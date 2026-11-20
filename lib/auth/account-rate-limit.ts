import "server-only";
import { createHmac } from "node:crypto";
import { query } from "@/lib/db";
import { emailError } from "./adapter";

export function accountLimitKey(email: string, secret: string): string {
  return createHmac("sha256", secret).update(`auth-account:${email.trim().toLowerCase()}`).digest("hex");
}

// Zamanlar UTC ISO metni olarak saklanır (ms çözünürlük); saniye hesabı tamsayı milisaniye ile yapılır.
const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
const MS = (column: string) => `CAST(round(unixepoch(${column}, 'subsec') * 1000) AS INTEGER)`;

/** One shared account budget across sign-in, signup, recovery and email links.
 * The atomic upsert serializes concurrent requests, independent of client IP.
 * Five requests are allowed per 15 minutes; subsequent attempts require waits
 * of 5, 10, 20 ... 900 seconds. Requests made while blocked do not extend a ban.
 * Only an HMAC of the normalized email is persisted, never the email or password.
 */
export async function consumeAccountAttempt(email: unknown, secret: string): Promise<number> {
  if (typeof email !== "string" || emailError(email)) return 0;
  const { rows } = await query<{ retry_after: number }>(`
    INSERT INTO auth_account_limits AS current (key, attempts, window_started, blocked_until, permitted)
    VALUES ($1, 1, ${NOW}, NULL, 1)
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE
        WHEN current.window_started <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 minutes') THEN 1
        WHEN current.blocked_until > ${NOW} THEN current.attempts
        ELSE min(current.attempts + 1, 1000000) END,
      window_started = CASE
        WHEN current.window_started <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 minutes') THEN ${NOW}
        ELSE current.window_started END,
      permitted = CASE
        WHEN current.window_started <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 minutes') THEN 1
        WHEN current.blocked_until > ${NOW} THEN 0
        WHEN current.blocked_until IS NOT NULL THEN 1
        WHEN current.attempts < 5 THEN 1
        ELSE 0 END,
      blocked_until = CASE
        WHEN current.window_started <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 minutes') THEN NULL
        WHEN current.blocked_until > ${NOW} THEN current.blocked_until
        WHEN current.attempts >= 5 THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+' || min(900, 5 * (1 << min(current.attempts - 5, 8))) || ' seconds')
        ELSE NULL END
    RETURNING CASE WHEN permitted = 1 THEN 0
      ELSE max(0, (${MS("blocked_until")} - ${MS(NOW)} + 999) / 1000) END AS retry_after
  `, [accountLimitKey(email, secret)]);
  const retry = rows[0]?.retry_after;
  if (!Number.isSafeInteger(retry) || retry < 0) throw new Error("Account limit unavailable");
  return retry;
}

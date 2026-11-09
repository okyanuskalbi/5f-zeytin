import "server-only";
import { createHmac } from "node:crypto";
import { query } from "@/lib/db";
import { emailError } from "./adapter";

export function accountLimitKey(email: string, secret: string): string {
  return createHmac("sha256", secret).update(`auth-account:${email.trim().toLowerCase()}`).digest("hex");
}

/** One shared account budget across sign-in, signup, recovery and email links.
 * The atomic upsert serializes concurrent requests, independent of client IP.
 * Five requests are allowed per 15 minutes; subsequent attempts require waits
 * of 5, 10, 20 ... 900 seconds. Requests made while blocked do not extend a ban.
 * Only an HMAC of the normalized email is persisted, never the email or password.
 */
export async function consumeAccountAttempt(email: unknown, secret: string): Promise<number> {
  if (typeof email !== "string" || emailError(email)) return 0;
  const { rows } = await query<{ retry_after: number }>(`
    INSERT INTO public.auth_account_limits AS current (key, attempts, window_started, blocked_until, permitted)
    VALUES ($1, 1, CURRENT_TIMESTAMP, NULL, true)
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE
        WHEN current.window_started <= CURRENT_TIMESTAMP - interval '15 minutes' THEN 1
        WHEN current.blocked_until > CURRENT_TIMESTAMP THEN current.attempts
        ELSE least(current.attempts + 1, 1000000) END,
      window_started = CASE
        WHEN current.window_started <= CURRENT_TIMESTAMP - interval '15 minutes' THEN CURRENT_TIMESTAMP
        ELSE current.window_started END,
      permitted = CASE
        WHEN current.window_started <= CURRENT_TIMESTAMP - interval '15 minutes' THEN true
        WHEN current.blocked_until > CURRENT_TIMESTAMP THEN false
        WHEN current.blocked_until IS NOT NULL THEN true
        ELSE current.attempts < 5 END,
      blocked_until = CASE
        WHEN current.window_started <= CURRENT_TIMESTAMP - interval '15 minutes' THEN NULL
        WHEN current.blocked_until > CURRENT_TIMESTAMP THEN current.blocked_until
        WHEN current.attempts >= 5 THEN CURRENT_TIMESTAMP + make_interval(secs => least(900, 5 * power(2, least(current.attempts - 5, 8)))::double precision)
        ELSE NULL END
    RETURNING CASE WHEN permitted THEN 0 ELSE greatest(0, ceil(extract(epoch FROM (blocked_until - CURRENT_TIMESTAMP))))::int END AS retry_after
  `, [accountLimitKey(email, secret)]);
  const retry = rows[0]?.retry_after;
  if (!Number.isSafeInteger(retry) || retry < 0) throw new Error("Account limit unavailable");
  return retry;
}

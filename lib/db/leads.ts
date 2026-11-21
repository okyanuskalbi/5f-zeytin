import "server-only";
import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";
import type { LeadInput } from "@/lib/contracts/admin-panel";

export async function createLead(input: LeadInput): Promise<string> {
  const id = randomUUID();
  await query("insert into leads (id, name, email, phone, message, source) values ($1, $2, $3, $4, $5, $6)",
    [id, input.name, input.email, input.phone, input.message, input.source]);
  return id;
}

export const contactRateLimit = { max: 5, windowMs: 10 * 60 * 1000 } as const;
/** İstemci adresi yalnız tek yönlü özet olarak (rateLimit tablosunda) tutulur; ham IP saklanmaz. Sınır aşılmışsa false. */
export async function consumeContactAttempt(clientAddress: string, now = Date.now()): Promise<boolean> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`contact:${clientAddress}`));
  const key = `contact:${[...new Uint8Array(digest)].slice(0, 16).map(byte => byte.toString(16).padStart(2, "0")).join("")}`;
  const { rows } = await query<{ count: number }>(`insert into "rateLimit" (id, key, count, "lastRequest") values ($1, $2, 1, $3)
    on conflict (key) do update set
      count = case when $3 - "rateLimit"."lastRequest" > $4 then 1 else "rateLimit".count + 1 end,
      "lastRequest" = case when $3 - "rateLimit"."lastRequest" > $4 then $3 else "rateLimit"."lastRequest" end
    returning count`, [randomUUID(), key, now, contactRateLimit.windowMs]);
  return (rows[0]?.count ?? 1) <= contactRateLimit.max;
}

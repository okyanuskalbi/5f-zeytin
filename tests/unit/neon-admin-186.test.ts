// @vitest-environment node
import { localTestDatabaseUrl } from "../helpers/local-postgres";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { hashPassword } from "better-auth/crypto";
import { query, closePool } from "@/lib/db";
import { getAuth } from "@/lib/auth/better-auth";
import { GET, PATCH } from "@/app/api/admin/products/route";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => ({ cookie: "" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: jar.cookie }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const origin = "https://afinazeytin.com";
const userId = randomUUID();
const email = `task186-admin-${userId}@example.test`;
const productId = `task186-admin-${randomUUID()}`;
const password = "LocalSecure123!";
const testIp = "198.18.186.62";
const input = { id: productId, name: "Local admin olive", category: "sofralik-zeytin", categoryLabel: null,
  showCategoryLabel: true, weight: "1 kg", priceKurus: 12345, stock: 5, isActive: false, upsellIds: [] };
let configured = false;
function mutation(name: string, requestOrigin = origin) {
  return new Request(`${origin}/api/admin/products`, { method: "PATCH", headers: { origin: requestOrigin,
    "sec-fetch-site": "same-origin", "content-type": "application/json", cookie: jar.cookie }, body: JSON.stringify({ ...input, name }) });
}
async function storedName() { return (await query("SELECT name FROM products WHERE id = $1", [productId])).rows[0]?.name; }

describe.skipIf(!process.env.TEST_DATABASE_URL)("actual Better Auth session and local PostgreSQL admin gate", () => {
beforeAll(async () => {
  const raw = localTestDatabaseUrl();
  vi.stubEnv("DATABASE_URL", raw); vi.stubEnv("BETTER_AUTH_URL", origin);
  vi.stubEnv("BETTER_AUTH_SECRET", "task186-local-admin-tests-only-32-character-secret");
  vi.stubEnv("VERCEL", "1");
  configured = true;
  await closePool();
  await query('INSERT INTO "user"(id,name,email,"emailVerified") VALUES($1,$2,$3,true)', [userId,"Local Admin Test",email]);
  await query('INSERT INTO account(id,"accountId","providerId","userId",password) VALUES($1,$2,$3,$2,$4)', [randomUUID(),userId,"credential",await hashPassword(password)]);
  await query("INSERT INTO products(id,name,category,weight,price_kurus,stock) VALUES($1,$2,$3,$4,$5,$6)", [productId,input.name,input.category,input.weight,input.priceKurus,input.stock]);
  const signedIn = await getAuth().handler(new Request(`${origin}/api/auth/sign-in/email`, { method: "POST", headers: { origin,
    "content-type":"application/json", "x-vercel-forwarded-for": testIp }, body: JSON.stringify({ email,password }) }));
  expect(signedIn.status).toBe(200);
  jar.cookie = signedIn.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");
  expect(jar.cookie).toContain("session_token");
});
afterAll(async () => {
  if (!configured) return;
  try {
    await query("DELETE FROM products WHERE id = $1", [productId]);
    await query('DELETE FROM "user" WHERE id = $1', [userId]);
    await query('DELETE FROM "rateLimit" WHERE key LIKE $1', [`%${testIp}%`]);
  } finally { await closePool(); vi.unstubAllEnvs(); }
});


  it("denies product reads and writes to a signed-in verified non-admin", async () => {
    expect((await GET(new Request(`${origin}/api/admin/products`))).status).toBe(403);
    expect((await PATCH(mutation("Forbidden change"))).status).toBe(403);
    expect(await storedName()).toBe(input.name);
  });
  it("permits assigned admin mutation and immediately observes assignment removal", async () => {
    await query("INSERT INTO admin_users(user_id) VALUES($1)", [userId]);
    expect((await PATCH(mutation("Authorized change"))).status).toBe(200);
    expect(await storedName()).toBe("Authorized change");
    await query("DELETE FROM admin_users WHERE user_id = $1", [userId]);
    expect((await PATCH(mutation("Revoked change"))).status).toBe(403);
    expect(await storedName()).toBe("Authorized change");
  });
  it("denies unverified assigned users and rejects a foreign origin", async () => {
    await query("INSERT INTO admin_users(user_id) VALUES($1)", [userId]);
    await query('UPDATE "user" SET "emailVerified" = false WHERE id = $1', [userId]);
    expect((await PATCH(mutation("Unverified change"))).status).toBe(403);
    await query('UPDATE "user" SET "emailVerified" = true WHERE id = $1', [userId]);
    expect((await PATCH(mutation("Cross-origin change", "https://foreign.example.test"))).status).toBe(403);
    expect(await storedName()).toBe("Authorized change");
  });
  it("rejects a database-revoked session even while its signed cookie and admin row remain", async () => {
    await query('DELETE FROM session WHERE "userId" = $1', [userId]);
    expect((await PATCH(mutation("Stale session change"))).status).toBe(401);
    expect(await storedName()).toBe("Authorized change");
  });
});

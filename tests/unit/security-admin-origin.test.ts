// @vitest-environment node
import { readFile } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { assertAuthMutation, authErrorResponse } from "@/lib/auth/server";
import { readCatalog } from "@/lib/catalog/read";
import { createLocalSupabase } from "../helpers/supabase-local";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...jar].map(([name, value]) => ({ name, value })), set: vi.fn(),
}) }));

const origin = "https://shop.example.test";
const publicKey = "sb_publishable_task135_test_only";
const serviceKey = "sb_secret_task135_test_only_service_key";
const ownerId = "00000000-0000-4000-8000-000000000135";
const ownerEmail = "admin@afina.com.tr";
const fetchMock = vi.fn<typeof fetch>();
const mutation = (url = `${origin}/api/admin/products`, headers: HeadersInit = { origin }) =>
  new Request(url, { method: "POST", headers });

beforeEach(() => {
  jar.clear(); fetchMock.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceKey);
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe.each(["auth", "admin"])("%s mutation origin behind a proxy", guard => {
  const invoke = async (request: Request) => {
    try {
      if (guard === "auth") assertAuthMutation(request);
      else await requireAdminMutation(request);
      return new Response(null, { status: 204 });
    } catch (error) { return authErrorResponse(error); }
  };

  it("trusts the configured origin instead of the internal URL or forwarded host", async () => {
    const response = await invoke(mutation("http://internal-proxy:3000/api/admin/products", {
      origin, "sec-fetch-site": "same-origin", "x-forwarded-host": "evil.example", "x-forwarded-proto": "http",
    }));
    // The anonymous admin request must reach identity verification, which returns 401.
    expect(response.status).toBe(guard === "auth" ? 204 : 401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects a matching request URL when its Origin differs from SITE_ORIGIN", async () => {
    const response = await invoke(mutation("https://evil.example/api/admin/products", { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["same-site", "cross-site", "none"])("rejects Sec-Fetch-Site %s even with the configured Origin", async site => {
    expect((await invoke(mutation(undefined, { origin, "sec-fetch-site": site }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([undefined, "", "https://private@example.test", "https://example.test/path"])("fails closed with 503 for missing/invalid production SITE_ORIGIN (%#)", async value => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_ORIGIN", value);
    const response = await invoke(mutation());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/private@|SITE_ORIGIN|internal-proxy/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("falls back to the request URL in development only", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SITE_ORIGIN", undefined);
    const local = "http://localhost:3004";
    expect((await invoke(mutation(`${local}/auth/logout`, { origin: local }))).status).toBe(guard === "auth" ? 204 : 401);
    expect((await invoke(mutation(`${local}/auth/logout`, { origin: "http://localhost:3005" }))).status).toBe(403);
  });
});

describe("admin assignments and anonymous catalog with memory-only PostgreSQL", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await createLocalSupabase();
    // Auth is represented locally, never by connecting to a Supabase project.
    await db.exec("alter table auth.users add column email text, add column email_confirmed_at timestamptz");
  }, 30_000);
  afterAll(async () => { await db?.close(); });
  beforeEach(async () => {
    await db.exec("reset role; delete from auth.users; delete from public.products;");
    await db.query("insert into auth.users (id, email, email_confirmed_at) values ($1, $2, '2026-10-22T00:00:00Z')", [ownerId, ownerEmail]);
    const expires_at = Math.floor(Date.now() / 1000) + 3600;
    const access_token = ["header", Buffer.from(JSON.stringify({ sub: ownerId, exp: expires_at })).toString("base64url"), "signature"].join(".");
    jar.set("sb-fixture-auth-token", `base64-${Buffer.from(JSON.stringify({
      access_token, refresh_token: "fixture-refresh", expires_at, token_type: "bearer", user: { id: ownerId },
    })).toString("base64url")}`);
    fetchMock.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      const key = new Headers(init?.headers).get("apikey");
      if (url.pathname === "/auth/v1/user") {
        expect(key).toBe(publicKey);
        const { rows } = await db.query<{ id: string; email: string; email_confirmed_at: Date | null }>("select * from auth.users where id = $1", [ownerId]);
        return Response.json({ ...rows[0], is_anonymous: false });
      }
      if (url.pathname === "/rest/v1/admin_users") {
        expect(key).toBe(serviceKey);
        expect(url.searchParams.get("user_id")).toBe(`eq.${ownerId}`);
        await db.exec("set role service_role");
        try { return Response.json((await db.query("select user_id from public.admin_users where user_id = $1", [ownerId])).rows); }
        finally { await db.exec("reset role"); }
      }
      if (url.pathname === "/rest/v1/products") {
        expect(key).toBe(publicKey);
        await db.exec("set role anon");
        // Deliberately no is_active WHERE: RLS itself must hide drafts.
        try { return Response.json((await db.query("select * from public.products order by active_slot limit 6")).rows); }
        finally { await db.exec("reset role"); }
      }
      throw new Error("Unexpected fixture request");
    });
  });

  it("denies an unconfirmed user even when admin_users contains the assignment", async () => {
    await db.query("insert into public.admin_users (user_id) values ($1)", [ownerId]);
    await db.query("update auth.users set email_confirmed_at = null where id = $1", [ownerId]);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("denies the confirmed owner address when it has no admin_users row", async () => {
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("revokes the confirmed owner's access on the next call after deleting the row", async () => {
    await db.query("insert into public.admin_users (user_id) values ($1)", [ownerId]);
    expect(await requireAdmin()).toEqual({ id: ownerId, email: ownerEmail });
    await db.query("delete from public.admin_users where user_id = $1", [ownerId]);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("reads only published products using the anonymous client and products_published_read RLS", async () => {
    await db.exec(`insert into public.products (id, name, category, weight, price_kurus, is_active) values
      ('published', 'Test zeytin', 'sofralik-zeytin', '1 kg', 12500, true),
      ('draft', 'Test taslak', 'sofralik-zeytin', '1 kg', 12500, false)`);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    expect(await readCatalog()).toEqual({ source: "database", data: [{
      id: "published", name: "Test zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 12500, stock: 0,
      categoryLabel: null, showCategoryLabel: true,
    }] });
    expect((await db.query("select count(*)::int as count from public.products")).rows).toEqual([{ count: 2 }]);
  });
  it("bootstraps only a confirmed existing owner and does not duplicate the assignment", async () => {
    const sql = await readFile(new URL("../../supabase/snippets/admin-bootstrap.sql", import.meta.url), "utf8");
    await db.query("update auth.users set email_confirmed_at = null where id = $1", [ownerId]);
    await db.exec(sql);
    expect((await db.query("select user_id from public.admin_users")).rows).toEqual([]);
    await db.query("update auth.users set email_confirmed_at = now() where id = $1", [ownerId]);
    await db.exec(sql); await db.exec(sql);
    expect((await db.query("select user_id from public.admin_users")).rows).toEqual([{ user_id: ownerId }]);
    await db.query("delete from auth.users where id = $1", [ownerId]);
    await db.exec(sql);
    expect((await db.query("select user_id from public.admin_users")).rows).toEqual([]);
  });
});

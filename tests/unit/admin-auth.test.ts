// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout, { dynamic, metadata } from "@/app/admin/layout";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { authErrorResponse } from "@/lib/auth/server";
import nextConfig from "@/next.config";
import { createLocalSupabase } from "../helpers/supabase-local";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => new Map<string, string>());
const setCookie = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...jar].map(([name, value]) => ({ name, value })), set: setCookie,
}) }));
vi.mock("next/navigation", () => ({
  unauthorized: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;401"); },
  forbidden: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;403"); },
}));

const origin = "https://shop.example.test";
const supabaseUrl = "https://fixture.supabase.co";
const memberId = "00000000-0000-4000-8000-000000000062";
const otherId = "00000000-0000-4000-8000-000000000063";
const serviceKey = "task062-test-only-service-key";
const publicKey = "sb_publishable_task062_test_only";
const member = { id: memberId, email: "member@example.test", aud: "authenticated", role: "authenticated",
  email_confirmed_at: "2026-10-22T00:00:00Z", is_anonymous: false,
  app_metadata: {}, user_metadata: {}, created_at: "2026-10-22T00:00:00Z" };
const fetchMock = vi.fn<typeof fetch>();
let providerUser: Record<string, unknown>;
let adminRows: { user_id: string }[];
function putSession(cookieUser: Record<string, unknown> = member) {
  const expires_at = Math.floor(Date.now() / 1000) + 3600;
  const access_token = ["header", Buffer.from(JSON.stringify({ sub: memberId, exp: expires_at })).toString("base64url"), "signature"].join(".");
  jar.set("sb-fixture-auth-token", `base64-${Buffer.from(JSON.stringify({
    access_token, refresh_token: "fixture-refresh", expires_at, token_type: "bearer", user: cookieUser,
  })).toString("base64url")}`);
}
const mutation = (method = "POST", headers: HeadersInit = { origin }) => new Request(`${origin}/api/admin/products`, { method, headers });
const roleRequests = () => fetchMock.mock.calls.filter(([url]) => String(url).includes("/rest/v1/"));

beforeEach(() => {
  jar.clear(); setCookie.mockClear(); fetchMock.mockReset();
  providerUser = { ...member }; adminRows = [];
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", serviceKey);
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async input => {
    const url = new URL(String(input));
    if (url.pathname === "/auth/v1/user") return Response.json(providerUser);
    if (url.pathname === "/rest/v1/admin_users") return Response.json(adminRows);
    throw new Error("Unexpected fixture request");
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("server-verified admin authorization", () => {
  it("rejects a missing session with 401 without accessing the privileged client", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401, code: "unauthenticated" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([401, 403])("rejects revoked or forged sessions (%s) before any role lookup", async status => {
    putSession({ ...member, email: "admin@afina.com.tr" });
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-provider-detail" }, { status }));
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
    expect(roleRequests()).toHaveLength(0);
  });
  it.each(["admin@afina.com.tr", "ADMIN@AFINA.COM.TR"])("denies a confirmed owner email without an explicit assignment (%#)", async email => {
    putSession(); providerUser.email = email;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403, code: "forbidden" });
    expect(roleRequests()).toHaveLength(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${supabaseUrl}/auth/v1/user`);
    expect(new Headers(options?.headers).get("apikey")).toBe(publicKey);
    expect(options?.cache).toBe("no-store");
  });
  it.each([null, undefined, "", "not-a-date"])("rejects an unconfirmed bootstrap address (%#)", async confirmation => {
    putSession(); providerUser.email = "admin@afina.com.tr"; providerUser.email_confirmed_at = confirmation;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403, code: "forbidden" });
    expect(roleRequests()).toHaveLength(0);
  });
  it("rejects anonymous auth users even if their address matches the bootstrap address", async () => {
    putSession(); providerUser.email = "admin@afina.com.tr"; providerUser.is_anonymous = true;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it.each(["admin@afina.com.tr.evil.test", "xadmin@afina.com.tr", "admin+other@afina.com.tr", "other@afina.com.tr", null])("does not widen the bootstrap allowlist (%#)", async email => {
    putSession(); providerUser.email = email;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("ignores forged cookie identity, user metadata, app metadata and the JWT role", async () => {
    putSession({ ...member, email: "admin@afina.com.tr", role: "admin" });
    providerUser = { ...member, role: "admin", user_metadata: { role: "admin", email: "admin@afina.com.tr" }, app_metadata: { role: "admin" } };
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("reads additional admins by the verified user id with a bounded server-only query", async () => {
    putSession(); adminRows = [{ user_id: memberId }];
    expect(await requireAdmin()).toEqual({ id: memberId, email: member.email });
    const [input, options] = roleRequests()[0];
    const url = new URL(String(input));
    expect(url.searchParams.get("select")).toBe("user_id");
    expect(url.searchParams.get("user_id")).toBe(`eq.${memberId}`);
    expect(url.searchParams.get("limit")).toBe("1");
    expect(new Headers(options?.headers).get("apikey")).toBe(serviceKey);
    expect(options?.cache).toBe("no-store");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });
  it("rejects a role row for a different user", async () => {
    putSession(); adminRows = [{ user_id: otherId }];
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
  it("rechecks identity and role for each action and immediately observes revocation and logout", async () => {
    putSession(); adminRows = [{ user_id: memberId }];
    const write = vi.fn();
    const action = async () => { const admin = await requireAdmin({ readOnly: false }); write(admin.id); };
    await action();
    adminRows = [];
    await expect(action()).rejects.toMatchObject({ status: 403 });
    jar.clear();
    await expect(action()).rejects.toMatchObject({ status: 401 });
    expect(write).toHaveBeenCalledExactlyOnceWith(memberId);
    expect(roleRequests()).toHaveLength(2);
  });
  it.each([{}, { ...member, id: "" }, { ...member, id: 42 }, { ...member, email: 42 }])("fails closed on malformed verified identity (%#)", async payload => {
    putSession(); providerUser = payload;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 503 });
    expect(roleRequests()).toHaveLength(0);
  });
  it.each([429, 500])("preserves safe Auth failure status on %s", async status => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-provider-detail" }, { status }));
    await expect(requireAdmin()).rejects.toMatchObject({ status: status === 429 ? 429 : 503 });
    expect(roleRequests()).toHaveLength(0);
  });
  it.each(["missing-config", "missing-table", "network", "malformed"])("fails closed with a sanitized 503 on role store failure (%s)", async failure => {
    putSession();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    if (failure === "missing-config") vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    else fetchMock.mockImplementation(async input => {
      if (String(input).includes("/auth/v1/user")) return Response.json(providerUser);
      if (failure === "network") throw new Error("private-db-detail");
      return failure === "malformed" ? Response.json({ unexpected: true })
        : Response.json({ code: "42P01", message: "private-db-detail" }, { status: 404 });
    });
    const response = await requireAdmin().then(() => { throw new Error("Unexpected authorization"); }, authErrorResponse);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/private-|SUPABASE|admin_users|42P01/);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(log).not.toHaveBeenCalled();
  });
});

describe("admin mutation guards", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])("permits same-origin %s only after fresh admin verification", async method => {
    putSession(); adminRows = [{ user_id: memberId }];
    expect(await requireAdminMutation(mutation(method, { origin, "sec-fetch-site": "same-origin" }))).toEqual({ id: memberId, email: member.email });
  });
  it.each(["POST", "PUT", "PATCH", "DELETE"])("returns 401/403 before executing an API mutation (%s)", async method => {
    const write = vi.fn();
    const handler = async () => {
      try { const admin = await requireAdminMutation(mutation(method)); write(admin.id); return new Response(null, { status: 204 }); }
      catch (error) { return authErrorResponse(error); }
    };
    expect((await handler()).status).toBe(401);
    putSession();
    expect((await handler()).status).toBe(403);
    expect(write).not.toHaveBeenCalled();
  });
  it.each([new Headers(), new Headers({ origin: "https://evil.test" }), new Headers({ origin, "sec-fetch-site": "cross-site" }), new Headers({ origin, "sec-fetch-site": "same-site" })])("rejects missing/foreign Origin or fetch site before Auth (%#)", async headers => {
    putSession(); providerUser.email = "admin@afina.com.tr";
    await expect(requireAdminMutation(mutation("POST", headers))).rejects.toMatchObject({ status: 403, code: "csrf_rejected" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["GET", "HEAD", "OPTIONS"])("rejects safe methods for the mutation guard (%s)", async method => {
    await expect(requireAdminMutation(mutation(method))).rejects.toMatchObject({ status: 405 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("admin server layout gate", () => {
  it("uses dynamic rendering, noindex and enabled Next auth interrupts", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(nextConfig.experimental?.authInterrupts).toBe(true);
  });
  it("interrupts anonymous rendering with 401", async () => {
    await expect(AdminLayout({ children: "protected-content" })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;401");
  });
  it("interrupts member rendering with 403", async () => {
    putSession();
    await expect(AdminLayout({ children: "protected-content" })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;403");
  });
  it("renders children only for an authorized admin", async () => {
    putSession(); adminRows = [{ user_id: memberId }];
    expect(await AdminLayout({ children: "protected-content" })).toBe("protected-content");
  });
  it("propagates sanitized service failure without rendering children", async () => {
    putSession(); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    await expect(AdminLayout({ children: "protected-content" })).rejects.toMatchObject({ status: 503 });
  });
});

describe("server-only admin table migration", () => {
  let db: PGlite;
  beforeAll(async () => { db = await createLocalSupabase(); }, 30_000);
  afterAll(async () => { await db?.close(); });
  afterEach(async () => { await db.exec("reset role; reset request.jwt.claim.sub;"); });

  it("creates an empty RLS-protected role store without granting admin to anyone", async () => {
    expect((await db.query("select count(*)::int as count from public.admin_users")).rows).toEqual([{ count: 0 }]);
    expect((await db.query("select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.admin_users'::regclass")).rows)
      .toEqual([{ relrowsecurity: true, relforcerowsecurity: true }]);
  });
  it.each(["anon", "authenticated"])("denies all table operations and self-promotion to %s", async role => {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [memberId]);
    await db.exec(`set role ${role}`);
    for (const sql of ["select * from public.admin_users", `insert into public.admin_users (user_id) values ('${memberId}')`,
      `update public.admin_users set user_id = '${memberId}'`, "delete from public.admin_users", "truncate public.admin_users"]) {
      await expect(db.exec(sql)).rejects.toMatchObject({ code: "42501" });
    }
  });
  it("allows only explicit service CRUD and rejects missing users/duplicate assignments", async () => {
    await db.query("insert into auth.users (id) values ($1), ($2)", [memberId, otherId]);
    await db.exec("set role service_role");
    await db.query("insert into public.admin_users (user_id) values ($1)", [memberId]);
    expect((await db.query("select user_id from public.admin_users")).rows).toEqual([{ user_id: memberId }]);
    await expect(db.query("insert into public.admin_users (user_id) values ($1)", [memberId])).rejects.toMatchObject({ code: "23505" });
    await expect(db.query("insert into public.admin_users (user_id) values ($1)", ["00000000-0000-4000-8000-000000000099"])).rejects.toMatchObject({ code: "23503" });
    await db.query("update public.admin_users set user_id = $1 where user_id = $2", [otherId, memberId]);
    expect((await db.query("delete from public.admin_users returning user_id")).rows).toEqual([{ user_id: otherId }]);
    await expect(db.exec("truncate public.admin_users")).rejects.toMatchObject({ code: "42501" });
  });
  it("removes the assignment when its auth identity is deleted", async () => {
    await db.query("insert into public.admin_users (user_id) values ($1)", [memberId]);
    await db.query("delete from auth.users where id = $1", [memberId]);
    expect((await db.query("select * from public.admin_users")).rows).toEqual([]);
  });
});

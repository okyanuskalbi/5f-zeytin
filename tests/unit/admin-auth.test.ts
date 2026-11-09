// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout, { dynamic, metadata } from "@/app/admin/layout";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { authErrorResponse, AuthCoreError } from "@/lib/auth/server";
import nextConfig from "@/next.config";

vi.mock("server-only", () => ({}));
const session = vi.hoisted(() => vi.fn());
const query = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ query }));
vi.mock("@/lib/auth/server", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/auth/server")>(),
  getVerifiedSession: session,
}));
vi.mock("next/navigation", () => ({
  unauthorized: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;401"); },
  forbidden: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;403"); },
}));
const origin = "https://shop.example.test";
const memberId = "00000000-0000-4000-8000-000000000062";
const member = { id: memberId, email: "member@example.test", emailVerified: true, name: "Member" };
const putSession = (user = member) => session.mockResolvedValue({ user, session: { id: "server-verified-session" } });
const mutation = (method = "POST", headers: HeadersInit = { origin }) => new Request(`${origin}/api/admin/products`, { method, headers });

beforeEach(() => {
  session.mockReset().mockResolvedValue(null);
  query.mockReset().mockResolvedValue({ rows: [] });
  vi.stubEnv("BETTER_AUTH_URL", origin);
  vi.stubEnv("BETTER_AUTH_SECRET", "task186-local-tests-only-32-character-secret");
  vi.stubEnv("DATABASE_URL", "postgres://postgres@localhost:54329/afina_test");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("server-verified admin authorization", () => {
  it("rejects a missing database session before looking up roles", async () => {
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401, code: "unauthenticated" });
    expect(query).not.toHaveBeenCalled();
  });
  it("rejects a revoked session before role lookup", async () => {
    session.mockRejectedValue(new AuthCoreError(401, "unauthenticated"));
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
    expect(query).not.toHaveBeenCalled();
  });
  it.each(["admin@afina.com.tr", "ADMIN@AFINA.COM.TR", "member@example.test"])("requires explicit assignment regardless of email (%s)", async email => {
    putSession({ ...member, email });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403, code: "forbidden" });
    expect(query).toHaveBeenCalledExactlyOnceWith("select user_id from admin_users where user_id = $1 limit 1", [memberId]);
  });
  it("requires verified email even for an assigned user", async () => {
    putSession({ ...member, emailVerified: false });
    query.mockResolvedValue({ rows: [{ user_id: memberId }] });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
    expect(query).not.toHaveBeenCalled();
  });
  it("reads assignments with a bound verified identity and rejects a different user's row", async () => {
    putSession();
    query.mockResolvedValue({ rows: [{ user_id: "other-user" }] });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
    query.mockResolvedValue({ rows: [{ user_id: memberId }] });
    expect(await requireAdmin()).toEqual({ id: memberId, email: member.email });
  });
  it("rechecks session and assignment for each action, observing revocation and logout", async () => {
    putSession(); query.mockResolvedValue({ rows: [{ user_id: memberId }] });
    const write = vi.fn();
    const action = async () => { const admin = await requireAdmin({ readOnly: false }); write(admin.id); };
    await action();
    query.mockResolvedValue({ rows: [] });
    await expect(action()).rejects.toMatchObject({ status: 403 });
    session.mockResolvedValue(null);
    await expect(action()).rejects.toMatchObject({ status: 401 });
    expect(write).toHaveBeenCalledExactlyOnceWith(memberId);
    expect(query).toHaveBeenCalledTimes(2);
    expect(session).toHaveBeenCalledTimes(3);
  });
  it("sanitizes database failures and prevents authorization", async () => {
    putSession(); query.mockRejectedValue(new Error("private-db-detail"));
    const response = await requireAdmin().then(() => { throw new Error("Unexpected authorization"); }, authErrorResponse);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/private-|admin_users|postgres/);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("admin mutation guards", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])("permits same-origin %s only after fresh admin verification", async method => {
    putSession(); query.mockResolvedValue({ rows: [{ user_id: memberId }] });
    expect(await requireAdminMutation(mutation(method, { origin, "sec-fetch-site": "same-origin" }))).toEqual({ id: memberId, email: member.email });
    expect(session).toHaveBeenCalledOnce();
  });
  it.each(["POST", "PUT", "PATCH", "DELETE"])("blocks anonymous and non-admin writes (%s)", async method => {
    const write = vi.fn();
    const action = async () => { const admin = await requireAdminMutation(mutation(method)); write(admin.id); };
    await expect(action()).rejects.toMatchObject({ status: 401 });
    putSession();
    await expect(action()).rejects.toMatchObject({ status: 403 });
    expect(write).not.toHaveBeenCalled();
  });
  it.each<HeadersInit>([{}, { origin: "https://evil.test" }, { origin, "sec-fetch-site": "cross-site" }, { origin, "sec-fetch-site": "same-site" }])("rejects missing/foreign Origin or fetch site before verification (%#)", async headers => {
    await expect(requireAdminMutation(mutation("POST", headers))).rejects.toMatchObject({ status: 403, code: "csrf_rejected" });
    expect(session).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
  it.each(["GET", "HEAD", "OPTIONS"])("rejects non-mutation methods (%s)", async method => {
    await expect(requireAdminMutation(mutation(method))).rejects.toMatchObject({ status: 405 });
    expect(session).not.toHaveBeenCalled();
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
  it("interrupts non-admin rendering with 403", async () => {
    putSession();
    await expect(AdminLayout({ children: "protected-content" })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;403");
  });
  it("renders children only for an authorized admin", async () => {
    putSession(); query.mockResolvedValue({ rows: [{ user_id: memberId }] });
    expect(await AdminLayout({ children: "protected-content" })).toBe("protected-content");
  });
  it("propagates configuration failure before accessing sessions or rendering", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    await expect(AdminLayout({ children: "protected-content" })).rejects.toMatchObject({ status: 503 });
    expect(session).not.toHaveBeenCalled();
  });
});

describe("restored admin trust/error regressions (186-2)", () => {
  it.each([429, 503])("preserves safe session failure %s before a role query", async status => {
    session.mockRejectedValueOnce(new AuthCoreError(status, status === 429 ? "auth_rate_limited" : "auth_unavailable", 5));
    const response = await requireAdmin().then(() => { throw new Error("Unexpected authorization"); }, authErrorResponse);
    expect(response.status).toBe(status); expect(query).not.toHaveBeenCalled();
    expect(await response.text()).not.toMatch(/postgres|session_token|private/);
  });
  it("never grants admin from profile, metadata or provider role claims", async () => {
    session.mockResolvedValueOnce({ user: { ...member, role: "admin", metadata: { role: "admin", user_id: "other-admin" } } });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
    expect(query).toHaveBeenCalledExactlyOnceWith("select user_id from admin_users where user_id = $1 limit 1", [memberId]);
  });
  it.each([{ code: "42P01", message: "private-table" }, { code: "57014", message: "private-timeout" }])("sanitizes storage failures and never logs credentials or personal data (%#)", async failure => {
    const error = vi.spyOn(console, "error"), warn = vi.spyOn(console, "warn");
    putSession(); query.mockRejectedValueOnce(failure);
    const response = await requireAdmin().then(() => { throw new Error("Unexpected authorization"); }, authErrorResponse);
    expect(response.status).toBe(503); expect(await response.text()).not.toMatch(/private|42P01|57014/);
    expect(error).not.toHaveBeenCalled(); expect(warn).not.toHaveBeenCalled();
  });
});

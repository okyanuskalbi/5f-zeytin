// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readOwnAccount } from "@/lib/account/read";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => new Map<string, string>());
const setCookie = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...jar].map(([name, value]) => ({ name, value })), set: setCookie,
}) }));

const publicKey = "sb_publishable_task043_test_only";
const user = { id: "member-a", email: "deniz@example.test", aud: "authenticated", role: "authenticated",
  email_confirmed_at: "2026-10-22T00:00:00Z", created_at: "2026-10-22T00:00:00Z",
  app_metadata: { role: "admin", private: "private-admin-data" },
  user_metadata: { name: " Deniz Sofra ", phone: " 05321234567 ", role: "admin", email: "other@example.test", id: "member-b" } };
const fetchMock = vi.fn<typeof fetch>();
function putSession(cookieUser = user) {
  const expires_at = Math.floor(Date.now() / 1000) + 3600;
  const access_token = ["header", Buffer.from(JSON.stringify({ sub: cookieUser.id, exp: expires_at })).toString("base64url"), "fixture-signature"].join(".");
  jar.set("sb-fixture-auth-token", `base64-${Buffer.from(JSON.stringify({ user: cookieUser, access_token, refresh_token: "fixture-refresh", expires_at, token_type: "bearer" })).toString("base64url")}`);
}
beforeEach(() => {
  jar.clear(); setCookie.mockClear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "task043-service-must-never-be-used");
  fetchMock.mockReset().mockResolvedValue(Response.json(user));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("account identity boundary with the real Supabase SDK", () => {
  it("treats absent and malformed cookies as anonymous without provider access", async () => {
    expect(await readOwnAccount()).toBeNull();
    jar.set("sb-fixture-auth-token", "base64-invalid");
    expect(await readOwnAccount()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("uses the provider's verified identity, not the cookie profile, and returns only display fields", async () => {
    putSession({ ...user, id: "member-b", email: "cookie-other@example.test" });
    expect(await readOwnAccount()).toEqual({ name: "Deniz Sofra", email: user.email, phone: "05321234567" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://fixture.supabase.co/auth/v1/user");
    expect(new Headers(options?.headers).get("apikey")).toBe(publicKey);
    expect(options?.cache).toBe("no-store");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("isolates successive members without caching a profile or accepting a target user id", async () => {
    putSession();
    expect(await readOwnAccount()).toMatchObject({ email: user.email });
    putSession({ ...user, id: "member-b" });
    fetchMock.mockResolvedValueOnce(Response.json({ ...user, id: "member-b", email: "other@example.test", user_metadata: { name: "Başka Üye" } }));
    expect(await readOwnAccount()).toEqual({ name: "Başka Üye", email: "other@example.test", phone: null });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.every(([url]) => String(url).endsWith("/auth/v1/user"))).toBe(true);
  });
  it.each([401, 403, 422])("rejects forged, expired or revoked sessions (%s)", async status => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-provider-detail" }, { status }));
    expect(await readOwnAccount()).toBeNull();
  });
  it.each([429, 500, 503])("preserves safe provider failures (%s)", async status => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-provider-detail" }, { status }));
    await expect(readOwnAccount()).rejects.toMatchObject({ status: status === 429 ? 429 : 503, code: status === 429 ? "auth_rate_limited" : "auth_unavailable" });
  });
  it("sanitizes transport failures and configuration errors", async () => {
    putSession(); fetchMock.mockRejectedValueOnce(new Error("private-provider-detail"));
    await expect(readOwnAccount()).rejects.toMatchObject({ message: "auth_unavailable", status: 503 });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    await expect(readOwnAccount()).rejects.toMatchObject({ message: "auth_unavailable", status: 503 });
  });
  it.each([{}, { ...user, id: "" }, { ...user, id: 3 }, { ...user, email: {} }])("fails closed on malformed verified identities (%#)", async payload => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json(payload));
    await expect(readOwnAccount()).rejects.toMatchObject({ status: 503 });
  });
  it.each([null, [], {}, { name: " ", phone: [] }, { name: "x".repeat(101), phone: "x".repeat(21) }])("handles absent or malformed display metadata without authorizing roles (%#)", async user_metadata => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ ...user, email: null, user_metadata }));
    expect(await readOwnAccount()).toEqual({ name: null, email: null, phone: null });
  });
  it("never logs personal data or raw provider errors", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    putSession(); await readOwnAccount();
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-provider-detail" }, { status: 503 }));
    await expect(readOwnAccount()).rejects.toThrow();
    expect(JSON.stringify([log.mock.calls, error.mock.calls, warn.mock.calls])).not.toMatch(/deniz|private-provider-detail|fixture-refresh|private-admin/);
  });
});

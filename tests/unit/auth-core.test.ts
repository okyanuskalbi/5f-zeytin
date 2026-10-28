// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { GET, dynamic } from "@/app/auth/callback/route";
import { POST } from "@/app/auth/logout/route";
import { createAuthServerClient, getVerifiedUser, assertAuthMutation } from "@/lib/auth/server";
import { getAuthConfig, getAuthCookieOptions, safeAuthRedirect } from "@/lib/auth/config";
import { proxy, config } from "@/proxy";
import { expectHttpOnlyAuthCookies } from "../helpers/auth-cookies";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => new Map<string, string>());
const setCookie = vi.hoisted(() => vi.fn<(name: string, value: string, options?: CookieOptions) => void>());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...jar].map(([name, value]) => ({ name, value })), set: setCookie,
}) }));

const origin = "https://shop.example.test";
const supabaseUrl = "https://fixture.supabase.co";
const publicKey = "sb_publishable_task040_test_only";
const cookieName = "sb-fixture-auth-token";
const verifier = "test-only-pkce-verifier";
const user = { id: "fixture-member", email: "member@example.test", aud: "authenticated",
  role: "authenticated", app_metadata: {}, user_metadata: { role: "admin" }, created_at: "2026-10-22T00:00:00Z" };
const jwt = (expires: number) => ["header", Buffer.from(JSON.stringify({ sub: user.id, exp: expires })).toString("base64url"), "signature"].join(".");
const tokenResponse = () => ({ access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
  refresh_token: "fixture-refresh", token_type: "bearer", expires_in: 3600, user });
function putCookie(name: string, value: unknown) {
  jar.set(name, `base64-${Buffer.from(JSON.stringify(value)).toString("base64url")}`);
}
function putSession(expired = false) {
  const expires_at = Math.floor(Date.now() / 1000) + (expired ? -3600 : 3600);
  putCookie(cookieName, { ...tokenResponse(), access_token: jwt(expires_at), expires_at });
}
const callback = (query = "code=test-code", headers?: HeadersInit) => new Request(`${origin}/auth/callback?${query}`, { headers });
const logout = (headers: HeadersInit = { origin }) => new Request(`${origin}/auth/logout`, { method: "POST", headers });
const fetchMock = vi.fn<typeof fetch>();
let cookieWrites: NextResponse;

beforeEach(() => {
  jar.clear(); setCookie.mockClear(); fetchMock.mockReset();
  // Next merges cookies() writes into Route Handler responses. Serialize those
  // writes with its real response cookie implementation in this mocked context.
  cookieWrites = new NextResponse(null);
  setCookie.mockImplementation((name, value, options) => {
    jar.set(name, value);
    cookieWrites.cookies.set(name, value, options);
  });
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "task040-service-must-never-be-used");
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async input => String(input).includes("/token")
    ? Response.json(tokenResponse()) : Response.json(user));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("public auth configuration and server cookie boundary", () => {
  it("uses only the public key and normalizes the URL", () => {
    expect(getAuthConfig()).toEqual({ url: supabaseUrl, key: publicKey, siteOrigin: origin });
  });
  it.each([undefined, "", "   "])("requires SITE_ORIGIN on the server in production (%#)", value => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_ORIGIN", value);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it.each(["https://user:private@example.test", "https://example.test/path", "https://example.test?private=value",
    "https://example.test/#hash", "http://example.test", "null", "//example.test"])("rejects unsafe SITE_ORIGIN (%#)", value => {
    vi.stubEnv("SITE_ORIGIN", value);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it("allows local development origins and normalizes a trailing slash", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SITE_ORIGIN", " http://localhost:3004/ ");
    expect(getAuthConfig()).toMatchObject({ siteOrigin: "http://localhost:3004" });
    vi.stubEnv("NODE_ENV", "production");
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it.each(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"])("rejects missing %s without exposing values", variable => {
    vi.stubEnv(variable, undefined);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it.each(["http://example.test", "https://user:private@example.test", "https://example.test/path",
    "https://example.test?secret=value", "https://example.test/#hash", "invalid-private-value"])("rejects unsafe URL (%#)", url => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it("allows local HTTP only outside production", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    expect(getAuthConfig().url).toBe("http://127.0.0.1:54321");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it.each(["sb_secret_test-only", `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`])("rejects a privileged key in the public config (%#)", key => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it("accepts the legacy anon JWT format", () => {
    const key = `header.${Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url")}.signature`;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);
    expect(getAuthConfig().key).toBe(key);
  });
  it("uses host-only, HttpOnly cookies with HTTPS in production and server-side refresh", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getAuthCookieOptions()).toEqual({ path: "/", sameSite: "lax", secure: true, httpOnly: true });
    vi.stubEnv("NODE_ENV", "development");
    expect(getAuthCookieOptions().secure).toBe(false);
  });
});

describe("SSR identity verification and cookie refresh", () => {
  it("treats a missing session as signed out without a network call", async () => {
    expect(await getVerifiedUser()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("verifies at the Auth server, strips untrusted role metadata and does not cache users", async () => {
    putSession();
    expect(await getVerifiedUser()).toEqual({ id: user.id, email: user.email });
    fetchMock.mockResolvedValueOnce(Response.json({ ...user, id: "second-member", email: "second@example.test" }));
    expect(await getVerifiedUser()).toEqual({ id: "second-member", email: "second@example.test" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${supabaseUrl}/auth/v1/user`);
    expect(new Headers(options?.headers).get("apikey")).toBe(publicKey);
    expect(options?.cache).toBe("no-store");
  });
  it.each([401, 403])( "rejects forged/revoked sessions on upstream %s", async status => {
    putSession();
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token", code: "bad_jwt" }, { status }));
    expect(await getVerifiedUser()).toBeNull();
  });
  it("does not trust malformed stored session data", async () => {
    jar.set(cookieName, "base64-broken");
    expect(await getVerifiedUser()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("refreshes expired tokens and writes hardened replacement cookies in writable contexts", async () => {
    vi.stubEnv("NODE_ENV", "production"); putSession(true);
    const client = await createAuthServerClient();
    expect(await getVerifiedUser(client)).toEqual({ id: user.id, email: user.email });
    expect(String(fetchMock.mock.calls[0][0])).toContain("grant_type=refresh_token");
    expect(setCookie).toHaveBeenCalledWith(cookieName, expect.any(String), expect.objectContaining({
      secure: true, sameSite: "lax", path: "/", httpOnly: true,
    }));
    expectHttpOnlyAuthCookies(cookieWrites.headers);
  });
  it("keeps Server Component cookie access read-only", async () => {
    putSession(true);
    expect(await getVerifiedUser()).toEqual({ id: user.id, email: user.email });
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("preserves a provider rate limit as a sanitized error", async () => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status: 429 }));
    await expect(getVerifiedUser()).rejects.toMatchObject({ status: 429, code: "auth_rate_limited", retryAfter: 60 });
  });
  it.each([500, 503])("fails closed on provider outage %s", async status => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status }));
    await expect(getVerifiedUser()).rejects.toMatchObject({ status: 503, code: "auth_unavailable" });
  });
  it("sanitizes a rejected network request without logging private error details", async () => {
    putSession();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("private-token"));
    await expect(getVerifiedUser()).rejects.toMatchObject({ status: 503, code: "auth_unavailable" });
    expect(log).not.toHaveBeenCalled();
  });
  it("bounds provider requests with a five-second abort signal", async () => {
    putSession();
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    fetchMock.mockImplementationOnce(async (_url, options) => {
      expect(options?.signal).toBe(controller.signal);
      controller.abort();
      throw new DOMException("Fixture timeout", "AbortError");
    });
    await expect(getVerifiedUser()).rejects.toMatchObject({ status: 503 });
    expect(timeout).toHaveBeenCalledWith(5000);
  });
  it.each([{}, { id: 42 }, { id: "" }, { ...user, email: 42 }])("rejects malformed provider identities (%#)", async payload => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json(payload));
    await expect(getVerifiedUser()).rejects.toMatchObject({ status: 503, code: "auth_unavailable" });
  });
});

describe("callback allowlist and PKCE login CSRF protection", () => {
  it("redirects to SITE_ORIGIN after PKCE even when the request URL uses an internal host", async () => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    const response = await GET(new Request("http://internal-proxy:3000/auth/callback?code=test-code&next=/sepet"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${origin}/sepet`);
  });
  it.each(["/hesabim", "/sepet", "/odeme"])("allows exact local return path %s", path => {
    expect(safeAuthRedirect(path)).toBe(path);
  });
  it.each([null, "", "https://evil.test", "//evil.test", "/\\evil.test", "/admin", "/hesabim/../admin",
    "/%2f%2fevil.test", "/hesabim?next=https://evil.test", "/hesabim#token", "/hesabim\r\nLocation: https://evil.test"])("defaults unsafe return paths (%#)", path => {
    expect(safeAuthRedirect(path)).toBe("/hesabim");
  });
  it("exchanges a code with the browser's verifier and redirects without leaking code or tokens", async () => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    const response = await GET(callback("code=test-code&next=/sepet", { "x-forwarded-host": "evil.test" }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${origin}/sepet`);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(await response.text()).toBe("");
    expect(dynamic).toBe("force-dynamic");
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${supabaseUrl}/auth/v1/token?grant_type=pkce`);
    expect(JSON.parse(String(options?.body))).toEqual({ auth_code: "test-code", code_verifier: verifier });
    expect(setCookie).toHaveBeenCalledWith(cookieName, expect.any(String), expect.objectContaining({ sameSite: "lax" }));
    expect(cookieWrites.cookies.get(cookieName)?.value).toBeTruthy();
    expect(cookieWrites.cookies.get(`${cookieName}-code-verifier`)).toMatchObject({ value: "", maxAge: 0 });
    expectHttpOnlyAuthCookies(cookieWrites.headers);
  });
  it("supports the SDK's per-flow PKCE verifier without borrowing another browser flow", async () => {
    putCookie(`${cookieName}-flow-testflow123-code-verifier`, verifier);
    const response = await GET(callback("code=test-code&sb_flow_id=testflow123"));
    expect(response.status).toBe(303);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).code_verifier).toBe(verifier);
    expect(cookieWrites.cookies.get(cookieName)?.value).toBeTruthy();
    expect(cookieWrites.cookies.get(`${cookieName}-flow-testflow123-code-verifier`)).toMatchObject({ value: "", maxAge: 0 });
    expectHttpOnlyAuthCookies(cookieWrites.headers);
  });
  it("cannot establish a login without a browser-bound verifier", async () => {
    const response = await GET(callback());
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({ error: { code: "invalid_callback" } });
  });
  it("does not borrow the legacy verifier when a requested per-flow verifier is absent", async () => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    const response = await GET(callback("code=test-code&sb_flow_id=testflow123"));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not accept a replayed code after a successful exchange", async () => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    expect((await GET(callback())).status).toBe(303);
    fetchMock.mockClear();
    expect((await GET(callback())).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("fails closed with a sanitized 503 when public configuration is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    const response = await GET(callback());
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({ error: { code: "auth_unavailable" } });
  });
  it.each(["", "code=", "code=a&code=b", "code=test-code&next=/sepet&next=/odeme", "code=test-code&error=private-token",
    "code=test-code&sb_flow_id=bad", "code=test-code&sb_flow_id=testflow123&sb_flow_id=testflow456", "code=%0d%0a", `code=${"a".repeat(2049)}`])("rejects malformed/ambiguous callback input before network (%#)", async query => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    const response = await GET(callback(query));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("private-token");
  });
  it("keeps external next parameters on the allowlisted fallback", async () => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    const response = await GET(callback("code=test-code&next=https://evil.test"));
    expect(response.headers.get("location")).toBe(`${origin}/hesabim`);
  });
  it.each([400, 401, 403, 429, 503])("sanitizes callback upstream failure %s and never redirects as success", async status => {
    putCookie(`${cookieName}-code-verifier`, verifier);
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status }));
    const response = await GET(callback());
    expect(response.status).toBe(status === 429 ? 429 : status >= 500 ? 503 : 400);
    expect(response.headers.get("location")).toBeNull();
    expect(await response.text()).not.toContain("private-token");
    expect(response.headers.get("cache-control")).toContain("no-store");
    if (status === 429) expect(response.headers.get("retry-after")).toBe("60");
  });
});

describe("mutation CSRF and logout", () => {
  it("accepts only same-origin POSTs", () => {
    expect(() => assertAuthMutation(logout({ origin, "sec-fetch-site": "same-origin" }))).not.toThrow();
  });
  it.each<HeadersInit>([{}, { origin: "https://evil.test" }, { origin: "null" }, { origin: `${origin}.evil.test` },
    { origin, "sec-fetch-site": "cross-site" }, { origin, "sec-fetch-site": "same-site" }])("rejects CSRF before reading session or contacting Auth (%#)", async headers => {
    const response = await POST(logout(headers));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("does not permit GET logout", () => {
    expect(() => assertAuthMutation(new Request(`${origin}/auth/logout`, { headers: { origin } })))
      .toThrow(expect.objectContaining({ status: 405 }));
  });
  it("logs out only the current session, clears cookies and returns no tokens", async () => {
    putSession();
    fetchMock.mockImplementation(async input => String(input).includes("/logout")
      ? new Response(null, { status: 204 }) : Response.json(user));
    const response = await POST(logout());
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toBe(`${supabaseUrl}/auth/v1/logout?scope=local`);
    expect(setCookie).toHaveBeenCalledWith(cookieName, "", expect.objectContaining({ maxAge: 0, path: "/" }));
    expectHttpOnlyAuthCookies(cookieWrites.headers);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("allows repeated logout without a session", async () => {
    expect((await POST(logout())).status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("clears a revoked session locally", async () => {
    putSession();
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "revoked" }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ msg: "revoked" }, { status: 401 }));
    expect((await POST(logout())).status).toBe(204);
    expect(setCookie).toHaveBeenCalledWith(cookieName, "", expect.objectContaining({ maxAge: 0 }));
  });
  it("clears an expired session whose refresh token has been revoked", async () => {
    putSession(true);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token", error_code: "refresh_token_not_found" }, { status: 400 }));
    expect((await POST(logout())).status).toBe(204);
    expect(setCookie).toHaveBeenCalledWith(cookieName, "", expect.objectContaining({ maxAge: 0 }));
    expect(log.mock.calls.flat().map(String).join(" ")).not.toContain("private-token");
  });
  it("uses provider rate limiting before the logout mutation", async () => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status: 429 }));
    const response = await POST(logout());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("reports upstream logout failure without claiming success or exposing details", async () => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json(user))
      .mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status: 503 }));
    const response = await POST(logout());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-token");
  });
});

describe("SSR proxy refresh transport", () => {
  it("is scoped to membership/auth consumers and never changes the landing", async () => {
    expect(config.matcher).toEqual(["/hesabim/:path*", "/admin/:path*", "/api/admin/:path*", "/sepet", "/odeme", "/giris"]);
    const response = await proxy(new NextRequest(`${origin}/hesabim`));
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("forwards rotated cookies to the Server Component request and browser response", async () => {
    putSession(true);
    const request = new NextRequest(`${origin}/hesabim`, { headers: { cookie: `${cookieName}=${jar.get(cookieName)}` } });
    const response = await proxy(request);
    expect(response.cookies.get(cookieName)?.value).toBeTruthy();
    expectHttpOnlyAuthCookies(response.headers);
    expect(response.headers.get("x-middleware-request-cookie")).toContain(response.cookies.get(cookieName)!.value);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
  it("preserves rate limits as a sanitized non-cacheable response", async () => {
    putSession(); fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-token" }, { status: 429 }));
    const request = new NextRequest(`${origin}/hesabim`, { headers: { cookie: `${cookieName}=${jar.get(cookieName)}` } });
    const response = await proxy(request);
    expect(response.status).toBe(429);
    expect(await response.text()).not.toContain("private-token");
  });
});

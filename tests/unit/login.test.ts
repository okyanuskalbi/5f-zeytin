// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/auth/logout/route";
import { GET as callback } from "@/app/auth/callback/route";
import { loginInvalidCredentials, magicLinkConfirmation, validateLoginRequest } from "@/lib/contracts/login";

vi.mock("server-only", () => ({}));
const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...jar].map(([name, value]) => ({ name, value })),
  set: (name: string, value: string) => jar.set(name, value),
}) }));
const origin = "https://shop.example.test";
const publicKey = "sb_publishable_task042_test_only";
const input = { method: "password", email: " Deniz@example.test ", password: " Sofrada123! ", next: "/sepet" };
const magic = { method: "magic_link", email: input.email, next: "/odeme" };
const user = { id: "fixture-member", email: "deniz@example.test", aud: "authenticated", app_metadata: {}, user_metadata: { role: "admin" }, created_at: "2026-10-22T00:00:00Z" };
const session = () => ({ user, access_token: ["header", Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"), "signature"].join("."), refresh_token: "fixture-refresh", expires_in: 3600, token_type: "bearer" });
const fetchMock = vi.fn<typeof fetch>();
function request(body: unknown = input, headers: HeadersInit = {}, raw = false) {
  return new NextRequest(`${origin}/api/auth/login`, { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: raw ? String(body) : JSON.stringify(body) });
}
beforeEach(() => {
  jar.clear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "task042-service-must-never-be-used");
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async url => String(url).includes("/otp") ? Response.json({}) : Response.json(session()));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("login contract", () => {
  it("normalizes email, preserves passwords and defaults the return path", () => {
    expect(validateLoginRequest({ ...input, next: undefined })).toEqual({ ok: true, data: { ...input, email: "deniz@example.test", next: "/hesabim" } });
    expect(validateLoginRequest(magic)).toEqual({ ok: true, data: { ...magic, email: "deniz@example.test" } });
  });
  it.each([null, [], "input", 2, {}, { ...input, method: "google" }, { ...input, email: 12 }, { ...input, password: null }, { ...input, next: [] }, { ...input, role: "admin" }, { ...magic, password: "ignored" }])("rejects malformed or unexpected input (%#)", value => {
    expect(validateLoginRequest(value).ok).toBe(false);
  });
  it.each([["email", "invalid"], ["email", "a".repeat(250) + "@example.test"], ["password", ""], ["password", "a".repeat(129)]])("validates %s (%#)", (key, value) => {
    expect(validateLoginRequest({ ...input, [key]: value })).toMatchObject({ ok: false, fields: { [key]: expect.any(String) } });
  });
  it("does not impose registration password complexity on an existing member", () => {
    expect(validateLoginRequest({ ...input, password: "x" }).ok).toBe(true);
  });
});

describe("password login with real SDK and mocked transport", () => {
  it("publishes a secure session cookie and only a safe redirect, using the public key", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(request(input, { "x-forwarded-host": "evil.example", "x-forwarded-proto": "http" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: "signed_in", redirectTo: "/sepet" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://fixture.supabase.co/auth/v1/token?grant_type=password");
    expect(new Headers(options?.headers).get("apikey")).toBe(publicKey);
    expect(JSON.parse(String(options?.body))).toMatchObject({ email: "deniz@example.test", password: input.password });
    expect(options?.cache).toBe("no-store");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(response.cookies.getAll()).toEqual(expect.arrayContaining([expect.objectContaining({ name: "sb-fixture-auth-token", secure: true, path: "/", sameSite: "lax" })]));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/admin", "/hesabim?next=//evil.example", "/%2f%2fevil", "javascript:alert(1)", "/odeme#x"])("blocks an unsafe return path (%#)", async next => {
    expect(await (await POST(request({ ...input, next }))).json()).toEqual({ data: { status: "signed_in", redirectTo: "/hesabim" } });
  });
  it.each([400, 401, 403, 422])("hides invalid, nonexistent, banned and unconfirmed credentials (%s)", async status => {
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-email-password", code: "email_not_confirmed" }, { status }));
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { code: "invalid_credentials", message: loginInvalidCredentials } });
    expect(response.cookies.getAll()).toHaveLength(0);
  });
  it.each([{}, { user }, { ...session(), user: { ...user, id: "" } }, { ...session(), user: { ...user, email: 5 } }, { ...session(), refresh_token: "" }])("rejects malformed successful responses without publishing cookies (%#)", async payload => {
    fetchMock.mockResolvedValueOnce(Response.json(payload));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.cookies.getAll()).toHaveLength(0);
  });
  it("ignores an existing cookie instead of refreshing or reading another user's data", async () => {
    const response = await POST(request(input, { cookie: "sb-fixture-auth-token=other-private-session" }));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.every(([url]) => String(url).includes("grant_type=password"))).toBe(true);
    expect(await response.text()).not.toMatch(/fixture-member|admin|refresh|access_token|deniz/);
  });
});

describe("magic link", () => {
  it("builds emailRedirectTo from SITE_ORIGIN behind an internal request host", async () => {
    const response = await POST(new NextRequest("http://internal-proxy:3000/api/auth/login", {
      method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(magic),
    }));
    expect(response.status).toBe(202);
    const redirect = new URL(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("redirect_to")!);
    expect(redirect.origin + redirect.pathname).toBe(`${origin}/auth/callback`);
    expect(redirect.searchParams.get("next")).toBe("/odeme");
  });
  it("starts browser-bound PKCE without creating a user and keeps the return URL on this origin", async () => {
    const response = await POST(request(magic, { "x-forwarded-host": "evil.example" }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { status: "link_requested", message: magicLinkConfirmation } });
    const [url, options] = fetchMock.mock.calls[0];
    const redirect = new URL(new URL(String(url)).searchParams.get("redirect_to")!);
    expect(redirect.origin + redirect.pathname).toBe(`${origin}/auth/callback`);
    expect(redirect.searchParams.get("next")).toBe("/odeme");
    expect(JSON.parse(String(options?.body))).toMatchObject({ email: "deniz@example.test", create_user: false, code_challenge_method: "s256", code_challenge: expect.any(String), data: {} });
    expect(response.cookies.getAll().length).toBeGreaterThan(0);
    expect(response.cookies.getAll().every(cookie => /-code-verifier(?:\.\d+)?$/.test(cookie.name))).toBe(true);
    for (const cookie of response.cookies.getAll()) jar.set(cookie.name, cookie.value);
    fetchMock.mockResolvedValueOnce(Response.json(session()));
    redirect.searchParams.set("code", "fixture-email-code");
    const confirmed = await callback(new Request(redirect));
    expect(confirmed.status).toBe(303);
    expect(confirmed.headers.get("location")).toBe(`${origin}/odeme`);
    expect(jar.has("sb-fixture-auth-token")).toBe(true);
  });
  it.each([400, 403, 404, 422])("keeps user existence neutral for upstream %s including verifier cookies", async status => {
    const success = await POST(request(magic));
    fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-user-missing", code: "otp_disabled" }, { status }));
    const missing = await POST(request(magic));
    expect(missing.status).toBe(202);
    expect(await missing.json()).toEqual(await success.json());
    const shape = (response: typeof missing) => response.cookies.getAll().map(cookie => ({ name: cookie.name.replace(/-flow-[a-z0-9]+-/, "-flow-"), deleted: cookie.maxAge === 0 }));
    expect(shape(missing)).toEqual(shape(success));
    expect(missing.cookies.getAll().every(cookie => !!cookie.value)).toBe(true);
  });
  it("bounds repeated neutral requests, preserves existing verifiers and never changes the session", async () => {
    const cookies = new Map<string, string>([["sb-fixture-auth-token", "untouched-member-session"]]);
    for (let attempt = 0; attempt < 12; attempt++) {
      fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-missing" }, { status: 422 }));
      const response = await POST(request(magic, { cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join("; ") }));
      expect(response.status).toBe(202);
      for (const cookie of response.cookies.getAll()) {
        if (!cookie.value || cookie.maxAge === 0) cookies.delete(cookie.name);
        else cookies.set(cookie.name, cookie.value);
      }
    }
    expect(cookies.size).toBeLessThanOrEqual(8);
    expect(cookies.get("sb-fixture-auth-token")).toBe("untouched-member-session");
  });
});

describe("request and service boundaries", () => {
  it.each([input, magic])("preserves provider rate limiting and sanitized availability errors (%#)", async payload => {
    for (const status of [429, 500, 503]) {
      fetchMock.mockResolvedValueOnce(Response.json({ msg: "private-password-token" }, { status }));
      const response = await POST(request(payload));
      expect(response.status).toBe(status === 429 ? 429 : 503);
      expect(response.headers.get("retry-after")).toBe(status === 429 ? "60" : "5");
      expect(await response.text()).not.toMatch(/private-password-token|deniz/);
      expect(response.cookies.getAll()).toHaveLength(0);
    }
  });
  it.each([{}, { origin: "https://evil.example" }, { origin, "sec-fetch-site": "same-site" }, { origin, "sec-fetch-site": "cross-site" }])("rejects login CSRF before provider access (%#)", async headers => {
    const req = request();
    req.headers.delete("origin");
    Object.entries(headers).forEach(([key, value]) => req.headers.set(key, value));
    expect((await POST(req)).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([null, {}, { ...input, password: "" }, { ...input, role: "admin" }])("rejects invalid input without provider access (%#)", async payload => {
    expect((await POST(request(payload))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("bounds streamed JSON, rejects bad JSON/media and empty requests", async () => {
    expect((await POST(request("{", {}, true))).status).toBe(400);
    expect((await POST(request(input, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(request(" ".repeat(9000), {}, true))).status).toBe(413);
    expect((await POST(request(input, { "content-length": "9000" }))).status).toBe(413);
    expect((await POST(new NextRequest(`${origin}/api/auth/login`, { method: "POST", headers: { origin, "content-type": "application/json" } }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("never logs passwords or provider errors on transport/config failures", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("private-password-token"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-password-token");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    expect((await POST(request())).status).toBe(503);
    expect(errorLog).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
  it("logs out only the current session, rejects CSRF and handles repeat logout", async () => {
    const signedIn = await POST(request());
    signedIn.cookies.getAll().forEach(cookie => jar.set(cookie.name, cookie.value));
    fetchMock.mockImplementation(async url => String(url).includes("/user") ? Response.json(user) : new Response(null, { status: 204 }));
    expect((await logout(new Request(`${origin}/auth/logout`, { method: "POST" }))).status).toBe(403);
    const response = await logout(new Request(`${origin}/auth/logout`, { method: "POST", headers: { origin } }));
    expect(response.status).toBe(204);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("/logout?scope=local"))).toBe(true);
    expect(jar.get("sb-fixture-auth-token")).toBe("");
    expect((await logout(new Request(`${origin}/auth/logout`, { method: "POST", headers: { origin } }))).status).toBe(204);
  });
});

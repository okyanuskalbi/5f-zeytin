// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { GET as confirmRegistration } from "@/app/auth/callback/route";
import { registrationConfirmation, validateRegisterRequest } from "@/lib/contracts/register";

vi.mock("server-only", () => ({}));
const callbackCookies = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({ cookies: async () => ({
  getAll: () => [...callbackCookies].map(([name, value]) => ({ name, value })),
  set: (name: string, value: string) => callbackCookies.set(name, value),
}) }));
const origin = "https://shop.example.test";
const provider = "https://fixture.supabase.co";
const publicKey = "sb_publishable_task041_test_only";
const input = { name: "  Deniz Test  ", email: "  Deniz@example.test  ", password: "Sofrada123!", privacy: true, consent: true, marketing: false };
const user = { id: "fixture-member", email: "deniz@example.test", identities: [], app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-10-22T00:00:00Z" };
const fetchMock = vi.fn<typeof fetch>();
function request(body: unknown = input, headers: HeadersInit = {}, raw = false) {
  return new NextRequest(`${origin}/api/auth/register`, { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: raw ? String(body) : JSON.stringify(body) });
}
beforeEach(() => {
  callbackCookies.clear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", provider);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "task041-service-must-never-be-used");
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json({ user, session: null }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("registration validation", () => {
  it("normalizes name/email, preserves the password and defaults marketing to false", () => {
    const required = Object.fromEntries(Object.entries(input).filter(([key]) => key !== "marketing"));
    expect(validateRegisterRequest({ ...required, password: " Sofrada123! " })).toEqual({ ok: true, data: { ...input, name: "Deniz Test", email: "deniz@example.test", password: " Sofrada123! " } });
  });
  it.each([null, [], "email", 12, {}, { ...input, role: "admin" }, { ...input, marketing: "true" }, { ...input, email: 12 }, { ...input, name: {} }, { ...input, password: null }])("rejects malformed/unexpected values (%#)", body => {
    expect(validateRegisterRequest(body).ok).toBe(false);
  });
  it.each([
    ["name", "x"], ["name", "a".repeat(101)], ["email", "invalid"], ["email", "a".repeat(250) + "@example.test"],
    ["password", "short"], ["password", "lowercase123"], ["password", "UPPERCASE123"], ["password", "NoDigitsHere"], ["password", "Aa1" + "x".repeat(126)],
    ["privacy", false], ["privacy", "true"], ["consent", false], ["consent", 1],
  ])("reports the invalid %s field (%#)", (field, value) => {
    const result = validateRegisterRequest({ ...input, [field]: value });
    expect(result).toMatchObject({ ok: false, fields: { [field]: expect.any(String) } });
  });
});

describe("registration API with real Supabase SDK and mocked transport", () => {
  it("builds the confirmation callback from SITE_ORIGIN behind an internal request host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(new NextRequest("http://internal-proxy:3000/api/auth/register", {
      method: "POST", headers: { origin, "content-type": "application/json", "sec-fetch-site": "same-origin",
        "x-forwarded-host": "evil.example", "x-forwarded-proto": "http" }, body: JSON.stringify(input),
    }));
    expect(response.status).toBe(202);
    const redirect = new URL(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("redirect_to")!);
    expect(redirect.origin + redirect.pathname).toBe(`${origin}/auth/callback`);
    expect(redirect.searchParams.get("next")).toBe("/hesabim");
  });
  it("rejects production signup without SITE_ORIGIN before any provider access", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_ORIGIN", undefined);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.cookies.getAll()).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("starts PKCE with the public key, fixed same-origin callback and allowlisted consent metadata", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(request(input, { "x-forwarded-host": "evil.example", "x-forwarded-proto": "http" }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { status: "confirmation_required", message: registrationConfirmation } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    const callback = new URL(new URL(String(url)).searchParams.get("redirect_to")!);
    expect(callback.origin + callback.pathname).toBe(`${origin}/auth/callback`);
    expect(callback.searchParams.get("next")).toBe("/hesabim");
    expect(new Headers(options?.headers).get("apikey")).toBe(publicKey);
    expect(options?.cache).toBe("no-store");
    const payload = JSON.parse(String(options?.body));
    expect(payload).toMatchObject({ email: "deniz@example.test", password: input.password, code_challenge_method: "s256", code_challenge: expect.any(String), data: { name: "Deniz Test", privacy_acknowledged: true, membership_consent: true, marketing_consent: false, consent_recorded_at: expect.any(String) } });
    expect(payload.data).not.toHaveProperty("role");
    const cookies = response.cookies.getAll();
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.every(cookie => /-code-verifier(?:\.\d+)?$/.test(cookie.name) && cookie.secure && cookie.sameSite === "lax")).toBe(true);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });
  it("records an explicit optional marketing opt-in", async () => {
    expect((await POST(request({ ...input, marketing: true }))).status).toBe(202);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).data.marketing_consent).toBe(true);
  });
  it("completes the registration PKCE flow through the existing callback using mocked confirmation", async () => {
    const started = await POST(request());
    for (const cookie of started.cookies.getAll()) callbackCookies.set(cookie.name, cookie.value);
    const redirect = new URL(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("redirect_to")!);
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const token = ["header", Buffer.from(JSON.stringify({ sub: user.id, exp: expires })).toString("base64url"), "signature"].join(".");
    fetchMock.mockImplementationOnce(async () => Response.json({ user, access_token: token, refresh_token: "fixture-refresh", expires_in: 3600, token_type: "bearer" }));
    redirect.searchParams.set("code", "fixture-confirmation-code");
    const confirmed = await confirmRegistration(new Request(redirect));
    expect(confirmed.status).toBe(303);
    expect(confirmed.headers.get("location")).toBe(`${origin}/hesabim`);
    const [url, options] = fetchMock.mock.calls[1];
    expect(String(url)).toContain("grant_type=pkce");
    expect(JSON.parse(String(options?.body))).toMatchObject({ auth_code: "fixture-confirmation-code", code_verifier: expect.any(String) });
    expect(callbackCookies.has("sb-fixture-auth-token")).toBe(true);
  });
  it("does not refresh or replace an existing member session during signup", async () => {
    const response = await POST(request(input, { cookie: "sb-fixture-auth-token=private-session" }));
    expect(response.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.cookies.getAll().some(cookie => cookie.name === "sb-fixture-auth-token")).toBe(false);
  });
  it.each(["user_already_exists", "email_exists"])("returns identical confirmation and verifier cookie shape for %s", async code => {
    const success = await POST(request());
    fetchMock.mockImplementationOnce(async () => Response.json({ code, msg: "private member@example.test" }, { status: 422 }));
    const duplicate = await POST(request());
    expect(duplicate.status).toBe(success.status);
    expect(await duplicate.json()).toEqual(await success.json());
    const cookieShape = (response: typeof duplicate) => response.cookies.getAll().map(cookie => cookie.name.replace(/-flow-[a-z0-9]+-/, "-flow-"));
    expect(cookieShape(duplicate)).toEqual(cookieShape(success));
    expect(duplicate.cookies.getAll().every(cookie => cookie.value && cookie.maxAge !== 0)).toBe(true);
  });
  it("accepts an obfuscated duplicate without inspecting identities", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(JSON.stringify(await response.json())).not.toContain(user.id);
  });
  it("bounds verifier cookies across repeated duplicate requests while retaining indexed flows", async () => {
    const jar = new Map<string, string>();
    for (let attempt = 0; attempt < 12; attempt++) {
      fetchMock.mockImplementationOnce(async () => Response.json({ code: "user_already_exists" }, { status: 422 }));
      const response = await POST(request(input, { cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") }));
      expect(response.status).toBe(202);
      for (const cookie of response.cookies.getAll()) {
        if (cookie.maxAge === 0) jar.delete(cookie.name);
        else jar.set(cookie.name, cookie.value);
      }
    }
    expect(jar.size).toBeLessThanOrEqual(7);
    const index = jar.get("sb-fixture-auth-token-flows-code-verifier")!;
    const flowIds = JSON.parse(Buffer.from(index.replace(/^base64-/, ""), "base64url").toString()) as string[];
    expect(flowIds).toHaveLength(5);
    expect(flowIds.every(id => jar.has(`sb-fixture-auth-token-flow-${id}-code-verifier`))).toBe(true);
  });
  it.each([{}, { origin: "https://evil.example" }, { origin }, { origin, "sec-fetch-site": "same-site" }])("rejects absent/cross-origin CSRF before provider access (%#)", async headers => {
    const req = request();
    req.headers.delete("origin");
    Object.entries(headers).forEach(([key, value]) => req.headers.set(key, value));
    if (headers.origin === origin && !("sec-fetch-site" in headers)) req.headers.set("sec-fetch-site", "cross-site");
    expect((await POST(req)).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([null, {}, { ...input, consent: false }, { ...input, marketing: 1 }, { ...input, role: "admin" }])("rejects invalid JSON values before provider access (%#)", async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON, unsupported media and oversized bodies", async () => {
    expect((await POST(request("{", {}, true))).status).toBe(400);
    expect((await POST(request(input, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(request(" ".repeat(9000), {}, true))).status).toBe(413);
    expect((await POST(request(input, { "content-length": "9000" }))).status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns sanitized field guidance for provider password rules", async () => {
    fetchMock.mockImplementationOnce(async () => Response.json({ code: "weak_password", msg: "private password detail", weak_password: { reasons: ["pwned"] } }, { status: 422 }));
    const response = await POST(request());
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { code: "validation_error", fields: { password: expect.any(String) } } });
  });
  it.each([429, 500, 503, 401, 422])("handles upstream %s without leaking payloads or cookies", async status => {
    fetchMock.mockImplementationOnce(async () => Response.json({ msg: "private-secret", code: "private-code" }, { status }));
    const response = await POST(request());
    expect(response.status).toBe(status === 429 ? 429 : 503);
    expect(response.headers.get("retry-after")).toBe(status === 429 ? "60" : "5");
    expect(await response.text()).not.toMatch(/private-secret|private-code|deniz|token/);
    expect(response.cookies.getAll()).toHaveLength(0);
  });
  it("handles network/configuration failures without exposing secrets or logging", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("private-secret"));
    expect((await POST(request())).status).toBe(503);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    expect((await POST(request())).status).toBe(503);
    expect(log).not.toHaveBeenCalled();
  });
  it.each([{ user: null, session: null }, { user: { ...user, id: 12 } }, { user, session: { access_token: "private-access", refresh_token: "private-refresh", expires_in: 3600, token_type: "bearer" } }, {}])("fails closed on missing confirmation or malformed provider success (%#)", async body => {
    const payload = body.session ? { ...body.session, user } : body;
    fetchMock.mockImplementationOnce(async () => Response.json(payload));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.cookies.getAll()).toHaveLength(0);
    expect(await response.text()).not.toMatch(/private-access|private-refresh/);
  });
});

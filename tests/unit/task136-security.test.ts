// @vitest-environment node
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "@/proxy";
import { GET, POST, PATCH, DELETE } from "@/app/api/admin/products/route";
import nextConfig from "@/next.config";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: vi.fn() }) }));
const message = "Yönetim paneli şu an yapılandırılıyor.";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_task136_test_only");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_task136_test_only");
  vi.stubEnv("SITE_ORIGIN", "https://shop.example.test");
  vi.stubGlobal("fetch", fetchMock.mockReset());
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("admin configuration HTTP responses", () => {
  it.each([
    ["NEXT_PUBLIC_SUPABASE_URL", undefined], ["NEXT_PUBLIC_SUPABASE_URL", "https://private@example.test/path"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_secret_private"],
    ["SUPABASE_SERVICE_ROLE_KEY", undefined], ["SUPABASE_SERVICE_ROLE_KEY", "private-invalid-key"],
    ["SITE_ORIGIN", undefined], ["SITE_ORIGIN", "https://private@example.test/path"],
  ])("returns safe 503 HTML before rendering any admin page (%#)", async (key, value) => {
    vi.stubEnv(key, value);
    for (const path of ["/admin", "/admin/urunler"]) {
      for (const cookie of ["", "sb-fixture-auth-token=untrusted"]) {
        const response = await proxy(new NextRequest(`https://shop.example.test${path}`, { headers: { cookie } }));
        expect(response.status).toBe(503);
        expect(response.headers.get("content-type")).toContain("text/html");
        expect(response.headers.get("cache-control")).toContain("no-store");
        expect(response.headers.get("retry-after")).toBe("5");
        const body = await response.text();
        expect(body).toContain(message);
        expect(body).toContain('lang="tr"');
        expect(body).not.toMatch(/private|SUPABASE|SITE_ORIGIN|sb_secret|Auth configuration|protected-content/);
      }
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("covers every admin API path and returns JSON for configuration errors", async () => {
    expect(config.matcher).toContain("/api/admin/:path*");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
      const response = await proxy(new NextRequest("https://shop.example.test/api/admin/future", { method }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: { code: "admin_configuration_unavailable", message } });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("keeps direct API handlers safe even without the proxy", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    for (const handler of [GET, POST, PATCH, DELETE]) {
      const response = await handler(new Request("https://shop.example.test/api/admin/products", {
        method: handler === GET ? "GET" : "POST", headers: { origin: "https://shop.example.test" },
      }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: { code: "admin_configuration_unavailable", message } });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("passes a configured anonymous page to the existing authorization gate without a network request", async () => {
    const response = await proxy(new NextRequest("https://shop.example.test/admin"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("accepts legacy service_role JWTs while retaining anonymous authorization", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`);
    expect((await proxy(new NextRequest("https://shop.example.test/admin"))).headers.get("x-middleware-next")).toBe("1");
    expect((await GET(new Request("https://shop.example.test/api/admin/products"))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["", "   ", "sb_publishable_task136_test_only", "header.not-json.signature",
    `header.${Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url")}.signature`])("fails closed on malformed or public service configuration (%#)", async key => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", key);
    expect((await proxy(new NextRequest("https://shop.example.test/admin"))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("enforced security headers", () => {
  async function cspHeader(): Promise<string> {
    const rules = await nextConfig.headers?.();
    return rules?.flatMap(rule => rule.headers).find(header => header.key === "Content-Security-Policy")?.value ?? "";
  }

  it("adds all five headers to every route with only public CSP sources", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(nextConfig.headers).toBeTypeOf("function");
    const rules = await nextConfig.headers?.();
    const rule = rules?.find(item => item.source === "/:path*");
    const headers = Object.fromEntries(rule?.headers.map(({ key, value }) => [key.toLowerCase(), value]) ?? []);
    expect(headers).toMatchObject({
      "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin",
      "x-frame-options": "DENY", "permissions-policy": "camera=(), microphone=(), geolocation=()",
    });
    expect(Object.keys(headers)).toHaveLength(5);
    expect(headers).not.toHaveProperty("content-security-policy-report-only");
    const csp = headers["content-security-policy"];
    expect(csp?.split("; ")).toEqual([
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.paytr.com/js/iframeResizer.min.js",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://fixture.supabase.co wss://fixture.supabase.co",
      "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' blob:",
      "frame-src 'self' https://www.paytr.com", "form-action 'self' https://www.paytr.com",
      "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ]);
    expect(csp).not.toMatch(/sb_secret|sb_publishable|unsafe-eval|\*/);
    expect(warn).not.toHaveBeenCalled();
  });
  it.each([
    undefined, "", "invalid-url", "http://fixture.supabase.co", "http://localhost:54321",
    "https://private@example.test", "https://user:private@example.test",
    "https://example.test/path", "https://example.test?private=1", "https://example.test#private",
    "https://private@example.test/path; script-src *",
  ])("warns in production without exposing an absent or rejected Supabase URL (%#)", async url => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    const csp = await cspHeader();
    expect(csp).toBeTruthy();
    expect(csp.split("; ")).toContain("connect-src 'self'");
    expect(csp).not.toMatch(/private|example\.test|fixture\.supabase\.co|localhost|script-src \*/);
    expect(warn).toHaveBeenCalledExactlyOnceWith(
      "[CSP] NEXT_PUBLIC_SUPABASE_URL is missing or invalid; Supabase connections are excluded from the enforced Content-Security-Policy.",
    );
  });
  it.each(["localhost", "127.0.0.1", "[::1]"])("retains local HTTP/WebSocket sources and eval only in development (%s)", async host => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", `http://${host}:54321`);
    const csp = await cspHeader();
    expect(csp.split("; ")).toContain(`connect-src 'self' http://${host}:54321 ws://${host}:54321`);
    expect(csp).toContain("'unsafe-eval'");
    expect(warn).not.toHaveBeenCalled();
  });
  it("keeps a missing development Supabase URL silent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect((await cspHeader()).split("; ")).toContain("connect-src 'self'");
    expect(warn).not.toHaveBeenCalled();
  });
  it("keeps the local Supabase password policy aligned", async () => {
    const config = await readFile(new URL("../../supabase/config.toml", import.meta.url), "utf8");
    expect(config).toMatch(/^minimum_password_length = 10$/m);
    expect(config).toMatch(/^password_requirements = "lower_upper_letters_digits"$/m);
  });
});

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "@/proxy";
import { GET, POST, PATCH, DELETE } from "@/app/api/admin/products/route";
import nextConfig from "@/next.config";

vi.mock("server-only", () => ({}));
const session = vi.hoisted(() => vi.fn());
const query = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ query }));
vi.mock("@/lib/auth/server", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/auth/server")>(), getVerifiedSession: session,
}));
const message = "Yönetim paneli şu an yapılandırılıyor.";
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_URL", "https://shop.example.test");
  vi.stubEnv("BETTER_AUTH_SECRET", "task186-local-tests-only-32-character-secret");
  vi.stubEnv("DATABASE_URL", "postgres://postgres@localhost:54329/afina_test");
  query.mockReset(); session.mockReset().mockResolvedValue(null);
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("admin configuration HTTP responses", () => {
  it.each([
    ["BETTER_AUTH_URL", undefined], ["BETTER_AUTH_URL", "https://private@example.test/path"],
    ["BETTER_AUTH_SECRET", undefined], ["BETTER_AUTH_SECRET", "short-private-secret"],
    ["DATABASE_URL", undefined], ["DATABASE_URL", "https://private@example.test/path"],
  ])("returns safe 503 HTML before admin pages render (%#)", async (key, value) => {
    vi.stubEnv(key, value);
    for (const path of ["/admin", "/admin/urunler"]) {
      for (const cookie of ["", "better-auth.session_token=untrusted"]) {
        const response = await proxy(new NextRequest(`https://shop.example.test${path}`, { headers: { cookie } }));
        expect(response.status).toBe(503);
        expect(response.headers.get("content-type")).toContain("text/html");
        expect(response.headers.get("cache-control")).toContain("no-store");
        expect(response.headers.get("retry-after")).toBe("5");
        const body = await response.text();
        expect(body).toContain(message);
        expect(body).toContain('lang="tr"');
        expect(body).not.toMatch(/private|DATABASE_URL|BETTER_AUTH|Auth configuration|protected-content/);
      }
    }
    expect(session).not.toHaveBeenCalled(); expect(query).not.toHaveBeenCalled();
  });
  it("covers every admin API path and returns JSON for configuration errors", async () => {
    expect(config.matcher).toContain("/api/admin/:path*");
    vi.stubEnv("BETTER_AUTH_URL", undefined);
    for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
      const response = await proxy(new NextRequest("https://shop.example.test/api/admin/future", { method }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: { code: "admin_configuration_unavailable", message } });
    }
  });
  it("keeps direct API handlers safe without the proxy", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    for (const handler of [GET, POST, PATCH, DELETE]) {
      const response = await handler(new Request("https://shop.example.test/api/admin/products", {
        method: handler === GET ? "GET" : "POST", headers: { origin: "https://shop.example.test" },
      }));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: { code: "admin_configuration_unavailable", message } });
    }
    expect(session).not.toHaveBeenCalled(); expect(query).not.toHaveBeenCalled();
  });
  it("passes configured anonymous pages to server authorization; presence of a forged cookie grants nothing", async () => {
    for (const cookie of ["", "better-auth.session_token=forged"]) {
      const response = await proxy(new NextRequest("https://shop.example.test/admin", { headers: { cookie } }));
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
    expect((await GET(new Request("https://shop.example.test/api/admin/products"))).status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("enforced security headers", () => {
  async function cspHeader(): Promise<string> {
    const rules = await nextConfig.headers?.();
    return rules?.flatMap(rule => rule.headers).find(header => header.key === "Content-Security-Policy")?.value ?? "";
  }
  it("adds five headers to every route without exposing database or auth configuration", async () => {
    const rules = await nextConfig.headers?.();
    const rule = rules?.find(item => item.source === "/:path*");
    const headers = Object.fromEntries(rule?.headers.map(({ key, value }) => [key.toLowerCase(), value]) ?? []);
    expect(headers).toMatchObject({
      "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin",
      "x-frame-options": "DENY", "permissions-policy": "camera=(), microphone=(), geolocation=()",
    });
    expect(Object.keys(headers)).toHaveLength(5);
    expect(headers).not.toHaveProperty("content-security-policy-report-only");
    expect(headers["content-security-policy"]?.split("; ")).toEqual([
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.paytr.com/js/iframeResizer.min.js",
      "style-src 'self' 'unsafe-inline'", "connect-src 'self'",
      "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' blob:",
      "frame-src 'self' https://www.paytr.com", "form-action 'self' https://www.paytr.com",
      "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests",
    ]);
    expect(headers["content-security-policy"]).not.toMatch(/postgres|localhost|BETTER_AUTH|private|unsafe-eval|\*/);
  });
  it("keeps database origins and secrets out of browser connection policy", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://private:private@private.example.test/db");
    vi.stubEnv("BETTER_AUTH_SECRET", "private-secret-long-enough-for-test-only");
    expect((await cspHeader()).split("; ")).toContain("connect-src 'self'");
    expect(await cspHeader()).not.toContain("private");
  });
  it("allows eval solely for the development runtime", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const csp = await cspHeader();
    expect(csp).toContain("'unsafe-eval'");
    expect(csp.split("; ")).toContain("connect-src 'self'");
  });
});

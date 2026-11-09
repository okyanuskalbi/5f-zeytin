// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdminMutation } from "@/lib/auth/admin";
import { assertAuthMutation, authErrorResponse } from "@/lib/auth/server";

vi.mock("server-only", () => ({}));
const session = vi.hoisted(() => vi.fn());
const query = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ query }));
vi.mock("@/lib/auth/server", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/auth/server")>(), getVerifiedSession: session,
}));
const origin = "https://shop.example.test";
const mutation = (url = `${origin}/api/admin/products`, headers: HeadersInit = { origin }) =>
  new Request(url, { method: "POST", headers });

beforeEach(() => {
  session.mockReset().mockResolvedValue(null); query.mockReset();
  vi.stubEnv("BETTER_AUTH_URL", origin);
  vi.stubEnv("BETTER_AUTH_SECRET", "task186-local-tests-only-32-character-secret");
  vi.stubEnv("DATABASE_URL", "postgres://postgres@localhost:54329/afina_test");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe.each(["auth", "admin"])("%s mutation origin behind a proxy", guard => {
  const invoke = async (request: Request) => {
    try {
      if (guard === "auth") assertAuthMutation(request);
      else await requireAdminMutation(request);
      return new Response(null, { status: 204 });
    } catch (error) { return authErrorResponse(error); }
  };
  it("uses configured public origin despite internal URL or spoofed forwarded headers", async () => {
    const response = await invoke(mutation("http://internal-proxy:3000/api/admin/products", {
      origin, "sec-fetch-site": "same-origin", "x-forwarded-host": "evil.example", "x-forwarded-proto": "http",
    }));
    expect(response.status).toBe(guard === "auth" ? 204 : 401);
    expect(query).not.toHaveBeenCalled();
  });
  it("rejects matching request URL when Origin differs from configured origin", async () => {
    expect((await invoke(mutation("https://evil.example/api/admin/products", { origin: "https://evil.example" }))).status).toBe(403);
    expect(session).not.toHaveBeenCalled();
  });
  it.each(["same-site", "cross-site", "none"])("rejects Sec-Fetch-Site %s before identity lookup", async site => {
    expect((await invoke(mutation(undefined, { origin, "sec-fetch-site": site }))).status).toBe(403);
    expect(session).not.toHaveBeenCalled();
  });
  it.each([undefined, "", "https://private@example.test", "https://example.test/path"])("fails closed for invalid production auth origin (%#)", async value => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("BETTER_AUTH_URL", value);
    const response = await invoke(mutation());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/private@|BETTER_AUTH_URL|internal-proxy/);
    expect(session).not.toHaveBeenCalled();
  });
  it("accepts an explicitly configured local origin in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const local = "http://localhost:3004";
    vi.stubEnv("BETTER_AUTH_URL", local);
    expect((await invoke(mutation(`${local}/auth/logout`, { origin: local }))).status).toBe(guard === "auth" ? 204 : 401);
    expect((await invoke(mutation(`${local}/auth/logout`, { origin: "http://localhost:3005" }))).status).toBe(403);
  });
});

// @vitest-environment node
import { describe, expect, it, vi, afterEach } from "vitest";
import { getAuthCookieOptions, safeAuthRedirect } from "@/lib/auth/config";
import { getAuthConfig } from "@/lib/auth/server-config";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());
describe("Neon auth security configuration", () => {
 it("requires an explicit secret and trusted origin", () => {
  vi.stubEnv("BETTER_AUTH_SECRET", ""); vi.stubEnv("BETTER_AUTH_URL", "https://afinazeytin.com");
  expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
 });
 it("keeps cookies private and redirects allowlisted", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(getAuthCookieOptions()).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax" });
  expect(safeAuthRedirect("https://evil.test")).toBe("/hesabim");
 });
});

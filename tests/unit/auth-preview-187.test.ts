// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthConfig } from "@/lib/auth/server-config";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_URL", "https://afinazeytin.com");
  vi.stubEnv("BETTER_AUTH_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("VERCEL_URL", "afina-preview-187.vercel.app");
});
afterEach(() => vi.unstubAllEnvs());

describe("Task187 exact preview authentication origin", () => {
  it("uses only the deployment's injected hostname for preview", () => {
    expect(getAuthConfig().siteOrigin).toBe("https://afina-preview-187.vercel.app");
  });
  it("does not require the production URL in preview", () => {
    vi.stubEnv("BETTER_AUTH_URL", "");
    expect(getAuthConfig().siteOrigin).toBe("https://afina-preview-187.vercel.app");
  });
  it.each([undefined, "", "evil.example", "evil.vercel.app.attacker.test", "user@afina.vercel.app", "afina.vercel.app:444", "afina.vercel.app/path", "https://afina.vercel.app", "afina.vercel.app?value=1"])("fails closed for malformed deployment hostname (%#)", value => {
    vi.stubEnv("VERCEL_URL", value);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it.each(["production", "development", undefined])("preserves the configured origin outside preview (%s)", environment => {
    vi.stubEnv("VERCEL_ENV", environment);
    expect(getAuthConfig().siteOrigin).toBe("https://afinazeytin.com");
  });
  it("does not activate preview behavior outside Vercel", () => {
    vi.stubEnv("VERCEL", "");
    expect(getAuthConfig().siteOrigin).toBe("https://afinazeytin.com");
  });
  it("still requires a strong configured secret in preview", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
});

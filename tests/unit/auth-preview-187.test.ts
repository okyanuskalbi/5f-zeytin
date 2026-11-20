// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthConfig } from "@/lib/auth/server-config";
import { getAppEnv, isCloudflareRuntime } from "@/lib/runtime/app-env";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_URL", "https://afina-zeytin.example.workers.dev");
  vi.stubEnv("BETTER_AUTH_SECRET", randomBytes(32).toString("hex"));
  vi.stubEnv("APP_ENV", "preview");
});
afterEach(() => vi.unstubAllEnvs());

describe("Task213 authentication origin comes only from BETTER_AUTH_URL", () => {
  it("uses the configured origin in every APP_ENV", () => {
    for (const environment of ["production", "preview", "development", undefined]) {
      vi.stubEnv("APP_ENV", environment);
      expect(getAuthConfig().siteOrigin).toBe("https://afina-zeytin.example.workers.dev");
    }
  });
  it("ignores legacy deployment hostname variables", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "afina-preview-187.vercel.app");
    expect(getAuthConfig().siteOrigin).toBe("https://afina-zeytin.example.workers.dev");
  });
  it.each([undefined, "", "http://example.test", "https://user@example.test", "https://example.test/path", "https://example.test?x=1"])("fails closed for a malformed or absent origin (%#)", value => {
    vi.stubEnv("BETTER_AUTH_URL", value);
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
  it("still requires a strong configured secret", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(() => getAuthConfig()).toThrow("Auth configuration unavailable");
  });
});

describe("Task213 APP_ENV", () => {
  it.each(["production", "preview", "development"])("accepts %s", value => {
    vi.stubEnv("APP_ENV", value);
    expect(getAppEnv()).toBe(value);
  });
  it("falls back to NODE_ENV and never trusts the client IP header outside Workers", () => {
    vi.stubEnv("APP_ENV", "bogus");
    expect(getAppEnv()).toBe("production");
    vi.stubEnv("NODE_ENV", "development");
    expect(getAppEnv()).toBe("development");
    expect(isCloudflareRuntime()).toBe(false);
  });
});

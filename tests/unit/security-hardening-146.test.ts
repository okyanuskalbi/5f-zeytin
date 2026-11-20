// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Production demo build guard", () => {
  it("rejects demo mode as soon as the production config loads", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
    await expect(import("@/next.config")).rejects.toThrow(
      "Production ortamında demo modu açılamaz. NEXT_PUBLIC_DEMO=1 ayarını kaldırın.",
    );
  });

  it.each([
    ["production", "0"], ["preview", "1"], ["preview", "0"],
    ["production", undefined], [undefined, "1"], ["development", "1"],
  ])("loads with APP_ENV=%s and NEXT_PUBLIC_DEMO=%s", async (environment, demo) => {
    // A local next build/start uses production NODE_ENV too; E2E must keep demo mode.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", environment);
    vi.stubEnv("NEXT_PUBLIC_DEMO", demo);
    await expect(import("@/next.config")).resolves.toHaveProperty("default");
  });
});

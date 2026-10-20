import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localPort = Number(process.env.PLAYWRIGHT_PORT ?? 3004);
if (!Number.isInteger(localPort) || localPort < 1 || localPort > 65535) {
  throw new Error("PLAYWRIGHT_PORT must be a valid port.");
}
const baseURL = externalBaseURL ?? `http://localhost:${localPort}`;
const targetURL = new URL(baseURL);
const browserNames = ["chromium", "firefox", "webkit"] as const;
const viewportWidths = [320, 390, 768, 1440];

if (!["http:", "https:"].includes(targetURL.protocol)) {
  throw new Error("PLAYWRIGHT_BASE_URL must use http or https.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  metadata: { targetHost: targetURL.host },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [...browserNames.flatMap((browserName) =>
    viewportWidths.map((width) => ({
      name: `${browserName}-${width}`,
      use: { browserName, viewport: { width, height: 900 } },
    })),
  ), { name: "webkit-iphone14", use: { ...devices["iPhone 14"] } }],
  webServer:
    externalBaseURL !== undefined
      ? undefined
      : {
          command: `npm run start -- --port ${localPort}`,
          url: baseURL,
          // A server from another checkout must never satisfy local acceptance.
          reuseExistingServer: false,
          timeout: 120_000,
          gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
        },
});

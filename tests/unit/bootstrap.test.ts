import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { scripts } from "../../package.json";

// next/font is a build-time transform; browser tests verify the real font files.
vi.mock("next/font/google", () => ({
  Fraunces: () => ({ variable: "font-display" }),
  Figtree: () => ({ variable: "font-body" }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("ZEYTİN bootstrap", () => {
  it("renders the brand heading inside the main landmark", async () => {
    const { default: Home } = await import("../../app/page");

    render(await Home());

    const heading = screen.getByRole("heading", { level: 1, name: "Kökü toprakta. Yeri sofrada." });
    expect(screen.getByRole("main").contains(heading)).toBe(true);
    expect(screen.getByRole("img", { name: "Afina Zeytin" })).toBeDefined();
  });

  it("identifies the application as ZEYTİN in page metadata", async () => {
    const { metadata } = await import("../../app/layout");

    expect(metadata.title).toBe("Afina Zeytin | Zeytin ve Zeytinyağı");
    expect(metadata.other).toMatchObject({ app: "zeytin" });
  });

  it("serves Turkish document semantics and keeps child content", async () => {
    const { default: RootLayout } = await import("../../app/layout");

    const html = renderToStaticMarkup(
      await RootLayout({ children: createElement("p", null, "İçerik") }),
    );

    expect(new DOMParser().parseFromString(html, "text/html").documentElement.lang).toBe("tr");
    expect(html).toContain("<p>İçerik</p>");
  });
});

describe("Playwright target selection", () => {
  it("uses port 3004 for development and production servers", () => {
    expect(scripts.dev).toBe("next dev -p 3004");
    expect(scripts.start).toBe("next start -p 3004");
  });

  it("starts a local server on 3004 with three browsers, four widths and iPhone 14", async () => {
    vi.stubEnv("PLAYWRIGHT_BASE_URL", undefined);
    vi.stubEnv("PLAYWRIGHT_PORT", undefined);
    const { default: config } = await import("../../playwright.config");

    expect(config.use?.baseURL).toBe("http://localhost:3004");
    expect(config.webServer).toMatchObject({
      command: "npm run start -- --port 3004",
      url: "http://localhost:3004",
      reuseExistingServer: false,
    });
    expect(config.metadata).toMatchObject({ targetHost: "localhost:3004" });
    expect(config.projects).toHaveLength(13);
    expect(config.projects).toContainEqual(expect.objectContaining({
      name: "webkit-iphone14",
      use: expect.objectContaining({ defaultBrowserType: "webkit", isMobile: true, hasTouch: true }),
    }));
    for (const browserName of ["chromium", "firefox", "webkit"]) {
      for (const width of [320, 390, 768, 1440]) {
        expect(config.projects).toContainEqual(
          expect.objectContaining({
            use: expect.objectContaining({ browserName, viewport: { width, height: 900 } }),
          }),
        );
      }
    }
  });

  it("owns the requested local production port without reusing another server", async () => {
    vi.stubEnv("PLAYWRIGHT_BASE_URL", undefined);
    vi.stubEnv("PLAYWRIGHT_PORT", "3104");
    const { default: config } = await import("../../playwright.config");

    expect(config.use?.baseURL).toBe("http://localhost:3104");
    expect(config.webServer).toMatchObject({ command: "npm run start -- --port 3104", reuseExistingServer: false });
  });

  it("rejects an invalid local port", async () => {
    vi.stubEnv("PLAYWRIGHT_PORT", "0");
    await expect(import("../../playwright.config")).rejects.toThrow("PLAYWRIGHT_PORT must be a valid port.");
  });

  it("uses the explicit remote host and disables the local webServer", async () => {
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "https://preview.example.com");
    const { default: config } = await import("../../playwright.config");

    expect(config.use?.baseURL).toBe("https://preview.example.com");
    expect(config.webServer).toBeUndefined();
    expect(config.metadata).toMatchObject({ targetHost: "preview.example.com" });
  });

  it("rejects an empty explicit target instead of falling back to localhost", async () => {
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "");

    await expect(import("../../playwright.config")).rejects.toThrow("Invalid URL");
  });
});

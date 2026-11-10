import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
];
const routes = [
  { name: "bulunamayan", url: "/task189-1-bulunamayan", status: 404 },
  { name: "odeme-onizleme", url: "/odeme-onizleme", status: 404 },
  { name: "siparis-takip", url: "/siparis-takip", status: 200 },
  { name: "urunler", url: "/urunler", status: 200 },
  { name: "kategori-siyah", url: "/urunler/siyah-zeytin", status: 200 },
  { name: "kategori-yesil", url: "/urunler/yesil-zeytin", status: 200 },
  { name: "kategori-kirma", url: "/urunler/kirma-zeytin", status: 200 },
  { name: "kategori-yag", url: "/urunler/zeytinyagi", status: 200 },
];

function rgb(value: string): number[] {
  return (value.match(/[\d.]+/g) ?? []).map(Number);
}

test.describe("Task189-1 footer and document canvas", () => {
  // Supply the requested viewport matrix once, using packaged Chromium only.
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium-390", "Run the footer matrix once with chromium-390.");
  });
  test.setTimeout(90_000);

  for (const viewport of viewports) for (const route of routes) {
    test(`${viewport.width}x${viewport.height} ${route.name}: no light pixels below the footer`, async ({ browser, baseURL }, testInfo) => {
      const origin = new URL(baseURL ?? "http://localhost:3004");
      expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
      const output = path.resolve("output/task189-1-footer");
      await mkdir(output, { recursive: true });
      const modes = [];

      for (const colorScheme of ["light", "dark"] as const) {
        const context = await browser.newContext({ baseURL: origin.href, viewport, reducedMotion: "reduce", colorScheme });
        try {
          await context.route("**/*", request => {
            const url = new URL(request.request().url());
            return [origin.hostname, "localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? request.continue() : request.abort();
          });
          await context.addInitScript(() => {
            localStorage.setItem("afina-zeytin:cart", JSON.stringify([{ productId: "sample-olive-oil-1l", quantity: 1 }]));
          });
          const page = await context.newPage();
          const response = await page.goto(route.url, { waitUntil: "networkidle" });
          expect(response?.status()).toBe(route.status);
          await page.evaluate(async () => {
            await document.fonts.ready;
            for (const image of document.images) image.loading = "eager";
            await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
          });
          await expect(page.locator("footer")).toBeInViewport();
          if (viewport.width === 390 && !route.url.startsWith("/odeme")) {
            await expect(page.locator("[data-mini-cart-reserve]")).toBeVisible();
            await expect(page.locator("[data-mini-cart]")).toHaveCount(0);
          }
          // Wait for actual bottom geometry, rather than a timer or animation duration.
          await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY + innerHeight - document.documentElement.scrollHeight))).toBeLessThanOrEqual(1);
          const geometry = await page.evaluate(() => {
            const footer = document.querySelector("footer")!;
            const reserve = document.querySelector<HTMLElement>("[data-mini-cart-reserve]");
            let surface = document.querySelector<HTMLElement>("main");
            let contentBackground = "";
            while (surface) {
              const value = getComputedStyle(surface).backgroundColor;
              if (value !== "rgba(0, 0, 0, 0)" && value !== "transparent") { contentBackground = value; break; }
              surface = surface.parentElement;
            }
            return {
              footerBottom: footer.getBoundingClientRect().bottom + scrollY,
              footerBackground: getComputedStyle(footer).backgroundColor,
              documentHeight: document.documentElement.scrollHeight,
              htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
              contentBackground,
              reserveBackground: reserve && getComputedStyle(reserve).display !== "none" ? getComputedStyle(reserve).backgroundColor : null,
              miniCartCount: document.querySelectorAll("[data-mini-cart]").length,
            };
          });
          const name = `${viewport.width}x${viewport.height}-${route.name}-${colorScheme}`;
          const screenshot = await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true, animations: "disabled", caret: "hide" });
          const pixels = await sharp(screenshot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          const footerColor = rgb(geometry.footerBackground);
          let mismatchingPixels = 0;
          const startY = Math.ceil(geometry.footerBottom);
          for (let y = startY; y < pixels.info.height; y++) for (let x = 0; x < pixels.info.width; x++) {
            const index = (y * pixels.info.width + x) * 4;
            if (footerColor.slice(0, 3).some((channel, i) => Math.abs(pixels.data[index + i] - channel) > 2) || pixels.data[index + 3] !== 255) mismatchingPixels++;
          }
          const report = { colorScheme, ...geometry, screenshotHeight: pixels.info.height, sampledRowsBelowFooter: Math.max(0, pixels.info.height - startY), mismatchingPixels };
          modes.push(report);
          expect.soft(geometry.footerBottom).toBeLessThanOrEqual(geometry.documentHeight + 1);
          expect.soft(mismatchingPixels, `${name}: every rendered pixel after the footer must match its dark background`).toBe(0);
          const canvas = rgb(geometry.htmlBackground);
          expect.soft(canvas.length === 3 || canvas[3] === 1, "The root overscroll canvas must be opaque.").toBe(true);
          expect.soft(canvas.slice(0, 3).every(channel => channel < 96), "The root overscroll canvas must remain dark.").toBe(true);
          const content = rgb(geometry.contentBackground);
          expect.soft(content[0], "Page content must retain its light ivory surface.").toBeGreaterThanOrEqual(230);
          expect.soft(content[1]).toBeGreaterThanOrEqual(225);
          expect.soft(content[2]).toBeGreaterThanOrEqual(210);
          if (geometry.reserveBackground) expect.soft(geometry.reserveBackground).toBe(geometry.footerBackground);
        } finally { await context.close(); }
      }
      await writeFile(path.join(output, `${viewport.width}x${viewport.height}-${route.name}.json`), JSON.stringify(modes, null, 2));
      await testInfo.attach("footer-pixel-report", { body: JSON.stringify(modes, null, 2), contentType: "application/json" });
    });
  }
});

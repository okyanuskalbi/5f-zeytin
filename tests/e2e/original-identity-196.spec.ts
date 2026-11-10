import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const order = ["hero", "categories", "products", "story", "featured", "banners", "harvest", "marquee", "business", "blog", "trust"];
const forbidden = /topraktan sofraya|tarladan sofraya|doğallığın|sizden gelen|daha fazlasını keşfet|en beğenilen/iu;

test.describe("Task196 AFİNA original identity", () => {
  test.beforeEach(async ({ context, browserName, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged headless Chromium matrix.");
    const origin = new URL(baseURL ?? "http://localhost:3004");
    expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  });

  for (const width of [320, 390, 768, 1440]) test(`${width}: customer content remains ordered, readable and recognisably AFİNA`, async ({ page }) => {
    await mkdir("output/task196", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const result = { cls: 0 };
      Object.assign(window, { task196Metrics: result });
      new PerformanceObserver(list => { for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) result.cls += entry.value;
      } }).observe({ type: "layout-shift", buffered: true });
    });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    expect((await page.goto("/", { waitUntil: "load" }))?.status()).toBe(200);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const image of document.images) image.loading = "eager";
      await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
    });
    expect(await page.locator("[data-home-section]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-home-section")))).toEqual(order);
    expect(await page.locator("main").innerText()).not.toMatch(forbidden);
    await expect(page.locator('[data-home-section="blog"] h2')).toHaveText("Zeytin Defteri");
    await expect(page.locator('[data-home-section="banners"]')).not.toContainText(/Keşfedin|\b0[123]\b/u);
    const categories = page.locator("[data-home-category]");
    await expect(categories).toHaveCount(4);
    for (const category of await categories.all()) {
      const link = await category.boundingBox();
      expect(link!.height).toBeGreaterThanOrEqual(44);
      const photograph = category.locator("picture");
      const picture = await photograph.boundingBox();
      expect(picture!.width).toBeGreaterThan(0);
      // The former circular category medallions must no longer remain.
      const radii = await photograph.evaluate(node => {
        const css = getComputedStyle(node);
        return [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius];
      });
      expect(radii.every(radius => radius === "50%" || radius === "9999px")).toBe(false);
    }
    const harvest = page.locator('[data-home-section="harvest"]');
    await expect(harvest.getByRole("heading", { level: 2 })).toHaveText("Bereketin Hasat Vakti");
    await expect(harvest).not.toContainText(/\b0[1-4]\b/u);
    await expect(harvest.locator("li h3")).toHaveText(["Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız"]);
    await expect(harvest.getByRole("link", { name: "Hikayemizi Keşfet", exact: true })).toHaveAttribute("href", "/hakkimizda");
    await expect(page.locator('[data-home-section="business"] img')).toHaveCount(0);
    for (const section of await page.locator('[data-home-section="products"], [data-home-section="featured"]').all()) {
      const more = section.getByRole("link", { name: "Tüm Ürünler", exact: true });
      await expect(more).toHaveAttribute("href", "/urunler");
      const lastProduct = section.locator("article[data-product-id]").last();
      const cardBounds = await lastProduct.boundingBox(), linkBounds = await more.boundingBox();
      expect(linkBounds!.y).toBeGreaterThanOrEqual(cardBounds!.y + cardBounds!.height);
    }
    const signature = page.locator('[data-home-section="trust"]');
    await expect(signature.getByRole("img", { name: "AFİNA ZEYTİN", exact: true })).toHaveCount(1);
    await expect(signature).toContainText("Kökü toprakta.");
    await expect(signature).toContainText("Yeri sofrada.");
    await expect(signature.locator("li")).toHaveCount(0);
    const report = await page.evaluate(() => ({ cls: (window as unknown as { task196Metrics: { cls: number } }).task196Metrics.cls,
      overflow: document.documentElement.scrollWidth - innerWidth,
      brokenImages: [...document.images].filter(image => !image.naturalWidth).map(image => image.currentSrc || image.src) }));
    expect(report.cls).toBeLessThan(.05);
    expect(report.overflow).toBeLessThanOrEqual(1);
    expect(report.brokenImages).toEqual([]);
    const contrast = (await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze()).violations;
    expect(contrast).toEqual([]);
    expect(errors).toEqual([]);
    await writeFile(`output/task196/layout-${width}.json`, JSON.stringify({ ...report, contrast, errors }, null, 2));
  });

  for (const width of [390, 1440]) test(`${width}: doubled text stays in flow and visible keyboard links remain usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(async () => { await document.fonts.ready; document.documentElement.style.fontSize = "200%"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    for (const link of await page.locator('[data-home-categories] a, [data-home-section="harvest"] a, [data-home-section="business"] a').all()) {
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link).toBeInViewport();
      const bounds = await link.boundingBox();
      expect(bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
});

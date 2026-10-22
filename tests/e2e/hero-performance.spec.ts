import { expect, test } from "@playwright/test";
import manifest from "../../public/images/v3/manifest.json";

for (const width of [390, 768, 900, 901, 1440]) {
  test(`v4: matching SSR art direction and budget at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    const html = await (await request.get("/")).text();
    expect(html).toMatch(/rel="preload"[^>]+as="image"[^>]+type="image\/avif"[^>]+media="\(max-width: 900px\)"/);
    const images: string[] = [];
    page.on("request", entry => { if (/\/images\/v3\/hero-|\/frames\//.test(entry.url())) images.push(entry.url()); });
    await page.goto("/");
    const photo = page.locator("[data-hero-photo] img");
    await expect(photo).toHaveAttribute("fetchpriority", "high");
    await expect.poll(() => photo.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    const currentSrc = await photo.evaluate((node: HTMLImageElement) => node.currentSrc);
    const key = width <= 900 ? "hero-mobil" : "hero-masaustu";
    expect(currentSrc).toContain(key);
    expect(currentSrc).toMatch(/\.avif$/);
    expect(images).toHaveLength(1);
    for (const output of manifest.assets[key].outputs) {
      const response = await request.get(output.file);
      expect(response.ok()).toBe(true);
      expect((await response.body()).length).toBeLessThanOrEqual(width <= 900 ? 120000 : 180000);
    }
    await expect(page.locator("[data-hero-intro] canvas, [data-hero-intro] video")).toHaveCount(0);
  });
}

// Claude executes these cases; Codex only writes/typechecks them.
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test.describe(`hero card at ${viewport.width}px / 3x`, () => {
    test.use({ viewport, deviceScaleFactor: 3, reducedMotion: "reduce" });
    test("uses one responsive preload per hero image and preserves the card dimensions", async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Headless bundled Chromium owns image candidate acceptance.");
      const cardRequests: string[] = [];
      page.on("request", entry => {
        if (/\/images\/v3\/urun-01-kirma-10kg-w\d+\./.test(entry.url())) cardRequests.push(entry.url());
      });
      await page.goto("/");
      const image = page.locator("[data-hero-card] img");
      await expect(image).toHaveAttribute("loading", "eager");
      await expect(image).toHaveAttribute("fetchpriority", "high");
      await expect(image).toHaveAttribute("decoding", "async");
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      const mobile = viewport.width <= 900;
      const currentSrc = await image.evaluate((node: HTMLImageElement) => node.currentSrc);
      expect(currentSrc).toContain(`urun-01-kirma-10kg-w${mobile ? 216 : 288}.avif`);
      expect(cardRequests).toEqual([currentSrc]);
      await expect(image).toHaveCSS("width", mobile ? "72px" : "96px");
      await expect(image).toHaveCSS("height", mobile ? "92px" : "118px");
      const activePreloads = await page.locator('head link[rel="preload"][as="image"]').evaluateAll(links => links
        .filter(link => matchMedia(link.getAttribute("media")!).matches)
        .map(link => link.getAttribute("imagesrcset")));
      expect(activePreloads).toHaveLength(2);
      expect(activePreloads.filter(srcset => srcset?.includes("urun-01-kirma-10kg-w"))).toHaveLength(1);
    });
  });
}

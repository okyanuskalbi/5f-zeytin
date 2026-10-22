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

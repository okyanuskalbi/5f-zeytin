import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("hero heading preloads a small subset of the approved Fraunces face", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const preload = html.match(/<link[^>]+rel="preload"[^>]+href="([^"]*Fraunces_hero[^"]*\.woff2)"[^>]+as="font"/i);
  expect(preload, "the LCP headline font must be discoverable in server HTML").not.toBeNull();
  const response = await request.get(preload![1]);
  expect(response.ok()).toBe(true);
  expect((await response.body()).length).toBeLessThan(20 * 1024);
});

test("mobile poster is preloaded in SSR and frames wait for idle or interaction with a ten-frame budget", async ({ page, request }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 });
    // Hold browser idle work: the SSR poster and purchase controls must stand alone.
    window.requestIdleCallback = () => 1;
    window.cancelIdleCallback = () => {};
  });
  const frames: string[] = [];
  page.on("request", (entry) => { if (/\/frames\/hero-zeytin\/\d+\/frame-/.test(entry.url())) frames.push(entry.url()); });
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/<link[^>]+rel="preload"[^>]+as="image"[^>]+imageSrcSet=/i);
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  const poster = hero.locator("[data-frame-sequence] img");
  await expect.poll(() => poster.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(hero.getByRole("button", { name: "Sepete ekle" })).toBeEnabled();
  expect(frames).toHaveLength(0);
  const currentSrc = await poster.evaluate((node: HTMLImageElement) => node.currentSrc);
  const delivery = await request.get(currentSrc, { headers: { Accept: "image/avif,image/webp" } });
  expect(delivery.headers()["content-type"]).toContain("image/avif");
  const bytes = await delivery.body();
  expect(bytes.length).toBeLessThanOrEqual(60 * 1024);
  expect(await sharp(bytes).metadata()).toMatchObject({ width: 900, height: 1350 });
  const fallback = await request.get(currentSrc.replace(".avif", ".webp"), { headers: { Accept: "image/webp" } });
  expect(fallback.headers()["content-type"]).toContain("image/webp");
  expect((await fallback.body()).length).toBeLessThanOrEqual(60 * 1024);
  await page.screenshot({ path: testInfo.outputPath("mobile-poster.png") });
  await page.keyboard.press("Shift");
  await expect(hero.locator("canvas")).toHaveAttribute("data-frame", "0");
  await expect.poll(() => frames.length).toBe(10);
  await page.waitForTimeout(300);
  expect(frames).toHaveLength(10);
});

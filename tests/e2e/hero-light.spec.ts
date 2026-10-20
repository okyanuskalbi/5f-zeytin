import { mkdir } from "node:fs/promises";
import { devices, expect, test, type Page } from "@playwright/test";

async function seek(page: Page, progress: number): Promise<void> {
  await page.locator("[data-hero-scene]").evaluate((node, value) => {
    const stage = node.querySelector("[data-hero-stage]")!;
    scrollTo(0, node.getBoundingClientRect().top + scrollY + (node.clientHeight - stage.clientHeight) * value);
  }, progress);
}

test("101: light rises at 20/60/95 percent and reverses with the headline and real frames", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const scene = page.locator("[data-hero-scene]");
  const stage = page.locator("[data-hero-stage]");
  const second = page.locator("#hero-title span").nth(1);
  await expect(scene).toBeVisible();
  const geometry = await scene.evaluate(node => ({ height: node.clientHeight, viewport: innerHeight }));
  expect(geometry.height / geometry.viewport).toBeCloseTo(1.8, 1);
  await mkdir("test-results/101", { recursive: true });
  for (const progress of [0.2, 0.6, 0.95]) {
    await seek(page, progress);
    await expect.poll(() => stage.evaluate(node => getComputedStyle(node).backgroundColor)).toMatch(progress === 0.2 ? /rgb\(13, 17, 13\)/ : progress === 0.95 ? /rgb\(246, 241, 230\)/ : /rgba?\(/);
    await expect(second).toHaveCSS("opacity", progress === 0.2 ? "0" : "1");
    const metrics = await stage.evaluate(node => {
      const media = node.querySelector("[data-hero-media]")!;
      return { background: getComputedStyle(node).backgroundColor, filter: getComputedStyle(media).filter, transform: getComputedStyle(media).transform };
    });
    if (progress === 0.6) expect(metrics.background).not.toBe("rgb(13, 17, 13)");
    if (progress === 0.95) { expect(metrics.filter).toBe("brightness(1)"); expect(metrics.transform).not.toBe("none"); }
    await info.attach(`scroll-${progress}`, { body: JSON.stringify(metrics), contentType: "application/json" });
    await page.screenshot({ path: `test-results/101/${info.project.name}-${progress}.png` });
  }
  await seek(page, 0.2);
  await expect(second).toHaveCSS("opacity", "0");
  await expect(stage).toHaveCSS("background-color", "rgb(13, 17, 13)");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  const cta = page.getByRole("link", { name: "Ürünleri keşfet", exact: true });
  await cta.click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.locator("#urunler")).toBeInViewport();
});

test("101: reduced motion has cream ground, both lines and a static poster immediately", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", request => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.goto("/");
  const stage = page.locator("[data-hero-stage]");
  const second = page.locator("#hero-title span").nth(1);
  await expect(stage).toHaveCSS("background-color", "rgb(246, 241, 230)");
  await expect(second).toHaveCSS("opacity", "1");
  await expect(second).toHaveCSS("transform", "none");
  await expect(page.locator("[data-hero-media]")).toHaveCSS("transform", "none");
  await expect(page.locator("[data-frame-sequence] canvas")).toHaveCount(0);
  await mkdir("test-results/101", { recursive: true });
  await page.screenshot({ path: `test-results/101/${info.project.name}-reduce.png` });
  await page.evaluate(() => scrollBy(0, 180));
  await expect(stage).toHaveCSS("background-color", "rgb(246, 241, 230)");
  expect(frames).toEqual([]);
});

test("101: Pixel 7 light sequence screenshots", async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== "chromium-1440", "One Chromium Pixel 7 device capture.");
  const context = await browser.newContext({ ...devices["Pixel 7"], baseURL, reducedMotion: "no-preference" });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await mkdir("test-results/101", { recursive: true });
    for (const progress of [0.2, 0.6, 0.95]) {
      await seek(page, progress);
      await expect(page.locator("#hero-title span").nth(1)).toHaveCSS("opacity", progress === 0.2 ? "0" : "1");
      await page.screenshot({ path: `test-results/101/Pixel-7-${progress}.png` });
    }
  } finally { await context.close(); }
});

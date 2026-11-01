import { expect, test } from "@playwright/test";

test("accepted film follows forward and reverse scroll, holds its ending and rearms reduced motion", async ({ page }, testInfo) => {
  test.skip(page.viewportSize()!.width < 1024, "Desktop-only scrub; phones have a deliberately static composition.");
  await page.goto("/", { waitUntil: "networkidle" });
  const hero = page.locator("#baslangic");
  const video = hero.locator("video");
  await expect(hero).toHaveAttribute("data-hero-mode", "scrub");
  await expect(video).toHaveAttribute("src", /^blob:/);
  await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).currentTime)).toBeLessThan(.1);
  await expect(hero.locator("h1").locator("..")).toHaveCSS("opacity", "1");
  const geometry = await hero.evaluate(element => ({ top: element.getBoundingClientRect().top + scrollY, span: element.clientHeight - innerHeight }));
  expect(geometry.span).toBeGreaterThan(2000);
  for (const [step, p] of [0, .5, .99, .5, 0].entries()) {
    await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), geometry.top + geometry.span * p);
    await expect.poll(() => video.evaluate((node, target) => Math.abs((node as HTMLVideoElement).currentTime - ((node as HTMLVideoElement).duration - 1 / 24) * target), p)).toBeLessThan(.15);
    await page.screenshot({ path: testInfo.outputPath(`hero-${step}-${p}.png`) });
  }
  expect(await video.evaluate(node => ({ paused: (node as HTMLVideoElement).paused, loop: (node as HTMLVideoElement).loop, muted: (node as HTMLVideoElement).muted })))
    .toEqual({ paused: true, loop: false, muted: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-hero-mode", "native");
  await expect(video).not.toHaveAttribute("src");
  await expect(hero.locator("h1")).toHaveCSS("opacity", "1");
  await expect(hero.getByRole("link", { name: "Ürünleri Keşfet", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero).toHaveAttribute("data-hero-mode", "scrub");
});

test("reduced motion and a missing movie retain the poster, full title and both actual links", async ({ page }) => {
  await page.route("**/videos/afina-hasat-scrub.mp4", route => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  const hero = page.locator("#baslangic");
  await expect(hero).toHaveAttribute("data-hero-mode", "native");
  await expect(hero.locator("video")).not.toHaveAttribute("src");
  await expect(hero.locator("[data-cinematic-scrub] picture img")).toBeVisible();
  await expect(hero.locator("h1")).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(hero.getByRole("link", { name: "Kurumsal Teklif Al", exact: true })).toHaveAttribute("href", "#teklif");
  await hero.getByRole("link", { name: "Ürünleri Keşfet", exact: true }).click();
  await expect(page).toHaveURL(/#urunler$/);
});

test("data saver does not fetch a decorative movie", async ({ page }) => {
  const movies: string[] = [];
  page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) movies.push(request.url()); });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { configurable: true,
    value: { saveData: true, addEventListener() {}, removeEventListener() {} } }));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#baslangic")).toHaveAttribute("data-hero-mode", "native");
  await expect(page.locator("#baslangic video")).not.toHaveAttribute("src");
  expect(movies).toEqual([]);
});

test("coarse-pointer touch policy stays native even at desktop width", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 }, hasTouch: true });
  try {
    const page = await context.newPage();
    const movies: string[] = [];
    page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) movies.push(request.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    await expect(page.locator("#baslangic")).toHaveAttribute("data-hero-mode", "native");
    expect(movies).toEqual([]);
  } finally { await context.close(); }
});

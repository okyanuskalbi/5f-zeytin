import { expect, test, type Page } from "@playwright/test";

// Task164 keeps the accepted film, but its first 35% belongs to the common
// orchard → factory → table journey. IDs are markers in cinematic mode.
const journey = (page: Page) => page.locator("[data-harvest-journey]");
const scene = (page: Page, id: string) => page.locator(`section[data-sc-scene="${id}"]`);
const movie = (page: Page) => journey(page).locator("video");
const isMovie = (url: string) => /\.mp4(?:\?|$)/.test(url);

async function journeyGeometry(page: Page) {
  return journey(page).evaluate(element => ({ top: element.getBoundingClientRect().top + scrollY, span: element.clientHeight - innerHeight }));
}

async function scrollJourney(page: Page, progress: number) {
  const geometry = await journeyGeometry(page);
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), geometry.top + geometry.span * progress);
}

async function expectsCinematic(page: Page) {
  return page.evaluate(() => matchMedia("(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine)").matches);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // A CI host's CPU quota must not silently turn a film test into a low-power test.
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
});

test("the common journey scrubs the accepted film forward and backward, then holds it through factory and table", async ({ page }, testInfo) => {
  test.skip(!await expectsCinematic(page), "The film is a fine-pointer desktop enhancement.");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", "cinematic");
  await expect(journey(page)).toHaveAttribute("data-film-ready", "true");
  await expect(movie(page)).toHaveAttribute("src", /^blob:/);
  await expect.poll(() => movie(page).evaluate(node => (node as HTMLVideoElement).currentTime)).toBeLessThan(.1);
  await expect(scene(page, "baslangic").locator("h1").locator("..")).toHaveCSS("opacity", "1");
  const geometry = await journeyGeometry(page);
  expect(geometry.span).toBeGreaterThan(page.viewportSize()!.height * 4.5);
  for (const [step, progress] of [0, .175, .35, .55, .9, .175, 0].entries()) {
    await scrollJourney(page, progress);
    const filmProgress = Math.max(0, Math.min(1, progress / .35));
    await expect.poll(() => movie(page).evaluate((node, target) => {
      const video = node as HTMLVideoElement;
      return Math.abs(video.currentTime - (video.duration - 1 / 24) * target);
    }, filmProgress)).toBeLessThan(.15);
    await page.screenshot({ path: testInfo.outputPath(`harvest-${step}-${progress}.png`) });
  }
  expect(await movie(page).evaluate(node => ({ paused: (node as HTMLVideoElement).paused, loop: (node as HTMLVideoElement).loop, muted: (node as HTMLVideoElement).muted })))
    .toEqual({ paused: true, loop: false, muted: true });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(journey(page)).toHaveAttribute("data-mode", "native");
  await expect(movie(page)).not.toHaveAttribute("src");
  for (const id of ["baslangic", "tesisimiz", "uretim-yolculugu"]) {
    await expect(scene(page, id)).toHaveAttribute("id", id);
    await expect(scene(page, id)).toHaveCSS("opacity", "1");
  }
  await expect(scene(page, "baslangic").getByRole("link", { name: "Ürünleri Keşfet", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(journey(page)).toHaveAttribute("data-mode", "cinematic");
  await expect(journey(page)).toHaveAttribute("data-film-ready", "true");
});

test("a missing movie preserves the cinematic poster timeline and both actual opening links", async ({ page }) => {
  const cinematic = await expectsCinematic(page);
  await page.route("**/videos/afina-hasat-scrub.mp4", route => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", cinematic ? "cinematic" : "native");
  await expect(journey(page)).toHaveAttribute("data-film-ready", "false");
  await expect(movie(page)).not.toHaveAttribute("src");
  const opening = scene(page, "baslangic");
  await expect(opening.locator("[data-cinematic-scrub] picture img")).toBeVisible();
  await expect.poll(() => opening.locator("[data-cinematic-scrub] picture img").evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(opening.locator("h1")).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(opening.getByRole("link", { name: "Kurumsal Teklif Al", exact: true })).toHaveAttribute("href", "#teklif");
  if (cinematic) {
    await scrollJourney(page, .55);
    await expect(scene(page, "tesisimiz")).toHaveCSS("opacity", "1");
    await expect(scene(page, "tesisimiz").getByRole("heading")).toBeInViewport();
    await scrollJourney(page, .9);
    await expect(scene(page, "uretim-yolculugu")).toHaveCSS("opacity", "1");
    await expect(scene(page, "uretim-yolculugu").getByRole("heading")).toBeInViewport();
    await scrollJourney(page, 0);
  }
  await opening.getByRole("link", { name: "Ürünleri Keşfet", exact: true }).click();
  await expect(page).toHaveURL(/#urunler$/);
});

test("data saver keeps all three native scenes and does not fetch a decorative movie", async ({ page }) => {
  const movies: string[] = [];
  page.on("request", request => { if (isMovie(request.url())) movies.push(request.url()); });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { configurable: true,
    value: { saveData: true, addEventListener() {}, removeEventListener() {} } }));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", "native");
  await expect(movie(page)).not.toHaveAttribute("src");
  for (const id of ["baslangic", "tesisimiz", "uretim-yolculugu"]) await expect(scene(page, id)).toHaveAttribute("id", id);
  expect(movies).toEqual([]);
});

test("coarse-pointer touch policy stays native even at desktop width", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 }, hasTouch: true, reducedMotion: "no-preference" });
  try {
    await context.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
    const page = await context.newPage();
    const movies: string[] = [];
    page.on("request", request => { if (isMovie(request.url())) movies.push(request.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    await expect(journey(page)).toHaveAttribute("data-mode", "native");
    await expect(movie(page)).not.toHaveAttribute("src");
    expect(movies).toEqual([]);
  } finally { await context.close(); }
});

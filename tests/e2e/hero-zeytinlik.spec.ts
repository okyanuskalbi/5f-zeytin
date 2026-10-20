import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

const hero = (page: Page) => page.getByRole("region", { name: "Afina Zeytin", exact: true });
const sequence = (page: Page) => hero(page).locator("[data-frame-sequence]");

// Sample the rendered photo/gradient behind each text run, preserving button backgrounds.
async function expectAA(page: Page): Promise<number> {
  await page.evaluate(() => document.fonts.ready);
  const selector = 'section[aria-labelledby="hero-title"] :is(p,h1,a), header nav a';
  const runs = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element);
    const color = style.color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const result: { text: string; color: number[]; threshold: number; x: number; y: number; width: number; height: number }[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight) result.push({
          text: node.textContent.trim(), color,
          threshold: parseFloat(style.fontSize) >= 24 ? 3 : 4.5,
          x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        });
      }
    }
    return result;
  }));
  const style = await page.addStyleTag({ content: `${selector} { color: transparent !important; text-shadow: none !important; transition: none !important; }` });
  let pixels;
  try { pixels = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true }); }
  finally { await style.evaluate((element) => element.parentNode?.removeChild(element)); }
  const luminance = (rgb: number[]) => rgb.map((channel) => channel / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  let minimum = Infinity;
  expect(runs.length).toBeGreaterThan(5);
  for (const run of runs) {
    const foreground = luminance(run.color);
    let contrast = Infinity;
    for (let y = Math.max(0, Math.ceil(run.y)); y < Math.min(pixels.info.height, run.y + run.height); y++) {
      for (let x = Math.max(0, Math.ceil(run.x)); x < Math.min(pixels.info.width, run.x + run.width); x++) {
        const offset = (y * pixels.info.width + x) * pixels.info.channels;
        const background = luminance([...pixels.data.subarray(offset, offset + 3)]);
        contrast = Math.min(contrast, (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05));
      }
    }
    expect(contrast, `${run.text}: WCAG AA`).toBeGreaterThanOrEqual(run.threshold);
    minimum = Math.min(minimum, contrast);
  }
  return minimum;
}

async function seek(page: Page, progress: number): Promise<void> {
  await sequence(page).evaluate((element, value) => {
    const top = element.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + (element.clientHeight - innerHeight) * value);
  }, progress);
}

test("approved grove poster fills the hero and scroll scrubs the real frames in both directions", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  const poster = sequence(page).locator("img");
  await expect(poster).toHaveAttribute("src", "/images/hero/zeytinlik-2400.webp");
  await expect.poll(() => poster.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(hero(page).getByText(/görsel.*bekleniyor/i)).toHaveCount(0);
  const canvas = sequence(page).locator("canvas");
  await expect(canvas).toHaveAttribute("data-frame", "0");
  expect((await canvas.boundingBox())!.width).toBe(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath("hero-zeytinlik.png") });
  const contrasts = [await expectAA(page)];
  await seek(page, 0.65);
  await expect(canvas).toHaveAttribute("data-frame", "78");
  contrasts.push(await expectAA(page));
  await seek(page, 1);
  await expect(canvas).toHaveAttribute("data-frame", "120");
  contrasts.push(await expectAA(page));
  await testInfo.attach("wcag-aa-contrast", { body: JSON.stringify({ progress: [0, 0.65, 1], minimumRatios: contrasts }), contentType: "application/json" });
  await seek(page, 0);
  await expect(canvas).toHaveAttribute("data-frame", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("reduced motion keeps the approved poster static and never requests video frames", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", (request) => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  await expect(sequence(page).locator("img")).toBeVisible();
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  await expectAA(page);
  await expect(hero(page).getByRole("link", { name: "Ürünlerimizi Keşfedin", exact: true })).toBeInViewport();
  await page.mouse.wheel(0, 240);
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  expect(frames).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("hero-zeytinlik-reduced.png") });
});

test("poster and actions survive disabled JavaScript and manifest failures", async ({ browser, baseURL, page }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(new URL("/", baseURL!).href);
    await expect(sequence(staticPage).locator("img")).toBeVisible();
    await expect(hero(staticPage).getByRole("link", { name: "Ürünlerimizi Keşfedin", exact: true })).toBeInViewport();
  } finally {
    await context.close();
  }
  await page.route("**/frames/hero-zeytin/manifest.json", (route) => route.fulfill({ status: 500, body: "Unavailable" }));
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "error");
  await expect(sequence(page).locator("img")).toBeVisible();
  await expect(hero(page).getByRole("link", { name: "Ürünlerimizi Keşfedin", exact: true })).toBeInViewport();
});

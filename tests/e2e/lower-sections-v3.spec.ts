import { mkdir } from "node:fs/promises";
import { devices, expect, test } from "@playwright/test";
import sharp from "sharp";

// Claude: run chromium-1440, webkit-iphone14 and chromium-390 (Pixel 7 below).
test("114: forty-percent scroll filmstrip and 120px steps reach the footer", async ({ browser, browserName, baseURL }, testInfo) => {
  const pixel = testInfo.project.name === "chromium-390";
  const context = await browser.newContext({
    ...(pixel ? devices["Pixel 7"] : {
      viewport: testInfo.project.use.viewport,
      deviceScaleFactor: testInfo.project.use.deviceScaleFactor,
      isMobile: testInfo.project.use.isMobile,
      hasTouch: testInfo.project.use.hasTouch,
      userAgent: testInfo.project.use.userAgent,
    }),
    baseURL,
  });
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const name = pixel ? "pixel7" : testInfo.project.name;
    const directory = `test-results/114/${name}`;
    await mkdir(directory, { recursive: true });
    const frames: Buffer[] = [];
    const bounds = await page.evaluate(() => ({ height: innerHeight, bottom: document.documentElement.scrollHeight - innerHeight }));
    const step = Math.max(1, Math.round(bounds.height * 0.4));
    for (let top = 0; top < bounds.bottom + step; top += step) {
      await page.evaluate(y => scrollTo(0, y), Math.min(top, bounds.bottom));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      frames.push(await page.screenshot({ path: `${directory}/scroll-${String(frames.length).padStart(2, "0")}.png`, animations: "disabled" }));
    }
    const thumbnails = await Promise.all(frames.map(frame => sharp(frame).resize({ width: 240 }).png().toBuffer()));
    const tile = await sharp(thumbnails[0]).metadata();
    await sharp({ create: { width: 240, height: tile.height! * thumbnails.length, channels: 3, background: "#FAF7F0" } })
      .composite(thumbnails.map((input, index) => ({ input, left: 0, top: tile.height! * index })))
      .jpeg({ quality: 80 }).toFile(`test-results/114/filmstrip-${name}.jpg`);

    await page.evaluate(() => scrollTo(0, 0));
    const mobileWebKit = browserName === "webkit" && Boolean(testInfo.project.use.isMobile);
    for (let tick = 0; tick < Math.ceil(bounds.bottom / 120) + 30; tick++) {
      const atEnd = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 1);
      if (atEnd) break;
      if (mobileWebKit) await page.evaluate(() => scrollBy(0, 120));
      else await page.mouse.wheel(0, 120);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    await expect(page.getByRole("contentinfo").getByText("© 2026 AFİNA ZEYTİN", { exact: true })).toBeInViewport();
    expect(await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 1)).toBe(true);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

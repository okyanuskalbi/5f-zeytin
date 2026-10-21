import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, webkit, devices } from "@playwright/test";
import { repoRoot } from "./prepare-v3-assets.mjs";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3112";
const directory = resolve(repoRoot, "test-results/111-scroll");
await mkdir(directory, { recursive: true });
const report = [];
for (const [name, engine, options] of [
  ["desktop", chromium, { viewport: { width: 1440, height: 900 } }],
  ["iphone14", webkit, devices["iPhone 14"]],
  ["iphone-se", webkit, devices["iPhone SE"]],
  ["pixel7", chromium, devices["Pixel 7"]],
  ["pixel7-landscape", chromium, devices["Pixel 7 landscape"]],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ ...options, baseURL, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("heading", { name: "Kışlık kiler", exact: true }).waitFor();
    assert.equal(await page.getByRole("article").count(), 4);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(page.viewportSize().height * 0.4);
    let captures = 0;
    for (let y = 0; y < height; y += step) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert(size.scroll <= size.viewport, `${name}: yatay taşma ${size.scroll} > ${size.viewport}`);
      await page.screenshot({ path: resolve(directory, `${name}-${String(captures++).padStart(2, "0")}.png`) });
    }
    const failedImages = await page.locator("img").evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
    assert.deepEqual(failedImages, [], `${name}: eksik görsel`);
    await page.evaluate(() => window.scrollTo(0, 0));
    let clicks = 0;
    while (clicks++ < 150) {
      // Playwright mobile WebKit has no wheel API; the same 120px scroll
      // increment still verifies reachability, with native wheel on desktop/Pixel.
      if (engine === webkit && options.isMobile) await page.evaluate(() => window.scrollBy(0, 120));
      else await page.mouse.wheel(0, 120);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      if (await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2)) break;
    }
    assert(clicks < 150, `${name}: footer'a 120px tekerlek adımlarıyla ulaşılamadı`);
    const clipped = await page.locator("h1, h2, h3").evaluateAll(headings => headings.filter(heading => heading.scrollWidth > heading.clientWidth + 1).map(heading => heading.textContent));
    assert.deepEqual(clipped, [], `${name}: kesilen başlık`);
    assert.deepEqual(errors, [], `${name}: tarayıcı/ağ hatası`);
    report.push({ name, captures, wheelClicks: clicks, horizontalOverflow: false, missingImages: failedImages, browserErrors: errors });
  } finally { await browser.close(); }
}
await writeFile(resolve(directory, "report.json"), JSON.stringify(report, null, 2) + "\n");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

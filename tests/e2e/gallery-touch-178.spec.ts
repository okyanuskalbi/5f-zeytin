import { expect, test } from "@playwright/test";

// Claude acceptance: npm run test:e2e -- gallery-touch-178 --project=chromium-390
// Uses the configured local production server unless PLAYWRIGHT_BASE_URL is set.
test("touch capture transfer preserves horizontal gallery travel and vertical page scrolling", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-390", "One packaged Chromium touch profile.");
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const section = page.locator("#urunler");
    await expect(section).toHaveAttribute("data-gallery-mode", "scrub");
    await section.evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: "instant" }));
    const active = () => section.locator('[data-rail-item][data-rail-active="true"]').getAttribute("data-rail-item");
    const ids = await section.locator("[data-rail-item]").evaluateAll(items => items.map(item => item.getAttribute("data-rail-item")));
    await expect.poll(active).toBe(ids[0]);
    const session = await context.newCDPSession(page);
    const box = await section.locator("[data-rail-item]").first().boundingBox();
    const y = Math.min(box!.y + 200, 700);
    await session.send("Input.synthesizeScrollGesture", { x: 330, y, xDistance: -260, yDistance: 0, gestureSourceType: "touch", speed: 900 });
    await expect.poll(active).toBe(ids[1]);
    await session.send("Input.synthesizeScrollGesture", { x: 60, y, xDistance: 260, yDistance: 0, gestureSourceType: "touch", speed: 900 });
    await expect.poll(active).toBe(ids[0]);
    const before = await page.evaluate(() => scrollY);
    await session.send("Input.synthesizeScrollGesture", { x: 200, y, xDistance: 0, yDistance: -250, gestureSourceType: "touch", speed: 900 });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  } finally {
    await context.close();
  }
});

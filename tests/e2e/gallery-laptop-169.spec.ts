import { expect, test } from "@playwright/test";

// Run with the packaged headless Chromium project, not a system Chrome channel.
test("laptop gallery scrubs in both directions with all purchase controls inside the viewport", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium-only scoped regression.");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.locator("#urunler");
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1366, height: 700 }, { width: 1024, height: 680 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await expect(section).toHaveAttribute("data-gallery-mode", "scrub");
    const scene = await section.evaluate(element => ({
      top: element.getBoundingClientRect().top + scrollY,
      span: element.clientHeight - innerHeight,
    }));
    expect(scene.span).toBeGreaterThan(0);
    for (const progress of [0, .5, 1, .5, 0]) {
      await page.evaluate(top => scrollTo({ top, behavior: "instant" }), scene.top + scene.span * progress);
      await expect.poll(async () => section.evaluate(element => {
        const rail = element.querySelector<HTMLElement>("[data-gallery-track]")!;
        const viewport = element.querySelector<HTMLElement>("[data-gallery-viewport]")!;
        const style = getComputedStyle(rail);
        const x = style.transform === "none" ? 0 : new DOMMatrixReadOnly(style.transform).m41;
        return -x / (rail.scrollWidth - viewport.clientWidth);
      })).toBeCloseTo(progress, 2);
    }
    // End goes to the final real product using the same document scroll route.
    const rail = section.getByRole("region", { name: "Ürün galerisi" });
    await rail.focus();
    await page.keyboard.press("End");
    const card = section.locator("[data-product-id]").last();
    await expect(card.getByRole("button", { name: /detayını aç$/ })).toBeFocused();
    for (const control of [card.getByRole("button", { name: /Sepete ekle/ }), card.getByRole("button", { name: /^Teklife ekle/ }), section.getByRole("button", { name: "Önceki ürün" })]) {
      await expect(control).toBeInViewport({ ratio: 1 });
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
    }
    await expect(card.getByLabel("Fiyat", { exact: true })).toBeInViewport({ ratio: 1 });
    const box = await rail.boundingBox();
    const quote = await card.getByRole("button", { name: /^Teklife ekle/ }).boundingBox();
    expect(quote!.y + quote!.height).toBeLessThanOrEqual(box!.y + box!.height + 1);
    await page.locator("#toptan-iletisim").scrollIntoViewIfNeeded();
    await expect(page.locator("#toptan-iletisim").getByRole("heading").first()).toBeInViewport();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(section).toHaveAttribute("data-gallery-mode", "native");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(section).toHaveAttribute("data-gallery-mode", "native");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

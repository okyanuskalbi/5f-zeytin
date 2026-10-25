import { expect, test } from "@playwright/test";

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`layered hero: opening, scroll depth and reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const hero = page.locator("[data-hero-intro]");
    const products = hero.locator('[data-layer="products"]');
    const branch = hero.locator('[data-layer="branch"]');
    await expect(products).toHaveAttribute("data-ready", "true");
    await expect(branch).toHaveAttribute("data-ready", "true");
    await expect(hero.locator("[data-scroll-hint], [data-scroll-line]")).toHaveCount(0);
    await expect(hero).not.toContainText("KAYDIR");
    const opening = await hero.evaluate(node => {
      const rect = (selector: string) => node.querySelector(selector)!.getBoundingClientRect();
      const heading = rect("h1"), tin = rect('[data-product="tin"]'), jar = rect('[data-product="jar"]');
      const card = rect("[data-hero-card]");
      return { heading: { top: heading.top, bottom: heading.bottom, right: heading.right },
        tin: { top: tin.top, bottom: tin.bottom, left: tin.left }, jar: { bottom: jar.bottom }, cardTop: card.top,
        overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(opening.overflow).toBe(false);
    expect(opening.tin.bottom).toBeCloseTo(opening.jar.bottom, 0);
    if (width > 900) expect(opening.tin.left).toBeGreaterThan(opening.heading.right);
    else {
      expect(opening.tin.top).toBeGreaterThan(opening.heading.bottom);
      expect(opening.tin.bottom).toBeLessThanOrEqual(opening.cardTop);
    }
    await expect(hero.locator("[data-contact-shadow]")).toHaveCount(2);
    const initialCardTop = opening.cardTop;
    for (const progress of [0.35, 0.75]) {
      const scroll = Math.round(height * progress);
      await page.evaluate(y => scrollTo(0, y), scroll);
      await expect.poll(() => hero.locator('[data-layer="plate"]').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m42)).toBeGreaterThan(0);
      const pose = await hero.evaluate(node => {
        const matrix = (selector: string) => new DOMMatrix(getComputedStyle(node.querySelector(selector)!).transform);
        return { plateY: matrix('[data-layer="plate"]').m42, productY: matrix('[data-layer="products"]').m42,
          branchY: matrix('[data-layer="branch"]').m42, copyOpacity: Number(getComputedStyle(node.querySelector('[data-hero-copy]')!).opacity),
          cardTop: node.querySelector('[data-hero-card]')!.getBoundingClientRect().top };
      });
      expect(pose.productY).toBeGreaterThan(0);
      expect(pose.branchY).toBeLessThan(0);
      // The common table pivot permits only a small contact drift.
      expect(Math.abs(pose.productY - pose.plateY)).toBeLessThan(16);
      expect(pose.cardTop + scroll).toBeCloseTo(initialCardTop, 0);
      if (progress > 0.5) expect(pose.copyOpacity).toBeLessThan(1);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const layer of await hero.locator("[data-layer], [data-hero-copy]").all()) await expect(layer).toHaveCSS("transform", "none");
    await expect(hero.locator("[data-hero-copy]")).toHaveCSS("opacity", "1");
    await expect(products).toHaveCSS("opacity", "1");
    await expect(branch).toHaveCSS("opacity", "1");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(hero.getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
  });
}

test("layered hero: one failed cutout retains only the complete plate", async ({ page }) => {
  await page.route("**/images/hero-katman/teneke-*", route => route.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  await expect.poll(() => hero.locator('[data-layer="branch"] img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  for (const layer of await hero.locator('[data-layer="products"], [data-layer="branch"]').all()) {
    await expect(layer).toHaveAttribute("data-ready", "false");
    await expect(layer).toHaveCSS("opacity", "0");
  }
  await expect(hero.locator('[data-layer="plate"] img')).toBeVisible();
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
});

test("v4: cart badge persists while navigation switches at 40px and reverses", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-tone", "hero");
  await page.locator("[data-hero-intro]").getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await page.evaluate(() => scrollTo(0, 40));
  await expect(header).toHaveAttribute("data-tone", "hero");
  await page.evaluate(() => scrollTo(0, 41));
  await expect(header).toHaveAttribute("data-tone", "solid");
  await expect(header).toHaveCSS("background-color", "rgba(14, 21, 16, 0.72)");
  await expect(header).toHaveCSS("backdrop-filter", "blur(14px)");
  await expect(header.getByRole("button", { name: "Sepetim, 1 adet" })).toBeInViewport();
  await page.reload();
  await expect(header.getByRole("button", { name: "Sepetim, 1 adet" })).toBeEnabled();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(header).toHaveAttribute("data-tone", "hero");
});

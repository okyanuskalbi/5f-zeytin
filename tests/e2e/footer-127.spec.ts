import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("1440px has a distinct AFİNA introduction and four aligned link groups", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const footer = page.getByRole("contentinfo");
  await expect(footer).toHaveAttribute("data-surface", "dark");
  const introduction = footer.locator(":scope > div").first();
  await expect(introduction.getByRole("img", { name: "AFİNA ZEYTİN", exact: true })).toHaveCSS("height", "52px");
  await expect(introduction).toContainText("Kökü toprakta.Yeri sofrada.");
  const links = footer.locator("[data-footer-links]");
  const layout = await links.evaluate(node => ({
    tracks: getComputedStyle(node).gridTemplateColumns.split(" ").length,
    tops: [...node.children].map(child => child.getBoundingClientRect().top),
    gap: getComputedStyle(node).columnGap,
  }));
  expect(layout.tracks).toBe(4);
  expect(layout.gap).toBe("32px");
  expect(Math.max(...layout.tops) - Math.min(...layout.tops)).toBeLessThanOrEqual(1);
  await expect(footer.getByRole("group", { name: "Güvenli ödeme", exact: true })).toBeVisible();
});

test("390px keeps the logo, slogan and link groups in a readable natural order", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await footer.locator("img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  await expect(footer.getByRole("img", { name: "AFİNA ZEYTİN", exact: true })).toHaveCSS("height", "52px");
  await expect(footer).toContainText("Ellek, Düziçi / Osmaniye");
  const tops = await footer.locator("[data-footer-links] h2").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
  expect(tops).toHaveLength(4);
  for (let index = 1; index < tops.length; index++) expect(tops[index]).toBeGreaterThan(tops[index - 1]);
  expect(await footer.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
});

test("320–1920px preserves responsive order, touch targets and horizontal fit", async ({ page }) => {
  const footer = page.getByRole("contentinfo");
  for (const width of [320, 375, 390, 430, 640, 767, 768, 900, 1023, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const headings = await footer.locator("[data-footer-links] h2").evaluateAll(nodes => nodes.map(node => {
      const { y } = node.getBoundingClientRect();
      return y;
    }));
    expect(headings).toHaveLength(4);
    if (width < 768) {
      expect(headings[1]).toBeGreaterThan(headings[0]);
      expect(headings[2]).toBeGreaterThan(headings[1]);
    } else {
      expect(Math.abs(headings[0] - headings[1])).toBeLessThanOrEqual(1);
      if (width < 1024) expect(headings[2]).toBeGreaterThan(headings[0]);
      else expect(Math.abs(headings[0] - headings[2])).toBeLessThanOrEqual(1);
    }
    for (const link of await footer.getByRole("link").all()) {
      const box = (await link.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(await footer.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("the final legal links and payment group remain visible at the page bottom", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "İade ve İptal", exact: true })).toBeInViewport();
  const payment = footer.getByRole("group", { name: "Güvenli ödeme", exact: true });
  await expect(payment).toBeInViewport();
  expect(await payment.evaluate(node => {
    const box = node.getBoundingClientRect();
    return node.closest("footer")!.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
  })).toBe(true);
});

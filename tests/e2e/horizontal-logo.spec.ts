import { expect, test } from "@playwright/test";

// Task 129: written for Claude's browser acceptance; Codex does not run this suite.
test("horizontal artwork keeps its dimensions, links and navigation fit at every breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");
  const headerLogo = header.getByRole("img", { name: "AFİNA ZEYTİN", exact: true });
  const footerLogo = footer.getByRole("img", { name: "AFİNA ZEYTİN", exact: true });

  for (const width of [320, 360, 390, 768, 900, 901, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(headerLogo).toHaveCSS("height", width <= 900 ? "32px" : "40px");
    await expect(footerLogo).toHaveCSS("height", "48px");
    for (const root of [header, footer]) {
      await expect(root.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toHaveAttribute("href", "/");
    }
    const controls = width <= 900
      ? [headerLogo, header.getByRole("button", { name: /Sepetim/ }), header.getByRole("button", { name: "Menüyü aç" })]
      : [headerLogo, header.getByRole("navigation", { name: "Ana navigasyon" }), header.getByRole("button", { name: /Sepetim/ })];
    let trailingEdge = 0;
    for (const control of controls) {
      await expect(control).toBeVisible();
      const box = (await control.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(trailingEdge);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      trailingEdge = box.x + box.width;
    }
    expect(await footer.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await expect(header.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toHaveText("");
  await expect(footer.getByText("Bir AFİNA Şirketler Topluluğu markası", { exact: true })).toHaveCount(1);
  for (const logo of [headerLogo, footerLogo]) {
    await logo.scrollIntoViewIfNeeded();
    await expect(logo).toHaveAttribute("width", "180");
    await expect(logo).toHaveAttribute("height", "48");
    expect(await logo.getAttribute("fetchpriority")).toBeNull();
    await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await logo.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(/afina-zeytin-yatay-dark@(?:2|3)x\.webp$/);
  }
});

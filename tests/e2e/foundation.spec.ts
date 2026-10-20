import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`100: adaptive bar, v2 tokens and persistent cart badge with motion=${reducedMotion}`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const header = page.getByRole("banner");
    const logo = header.getByRole("img", { name: "AFİNA ZEYTİN", exact: true });
    await expect(header).toHaveAttribute("data-tone", "dark");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(header).toHaveCSS("color", "rgb(246, 241, 230)");
    await expect(logo).toHaveAttribute("src", "/brand/afina-zeytin-dark.svg");
    await expect(page.locator("[data-hero-label],[data-hero-card],[data-hero-stub],[data-product-slip],[data-footer-scallop],[data-footer-stamp]")).toHaveCount(0);
    const metrics = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return { tokens: ["--brand-earth", "--brand-olive", "--brand-ivory", "--brand-sand", "--brand-gold", "--factory-green"].map(name => root.getPropertyValue(name).trim()), old: root.getPropertyValue("--label-green"), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(metrics.tokens).toEqual(["#0d110d", "#243a29", "#f6f1e6", "#ede4d1", "#d4b483", "#6ccb3c"]);
    expect(metrics.old).toBe("");
    expect(metrics.overflow).toBe(false);
    await mkdir("test-results/100", { recursive: true });
    await page.screenshot({ path: `test-results/100/${testInfo.project.name}-${reducedMotion}-dark.png` });
    await page.locator("[data-nav-light]").evaluate(node => scrollTo(0, node.getBoundingClientRect().top + scrollY));
    await expect(header).toHaveAttribute("data-tone", "light");
    await expect(header).toHaveCSS("background-color", "rgb(246, 241, 230)");
    await expect(header).toHaveCSS("color", "rgb(36, 58, 41)");
    await expect(logo).toHaveAttribute("src", "/brand/afina-zeytin.svg");
    await expect(header.getByRole("button", { name: /^Sepetim,/ })).toHaveCSS("color", "rgb(36, 58, 41)");
    const card = page.locator("#urunler").getByRole("article", { name: "Sofralık Zeytin", exact: true });
    await card.getByRole("spinbutton").fill("2");
    await card.getByRole("button", { name: "Sepete ekle" }).click();
    const drawer = page.getByRole("dialog", { name: "Sepetim", exact: true });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    const cart = header.getByRole("button", { name: "Sepetim, 2 adet" });
    await expect(cart.locator('[data-slot="count-badge"]')).toHaveText("2");
    if (reducedMotion === "reduce") await expect(cart.locator('[data-slot="count-badge"]')).toHaveCSS("transform", "none");
    await page.screenshot({ path: `test-results/100/${testInfo.project.name}-${reducedMotion}-light.png` });
    await page.reload();
    await expect(cart).toBeEnabled();
    await expect(cart.locator('[data-slot="count-badge"]')).toHaveText("2");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(header).toHaveAttribute("data-tone", "dark");
    const desktop = page.viewportSize()!.width >= 1024;
    await expect(header.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible({ visible: desktop });
    const menu = header.getByRole("button", { name: "Menüyü aç" });
    await expect(menu).toBeVisible({ visible: !desktop });
    if (!desktop) {
      await menu.click();
      const dialog = page.getByRole("dialog", { name: "Site menüsü" });
      const first = dialog.getByRole("link", { name: "Ürünler", exact: true });
      const close = dialog.getByRole("button", { name: "Kapat", exact: true });
      await expect(first).toBeFocused();
      const box = (await dialog.boundingBox())!;
      expect(box.x).toBe(0); expect(box.y).toBe(0);
      expect(box.width).toBe(page.viewportSize()!.width);
      expect(box.height).toBe(page.viewportSize()!.height);
      await page.keyboard.press("Shift+Tab"); await expect(close).toBeFocused();
      await page.keyboard.press("Tab"); await expect(first).toBeFocused();
      await expect(page.getByRole("main")).toHaveCount(0);
      await page.screenshot({ path: `test-results/100/${testInfo.project.name}-${reducedMotion}-menu.png` });
      await page.keyboard.press("Escape"); await expect(menu).toBeFocused();
      await expect(page.getByRole("main")).toBeVisible();
    }
  });
}

test("100: direct interior routes and client navigation reset the header surface", async ({ page }) => {
  await page.goto("/sepet");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-tone", "light");
  await header.getByRole("link", { name: "Afina Zeytin ana sayfa" }).click();
  await expect(header).toHaveAttribute("data-tone", "dark");
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute("data-tone", "light");
  await header.getByRole("link", { name: "Afina Zeytin ana sayfa" }).click();
  await expect(header).toHaveAttribute("data-tone", "dark");
});

test("100: Pixel 7 device screenshots and menu focus", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440", "Pixel 7 capture uses the Chromium project.");
  const { devices } = await import("@playwright/test");
  const context = await browser.newContext({ ...devices["Pixel 7"], baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await mkdir("test-results/100", { recursive: true });
    await page.screenshot({ path: "test-results/100/Pixel-7-dark.png" });
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menüsü" });
    await expect(dialog.getByRole("link", { name: "Ürünler", exact: true })).toBeFocused();
    await page.screenshot({ path: "test-results/100/Pixel-7-menu.png" });
    await page.keyboard.press("Escape");
    await page.locator("#urunler").scrollIntoViewIfNeeded();
    await expect(page.getByRole("banner")).toHaveAttribute("data-tone", "light");
    await page.screenshot({ path: "test-results/100/Pixel-7-light.png" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`090: plain compact bar, typography and cart badge with motion=${reducedMotion}`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const header = page.getByRole("banner");
    const home = header.getByRole("link", { name: "Afina Zeytin ana sayfa" });
    await expect(home).toContainText("AFİNA ZEYTİN");
    await expect(header).toHaveCSS("background-color", "rgb(245, 241, 231)");
    expect((await header.boundingBox())!.height).toBeLessThanOrEqual(72);
    const menu = header.getByRole("button", { name: "Menüyü aç" });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveText("Menü");
    for (const control of await header.locator("a, button").all()) {
      const bounds = (await control.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByText(/görseli (hazırlanıyor|yakında)/i)).toHaveCount(0);
    await expect(page.getByText(/^(OSMANİYE \/ ÜRETİM TESİSİ|PERAKENDE|TOPRAKTAN SOFRAYA)$/)).toHaveCount(0);
    const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
    await card.getByRole("spinbutton").fill("2");
    await card.getByRole("button", { name: "Sepete ekle" }).click();
    await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    const cart = header.getByRole("button", { name: "Sepetim, 2 adet" });
    await expect(cart.locator('[data-slot="count-badge"]')).toHaveText("2");
    await page.reload();
    await expect(cart).toBeEnabled();
    await expect(cart.locator('[data-slot="count-badge"]')).toHaveText("2");
    await page.evaluate(() => scrollTo(0, 0));
    const metrics = await page.locator("body").evaluate((body) => {
      const textSizes = new Set<number>();
      for (const node of body.querySelectorAll("*")) {
        if ([...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
          && node.getBoundingClientRect().width && getComputedStyle(node).visibility !== "hidden") {
          textSizes.add(Number.parseFloat(getComputedStyle(node).fontSize));
        }
      }
      return { sizes: [...textSizes], overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(metrics.sizes.length).toBeLessThanOrEqual(5);
    expect(Math.min(...metrics.sizes)).toBeGreaterThanOrEqual(13);
    expect(metrics.overflow).toBe(false);
    await page.screenshot({ path: `test-results/090/${testInfo.project.name}-${reducedMotion}.png`, fullPage: true });
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "Site menüsü" });
    await expect(dialog.getByRole("link", { name: "Ürünlerimizi Keşfedin" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    if (reducedMotion === "reduce") {
      await expect(menu).toHaveCSS("transition-duration", "0s");
      await expect(page.locator("[data-frame-sequence] canvas")).toHaveCount(0);
    }
  });
}

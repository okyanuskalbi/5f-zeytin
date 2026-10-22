import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`v4: fixed navigation and mobile dialog with motion=${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toHaveCSS("position", "fixed");
    await expect(header).toHaveAttribute("data-tone", "hero");
    await expect(header).toHaveCSS("color", "rgb(247, 243, 234)");
    await expect(header.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toContainText("AFİNA");
    const desktop = page.viewportSize()!.width > 900;
    await expect(header.getByRole("navigation", { name: "Ana navigasyon" })).toBeVisible({ visible: desktop });
    if (desktop) {
      for (const [name, id] of [["Ürünler", "urunler"], ["Tesisimiz", "tesisimiz"], ["Toptan", "toptan-iletisim"], ["SSS", "sik-sorulanlar"]]) {
        await expect(header.getByRole("link", { name, exact: true })).toHaveAttribute("href", `/#${id}`);
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
    } else {
      const menu = header.getByRole("button", { name: "Menüyü aç" });
      await menu.click();
      const dialog = page.getByRole("dialog", { name: "Site menüsü" });
      await expect(dialog.getByRole("link", { name: "Ürünler", exact: true })).toBeFocused();
      for (const name of ["Tesisimiz", "Toptan", "SSS", "Hesabım"]) await expect(dialog.getByRole("link", { name, exact: true })).toBeVisible();
      await expect(page.getByRole("main")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await expect(page.getByRole("main")).toBeVisible();
    }
  });
}

test("v4: interior routes use solid navigation and returning home restores transparency", async ({ page }) => {
  await page.goto("/sepet");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-tone", "solid");
  await header.getByRole("link", { name: "Afina Zeytin ana sayfa" }).click();
  await expect(header).toHaveAttribute("data-tone", "hero");
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute("data-tone", "solid");
  await header.getByRole("link", { name: "Afina Zeytin ana sayfa" }).click();
  await expect(header).toHaveAttribute("data-tone", "hero");
});

import { expect, test } from "@playwright/test";

const links = ["/urunler", "/hakkimizda", "/toptan-satis", "/bayilik", "/blog"];

test("shell keeps every page destination and original brand links readable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");
  for (const root of [header, footer]) {
    await expect(root.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toHaveAttribute("href", "/");
    await expect(root.getByRole("img", { name: "AFİNA ZEYTİN" })).toBeVisible();
  }
  if (page.viewportSize()!.width < 1100) {
    await header.getByRole("button", { name: "Menüyü aç" }).click();
    const nav = page.getByRole("navigation", { name: "Mobil navigasyon" });
    for (const href of links) await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
    await page.keyboard.press("Escape");
  } else {
    const nav = header.getByRole("navigation", { name: "Ana navigasyon" });
    for (const href of links) await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
  }
  await expect(footer.locator('a[href="https://afina.com.tr"]')).toHaveAttribute("rel", /noopener/);
  await expect(page.getByRole("main")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("skip link and phone menu keep keyboard focus, dismissal and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Ana içeriğe geç" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#ana-icerik")).toBeFocused();
    const trigger = page.getByRole("button", { name: "Menüyü aç", includeHidden: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site menüsü" });
    const close = dialog.getByRole("button", { name: "Menüyü kapat" });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Sipariş takibi" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("banner").getByRole("link", { name: "Afina Zeytin ana sayfa" })).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test("failed logo media and a missing page preserve recovery links", async ({ page }) => {
  await page.route("**/brand/afina-*.webp", route => route.abort());
  await page.goto("/missing-task199-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const home = page.getByRole("banner").getByRole("link", { name: "Afina Zeytin ana sayfa" });
  await expect(home).toBeVisible();
  await home.click();
  await expect(page).toHaveURL(/\/$/);
});

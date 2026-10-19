import { expect, test, type Locator, type Page } from "@playwright/test";

const landingLinks = [
  ["Ürünlerimizi Keşfedin", "/#urunler"],
  ["Tesisimiz", "/#tesisimiz"],
  ["Toptan Satış İçin İletişime Geçin", "/#toptan"],
] as const;

async function expectLinks(navigation: Locator): Promise<void> {
  for (const [name, href] of landingLinks) {
    await expect(navigation.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
}

async function expectNoOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("shell exposes navigation, official copy and destination contracts at every viewport", async ({ page, baseURL }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  expect((await page.goto("/"))?.status()).toBe(200);
  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");
  await expect(header).toBeVisible();
  await expect(footer).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(header.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toHaveAttribute("href", "/");
  await expect(header.getByRole("link", { name: "Sepetim" })).toHaveAttribute("href", "/sepet");
  await expect(header.getByRole("link", { name: "Hesabım" })).toHaveAttribute("href", "/hesabim");
  await expect(footer.getByText("Toprağın sunduğu lezzet, Afina’nın özeniyle.")).toBeVisible();
  await expect(page.getByText("Kökü toprakta. Yeri sofrada.", { exact: true })).toHaveCount(1);
  await expectLinks(footer.getByRole("navigation", { name: "Keşfedin" }));
  const legal = footer.getByRole("navigation", { name: "Yasal bilgiler" });
  for (const [name, href] of [["KVKK", "/kvkk"], ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis"], ["İade ve İptal", "/iade"]]) {
    await expect(legal.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  await expect(footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu" })).toHaveAttribute("href", "https://afina.com.tr");
  if (page.viewportSize()!.width < 1024) {
    await expect(header.getByRole("navigation", { name: "Ana navigasyon" })).toBeHidden();
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await expectLinks(page.getByRole("navigation", { name: "Mobil navigasyon" }));
    await page.keyboard.press("Escape");
  } else {
    await expectLinks(header.getByRole("navigation", { name: "Ana navigasyon" }));
    await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeHidden();
  }
  // Until the explicit visual approval, neither candidate logos nor generated scenes may render.
  await expect(page.locator('img[src*="/brand/"], img[src*="/images/generated/"]')).toHaveCount(0);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("shell.png"), fullPage: true });
});

test("skip link and mobile menu support keyboard, dismissal and reduced motion", async ({ page, browserName }) => {
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.keyboard.press(nextControl);
    const skip = page.getByRole("link", { name: "Ana içeriğe geç" });
    await expect(skip).toBeFocused();
    expect(await skip.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Enter");
    await expect(page.locator("#ana-icerik")).toBeFocused();
    if (page.viewportSize()!.width >= 1024) {
      const home = page.getByRole("banner").getByRole("link", { name: "Afina Zeytin ana sayfa" });
      await home.focus();
      await page.keyboard.press(nextControl);
      await expect(page.getByRole("navigation", { name: "Ana navigasyon" }).getByRole("link").first()).toBeFocused();
      continue;
    }
    const trigger = page.getByRole("button", { name: "Menüyü aç" });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Site menüsü" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(dialog).toHaveAccessibleDescription("Ürünler, tesisimiz ve toptan satış bağlantıları.");
    await expect(page.getByRole("main")).toHaveCount(0);
    const first = dialog.getByRole("link", { name: "Ürünlerimizi Keşfedin" });
    const close = dialog.getByRole("button", { name: "Kapat", exact: true });
    await expect(first).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    for (const control of await dialog.locator("a, button").all()) {
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
    if (reducedMotion === "reduce") {
      await expect(trigger).toHaveCSS("transition-duration", "0s");
      await expect(dialog).toHaveCSS("animation-name", "none");
    }
    await expectNoOverflow(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await close.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await first.click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/#urunler$/);
    await expect(page.getByRole("main")).toBeVisible();
  }
});

test("mobile menu releases the page when resized to desktop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  const dialog = page.getByRole("dialog", { name: "Site menüsü" });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("shell-menu.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("banner").getByRole("link", { name: "Afina Zeytin ana sayfa" })).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 320, height: 480 });
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.scrollHeight >= element.clientHeight)).toBe(true);
  await dialog.getByRole("button", { name: "Kapat", exact: true }).click();
  await expectNoOverflow(page);
});

test("404 keeps shell navigation usable and recovers to the landing", async ({ page }) => {
  expect((await page.goto("/__shell-missing"))?.status()).toBe(404);
  const header = page.getByRole("banner");
  await expect(header).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await page.getByRole("navigation", { name: "Mobil navigasyon" }).getByRole("link", { name: "Tesisimiz", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } else {
    await header.getByRole("navigation", { name: "Ana navigasyon" }).getByRole("link", { name: "Tesisimiz", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/#tesisimiz$/);
  await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Afina Zeytin" })).toBeVisible();
  await header.getByRole("link", { name: "Afina Zeytin ana sayfa" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expectNoOverflow(page);
});

import { expect, test, type Locator, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Written for Claude's browser acceptance; Codex does not run this suite.
// Run with --project=chromium-1440; each case supplies its own viewport.
const viewports = [
  { width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 375, height: 667 },
  { width: 320, height: 640 }, { width: 1920, height: 1080 },
];
const panel = (page: Page) => page.getByRole("dialog", { name: /^Sepetim \(/ });
const headerCart = (page: Page) => page.getByRole("banner").getByRole("button", { name: /^Sepetim/ });

async function noOverflow(page: Page, container: Locator): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await container.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
}

async function targets(container: Locator): Promise<void> {
  for (const target of await container.locator("button:visible, a:visible, input:visible").all()) {
    const box = (await target.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

for (const viewport of viewports) {
  test.describe(`cart 131 ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });
    test.beforeEach(async ({ page }, info) => {
      test.skip(info.project.name !== "chromium-1440");
      await page.addInitScript(({ key }) => {
        if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 2 }]));
      }, { key: CART_STORAGE_KEY });
    });

    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`drawer: rows, totals, full height, touch targets and focus (${reducedMotion})`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion });
        await page.goto("/");
        await page.locator("#urunler").scrollIntoViewIfNeeded();
        await headerCart(page).click();
        const drawer = panel(page);
        await expect(drawer).toHaveAccessibleName("Sepetim (2)");
        await expect(drawer.getByRole("button", { name: "Sepeti kapat" })).toBeFocused();
        await expect.poll(async () => Math.round((await drawer.boundingBox())!.width)).toBe(viewport.width < 768 ? viewport.width : 440);
        await expect.poll(async () => Math.round((await drawer.boundingBox())!.height)).toBe(viewport.height);
        const line = drawer.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
        await expect(line.locator("picture img")).toBeVisible();
        await expect(line.getByText("1 kg", { exact: true })).toBeVisible();
        await expect(line.getByLabel("Satır toplamı")).toHaveText("440,00 ₺");
        await line.getByRole("button", { name: "Adedi artır" }).click();
        await expect(drawer.getByLabel("Ara toplam", { exact: true })).toHaveText("660,00 ₺");
        await expect(drawer.getByLabel("Toplam (tahmini)", { exact: true })).toHaveText("660,00 ₺");
        await line.getByRole("button", { name: "Adedi azalt" }).click();
        await expect(line.getByLabel("Adet", { exact: true })).toHaveText("2");
        await expect(drawer.getByText("Ödeme adımında hesaplanır")).toBeVisible();
        for (const brand of ["PayTR", "Visa", "Mastercard", "Troy"]) await expect(drawer.getByRole("img", { name: brand, exact: true })).toBeVisible();
        const checkout = drawer.getByRole("link", { name: "Ödemeye geç" }).or(drawer.getByRole("button", { name: "Ödemeye geç" }));
        await expect(checkout).toBeVisible();
        expect((await checkout.boundingBox())!.height).toBeGreaterThanOrEqual(52);
        await noOverflow(page, drawer);
        await targets(drawer);
        if (viewport.width < 768) {
          const buyBar = page.locator("[data-mobile-buy-bar]");
          await expect(buyBar).toHaveAttribute("aria-hidden", "true");
          await expect(buyBar).toHaveAttribute("inert", "");
        }
        if (reducedMotion === "reduce") await expect(drawer).toHaveCSS("transform", "none");
        await drawer.getByRole("button", { name: "Sepeti kapat" }).focus();
        await page.keyboard.press("Shift+Tab");
        await expect(drawer.getByRole("link", { name: "Sepeti görüntüle" })).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(drawer).toHaveCount(0);
        await expect(headerCart(page)).toBeFocused();
        await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
      });
    }

    test("page: responsive summary, sticky mobile checkout, persistence and empty state", async ({ page }) => {
      await page.goto("/sepet");
      const main = page.getByRole("main");
      const summary = main.getByRole("complementary", { name: "Sepet özeti" });
      const mobile = page.getByRole("region", { name: "Mobil ödeme" });
      const line = main.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
      await expect(summary.getByLabel("Toplam (tahmini)", { exact: true })).toHaveText("440,00 ₺");
      await expect(main.getByRole("textbox", { name: "Kupon kodu" })).toHaveAttribute("readonly", "");
      await expect(main.getByRole("button", { name: "Kuponu uygula" })).toBeDisabled();
      if (viewport.width < 768) {
        await expect(mobile).toBeVisible();
        await expect(mobile).toHaveCSS("position", "fixed");
        const checkout = mobile.getByRole("link", { name: "Ödemeye geç" }).or(mobile.getByRole("button", { name: "Ödemeye geç" }));
        await expect(checkout).toBeInViewport();
        expect((await checkout.boundingBox())!.height).toBeGreaterThanOrEqual(52);
        expect((await mobile.boundingBox())!.y + (await mobile.boundingBox())!.height).toBeLessThanOrEqual(viewport.height + 1);
      } else {
        await expect(mobile).toBeHidden();
        await expect(summary).toHaveCSS("position", "sticky");
        expect((await summary.boundingBox())!.x).toBeGreaterThan((await line.boundingBox())!.x);
      }
      await noOverflow(page, main);
      await targets(main);
      await line.getByRole("button", { name: "Adedi artır" }).click();
      await expect(summary.getByLabel("Ara toplam", { exact: true })).toHaveText("660,00 ₺");
      await page.reload();
      await expect(line.getByLabel("Adet", { exact: true })).toHaveText("3");
      await line.getByRole("button", { name: "Sepetten sil" }).click();
      await expect(main.getByText("Sepetiniz boş", { exact: true })).toBeVisible();
      await expect(mobile).toHaveCount(0);
      await expect(main.getByRole("link", { name: "Ürünlere göz atın" })).toHaveAttribute("href", "/#urunler");
      await headerCart(page).click();
      const drawer = panel(page);
      await expect(drawer.getByText("Sepetiniz boş", { exact: true })).toBeVisible();
      await drawer.getByRole("link", { name: "Ürünlere göz atın" }).click();
      await expect(drawer).toHaveCount(0);
      await expect(page).toHaveURL(/\/#urunler$/);
    });
  });
}

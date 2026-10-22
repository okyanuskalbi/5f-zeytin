import { expect, test } from "@playwright/test";
import { adminShellFixturePath, serveAdminShellFixture } from "./helpers/admin-shell-fixture";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Admin acceptance requires the local mocked target.");
  await page.route("**/*.supabase.co/**", route => route.abort());
});

test("anonymous or forged demo state cannot access the production shell", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify({ id: "forged", email: "admin@afina.com.tr", role: "admin" })));
  const response = await page.goto("/admin?role=admin");
  expect(response?.status()).toBe(401);
  await expect(page.locator("[data-admin-shell]")).toHaveCount(0);
});

// Server authorization (including 403/503) is verified by admin-auth and
// admin-shell unit tests. This in-memory fixture exercises the real client UI.
test.describe("admin client acceptance", () => {
  test.beforeEach(async ({ page }) => { await serveAdminShellFixture(page); });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`navigation, search and responsive layout at ${width}px (${reducedMotion})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion });
        await page.goto(adminShellFixturePath);
        await expect(page.getByRole("heading", { name: "Genel Bakış", exact: true })).toBeVisible();
        await expect(page.getByRole("region", { name: "Operasyon özeti" }).getByText("TEST VERİSİ", { exact: true })).toHaveCount(3);
        await expect(page.getByRole("region", { name: "Aktif ürün", exact: true })).toContainText("3 / 6");
        await expect(page.getByRole("region", { name: "Sipariş görünümü" })).toContainText("Henüz sipariş verisi yok");
        await expect(page.locator("table, canvas, a[href^='/admin/']")).toHaveCount(0);
        const menu = page.getByRole("button", { name: "Yönetim menüsünü aç" });
        if (width < 1024) {
          await menu.focus(); await page.keyboard.press("Enter");
          const dialog = page.getByRole("dialog", { name: "Yönetim menüsü" });
          await expect(dialog).toBeVisible();
          await page.keyboard.press("Shift+Tab");
          expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0); await expect(menu).toBeFocused();
          await menu.click();
          await dialog.getByRole("link", { name: "Müşteriler", exact: true }).click();
          await expect(dialog).toHaveCount(0);
          await expect(page.getByRole("heading", { name: "Müşteriler", exact: true })).toBeFocused();
        } else {
          await expect(menu).toBeHidden();
          const nav = page.getByRole("navigation", { name: "Yönetim navigasyonu", exact: true });
          await expect(nav).toBeVisible();
          await nav.getByRole("link", { name: "Siparişler", exact: true }).focus();
          await page.keyboard.press("Enter");
          await expect(page.getByRole("heading", { name: "Siparişler", exact: true })).toBeFocused();
        }
        const search = page.getByRole("searchbox", { name: "Yönetim alanlarında ara" });
        await search.fill("SİPARİŞ");
        await page.keyboard.press("Tab");
        const result = page.getByRole("navigation", { name: "Arama sonuçları" }).getByRole("link", { name: "Siparişler" });
        await expect(result).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("heading", { name: "Siparişler", exact: true })).toBeFocused();
        await search.fill("eşleşmeyen");
        await expect(page.getByRole("status")).toContainText("Eşleşen yönetim alanı bulunamadı");
        await page.keyboard.press("Escape"); await expect(search).toHaveValue("");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }
    test(`empty, loading and error recovery (${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto(`${adminShellFixturePath}?status=loading`);
      await expect(page.getByRole("status")).toContainText("Özet yükleniyor");
      await expect(page.getByRole("region", { name: "Operasyon özeti" })).toHaveAttribute("aria-busy", "true");
      await page.goto(`${adminShellFixturePath}?status=empty`);
      await expect(page.getByText("Henüz veri yok", { exact: true })).toHaveCount(3);
      await page.goto(`${adminShellFixturePath}?status=error`);
      await expect(page.getByRole("alert")).toContainText("Özet yüklenemedi");
      await page.getByRole("button", { name: "Yeniden dene" }).focus(); await page.keyboard.press("Enter");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(page.getByText("TEST VERİSİ", { exact: true })).toHaveCount(3);
    });
  }
});

import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";
import { accountFixturePath, serveAccountFixture } from "./helpers/account-fixture";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Account acceptance requires the local mocked target.");
  await page.route("**/*.supabase.co/**", route => route.abort());
  await page.route("**/auth/logout", route => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`anonymous and forged demo storage redirect to login before profile rendering (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify({ id: "demo-admin", name: "Forged Member", email: "forged@example.test", phone: "" })));
    await page.goto("/hesabim?userId=another-member&role=admin");
    await expect(page).toHaveURL(/\/giris\?next=\/hesabim$/);
    await expect(page.getByRole("form", { name: "E-posta ile giriş" })).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText("Forged Member");
  });
}

// Auth verification and user isolation use the real SDK in account.test.ts.
// Authenticated client acceptance renders the real AccountSummary in memory.
test.describe("verified summary client acceptance", () => {
  test.beforeEach(async ({ page }) => { await serveAccountFixture(page); });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`profile, history link and accessible logout (${reducedMotion})`, async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion });
      await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 2 }])), CART_STORAGE_KEY);
      await page.route("**/auth/logout", route => route.fulfill({ status: 204 }));
      await page.goto(accountFixturePath);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hesabım");
      await expect(page.getByRole("region", { name: "Profil bilgilerim" })).toContainText("Deniz Sofra");
      await expect(page.getByRole("main")).toContainText("deniz@example.test");
      await expect(page.getByRole("main")).toContainText("05321234567");
      await expect(page.locator('a[href^="/admin"], input, form')).toHaveCount(0);
      const history = page.getByRole("link", { name: "Sipariş geçmişim" });
      await expect(history).toHaveAttribute("href", "/hesabim/siparisler");
      if (!info.project.use.isMobile) {
        await history.focus();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("link", { name: "Alışverişe devam et" })).toBeFocused();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const logout = page.getByRole("button", { name: "Çıkış yap" });
      if (info.project.use.isMobile) await logout.tap();
      else { await logout.focus(); await page.keyboard.press("Enter"); }
      await expect(page).toHaveURL(/\/giris$/);
      await expect(page.getByRole("status")).toHaveText("Oturumunuz kapatıldı.");
      await expect(page.getByRole("status")).toBeFocused();
      await expect(page.getByRole("main")).not.toContainText("deniz@example.test");
      await expect(page.getByRole("region", { name: "Profil bilgilerim" })).toHaveCount(0);
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "sample-green-olive-1kg", quantity: 2 }]);
    });
    test(`service error recovery stays accessible (${reducedMotion})`, async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto(`${accountFixturePath}?unavailable=1`);
      await expect(page.getByRole("alert")).toContainText("Hesap bilgileri yüklenemedi");
      await expect(page.getByRole("main")).not.toContainText("deniz@example.test");
      await expect(page.getByRole("button", { name: "Çıkış yap" })).toHaveCount(0);
      const retry = page.getByRole("button", { name: "Yeniden dene" });
      if (info.project.use.isMobile) await retry.tap();
      else { await retry.focus(); await page.keyboard.press("Enter"); }
      await expect(page.getByRole("region", { name: "Profil bilgilerim" })).toBeVisible();
    });
  }
  for (const status of [401, 429, 503, "network"] as const) {
    test(`logout ${status} keeps the session visible and permits retry`, async ({ page }) => {
      await page.route("**/auth/logout", route => status === "network" ? route.abort() : route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: { message: "private-provider-secret" } }) }));
      await page.goto(accountFixturePath);
      await page.getByRole("button", { name: "Çıkış yap" }).click();
      await expect(page.getByRole("alert")).toBeFocused();
      await expect(page.getByRole("alert")).toContainText(status === 429 ? "Çok fazla deneme" : status === "network" ? "İşlem tamamlanamadı" : "Çıkış yapılamadı");
      await expect(page.getByRole("main")).toContainText("deniz@example.test");
      await expect(page.getByRole("main")).not.toContainText("private-provider-secret");
      await page.route("**/auth/logout", route => route.fulfill({ status: 204 }));
      await page.getByRole("button", { name: "Çıkış yap" }).click();
      await expect(page).toHaveURL(/\/giris$/);
    });
  }
});

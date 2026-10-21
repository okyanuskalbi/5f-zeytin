import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const routes = [
  { path: "/hesabim", title: "Hesabım", message: "Üyelik ve hesap işlemleri yakında.", status: 200 },
  { path: "/siparis-takip", title: "Sipariş takibi", message: "Sipariş ve kargo takibi yakında.", status: 200 },
  { path: "/bulunamayan-sayfa", title: "Sayfa bulunamadı", message: "Aradığınız sayfaya ulaşılamıyor.", status: 404 },
];

test("empty account, tracking and 404 retain reading content, recovery and reduced-motion access", async ({ page }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const route of routes) {
      expect((await page.goto(`${route.path}?motion=${reducedMotion}`))?.status()).toBe(route.status);
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1, name: route.title })).toBeVisible();
      await expect(main).toContainText(route.message);
      await expect(main.locator("form, input, iframe")).toHaveCount(0);
      const recovery = main.getByRole("link");
      await expect(recovery).toHaveAttribute("href", route.status === 404 ? "/" : "/#urunler");
      await recovery.focus();
      expect(await recovery.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
      expect((await recovery.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test("cart receipt survives quantity edits, modal focus, refresh, removal and empty recovery", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(key => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 1 }]));
  }, CART_STORAGE_KEY);
  await page.goto("/sepet");
  const line = page.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await line.getByRole("button", { name: "Adedi artır" }).click();
  await expect(line.getByRole("status", { name: "Adet" })).toHaveText("2");
  const opener = page.getByRole("banner").getByRole("button", { name: /^Sepetim/ });
  await opener.click();
  const modal = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(modal.getByRole("status", { name: "Adet" })).toHaveText("2");
  await expect(modal.getByRole("button", { name: "Sepeti kapat" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.reload();
  await expect(line.getByRole("status", { name: "Adet" })).toHaveText("2");
  await line.getByRole("button", { name: "Sepetten sil" }).click();
  await expect(page.getByRole("main").getByRole("status").filter({ hasText: "Sepetiniz henüz boş." })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Ürünlerimizi keşfedin" })).toHaveAttribute("href", "/#urunler");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("production hides every payment preview route and token endpoint", async ({ page, request }) => {
  for (const path of ["/odeme-onizleme", "/odeme-onizleme/sonuc/ok", "/odeme-onizleme/sonuc/fail"]) {
    expect((await page.goto(path))?.status()).toBe(404);
    await expect(page.getByRole("main").getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  }
  expect((await request.post("/api/odeme-onizleme/paytr-token")).status()).toBe(404);
});

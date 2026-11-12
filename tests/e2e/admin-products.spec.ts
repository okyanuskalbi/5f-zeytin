import { expect, test } from "@playwright/test";
import { adminProductsFixturePath, serveAdminProductsFixture } from "./helpers/admin-products-fixture";
import { adminProduct } from "../fixtures/admin-products";
import type { AdminProduct } from "../../lib/contracts/admin-products";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Only local admin acceptance is allowed.");
  await page.route("**/*.supabase.co/**", route => route.abort());
});

test("production routes reject anonymous and forged client state", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify({ role: "admin", email: "admin@afina.com.tr" })));
  expect((await page.goto("/admin/urunler?role=admin"))?.status()).toBe(401);
  await expect(page.getByRole("button", { name: "Ürün ekle" })).toHaveCount(0);
  const response = await page.request.get("/api/admin/products");
  expect(response.status()).toBe(401);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`products, keyboard, sorting and mutations at ${width}px (${reducedMotion})`, async ({ page }) => {
      await serveAdminProductsFixture(page);
      let records: AdminProduct[] = [{ ...adminProduct, isActive: true }, { ...adminProduct, id: "fixture-oil", name: "Test yağ", isActive: true, stock: 0 }];
      let failSave = false;
      let listReads = 0;
      await page.route("**/api/admin/products**", async route => {
        const request = route.request();
        const body = request.method() === "GET" ? null : request.postDataJSON();
        if (request.method() === "GET") {
          listReads++;
          await route.fulfill({ json: { data: records, total: records.length, activeCount: records.filter(product => product.isActive).length, page: 1,
            options: records.filter(product => product.isActive).map(({ id, name }) => ({ id, name })) } });
        } else if (failSave) {
          failSave = false; await route.fulfill({ status: 409, json: { error: { code: "product_conflict" } } });
        } else {
          if (request.method() === "POST") records = [...records, { id: "new-test", ...body }];
          if (request.method() === "PATCH") records = records.map(product => product.id === body.id ? body : product);
          if (request.method() === "DELETE") records = records.map(product => product.id === body.id ? { ...product, isActive: false, upsellIds: [] } : product);
          await route.fulfill({ status: request.method() === "POST" ? 201 : 200, json: { id: body.id ?? "new-test" } });
        }
      });
      await page.setViewportSize({ width, height: 900 }); await page.emulateMedia({ reducedMotion });
      await page.goto(adminProductsFixturePath);
      const add = page.getByRole("button", { name: "Ürün ekle" });
      await expect(add).toBeEnabled();
      await expect(page.getByRole("heading", { name: "Ürünler", exact: true })).toBeVisible();
      await expect(page.getByText("Stok yok", { exact: true })).toBeVisible();
      const sort = page.getByRole("button", { name: "Fiyat ile sırala" });
      const sorted = page.waitForResponse(response => response.request().method() === "GET" && response.url().includes("/api/admin/products?sort=priceKurus"));
      await sort.focus(); await page.keyboard.press("Enter");
      await (await sorted).finished();
      await expect(page.getByRole("columnheader", { name: /Fiyat/ })).toHaveAttribute("aria-sort", "ascending");
      await expect.poll(() => listReads).toBeGreaterThanOrEqual(2);
      await expect(page.getByRole("region", { name: "Ürün listesi", exact: true })).toHaveAttribute("aria-busy", "false");
      await expect(add).toBeEnabled();
      await add.focus(); await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog", { name: "Yeni ürün" })).toBeVisible();
      await expect(page.getByLabel("Ürün adı", { exact: true })).toBeFocused();
      await expect(page.getByLabel("Ürün adı", { exact: true })).toHaveValue("");
      const dialog = page.getByRole("dialog", { name: "Yeni ürün" });
      await page.keyboard.press("Shift+Tab");
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
      await page.mouse.click(2, 2);
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(add).toBeFocused();
      await add.click();
      await page.getByLabel("Ürün adı", { exact: true }).fill("Yeni test ürün");
      await page.getByLabel("Kategori", { exact: true }).selectOption("sofralik-zeytin");
      const categoryLabel = page.getByLabel("Kategori etiketi", { exact: true });
      await expect(categoryLabel).toHaveValue("");
      const visibility = page.getByRole("radiogroup", { name: "Etiketi göster" });
      await expect(visibility.getByRole("radio", { name: "Göster" })).toBeChecked();
      await categoryLabel.fill("Kahvaltılık zeytin");
      await visibility.getByRole("radio", { name: "Gizle" }).click();
      await expect(visibility.getByRole("radio", { name: "Gizle" })).toBeChecked();
      for (const choice of await visibility.getByRole("radio").all()) {
        const bounds = await choice.boundingBox();
        expect(bounds?.width).toBeGreaterThanOrEqual(44);
        expect(bounds?.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByLabel("Ambalaj / ağırlık").fill("1 kg");
      await page.getByLabel("Fiyat (TL)").fill("12,34");
      await page.getByLabel("Test yağ", { exact: true }).check();
      failSave = true;
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(page.getByRole("alert")).toContainText("6 aktif");
      await expect(page.getByLabel("Ürün adı", { exact: true })).toHaveValue("Yeni test ürün");
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("Ürün kaydedildi");
      await expect(page.getByRole("status")).toBeFocused();
      expect(records.at(-1)?.priceKurus).toBe(1234); expect(records.at(-1)?.upsellIds).toEqual(["fixture-oil"]);
      expect(records.at(-1)).toMatchObject({ categoryLabel: "Kahvaltılık zeytin", showCategoryLabel: false });
      await page.getByRole("button", { name: "Yeni test ürün düzenle", exact: true }).click();
      await expect(categoryLabel).toHaveValue("Kahvaltılık zeytin");
      await expect(visibility.getByRole("radio", { name: "Gizle" })).toBeChecked();
      await categoryLabel.fill("");
      await visibility.getByRole("radio", { name: "Göster" }).focus();
      await page.keyboard.press("Space");
      await expect(visibility.getByRole("radio", { name: "Göster" })).toBeChecked();
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(page.getByRole("button", { name: "Yeni test ürün düzenle", exact: true })).toBeEnabled();
      expect(records.at(-1)).toMatchObject({ categoryLabel: null, showCategoryLabel: true });
      await page.getByRole("button", { name: "Test zeytin düzenle", exact: true }).click();
      await page.getByLabel("Stok", { exact: true }).fill("0");
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(page.getByRole("button", { name: "Test zeytin düzenle", exact: true })).toBeEnabled();
      expect(records[0].stock).toBe(0);
      await page.getByRole("button", { name: "Test zeytin yayından kaldır", exact: true }).click();
      await page.getByRole("button", { name: "Kaldırmayı onayla" }).click();
      await expect(page.getByRole("status")).toContainText("Ürün yayından kaldırıldı");
      expect(records[0].isActive).toBe(false); expect(records).toHaveLength(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // Task206 (tasarım dili v3): the product list no longer scrolls sideways. In a narrow panel every
      // product is a card whose values carry their column name, and the column headers stay as sort pills.
      const scroll = page.getByRole("region", { name: "Ürün tablosu", exact: true });
      await scroll.focus(); await expect(scroll).toBeFocused();
      expect(await scroll.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
      await expect(page.getByRole("table")).toHaveCount(1);
      for (const label of ["Ürün", "Fiyat", "Stok", "Durum"]) await expect(page.getByRole("button", { name: `${label} ile sırala` })).toBeVisible();
      if (width < 768) {
        const firstRow = page.getByRole("row").nth(1);
        const labels = await firstRow.getByRole("cell").evaluateAll(cells => cells.map(cell => getComputedStyle(cell, "::before").content));
        expect(labels).toEqual(['"Ürün"', '"Fiyat"', '"Stok"', '"Durum"', '"İşlemler"']);
        const row = await firstRow.boundingBox();
        expect(row!.x).toBeGreaterThanOrEqual(0);
        expect(row!.x + row!.width).toBeLessThanOrEqual(width);
      }
      if (width < 1024) {
        const menu = page.getByRole("button", { name: "Yönetim menüsünü aç" });
        await menu.focus(); await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog", { name: "Yönetim menüsü" })).toBeVisible();
        await page.keyboard.press("Escape"); await expect(menu).toBeFocused();
      }
    });
  }
  test(`list error, recovery, empty and six-active form limit (${reducedMotion})`, async ({ page }) => {
    await serveAdminProductsFixture(page); await page.emulateMedia({ reducedMotion });
    let state: "error" | "empty" | "full" = "error";
    await page.route("**/api/admin/products**", async route => {
      if (state === "error") await route.fulfill({ status: 503, json: { error: { code: "products_unavailable" } } });
      else {
        const data = state === "full" ? Array.from({ length: 6 }, (_, index) => ({ ...adminProduct, id: `full-${index}`, name: `Test ürün ${index}`, isActive: true })) : [];
        await route.fulfill({ json: { data, total: data.length, activeCount: data.length, page: 1, options: data.map(({ id, name }) => ({ id, name })) } });
      }
    });
    await page.goto(adminProductsFixturePath); await expect(page.getByRole("alert")).toContainText("yüklenemedi");
    state = "empty"; await page.getByRole("button", { name: "Yeniden dene" }).click();
    await expect(page.getByText("Henüz ürün eklenmedi.")).toBeVisible();
    state = "full"; await page.reload();
    await expect(page.getByRole("button", { name: "Ürün ekle" })).toBeEnabled();
    await page.getByRole("button", { name: "Ürün ekle" }).click();
    await expect(page.getByLabel("Yayında", { exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
    await expect(page.getByRole("button", { name: "Ürün ekle" })).toBeFocused();
  });
}

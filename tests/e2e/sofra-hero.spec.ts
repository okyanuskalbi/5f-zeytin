import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

test("v4: both size pills select the real SKU and confirm inline", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  const sizes = hero.getByRole("radiogroup", { name: "Boy" });
  await expect(sizes.getByRole("radio", { name: "10 kg teneke" })).toBeChecked();
  await expect(hero.getByLabel("Seçili boyun fiyatı")).toHaveText("₺2.200");
  await hero.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(hero.getByRole("status")).toHaveText("10 kg sepete eklendi.");
  await sizes.getByRole("radio", { name: "1 kg", exact: true }).click();
  await expect(hero.getByLabel("Seçili boyun fiyatı")).toHaveText("₺220");
  await hero.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(hero.getByRole("status")).toHaveText("1 kg sepete eklendi.");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([
    { productId: "sample-green-olive-10kg", quantity: 1 }, { productId: "sample-green-olive-1kg", quantity: 1 },
  ]);
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toHaveCount(0);
  const cart = page.getByRole("banner").getByRole("button", { name: "Sepetim, 2 adet" });
  await expect(cart).toContainText("Sepet");
  await cart.click();
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toBeVisible();
});

test("v4: ghost links scroll to existing anchors without a URL hash", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  for (const [label, id] of [["Ürünleri gör", "urunler"], ["Tesisimiz", "tesisimiz"]]) {
    await page.evaluate(() => scrollTo(0, 0));
    await hero.getByRole("link", { name: label, exact: true }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
    expect(new URL(page.url()).hash).toBe("");
  }
});

test("v4: stock overflow leaves persisted quantity unchanged", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-10kg", quantity: 6 }])), CART_STORAGE_KEY);
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("button", { name: "Sepetim, 6 adet" })).toBeEnabled();
  const before = await page.evaluate(key => localStorage.getItem(key), CART_STORAGE_KEY);
  await page.locator("[data-hero-intro]").getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(page.locator("[data-hero-intro]").getByRole("alert")).toContainText("Stok sınırına ulaştınız");
  expect(await page.evaluate(key => localStorage.getItem(key), CART_STORAGE_KEY)).toBe(before);
});

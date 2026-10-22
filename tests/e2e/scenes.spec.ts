import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const familyNames = ["Doğal Kırma Yeşil Zeytin", "Salamura Siyah Zeytin", "Natürel Sızma Zeytinyağı", "Salamura Yeşil Zeytin"];

test("v4 sections keep their order, real images and a single preview note", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const sections = page.locator("main > section, main > div > section");
  expect(await sections.evaluateAll(nodes => nodes.map(node => node.getAttribute("aria-labelledby") ?? node.getAttribute("aria-label")))).toEqual([
    "hero-title", "Alışveriş bilgileri", "urunler-title", "tesisimiz-title", "sss-title",
  ]);
  expect(await page.getByRole("article").locator("h3").allTextContents()).toEqual([
    familyNames[0], familyNames[0], familyNames[1], familyNames[2], familyNames[2], familyNames[3],
  ]);
  await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toHaveCount(1);
  await expect(page.locator("#toptan-iletisim form")).toHaveCount(0);
  await expect(page.locator("canvas, [data-hero-light], [data-product-card-motion]")).toHaveCount(0);
  expect(await page.locator("body").innerText()).not.toMatch(/Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil/);
  // Lazy images are loaded when their section enters the viewport.
  for (const image of await page.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(node => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("two cards add different sizes as separate persisted cart lines", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const small = page.locator('[data-product-id="sample-green-olive-1kg"]');
  const large = page.locator('[data-product-id="sample-green-olive-10kg"]');
  await small.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(small.getByRole("status")).toContainText("1 kg sepete eklendi");
  await expect(large.getByRole("img")).toHaveAttribute("alt", /10 kg teneke/);
  await large.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(large.getByRole("status")).toContainText("10 kg sepete eklendi");
  const expected = [{ productId: "sample-green-olive-1kg", quantity: 1 }, { productId: "sample-green-olive-10kg", quantity: 1 }];
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
  const drawer = page.getByRole("dialog", { name: /^Sepetim \(/ });
  await expect(drawer).toHaveCount(0);
  await page.getByRole("banner").getByRole("button", { name: "Sepetim, 2 adet", exact: true }).click();
  await drawer.getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page.getByRole("group", { name: familyNames[0], exact: true })).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("group", { name: familyNames[0], exact: true })).toHaveCount(2);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
});

test("JavaScript-disabled SSR retains every section and the product destination", async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: info.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expect(page.getByRole("heading", { name: "Düziçi'nden sofranıza.", exact: true })).toBeVisible();
    await expect(page.locator("article[data-product-id]")).toHaveCount(6);
    await expect(page.locator("#tesisimiz article")).toHaveCount(3);
    await page.goto(new URL("/#urunler", baseURL!).href);
    await expect(page.getByRole("heading", { name: "Sofranız için altı ürün.", exact: true })).toBeInViewport();
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  } finally { await context.close(); }
});

import { expect, test } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#urunler").scrollIntoViewIfNeeded();
});

test("six individual variants preserve prices and update the counter without opening a drawer", async ({ page }) => {
  const products = [...await getProducts()].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  const cards = page.locator("#urunler article");
  await expect(cards).toHaveCount(6);
  await expect(page.getByText("EN ÇOK ALINAN", { exact: true })).toHaveCount(1);
  await expect(cards.first()).toContainText("EN ÇOK ALINAN");
  const expected: { productId: string; quantity: number }[] = [];
  for (const product of products) {
    const card = page.locator(`[data-product-id="${product.id}"]`);
    await expect(card.getByLabel("Fiyat", { exact: true })).toHaveText(money.format(product.priceKurus / 100));
    await expect(card.getByLabel("Boy", { exact: true })).toHaveText(product.weight);
    if (product.stock === 0) {
      await expect(card.getByRole("button", { name: "Mevcut değil", exact: true })).toBeDisabled();
      continue;
    }
    await card.getByRole("button", { name: "Sepete ekle", exact: true }).click();
    await expect(card.getByRole("button", { name: "Eklendi ✓", exact: true })).toBeVisible();
    expected.push({ productId: product.id, quantity: 1 });
    await expect(page.getByRole("banner").getByRole("button", { name: `Sepetim, ${expected.length} adet`, exact: true })).toBeVisible();
    if (page.viewportSize()!.width < 768) await expect(page.locator("[data-mini-cart]")).toContainText(`${expected.length} adet`);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
  await page.reload();
  await expect(page.getByRole("banner").getByRole("button", { name: "Sepetim, 5 adet", exact: true })).toBeVisible();
});

test("the trust strip has four readable facts and a wholesale link", async ({ page }) => {
  const strip = page.getByRole("region", { name: "Alışveriş bilgileri" });
  await expect(strip.getByRole("listitem")).toHaveText([
    "Kendi tesisimizde dolum", "Kargo 2–4 iş günü", "Güvenli Ödeme", "Toptan alım için teklif",
  ]);
  await expect(strip.getByRole("link", { name: "Toptan alım için teklif" })).toHaveAttribute("href", "/#toptan-iletisim");
  const styles = await strip.locator("li").first().evaluate(node => {
    const style = getComputedStyle(node);
    return { size: parseFloat(style.fontSize), color: style.color, background: getComputedStyle(node.closest("section")!).backgroundColor };
  });
  expect(styles.size).toBeGreaterThanOrEqual(15);
  expect(styles.size).toBeLessThanOrEqual(16);
  const luminance = (color: string): number => color.match(/\d+/g)!.slice(0, 3).map(Number).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  expect((luminance(styles.color) + .05) / (luminance(styles.background) + .05)).toBeGreaterThanOrEqual(4.5);
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`responsive grid, content and touch targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await page.locator("#urunler").scrollIntoViewIfNeeded();
    const cards = page.locator("#urunler article");
    const columns = await cards.first().evaluate(node => getComputedStyle(node.parentElement!.parentElement!).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width < 768 ? 2 : 3);
    const trustColumns = await page.getByRole("region", { name: "Alışveriş bilgileri" }).locator("ul").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length);
    expect(trustColumns).toBe(width < 1024 ? 2 : 4);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      expect(await card.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      const button = card.getByRole("button");
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      await expect(button).toHaveCSS("opacity", "1");
      await card.getByRole("img").evaluate(node => (node as HTMLImageElement).decode());
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const heights = await cards.evaluateAll(nodes => nodes.map(node => node.querySelector('img:not([alt=""])')?.getBoundingClientRect().height ?? 0));
    expect(heights[0]).toBeGreaterThan(heights[4]);
    expect(heights[4]).toBeGreaterThan(heights[5]);
    expect(heights[5]).toBeGreaterThan(heights[1]);
  });
}

test("desktop hover reveals the approved scene and reduced motion removes transforms", async ({ page }) => {
  test.skip(page.viewportSize()!.width < 1024);
  const first = page.locator("#urunler article").first();
  await first.hover();
  await expect(first.locator("[data-product-scene]")).toHaveCSS("opacity", "0.18");
  expect(await first.evaluate(node => getComputedStyle(node).transform)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(first).toHaveCSS("transform", "none");
  await expect(first.locator('img').last()).toHaveCSS("transform", "none");
  await expect(first.locator("..")).toHaveCSS("transform", "none");
});

test("stock errors stay local and feedback resets after 2.4 seconds", async ({ page }) => {
  const product = (await getProducts())[0];
  await page.evaluate(({ key, product }) => localStorage.setItem(key, JSON.stringify([{ productId: product.id, quantity: product.stock }])), { key: CART_STORAGE_KEY, product });
  await page.reload();
  const card = page.locator(`[data-product-id="${product.id}"]`);
  await card.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(card.getByRole("alert")).toContainText("Stok");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const other = page.locator('[data-product-id="sample-green-olive-10kg"]');
  await other.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(other.getByRole("button", { name: "Eklendi ✓", exact: true })).toBeVisible();
  await expect(other.getByRole("button", { name: "Sepete ekle", exact: true })).toBeVisible({ timeout: 4000 });
});

test("JavaScript-disabled HTML retains the grid and all purchase labels", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/#urunler", baseURL!).href);
    await expect(page.locator("#urunler article")).toHaveCount(6);
    await expect(page.locator("#urunler").getByRole("button", { name: "Sepete ekle", exact: true })).toHaveCount(5);
    await expect(page.locator("#urunler").getByRole("button", { name: "Mevcut değil", exact: true })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  } finally { await context.close(); }
});

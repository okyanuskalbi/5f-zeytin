import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const familyNames = ["Doğal Kırma Yeşil Zeytin", "Salamura Siyah Zeytin", "Natürel Sızma Zeytinyağı", "Salamura Yeşil Zeytin"];

test("v3 sections keep their order, real images and a single preview note", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const sections = page.locator("main > section, main > div > section");
  expect(await sections.evaluateAll(nodes => nodes.map(node => node.getAttribute("aria-labelledby") ?? node.getAttribute("aria-label")))).toEqual([
    "hero-title", "kiler-title", "Alışveriş bilgileri", "tesisimiz-title", "sss-title",
  ]);
  expect(await page.getByRole("article").locator("h3").allTextContents()).toEqual(familyNames);
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

test("one family adds two different sizes as separate persisted cart lines", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const family = page.getByRole("article", { name: familyNames[0], exact: true });
  await family.getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await family.getByLabel("Boy", { exact: true }).selectOption({ label: "10 kg" });
  await expect(family.getByRole("img")).toHaveAttribute("alt", /10 kg teneke/);
  await family.getByRole("button", { name: "Sepete ekle" }).click();
  const expected = [{ productId: "sample-green-olive-1kg", quantity: 1 }, { productId: "sample-green-olive-10kg", quantity: 1 }];
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
  const drawer = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await drawer.getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page.getByRole("group", { name: familyNames[0], exact: true })).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("group", { name: familyNames[0], exact: true })).toHaveCount(2);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
});

test("JavaScript-disabled SSR retains every section and the pantry destination", async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: info.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expect(page.getByRole("heading", { name: "Düziçi’nden sofranıza.", exact: true })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(4);
    await page.getByRole("link", { name: "Ürünleri gör", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Kışlık kiler", exact: true })).toBeInViewport();
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  } finally { await context.close(); }
});

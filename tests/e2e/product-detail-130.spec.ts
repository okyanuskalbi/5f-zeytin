import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "@/lib/cart/store";

// Retains Task130's gallery, size, quantity, sharing and keyboard regressions on real pages.
test.beforeEach(async ({ context, browserName, baseURL }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "Run one packaged Chromium matrix.");
  const origin = new URL(baseURL ?? "http://localhost:3004");
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
  await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
});
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`${viewport.width}×${viewport.height} ${reducedMotion}: details, gallery and purchase fit`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/urunler", { waitUntil: "load" });
      const card = page.locator('article[data-product-id="sample-green-olive-10kg"]');
      await card.getByRole("link", { name: /detayını aç/ }).click();
      await expect(page).toHaveURL(/\/urun\/dogal-kirma-yesil-zeytin\?boy=3(?:%20|\+)L$/);
      const detail = page.locator("[data-product-page]");
      const title = detail.getByRole("heading", { level: 1 });
      const add = detail.getByRole("button", { name: "Sepete ekle", exact: true });
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await title.scrollIntoViewIfNeeded();
      await expect(title).toBeInViewport({ ratio: 1 });
      await add.scrollIntoViewIfNeeded();
      await expect(add).toBeInViewport({ ratio: 1 });
      await expect(add).toBeEnabled();
      const image = detail.locator("[data-product-detail-image] img");
      await expect(image).toHaveAttribute("src", /studyo/);
      await expect(image).toHaveAttribute("loading", "eager");
      await detail.getByRole("button", { name: "Sofra görseli" }).click();
      await expect(image).toHaveAttribute("src", /sahne/);
      await detail.getByRole("radio", { name: "1 kg", exact: true }).click();
      await expect(detail.getByLabel("Fiyat", { exact: true })).toHaveText("₺220,00");
      await expect(page).toHaveURL(/boy=1(?:%20|\+)kg/);
      await detail.getByRole("button", { name: "Adedi artır" }).click();
      await add.click();
      await expect(detail.getByRole("button", { name: "Eklendi" })).toBeVisible();
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "[]"), CART_STORAGE_KEY))
        .toEqual([{ productId: "sample-green-olive-1kg", quantity: 2 }]);
      const description = detail.getByText("Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur.");
      await description.scrollIntoViewIfNeeded();
      await expect(description).toBeInViewport();
      const facts = detail.getByRole("region", { name: "Ürün bilgileri" });
      await facts.scrollIntoViewIfNeeded();
      await expect(facts.locator("dt")).toHaveCount(5);
      await expect(detail.getByText("Ödeme seçenekleri")).toBeVisible();
      expect(await detail.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await page.keyboard.press("Escape");
      await expect(detail).toBeVisible();
      await expect(page).toHaveURL(/\/urun\/dogal-kirma-yesil-zeytin/);
      const recovery = page.getByRole("navigation", { name: "İçerik yolu", exact: true }).getByRole("link", { name: "Ürünler", exact: true });
      await recovery.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/urunler$/);
    });
  }
}

test("redirects a shared legacy URL to the selected page size and keeps the source parameter", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const legacy = await request.get("/?utm_source=shared&urun=sample-olive-oil-5l", { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  await page.goto("/?utm_source=shared&urun=sample-olive-oil-5l", { waitUntil: "load" });
  const detail = page.locator("[data-product-page]");
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("radio", { name: "5 L", exact: true })).toBeChecked();
  expect(new URL(page.url()).searchParams.get("utm_source")).toBe("shared");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await request.get("/?urun=unknown-product")).status()).toBe(404);
});

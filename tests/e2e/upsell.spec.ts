import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build } from "vite";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

async function seed(page: Page, items = [{ productId: "olive", quantity: 1 }]): Promise<void> {
  await page.addInitScript(({ key, items }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(items));
  }, { key: CART_STORAGE_KEY, items });
}

test("upsell: real cart has no invented relationship or discount", async ({ page }) => {
  await seed(page, [{ productId: "sample-table-olive", quantity: 1 }]);
  expect((await page.goto("/sepet"))?.status()).toBe(200);
  await expect(page.getByRole("group", { name: "Sofralık Zeytin", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sofranızı tamamlayın" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Miktar indirimi koşulları" })).toHaveCount(0);
  await expect(page.getByText("Henüz hesaplanmadı", { exact: true })).toBeVisible();
});

test.describe("upsell configured presentation", () => {
  let assets: Map<string, string | Buffer>;
  let html: string;
  test.beforeAll(async () => {
    if (process.env.PLAYWRIGHT_BASE_URL !== undefined) throw new Error("Upsell fixtures require the local checkout.");
    const root = fileURLToPath(new URL("../..", import.meta.url));
    const result = await build({
      configFile: false, root, base: "/__upsell-fixture/", publicDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      build: { write: false, sourcemap: !!process.env.UPSELL_COVERAGE,
        rollupOptions: { input: fileURLToPath(new URL("fixtures/upsell.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed fixture bundle.");
    assets = new Map(bundle.output.map((entry) => [entry.fileName,
      entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    html = [...assets.keys()].find((name) => name.endsWith("upsell.html"))!;
  });
  test.beforeEach(async ({ page, browserName }) => {
    if (process.env.UPSELL_COVERAGE && browserName === "chromium") await page.coverage.startJSCoverage({ resetOnNavigation: false });
    await page.route("**/__upsell-fixture/**", async (route) => {
      const name = new URL(route.request().url()).pathname.replace("/__upsell-fixture/", "") || html;
      const body = assets.get(name);
      await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset",
        contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
  });
  test.afterEach(async ({ page, browserName }, testInfo) => {
    if (process.env.UPSELL_COVERAGE && browserName === "chromium") {
      const coverage = (await page.coverage.stopJSCoverage()).filter((entry) => entry.url.includes("/__upsell-fixture/"));
      const sourceMaps = Object.fromEntries([...assets].filter(([name]) => name.endsWith(".map")));
      await testInfo.attach("upsell-v8-coverage", { body: JSON.stringify({ coverage, sourceMaps }), contentType: "application/json" });
    }
  });

  async function load(page: Page, mode = "normal", items = [{ productId: "olive", quantity: 1 }]): Promise<void> {
    await seed(page, items);
    await page.goto(`/__upsell-fixture/?mode=${mode}`);
    await expect(page.getByRole("heading", { level: 1, name: "Sepetim" })).toBeVisible();
  }
  const recommendations = (page: Page) => page.getByRole("region", { name: "Sofranızı tamamlayın" });
  const discount = (page: Page) => page.getByRole("region", { name: "Miktar indirimi koşulları" });

  test("approved relations: only active stocked distinct targets; add uses shared cart and persists", async ({ page }, testInfo) => {
    await load(page);
    const strip = recommendations(page);
    await expect(strip.getByRole("listitem")).toHaveCount(1);
    await expect(strip.getByRole("heading", { name: "Test Zeytinyağı", exact: true })).toBeVisible();
    await expect(strip.getByText("300,00 ₺ / adet (tahmini)")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("upsell-configured.png"), fullPage: true });
    await strip.getByRole("button", { name: "Test Zeytinyağı sepete ekle" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(strip).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Test Zeytinyağı", exact: true }).getByRole("status", { name: "Adet" })).toHaveText("1");
    await expect(page.getByRole("status", { name: "Sepet bildirimi" })).toContainText("Test Zeytinyağı sepetinize eklendi");
    await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
    await expect(page.getByRole("dialog").getByRole("group", { name: "Test Zeytinyağı", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
      .toEqual([{ productId: "olive", quantity: 1 }, { productId: "oil", quantity: 1 }]);
    await page.reload();
    await expect(strip).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Test Zeytinyağı", exact: true })).toBeVisible();
  });

  test("no configuration, empty cart and unrelated cart expose no offers", async ({ page }) => {
    await load(page, "no-config");
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Yapılandırmayı değiştir" }).click();
    await expect(recommendations(page)).toBeVisible();
    await page.getByRole("button", { name: "Yapılandırmayı değiştir" }).click();
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Sepetten sil" }).click();
    await page.getByRole("button", { name: "Yapılandırmayı değiştir" }).click();
    await expect(page.getByText("Sepetiniz henüz boş.")).toBeVisible();
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([{ productId: "unrelated", quantity: 1 }])), CART_STORAGE_KEY);
    await load(page, "normal", [{ productId: "unrelated", quantity: 1 }]);
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
  });

  test("configured quantity tiers are informational and never reduce the subtotal", async ({ page }) => {
    await load(page);
    await expect(discount(page)).toContainText("Test Zeytin");
    await expect(discount(page)).toContainText("3 adet ve üzeri için %5");
    await expect(discount(page)).toContainText("6 adet ve üzeri için %10");
    await expect(discount(page)).toContainText("sunucuda doğrulanır");
    const increase = page.getByRole("group", { name: "Test Zeytin", exact: true }).getByRole("button", { name: "Adedi artır" });
    await increase.click();
    await increase.click();
    await expect(page.getByText("376,50 ₺", { exact: true })).toBeVisible();
    await expect(page.getByText("Henüz hesaplanmadı", { exact: true })).toBeVisible();
    for (const mode of ["bad-threshold", "bad-rate", "duplicate-tier"]) {
      await page.goto(`/__upsell-fixture/?mode=${mode}`);
      await expect(page.getByRole("group", { name: "Test Zeytin", exact: true })).toBeVisible();
      await expect(discount(page)).toHaveCount(0);
      await expect(recommendations(page)).toBeVisible();
    }
  });

  test("catalog errors, stale stock and refresh suppress offers without pruning the cart", async ({ page }) => {
    await load(page, "catalog-error");
    await expect(page.getByRole("alert")).toContainText("Katalog yüklenemedi");
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(recommendations(page)).toBeVisible();
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "olive", quantity: 1 }]);
    await page.goto("/__upsell-fixture/?mode=stock-change");
    await expect(recommendations(page)).toBeVisible();
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(page.getByRole("alert")).toContainText("stoğu değişti");
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "olive", quantity: 1 }]);
    await page.goto("/__upsell-fixture/?mode=target-change");
    await expect(recommendations(page)).toBeVisible();
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toBeVisible();
    await page.goto("/__upsell-fixture/?mode=refreshing");
    await expect(recommendations(page)).toHaveCount(0);
    await expect(discount(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Yenilemeyi bitir" }).click();
    await expect(recommendations(page)).toBeVisible();
  });

  test("rejected add is retryable; storage failure preserves the successful in-memory add", async ({ page }) => {
    await load(page, "add-error");
    await recommendations(page).getByRole("button").click();
    await expect(page.getByRole("alert")).toContainText("Ürün eklenemedi");
    await expect(recommendations(page)).toBeVisible();
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "olive", quantity: 1 }]);
    await page.getByRole("button", { name: "Hatayı düzelt" }).click();
    await recommendations(page).getByRole("button").click();
    await expect(recommendations(page)).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
    await load(page, "storage-error");
    await recommendations(page).getByRole("button").click();
    await expect(page.getByRole("alert")).toContainText("kaydedilemiyor");
    await expect(page.getByRole("group", { name: "Test Zeytinyağı", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Hatayı düzelt" }).click();
    await page.getByRole("group", { name: "Test Zeytinyağı", exact: true }).getByRole("button", { name: "Adedi artır" }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("a newly restocked recommendation can be added after catalog refresh", async ({ page }) => {
    await load(page, "target-restock");
    await expect(recommendations(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(recommendations(page)).toBeVisible();
    await recommendations(page).getByRole("button").click();
    await expect(page.getByRole("group", { name: "Test Zeytinyağı", exact: true })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(recommendations(page)).toHaveCount(0);
  });

  test("keyboard and reduced motion retain visible controls and safe focus after add", async ({ page, browserName }, testInfo) => {
    const nextKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.setViewportSize({ width: page.viewportSize()!.width, height: 480 });
      await load(page);
      const remove = page.getByRole("group", { name: "Test Zeytin", exact: true }).getByRole("button", { name: "Sepetten sil" });
      await remove.focus();
      await page.keyboard.press(nextKey);
      const add = recommendations(page).getByRole("button");
      await expect(add).toBeFocused();
      expect(await add.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
      const box = (await add.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      if (reducedMotion === "reduce") expect(await add.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`upsell-keyboard-${reducedMotion}.png`), fullPage: true });
      await page.keyboard.press("Enter");
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      await expect(recommendations(page)).toHaveCount(0);
      await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
    }
  });
});

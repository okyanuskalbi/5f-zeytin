import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build } from "vite";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const items = [{ productId: "fixture-olive", quantity: 1 }, { productId: "fixture-oil", quantity: 2 }];

async function seed(page: Page, value: unknown): Promise<void> {
  await page.addInitScript(({ key, data }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, data);
  }, { key: CART_STORAGE_KEY, data: typeof value === "string" ? value : JSON.stringify(value) });
}

test("cart page: route loads the catalog and preserves edits on server refresh", async ({ page }) => {
  await seed(page, [{ productId: "sample-table-olive", quantity: 1, priceKurus: 1 }]);
  const response = await page.goto("/sepet");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Sepetim" })).toBeVisible();
  const olive = page.getByRole("group", { name: "Sofralık Zeytin", exact: true });
  await expect(olive.getByText("125,50 ₺ / adet")).toBeVisible();
  await olive.getByRole("button", { name: "Adedi artır" }).click();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  const refresh = page.waitForRequest((request) => request.url().includes("/sepet") && request.headers()["rsc"] === "1");
  await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
  await refresh;
  await expect(page.getByRole("button", { name: "Fiyat ve stokları yenile" })).toBeEnabled();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  await page.reload();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  await expect(page.getByRole("textbox", { name: "Kupon kodu" })).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Kuponu uygula" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Alışverişe devam et" })).toHaveAttribute("href", "/#urunler");
});

test.describe("cart page component", () => {
  let assets: Map<string, string | Buffer>;
  let html: string;
  test.beforeAll(async () => {
    if (process.env.PLAYWRIGHT_BASE_URL !== undefined) throw new Error("Cart page fixtures require the local checkout.");
    const root = fileURLToPath(new URL("../..", import.meta.url));
    const result = await build({
      configFile: false, root, base: "/__cart-page-fixture/", publicDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      build: { write: false, sourcemap: !!process.env.CART_PAGE_COVERAGE,
        rollupOptions: { input: fileURLToPath(new URL("fixtures/cart-page.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed fixture bundle.");
    assets = new Map(bundle.output.map((entry) => [entry.fileName,
      entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    html = [...assets.keys()].find((name) => name.endsWith("cart-page.html"))!;
  });
  test.beforeEach(async ({ page, browserName }) => {
    if (process.env.CART_PAGE_COVERAGE && browserName === "chromium") await page.coverage.startJSCoverage({ resetOnNavigation: false });
    await page.route("**/__cart-page-fixture/**", async (route) => {
      const name = new URL(route.request().url()).pathname.replace("/__cart-page-fixture/", "") || html;
      const body = assets.get(name);
      await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset",
        contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
  });
  test.afterEach(async ({ page, browserName }, testInfo) => {
    if (process.env.CART_PAGE_COVERAGE && browserName === "chromium") {
      const coverage = (await page.coverage.stopJSCoverage()).filter((entry) => entry.url.includes("/__cart-page-fixture/"));
      const sourceMaps = Object.fromEntries([...assets].filter(([name]) => name.endsWith(".map")));
      await testInfo.attach("cart-page-v8-coverage", { body: JSON.stringify({ coverage, sourceMaps }), contentType: "application/json" });
    }
  });
  async function load(page: Page, mode = "normal", value: unknown = items): Promise<void> {
    await seed(page, value);
    await page.goto(`/__cart-page-fixture/?mode=${mode}`);
    await expect(page.getByRole("heading", { name: "Sepetim", exact: true })).toBeVisible();
  }
  test("shared store: quantity limits, drawer synchronization, reload and removal", async ({ page }, testInfo) => {
    await load(page);
    const olive = page.getByRole("group", { name: "Sofralık Zeytin", exact: true });
    await expect(olive.getByRole("button", { name: "Adedi azalt" })).toBeDisabled();
    await expect(page.getByText("725,50 ₺", { exact: true })).toBeVisible();
    await olive.getByRole("button", { name: "Adedi artır" }).click();
    await olive.getByRole("button", { name: "Adedi artır" }).click();
    await expect(olive.getByRole("button", { name: "Adedi artır" })).toBeDisabled();
    await expect(page.getByText("976,50 ₺", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Sepetim" });
    await expect(dialog.getByRole("status", { name: "Adet" }).first()).toHaveText("3");
    await dialog.getByRole("button", { name: "Adedi azalt" }).first().click();
    await page.keyboard.press("Escape");
    await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
    await page.reload();
    await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
      .toEqual([{ productId: "fixture-olive", quantity: 2 }, items[1]]);
    await page.screenshot({ path: testInfo.outputPath("cart-filled.png"), fullPage: true });
    await olive.getByRole("button", { name: "Sepetten sil" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.getByRole("button", { name: "Sepetten sil" }).click();
    await expect(page.getByText("Sepetiniz henüz boş.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("cart-empty.png"), fullPage: true });
  });
  test("catalog refresh: changed price, reduced stock and removed product require reconciliation", async ({ page }) => {
    await load(page, "stock-change", [{ ...items[0], quantity: 3 }, items[1]]);
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    const olive = page.getByRole("group", { name: "Sofralık Zeytin", exact: true });
    await expect(olive.getByText("150,75 ₺ / adet")).toBeVisible();
    await expect(olive.getByText(/Stok değişti/)).toBeVisible();
    await expect(page.getByRole("group", { name: "Kullanılamayan ürün" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
    await page.getByRole("button", { name: "Stok değişikliklerini uygula" }).click();
    await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("1");
    await expect(olive.getByRole("button", { name: "Adedi artır" })).toBeDisabled();
    await expect(page.getByText("150,75 ₺", { exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "Kullanılamayan ürün" })).toHaveCount(0);
    await expect(page.getByRole("status", { name: "Sepet bildirimi" })).toContainText("Stok değişiklikleri uygulandı");
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
      .toEqual([{ productId: "fixture-olive", quantity: 1 }]);
  });
  test("catalog failures: retry preserves an unread cart; refresh failure hides stale prices", async ({ page }) => {
    await load(page, "catalog-error");
    await expect(page.getByRole("alert")).toContainText("Katalog yüklenemedi");
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(items);
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(page.getByText("725,50 ₺", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    await expect(page.getByRole("alert")).toContainText("Katalog yüklenemedi");
    await expect(page.getByText("725,50 ₺", { exact: true })).toHaveCount(0);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(items);
  });
  test("stock mismatch keeps unrelated edits from silently pruning other lines", async ({ page }) => {
    await load(page, "stock-change", [...items, { productId: "fixture-extra-0", quantity: 1 }]);
    await page.getByRole("button", { name: "Fiyat ve stokları yenile" }).click();
    const extra = page.getByRole("group", { name: "Uzun ürün adı 1 · Sofralar için salamura zeytin", exact: true });
    await expect(extra.getByRole("button", { name: "Adedi artır" })).toBeDisabled();
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
      .toEqual([...items, { productId: "fixture-extra-0", quantity: 1 }]);
    await page.getByRole("button", { name: "Stok değişikliklerini uygula" }).click();
    await expect(extra.getByRole("button", { name: "Adedi artır" })).toBeEnabled();
    await extra.getByRole("button", { name: "Adedi artır" }).click();
    await expect(extra.getByRole("status", { name: "Adet" })).toHaveText("2");
  });
  test("storage and quantity failures: edits stay in memory and recover", async ({ page }) => {
    await load(page, "write-error");
    await expect(page.getByRole("alert")).toContainText("kaydedilemiyor");
    const olive = page.getByRole("group", { name: "Sofralık Zeytin", exact: true });
    await olive.getByRole("button", { name: "Adedi artır" }).click();
    await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
    await page.getByRole("button", { name: "Kaydı etkinleştir" }).click();
    await olive.getByRole("button", { name: "Adedi azalt" }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.getByRole("button", { name: "Stok hatasını tetikle" }).click();
    await olive.getByRole("button", { name: "Adedi artır" }).click();
    await expect(page.getByRole("alert")).toContainText("Adet güncellenemedi");
    await page.getByRole("button", { name: "Stoğu düzelt" }).click();
    await olive.getByRole("button", { name: "Adedi artır" }).click();
    await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  });
  test("corrupt and blocked storage do not expose a false total or payment action", async ({ page }) => {
    await load(page, "normal", "broken-json");
    await expect(page.getByText("Sepetiniz henüz boş.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
    await page.goto("/__cart-page-fixture/?mode=read-error");
    await expect(page.getByRole("alert")).toContainText("kaydedilemiyor");
    await expect(page.getByText("Sepetiniz henüz boş.")).toBeVisible();
  });
  test("keyboard and reduced motion: controls, labels, visible focus and safe removal", async ({ page, browserName }, testInfo) => {
    const nextKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await load(page);
      const continueLink = page.getByRole("link", { name: "Alışverişe devam et" });
      await continueLink.focus();
      await page.keyboard.press(nextKey);
      const increase = page.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("button", { name: "Adedi artır" });
      await expect(increase).toBeFocused();
      expect(await increase.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
      await page.keyboard.press("Enter");
      await page.keyboard.press(nextKey);
      await expect(page.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("button", { name: "Sepetten sil" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      const coupon = page.getByRole("textbox", { name: "Kupon kodu" });
      await coupon.focus();
      await expect(coupon).toHaveAccessibleDescription(/henüz kullanıma açık değil/);
      await expect(page.getByRole("button", { name: "Ödemeye geç" })).toHaveAccessibleDescription(/henüz kullanıma açık değil/);
      if (reducedMotion === "reduce") expect(await continueLink.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`cart-keyboard-${reducedMotion}.png`), fullPage: true });
      await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
    }
  });
  test("six long lines fit narrow and short screens with reachable controls", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 480 });
    await load(page, "normal", [...items, ...Array.from({ length: 4 }, (_, index) => ({ productId: `fixture-extra-${index}`, quantity: 1 }))]);
    await expect(page.getByRole("list", { name: "Sepetteki ürünler" }).getByRole("listitem")).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const payment = page.getByRole("button", { name: "Ödemeye geç" });
    await payment.scrollIntoViewIfNeeded();
    await expect(payment).toBeInViewport();
    for (const control of await page.locator('main button, main input, main a').all()) {
      const box = (await control.boundingBox())!;
      expect(Math.round(box.height * 100) / 100).toBeGreaterThanOrEqual(44);
      expect(Math.round(box.width * 100) / 100).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: testInfo.outputPath("cart-short-screen.png"), fullPage: true });
  });
});

import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const families = [
  { slug: "dogal-kirma-yesil-zeytin", name: "Doğal Kırma Yeşil Zeytin" },
  { slug: "salamura-siyah-zeytin", name: "Salamura Siyah Zeytin" },
  { slug: "naturel-sizma-zeytinyagi", name: "Natürel Sızma Zeytinyağı" },
  { slug: "salamura-yesil-zeytin", name: "Salamura Yeşil Zeytin" },
];
const groups = ["zeytin", "siyah-zeytin", "yesil-zeytin", "kirma-zeytin", "zeytinyagi"];

async function measure(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const result = { cls: 0 };
    Object.assign(window, { task193Metrics: result });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (!entry.hadRecentInput) result.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}
async function layout(page: Page): Promise<{ cls: number; overflow: number }> {
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => ({
    cls: (window as unknown as { task193Metrics: { cls: number } }).task193Metrics.cls,
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(result.cls).toBeLessThan(.05);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect((await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze()).violations).toEqual([]);
  return result;
}

test.describe("Task193 product pages", () => {
  test.beforeEach(async ({ browserName, context, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged Chromium matrix.");
    const origin = new URL(baseURL ?? "http://localhost:3004");
    expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  });

  for (const width of [390, 1440]) test(`${width}: real card link, size, quantity and correct cart variant`, async ({ page }) => {
    await mkdir("output/task193", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    await page.goto("/urunler", { waitUntil: "load" });
    const card = page.locator('article[data-product-id="sample-green-olive-1kg"]');
    const anchor = card.locator('a[href^="/urun/dogal-kirma-yesil-zeytin"]').first();
    await expect(anchor).toHaveAttribute("href", /\?boy=1(?:%20|\+)kg$/);
    await anchor.click();
    await expect(page).toHaveURL(/\/urun\/dogal-kirma-yesil-zeytin\?boy=1(?:%20|\+)kg$/);
    const product = page.locator("[data-product-page]");
    await expect(product.getByRole("heading", { level: 1 })).toHaveText("Doğal Kırma Yeşil Zeytin");
    await expect(product.getByRole("radio", { name: "1 kg", exact: true })).toBeChecked();
    const price = await product.getByLabel("Fiyat", { exact: true }).textContent();
    await product.getByRole("radio", { name: "3 L", exact: true }).locator("..").click();
    await expect(page).toHaveURL(/\?boy=3(?:%20|\+)L$/);
    await expect(product.getByLabel("Fiyat", { exact: true })).not.toHaveText(price!);
    await expect(product.getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
    await product.getByRole("button", { name: "Adedi artır", exact: true }).click();
    await expect(product.getByLabel("Adet", { exact: true })).toHaveText("2");
    await product.getByRole("button", { name: "Sepete ekle", exact: true }).click();
    await expect(page.getByRole("button", { name: "Sepetim, 2 adet", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("afina-zeytin:cart") ?? "[]"))).toEqual([
      { productId: "sample-green-olive-10kg", quantity: 2 },
    ]);
    await expect(product.getByRole("link", { name: "Teklife ekle", exact: true })).toHaveAttribute("href", "/toptan-satis?teklif=sample-green-olive-10kg");
    await expect(page.getByRole("heading", { name: "Benzer Ürünler", exact: true })).toBeVisible();
    const related = page.locator('section[aria-labelledby="benzer-title"] article[data-product-id]');
    await expect(related).toHaveCount(4);
    const relatedItems = await related.evaluateAll(cards => cards.map(card => ({ id: card.getAttribute("data-product-id"), category: card.getAttribute("data-category") })));
    expect(new Set(relatedItems.map(item => item.id)).size).toBe(4);
    expect(relatedItems.map(item => item.id)).not.toContain("sample-green-olive-10kg");
    expect(relatedItems.slice(0, 3).every(item => item.category !== "zeytinyagi")).toBe(true);
    expect(relatedItems[3].category).toBe("zeytinyagi");
    // Audit the settled addition feedback; the intentional entrance crossfades
    // its text and the mobile mini-cart before reaching their final colours.
    await expect(product.locator("[data-add-label]")).toHaveText("Eklendi");
    await expect(product.locator("[data-add-label]")).toHaveCSS("opacity", "1");
    const miniCart = page.locator("[data-mini-cart]");
    if (await miniCart.count()) await expect(miniCart).toHaveCSS("opacity", "1");
    const result = await layout(page);
    await page.screenshot({ path: `output/task193/product-${width}.png`, fullPage: true });
    await writeFile(`output/task193/product-${width}-metrics.json`, JSON.stringify(result, null, 2));
    await page.reload({ waitUntil: "load" });
    await expect(product.getByRole("radio", { name: "3 L", exact: true })).toBeChecked();
  });

  for (const width of [390, 1440]) test(`${width}: sold-out state, gallery, price and breadcrumb remain readable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    expect((await page.goto("/urun/salamura-siyah-zeytin", { waitUntil: "load" }))?.status()).toBe(200);
    const product = page.locator("[data-product-page]");
    await expect(product.getByRole("button", { name: "Mevcut değil", exact: true })).toBeDisabled();
    await expect(product.getByRole("link", { name: "Teklife ekle", exact: true })).toHaveAttribute("href", "/toptan-satis?teklif=sample-black-olive-1kg");
    const breadcrumb = page.getByRole("navigation", { name: "İçerik yolu", exact: true });
    await expect(breadcrumb.getByRole("link", { name: "Ürünler", exact: true })).toHaveAttribute("href", "/urunler");
    const image = product.locator("[data-product-detail-image] img");
    const initialImage = await image.getAttribute("src");
    await product.getByRole("button", { name: "Sofra görseli", exact: true }).click();
    await expect(image).not.toHaveAttribute("src", initialImage!);
    await expect(product.getByRole("button", { name: "Sofra görseli", exact: true })).toHaveAttribute("aria-pressed", "true");
    await layout(page);
  });

  test("all family and category responses are 200/noindex; unknowns 404 and sitemap excludes prices", async ({ page, request }) => {
    for (const family of families) {
      expect((await page.goto(`/urun/${family.slug}`, { waitUntil: "load" }))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(family.name);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*follow/);
      const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
      expect(canonical.origin).toBe("https://afinazeytin.com");
      expect(canonical.pathname).toBe(`/urun/${family.slug}`);
      expect(canonical.searchParams.get("boy")).toBeTruthy();
      await expect(page).toHaveTitle(new RegExp(canonical.searchParams.get("boy")!));
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical.href);
      const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent ?? "{}")));
      expect(JSON.stringify(schemas)).toContain('"@type":"BreadcrumbList"');
      expect(JSON.stringify(schemas)).not.toMatch(/"@type":"(?:Product|Offer)"/);
    }
    for (const group of groups) {
      expect((await page.goto(`/urunler/${group}`, { waitUntil: "load" }))?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*follow/);
    }
    expect((await request.get("/urun/olmayan-urun")).status()).toBe(404);
    expect((await request.get("/urunler/olmayan-kategori")).status()).toBe(404);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of [...families.map(item => `/urun/${item.slug}`), ...groups.map(item => `/urunler/${item}`)]) expect(sitemap).not.toContain(path);
  });

  for (const width of [390, 1440]) test(`${width}: directly linked non-default size hydrates without a layout jump`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    await page.goto("/urun/naturel-sizma-zeytinyagi?boy=5%20L", { waitUntil: "load" });
    const product = page.locator("[data-product-page]");
    await expect(product.getByRole("radio", { name: "5 L", exact: true })).toBeChecked();
    await expect(product.getByLabel("Fiyat", { exact: true })).toContainText("1.750");
    const related = page.locator('section[aria-labelledby="benzer-title"] article[data-product-id]');
    await expect(related).toHaveCount(4);
    await expect(related.first()).toHaveAttribute("data-category", "zeytinyagi");
    expect(await related.evaluateAll(cards => cards.map(card => card.getAttribute("data-product-id")))).not.toContain("sample-olive-oil-5l");
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await layout(page);
  });

  for (const width of [390, 1440]) test(`${width}: olive parent and query-based price sorting work`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    await page.goto("/urunler/zeytin", { waitUntil: "load" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Zeytin");
    await expect(page.locator("article[data-product-id]")).toHaveCount(4);
    const navigation = page.getByRole("navigation", { name: "Ürün grupları", exact: true });
    for (const name of ["Siyah Zeytin", "Yeşil Zeytin", "Kırma Zeytin"]) await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible();
    // Opening stability is measured before intentional sorting reorders cards.
    await layout(page);
    const sort = page.getByRole("combobox", { name: /sırala/i });
    await sort.selectOption({ label: "Fiyat artan" });
    await expect(page).toHaveURL(/[?&]sirala=/);
    const ascending = await page.locator("article[data-product-id]").evaluateAll(cards => cards.map(card => card.getAttribute("data-product-id")));
    expect(ascending).toEqual(["sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg", "sample-green-olive-10kg"]);
    await sort.selectOption({ label: "Fiyat azalan" });
    const descending = await page.locator("article[data-product-id]").evaluateAll(cards => cards.map(card => card.getAttribute("data-product-id")));
    expect(descending).toEqual(["sample-green-olive-10kg", "sample-brined-green-olive-5kg", "sample-green-olive-1kg", "sample-black-olive-1kg"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
});

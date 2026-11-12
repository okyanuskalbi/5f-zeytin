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
    // Task208: the catalogue is the home page's #urunler section; a card carries only the buy action.
    await page.goto("/#urunler", { waitUntil: "load" });
    const card = page.locator('#urunler article[data-product-id="sample-green-olive-1kg"]');
    await expect(card.locator("[data-pill]")).toHaveCount(1);
    await expect(card.getByRole("link", { name: "Teklife ekle" })).toHaveCount(0);
    const anchor = card.locator('a[href^="/urun/dogal-kirma-yesil-zeytin"]').first();
    await expect(anchor).toHaveAttribute("href", /\?boy=1(?:%20|\+)kg$/);
    await anchor.click();
    await expect(page).toHaveURL(/\/urun\/dogal-kirma-yesil-zeytin\?boy=1(?:%20|\+)kg$/);
    const product = page.locator("[data-product-page]");
    await expect(product.getByRole("heading", { level: 1 })).toHaveText("Doğal Kırma Yeşil Zeytin");
    await expect(product.getByRole("radio", { name: "1 kg", exact: true })).toBeChecked();
    const price = await product.getByLabel("Fiyat", { exact: true }).textContent();
    await product.getByRole("radio", { name: "3 L", exact: true }).click();
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
    const related = page.locator('section[aria-labelledby="benzer-title"] article[data-product-id]');
    await expect(product.getByRole("link", { name: "Teklife ekle", exact: true })).toHaveAttribute("href", "/?sekme=toptan&teklif=sample-green-olive-10kg#toptan-bayilik"); // Task208
    const category = page.locator('section[aria-labelledby="benzer-title"]').getByRole("link", { name: "Kategorideki ürünler", exact: true });
    await expect(category).toHaveAttribute("href", "/?kategori=zeytin#urunler");
    await expect(category).toHaveAttribute("data-variant", "quiet");
    await expect(category.locator("[data-coin]")).toHaveCount(1);
    expect(await category.evaluate(link => getComputedStyle(link.querySelector("[data-pill-label]")!).textDecorationLine)).toBe("none");
    for (const item of await related.all()) await expect(item.getByRole("link", { name: "Teklife ekle" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Benzer Ürünler", exact: true })).toBeVisible();
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
    await expect(product.getByRole("link", { name: "Teklife ekle", exact: true })).toHaveAttribute("href", "/?sekme=toptan&teklif=sample-black-olive-1kg#toptan-bayilik"); // Task208
    const breadcrumb = page.getByRole("navigation", { name: "İçerik yolu", exact: true });
    // Task208: the trail leads to the products section and to the category pills of the home page.
    await expect(breadcrumb.getByRole("link", { name: "Ürünler", exact: true })).toHaveAttribute("href", "/#urunler");
    await expect(breadcrumb.getByRole("link", { name: "Zeytin", exact: true })).toHaveAttribute("href", "/?kategori=zeytin#urunler");
    await expect(breadcrumb.getByRole("link", { name: "Siyah Zeytin", exact: true })).toHaveAttribute("href", "/?kategori=siyah-zeytin#urunler");
    expect(await breadcrumb.getByRole("link").evaluateAll(links => links.map(link => getComputedStyle(link).textDecorationLine))).toEqual(["none", "none", "none", "none"]);
    const image = product.locator("[data-product-detail-image] img");
    const initialImage = await image.getAttribute("src");
    await product.getByRole("button", { name: "Sofra görseli", exact: true }).click();
    await expect(image).not.toHaveAttribute("src", initialImage!);
    await expect(product.getByRole("button", { name: "Sofra görseli", exact: true })).toHaveAttribute("aria-pressed", "true");
    await layout(page);
  });

  test("Task208: family pages are 200/noindex, category addresses redirect to their pill, unknown products 404 and the sitemap excludes prices", async ({ page, request }) => {
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
      // Task208: breadcrumb items point at the home sections, never at a retired page.
      expect(JSON.stringify(schemas)).toContain('"item":"https://afinazeytin.com/#urunler"');
      expect(JSON.stringify(schemas)).not.toMatch(/afinazeytin\.com\/urunler/);
      expect(JSON.stringify(schemas)).not.toMatch(/"@type":"(?:Product|Offer)"/);
    }
    for (const group of [...groups, "olmayan-kategori"]) {
      const redirect = await request.get(`/urunler/${group}`, { maxRedirects: 0 });
      expect(redirect.status()).toBe(308);
      expect(redirect.headers().location).toBe(`/?kategori=${group}#urunler`);
    }
    const catalogue = await request.get("/urunler", { maxRedirects: 0 });
    expect(catalogue.status()).toBe(308);
    expect(catalogue.headers().location).toBe("/#urunler");
    expect((await request.get("/urun/olmayan-urun")).status()).toBe(404);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of [...families.map(item => `/urun/${item.slug}`), "/urunler", "kategori="]) expect(sitemap).not.toContain(path);
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

  // Task208: price sorting is gone with the catalogue page (six products in one grid). The parent pill still
  // gathers its three child groups, in the catalogue order, and the address alone opens it without a layout jump.
  for (const width of [390, 1440]) test(`${width}: Task208 olive parent pill gathers its child groups in catalogue order`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    await page.goto("/?kategori=zeytin#urunler", { waitUntil: "load" });
    const pills = page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true });
    await expect(pills.locator('[role="radio"][aria-checked="true"]')).toHaveText("Zeytin");
    const cards = page.locator("#urunler article[data-product-id]");
    await expect(cards).toHaveCount(4);
    expect(await cards.evaluateAll(items => items.map(card => card.getAttribute("data-product-id")))).toEqual(["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg"]);
    for (const name of ["Siyah", "Yeşil", "Kırma"]) await expect(pills.getByRole("radio", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /sırala/i })).toHaveCount(0);
    // The address scrolls (smoothly) to the section; measure once it rests and the sections it passed have arrived.
    const gap = () => page.evaluate(() => Math.round(document.getElementById("urunler")!.getBoundingClientRect().top - document.querySelector("header[data-site-navbar]")!.getBoundingClientRect().bottom));
    await expect.poll(gap, { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
    await expect.poll(gap, { timeout: 10_000 }).toBeLessThanOrEqual(24);
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running" && !(animation.effect as KeyframeEffect | null)?.target?.closest("#baslangic")).length), { timeout: 10_000 }).toBe(0);
    // Opening stability: the filtered grid arrives without a shift.
    await layout(page);
    await expect(page.locator("[data-cart-pill]")).toBeEnabled();
    await pills.getByRole("radio", { name: "Kırma", exact: true }).click();
    await expect(page).toHaveURL(/\/\?kategori=kirma-zeytin#urunler$/);
    await expect(cards).toHaveCount(2);
    expect(await cards.evaluateAll(items => items.map(card => card.getAttribute("data-product-id")))).toEqual(["sample-green-olive-10kg", "sample-green-olive-1kg"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
});

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Task208: the category pages are pills of the home page's #urunler section; /urunler/<group> redirects there.
const ALL_PRODUCTS = ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-olive-oil-1l", "sample-olive-oil-5l", "sample-brined-green-olive-5kg"];
const groups = [
  { id: "zeytin", pill: "Zeytin", products: ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg"] },
  { id: "siyah-zeytin", pill: "Siyah", products: ["sample-black-olive-1kg"] },
  { id: "yesil-zeytin", pill: "Yeşil", products: ["sample-brined-green-olive-5kg"] },
  { id: "kirma-zeytin", pill: "Kırma", products: ["sample-green-olive-10kg", "sample-green-olive-1kg"] },
  { id: "zeytinyagi", pill: "Zeytinyağı", products: ["sample-olive-oil-1l", "sample-olive-oil-5l"] },
];
const PILLS = ["Tümü", "Zeytinyağı", "Zeytin", "Siyah", "Yeşil", "Kırma"];

const cardIds = (page: Page) => page.locator("#urunler article[data-product-id]").evaluateAll(cards => cards.map(card => card.getAttribute("data-product-id")));
/** Distance between the sticky header and the section: 0-24 px once the (smooth) scroll has settled. */
const gapUnderHeader = (page: Page, id: string) => page.evaluate(section => Math.round(document.getElementById(section)!.getBoundingClientRect().top - document.querySelector("header[data-site-navbar]")!.getBoundingClientRect().bottom), id);
async function landsUnderHeader(page: Page, id: string) {
  await expect.poll(() => gapUnderHeader(page, id), { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
  await expect.poll(() => gapUnderHeader(page, id), { timeout: 10_000 }).toBeLessThanOrEqual(24);
}
/** The pills answer only after hydration; the cart pill is enabled by the same hydration. */
const interactive = (page: Page) => expect(page.locator("[data-cart-pill]")).toBeEnabled();

async function localOnly(context: BrowserContext, baseURL: string | undefined) {
  const origin = new URL(baseURL ?? "http://localhost:3004");
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return [origin.hostname, "localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? route.continue() : route.abort();
  });
}

test.describe("Task190 category pages", () => {
  test.beforeEach(async ({ browserName, context, baseURL }, testInfo) => {
    test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium-390", "Run the category matrix once with packaged Chromium.");
    await localOnly(context, baseURL);
  });

  for (const group of groups) test(`${group.id}: Task208 old address redirects to its pill with exactly its products`, async ({ page, request }) => {
    const redirect = await request.get(`/urunler/${group.id}`, { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe(`/?kategori=${group.id}#urunler`);
    const response = await page.goto(`/urunler/${group.id}`, { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/");
    expect(new URL(page.url()).search).toBe(`?kategori=${group.id}`);
    expect(new URL(page.url()).hash).toBe("#urunler");
    const pills = page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true });
    await expect(pills.locator('[role="radio"][aria-checked="true"]')).toHaveText(group.pill);
    await expect(pills.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
    await expect.poll(() => cardIds(page)).toEqual(group.products);
    // One page, one title, one canonical: the pill is a state of the home page, not a second document.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/afinazeytin\.com\/?$/);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
    await landsUnderHeader(page, "urunler");
    for (const id of group.products) {
      const card = page.locator(`#urunler article[data-product-id="${id}"]`);
      await expect(card.locator("[data-pill]")).toHaveCount(1);
      await expect(card.getByRole("link", { name: "Teklife ekle" })).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });

  test("Task208: unknown groups fall back to every product and no category address enters the sitemap", async ({ page, request }) => {
    const missing = await request.get("/urunler/olmayan", { maxRedirects: 0 });
    expect(missing.status()).toBe(308);
    expect(missing.headers().location).toBe("/?kategori=olmayan#urunler");
    expect((await request.get("/urunler/zeytin/alt", { maxRedirects: 0 })).status()).toBe(404);
    await page.goto("/urunler/olmayan", { waitUntil: "load" });
    await expect(page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true }).locator('[role="radio"][aria-checked="true"]')).toHaveText("Tümü");
    await expect.poll(() => cardIds(page)).toEqual(ALL_PRODUCTS);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).not.toContain("/urunler");
    expect(xml).not.toContain("kategori=");
  });

  for (const width of [360, 390, 768, 1024, 1440]) test(`${width}: Task208 category pills, touch targets and normal document flow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#urunler", { waitUntil: "load" });
    await interactive(page);
    const pills = page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true });
    await expect(pills.getByRole("radio")).toHaveText(PILLS);
    for (const label of PILLS) {
      const box = await pills.getByRole("radio", { name: label, exact: true }).boundingBox();
      expect(box?.height, `${label} touch target`).toBeGreaterThanOrEqual(44);
      expect(box?.width, `${label} touch target`).toBeGreaterThanOrEqual(44);
    }
    await expect(pills.locator('[aria-checked="true"]')).toHaveText("Tümü");
    await page.evaluate(() => { (window as unknown as { task208SameDocument: boolean }).task208SameDocument = true; });
    for (const group of groups) {
      await pills.getByRole("radio", { name: group.pill, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/\\?kategori=${group.id}#urunler$`));
      await expect(pills.locator('[aria-checked="true"]')).toHaveCount(1);
      await expect(pills.locator('[aria-checked="true"]')).toHaveText(group.pill);
      await expect.poll(() => cardIds(page)).toEqual(group.products);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const card = await page.locator("#urunler article[data-product-id]").first().boundingBox();
      const heading = await page.locator("#urunler h2").boundingBox();
      const pillBounds = await pills.boundingBox();
      // Heading, then the pills, then the cards: one column of normal flow at every width.
      expect(pillBounds!.y).toBeGreaterThan(heading!.y);
      expect(pillBounds!.y + pillBounds!.height).toBeLessThanOrEqual(card!.y + 1);
    }
    await pills.getByRole("radio", { name: "Tümü", exact: true }).click();
    await expect(page).toHaveURL(/\/#urunler$/);
    await expect.poll(() => cardIds(page)).toEqual(ALL_PRODUCTS);
    // The whole walk happened in one document: no reload, no navigation.
    expect(await page.evaluate(() => (window as unknown as { task208SameDocument?: boolean }).task208SameDocument)).toBe(true);
  });

  test("Task208: the hero action opens the products and the existing detail and quote handoff still work", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "load" });
    await interactive(page);
    const action = page.locator("#baslangic a[data-pill]");
    await expect(action).toHaveCount(1);
    await expect(action).toHaveAttribute("href", "/#urunler");
    await action.click();
    await expect(page).toHaveURL(/\/#urunler$/);
    await landsUnderHeader(page, "urunler");
    await page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true }).getByRole("radio", { name: "Zeytinyağı", exact: true }).click();
    await expect(page).toHaveURL(/\/\?kategori=zeytinyagi#urunler$/);
    const product = page.locator('#urunler article[data-product-id="sample-olive-oil-1l"]');
    await expect(product.getByRole("link", { name: "Teklife ekle" })).toHaveCount(0);
    await product.getByRole("link", { name: /detayını aç/ }).click();
    await expect(page).toHaveURL(/\/urun\/naturel-sizma-zeytinyagi\?boy=1(?:%20|\+)L$/);
    const detail = page.locator("[data-product-page]");
    await expect(detail.getByRole("heading", { name: "Natürel Sızma Zeytinyağı", exact: true })).toBeVisible();
    await expect(detail.getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
    const quote = detail.getByRole("link", { name: "Teklife ekle" });
    await expect(quote).toHaveAttribute("href", "/?sekme=toptan&teklif=sample-olive-oil-1l#toptan-bayilik");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // The quote link opens the wholesale form on the home page with the product chosen.
    await quote.click();
    await expect(page.getByRole("textbox", { name: "Adınız veya firma adı" })).toBeFocused();
    await expect(page.locator("#toptan")).toContainText("1 ürün, 1 adet");
    expect(new URL(page.url()).pathname).toBe("/");
    expect(new URL(page.url()).searchParams.has("teklif")).toBe(false);
    await expect(page.locator('#toptan-bayilik [role="radio"][aria-checked="true"]')).toHaveText("Toptan Satış");
    // The legacy home query is answered in place, and the retired page address carries its query along.
    await page.goto("/?teklif=sample-olive-oil-1l#toptan", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/#toptan$/);
    await expect(page.getByRole("textbox", { name: "Adınız veya firma adı" })).toBeFocused();
    await expect(page.locator("#toptan")).toContainText("1 ürün, 1 adet");
    const old = await request.get("/toptan-satis?teklif=sample-olive-oil-1l", { maxRedirects: 0 });
    expect(old.status()).toBe(308);
    expect(old.headers().location).toBe("/?teklif=sample-olive-oil-1l&sekme=toptan#toptan-bayilik");
  });
});

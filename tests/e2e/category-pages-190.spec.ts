import { expect, test, type BrowserContext } from "@playwright/test";
import { getGroupTrail } from "@/lib/catalog/groups";

const groups = [
  { id: "zeytin", name: "Zeytin", products: ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg"] },
  { id: "siyah-zeytin", name: "Siyah Zeytin", products: ["sample-black-olive-1kg"] },
  { id: "yesil-zeytin", name: "Yeşil Zeytin", products: ["sample-brined-green-olive-5kg"] },
  { id: "kirma-zeytin", name: "Kırma Zeytin", products: ["sample-green-olive-10kg", "sample-green-olive-1kg"] },
  { id: "zeytinyagi", name: "Zeytinyağı", products: ["sample-olive-oil-1l", "sample-olive-oil-5l"] },
];

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

  for (const group of groups) test(`${group.id}: static response, exact products and complete category breadcrumb`, async ({ page }) => {
    const response = await page.goto(`/urunler/${group.id}`, { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: group.name, exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*follow/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://afinazeytin.com/urunler/${group.id}`);
    await expect(page).toHaveTitle(`${group.name} | AFİNA ZEYTİN`);
    const ids = await page.locator("article[data-product-id]").evaluateAll(cards => cards.map(card => card.getAttribute("data-product-id")));
    expect(ids).toEqual(group.products);
    const breadcrumb = page.getByRole("navigation", { name: "İçerik yolu" });
    await expect(breadcrumb.getByRole("link", { name: "Ana Sayfa", exact: true })).toHaveAttribute("href", "/");
    await expect(breadcrumb.getByRole("link", { name: "Ürünler", exact: true })).toHaveAttribute("href", "/urunler");
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(group.name);
    const schema = await page.locator('main script[type="application/ld+json"]').evaluate(script => JSON.parse(script.textContent ?? "{}"));
    expect(schema).toMatchObject({ "@type": "BreadcrumbList", itemListElement: [
      { position: 1, name: "Ana Sayfa", item: "https://afinazeytin.com/" },
      { position: 2, name: "Ürünler", item: "https://afinazeytin.com/urunler" },
      ...getGroupTrail(group.id).map((item, index) => ({ position: index + 3, name: item.name, item: `https://afinazeytin.com/urunler/${item.id}` })),
    ] });
    for (const id of group.products) await expect(page.locator(`article[data-product-id="${id}"]`).getByRole("link", { name: /^Teklife ekle:/ })).toHaveAttribute("href", `/toptan-satis?teklif=${id}`);
  });

  test("unknown groups are 404 and unapproved category prices stay outside the sitemap", async ({ request }) => {
    const missing = await request.get("/urunler/olmayan");
    expect(missing.status()).toBe(404);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const group of groups) expect(xml).not.toContain(`/urunler/${group.id}`);
  });

  for (const width of [360, 390, 768, 1024, 1440]) test(`${width}: category navigation, touch targets and normal document flow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/urunler", { waitUntil: "load" });
    const navigation = page.getByRole("navigation", { name: "Ürün grupları", exact: true });
    const labels = ["Tüm ürünler", ...groups.map(group => group.name)];
    for (const label of labels) {
      const link = navigation.getByRole("link", { name: label, exact: true });
      const box = await link.boundingBox();
      expect(box?.height, `${label} touch target`).toBeGreaterThanOrEqual(44);
    }
    await expect(navigation.locator('[aria-current="page"]')).toHaveText("Tüm ürünler");
    for (const group of groups) {
      await navigation.getByRole("link", { name: group.name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/urunler/${group.id}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(group.name);
      await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(navigation.locator('[aria-current="page"]')).toHaveText(group.name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const bounds = await page.locator("article[data-product-id]").first().boundingBox();
      const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
      const navBounds = await navigation.boundingBox();
      expect(navBounds!.y).toBeGreaterThan(heading!.y);
      if (width >= 1024) expect(navBounds!.x + navBounds!.width).toBeLessThanOrEqual(bounds!.x + 1);
      else expect(navBounds!.y + navBounds!.height).toBeLessThanOrEqual(bounds!.y + 1);
    }
  });

  test("home photos open category pages and the existing detail and quote handoff still work", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const groupSection = page.locator("[data-home-categories]");
    await expect(groupSection.locator('a[href="/urunler/zeytinyagi"]')).toBeVisible();
    await expect(groupSection.locator('a[href="/urunler/zeytin"]')).toBeVisible();
    await groupSection.locator('a[href="/urunler/zeytinyagi"]').click();
    await expect(page).toHaveURL(/\/urunler\/zeytinyagi$/);
    const product = page.locator('article[data-product-id="sample-olive-oil-1l"]');
    await expect(product.getByRole("link", { name: /^Teklife ekle:/ })).toHaveAttribute("href", "/toptan-satis?teklif=sample-olive-oil-1l");
    await product.getByRole("link", { name: /detayını aç/ }).click();
    await expect(page).toHaveURL(/\/urun\/naturel-sizma-zeytinyagi\?boy=1(?:%20|\+)L$/);
    const detail = page.locator("[data-product-page]");
    await expect(detail.getByRole("heading", { name: "Natürel Sızma Zeytinyağı", exact: true })).toBeVisible();
    await expect(detail.getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
    await expect(detail.getByRole("link", { name: "Toptan teklif al" })).toHaveAttribute("href", "/toptan-satis?teklif=sample-olive-oil-1l");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // The legacy query redirects to the dedicated quote page.
    await page.goto("/?teklif=sample-olive-oil-1l#toptan", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/toptan-satis#toptan$/);
    await expect(page.getByRole("textbox", { name: "Adınız veya firma adı" })).toBeFocused();
    await expect(page.locator("#toptan")).toContainText("1 ürün · 1 adet");
  });
});

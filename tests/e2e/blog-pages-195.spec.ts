import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const posts = [
  { slug: "salamura-zeytin-nasil-hazirlanir", title: "Salamura Zeytin Nasıl Hazırlanır?" },
  { slug: "kirma-zeytin-nedir-nasil-saklanir", title: "Kırma Zeytin Nedir, Nasıl Saklanır?" },
  { slug: "naturel-sizma-zeytinyagi-nasil-saklanmali", title: "Natürel Sızma Zeytinyağı Nasıl Saklanmalı?" },
  { slug: "sofralik-zeytin-secerken-nelere-dikkat-edilmeli", title: "Sofralık Zeytin Seçerken Nelere Dikkat Edilmeli?" },
];
async function measure(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const metrics = { cls: 0 };
    Object.assign(window, { task195Metrics: metrics });
    new PerformanceObserver(list => { for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (!entry.hadRecentInput) metrics.cls += entry.value;
    } }).observe({ type: "layout-shift", buffered: true });
  });
}
async function layout(page: Page): Promise<{ cls: number; overflow: number }> {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => ({ cls: (window as unknown as { task195Metrics: { cls: number } }).task195Metrics.cls,
    overflow: document.documentElement.scrollWidth - innerWidth }));
  expect(metrics.cls).toBeLessThan(.05);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect((await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze()).violations).toEqual([]);
  return metrics;
}
async function capture(page: Page, path: string): Promise<void> {
  // Full-page captures must include the real off-screen photographs too.
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
  });
  expect(await page.evaluate(() => [...document.images].filter(image => !image.naturalWidth).map(image => image.currentSrc || image.src))).toEqual([]);
  await page.screenshot({ path, fullPage: true });
}

test.describe("Task195 blog pages", () => {
  test.beforeEach(async ({ browserName, context, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged Chromium matrix.");
    const origin = new URL(baseURL ?? "http://localhost:3004");
    expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  });

  // Task208: the list page is the #blog section of the home page; /blog redirects there.
  test("staticpages: blog list and all four articles respond 200 with canonical editorial metadata", async ({ page, request }) => {
    const moved = await request.get("/blog", { maxRedirects: 0 });
    expect(moved.status()).toBe(308);
    expect(moved.headers().location).toBe("/#blog");
    expect((await page.goto("/blog", { waitUntil: "load" }))?.status()).toBe(200);
    await expect(page).toHaveURL(/\/#blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("#blog").getByRole("heading", { level: 2, name: "Zeytin Defteri", exact: true })).toBeVisible();
    await expect(page.locator('#blog a[href^="/blog/"]')).toHaveCount(3);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/afinazeytin\.com\/?$/);
    for (const post of posts) {
      expect((await page.goto(`/blog/${post.slug}`, { waitUntil: "load" }))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://afinazeytin.com/blog/${post.slug}`);
      const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent ?? "{}")));
      const article = schemas.find(schema => schema["@type"] === "BlogPosting");
      expect(article).toMatchObject({ headline: post.title, author: { name: "AFİNA ZEYTİN" }, datePublished: expect.stringMatching(/^2026-11-10/) });
      expect(JSON.stringify(schemas)).toContain('"@type":"BreadcrumbList"');
      expect(JSON.stringify(schemas)).not.toMatch(/"@type":"(?:Product|Offer)"/);
      const breadcrumb = page.getByRole("navigation", { name: "İçerik yolu", exact: true });
      await expect(breadcrumb.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/#blog");
      expect(JSON.stringify(schemas)).toContain('"item":"https://afinazeytin.com/#blog"');
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(post.title);
      const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes[0]?.getAttribute("content") ?? "");
      expect(robots).not.toContain("noindex");
    }
    expect((await request.get("/blog/olmayan-yazi")).status()).toBe(404);
  });

  for (const width of [390, 768, 1440]) test(`${width}: list and four articles have readable content, stable images and no overflow`, async ({ page }) => {
    await mkdir("output/task195", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    const report = [];
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    // Task208: the list is the home page's #blog section (three cards); the fourth article is reached from the others.
    expect((await page.goto("/#blog", { waitUntil: "load" }))?.status()).toBe(200);
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await expect(page.locator("#blog > div")).toHaveCSS("opacity", "1");
    report.push({ path: "/#blog", ...(await layout(page)) });
    for (const post of posts.slice(0, 3)) await expect(page.locator(`#blog a[href="/blog/${post.slug}"]`)).toBeVisible();
    await expect(page.locator('#blog a[href^="/blog/"]')).toHaveCount(3);
    await capture(page, `output/task195/list-${width}.png`);
    for (const post of posts) {
      expect((await page.goto(`/blog/${post.slug}`, { waitUntil: "load" }))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
      const metrics = await layout(page);
      for (const other of posts.filter(item => item.slug !== post.slug)) await expect(page.locator(`main a[href="/blog/${other.slug}"]`).first()).toBeAttached();
      const body = page.locator("[data-blog-content]");
      await expect(body).toHaveCount(1);
      const text = await body.textContent() ?? "";
      const words = text.trim().split(/\s+/u).length;
      expect(words).toBeGreaterThanOrEqual(400);
      expect(words).toBeLessThanOrEqual(700);
      expect(text).not.toMatch(/tedavi|iyileştirir|kanser|kolesterol|%|Ayvalık|Köklü/iu);
      const typography = await body.evaluate(element => {
        const css = getComputedStyle(element);
        return { width: element.getBoundingClientRect().width, fontSize: parseFloat(css.fontSize), maxWidth: css.maxWidth };
      });
      expect(typography.fontSize).toBeGreaterThanOrEqual(16);
      expect(typography.width).toBeLessThanOrEqual(typography.fontSize * 45);
      report.push({ path: `/blog/${post.slug}`, words, ...metrics, typography });
      await capture(page, `output/task195/${post.slug}-${width}.png`);
    }
    expect(errors).toEqual([]);
    await writeFile(`output/task195/layout-${width}.json`, JSON.stringify({ report, errors }, null, 2));
  });

  for (const width of [390, 1440]) test(`${width}: home preview opens a real article, category and related product`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const preview = page.locator('[data-home-section="blog"]');
    const links = preview.locator('a[href^="/blog/"]');
    await expect(links).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect(links.nth(i)).toHaveAttribute("href", `/blog/${posts[i].slug}`);
    await links.first().click();
    await expect(page).toHaveURL(`/blog/${posts[0].slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(posts[0].title);
    const category = page.locator('main a[href^="/urunler/"]').first();
    const categoryPath = await category.getAttribute("href");
    await expect(category).toBeVisible();
    await category.click();
    await expect(page).toHaveURL(categoryPath!);
    await expect(page.locator("article[data-product-id]").first()).toBeVisible();
    await page.goto(`/blog/${posts[0].slug}`, { waitUntil: "load" });
    const products = page.locator("article[data-product-id]");
    expect(await products.count()).toBeGreaterThanOrEqual(2);
    expect(await products.count()).toBeLessThanOrEqual(3);
    await products.first().locator('a[href^="/urun/"]').first().click();
    await expect(page.locator("[data-product-page]")).toBeVisible();
  });

  // Task208: the sitemap lists the home page and the four articles; the list page is gone.
  test("sitemap, llms and parseable Atom advertise the editorial pages without price pages", async ({ page, request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const llms = await (await request.get("/llms.txt")).text();
    const feedResponse = await request.get("/feed.xml");
    expect(feedResponse.status()).toBe(200);
    expect(feedResponse.headers()["content-type"]).toContain("application/atom+xml");
    const feed = await feedResponse.text();
    await page.goto("/", { waitUntil: "load" });
    const parsed = await page.evaluate(({ sitemap, feed }) => {
      const parser = new DOMParser(), map = parser.parseFromString(sitemap, "application/xml"), atom = parser.parseFromString(feed, "application/xml");
      return { errors: map.querySelectorAll("parsererror").length + atom.querySelectorAll("parsererror").length,
        urls: [...map.getElementsByTagName("loc")].map(element => element.textContent),
        entries: [...atom.getElementsByTagName("entry")].map(entry => ({ title: entry.getElementsByTagName("title")[0]?.textContent,
          href: entry.getElementsByTagName("link")[0]?.getAttribute("href") })) };
    }, { sitemap, feed });
    expect(parsed.errors).toBe(0);
    expect(parsed.urls).toHaveLength(5);
    expect(parsed.urls).toContain("https://afinazeytin.com/");
    expect(parsed.urls).not.toContain("https://afinazeytin.com/blog");
    expect(llms).toContain("https://afinazeytin.com/#blog");
    for (const post of posts) {
      const url = `https://afinazeytin.com/blog/${post.slug}`;
      expect(parsed.urls).toContain(url);
      expect(llms).toContain(url);
      expect(parsed.entries).toContainEqual({ title: post.title, href: url });
    }
    expect(sitemap).not.toMatch(/https:\/\/afinazeytin\.com\/urun(?:ler)?(?:\/|<)/);
  });
});

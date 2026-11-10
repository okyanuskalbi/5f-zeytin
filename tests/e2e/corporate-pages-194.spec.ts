import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const pages = [{ path: "/hakkimizda", title: "Hakkımızda" }, { path: "/toptan-satis", title: "Toptan Satış" }];
async function measure(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const metrics = { cls: 0 };
    Object.assign(window, { task194Metrics: metrics });
    new PerformanceObserver(list => { for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (!entry.hadRecentInput) metrics.cls += entry.value;
    } }).observe({ type: "layout-shift", buffered: true });
  });
}
async function assertLayout(page: Page): Promise<{ cls: number; overflow: number }> {
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => ({ cls: (window as unknown as { task194Metrics: { cls: number } }).task194Metrics.cls,
    overflow: document.documentElement.scrollWidth - innerWidth }));
  expect(result.cls).toBeLessThan(.05);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect((await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze()).violations).toEqual([]);
  return result;
}

test.describe("Task194 corporate pages", () => {
  test.beforeEach(async ({ browserName, context, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged Chromium matrix.");
    const origin = new URL(baseURL ?? "http://localhost:3004");
    expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  });

  test("staticpages: both new pages respond 200 with truthful headings and structured navigation", async ({ page }) => {
    for (const item of pages) {
      expect((await page.goto(item.path, { waitUntil: "load" }))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: item.title, exact: true })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://afinazeytin.com${item.path}`);
      const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes[0]?.getAttribute("content") ?? "");
      expect(robots ?? "").not.toContain("noindex");
      const navigation = page.getByRole("navigation", { name: "İçerik yolu", exact: true });
      await expect(navigation.getByRole("link", { name: "Ana Sayfa", exact: true })).toHaveAttribute("href", "/");
      await expect(navigation.locator('[aria-current="page"]')).toHaveText(item.title);
      const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent ?? "{}")));
      expect(JSON.stringify(schemas)).toContain('"@type":"BreadcrumbList"');
      if (item.path === "/hakkimizda") {
        await expect(page.locator('main img[src*="customer-home/fabrika"]').first()).toBeVisible();
        const faq = schemas.find(schema => schema["@type"] === "FAQPage");
        expect(faq?.mainEntity.length).toBeGreaterThan(0);
        for (const question of faq.mainEntity) {
          await expect(page.getByText(question.name, { exact: true })).toBeVisible();
          expect(await page.locator("#sik-sorulanlar").textContent()).toContain(question.acceptedAnswer.text);
        }
        await expect(page.locator("#iletisim")).toBeVisible();
        expect(await page.locator("main").textContent()).not.toMatch(/ödüllü|sertifikalı|500\.000|199\d|200\d yılında/);
      } else await expect(page.getByRole("form", { name: "Kurumsal teklif talebi", exact: true })).toBeVisible();
    }
  });

  for (const width of [390, 768, 1440]) for (const item of pages) test(`${width} ${item.path}: cold layout, contrast and screenshot`, async ({ page }) => {
    await mkdir("output/task194", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await measure(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    expect((await page.goto(item.path, { waitUntil: "load" }))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
    const result = await assertLayout(page);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `output/task194/${item.path.slice(1)}-${width}.png`, fullPage: true });
    await writeFile(`output/task194/${item.path.slice(1)}-${width}.json`, JSON.stringify({ ...result, errors }, null, 2));
  });

  for (const width of [390, 1440]) test(`${width}: product leads to preselected quote, validation and an unsent email draft`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const writes: string[] = [];
    page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) writes.push(`${request.method()} ${request.url()}`); });
    await page.goto("/urun/naturel-sizma-zeytinyagi?boy=5%20L", { waitUntil: "load" });
    await expect(page.locator('[data-product-page] input[value="sample-olive-oil-5l"]')).toBeChecked();
    await page.locator("[data-product-page]").getByRole("link", { name: "Toptan teklif al", exact: true }).click();
    await expect(page).toHaveURL(/\/toptan-satis(?:\?|#|$)/);
    const form = page.getByRole("form", { name: "Kurumsal teklif talebi", exact: true });
    const picker = form.getByRole("button", { name: "İlgilendiğiniz ürünler", exact: true });
    await expect(picker).toContainText("1 ürün");
    await picker.click();
    const dialog = page.getByRole("dialog", { name: "Ürünleri seçin", exact: true });
    await expect(dialog.getByRole("checkbox", { name: "Ürün · Natürel Sızma Zeytinyağı · 5 L", exact: true })).toBeChecked();
    await dialog.getByRole("button", { name: "Tamam", exact: true }).click();
    await form.getByRole("button", { name: "Talep özetini hazırla", exact: true }).click();
    await expect(form.getByRole("alert")).toContainText("Lütfen işaretli alanları kontrol edin.");
    await expect(form.getByRole("textbox", { name: "Adınız veya firma adı", exact: true })).toBeFocused();
    await form.getByRole("textbox", { name: "Adınız veya firma adı", exact: true }).fill("Yerel Kontrol İşletmesi");
    await form.getByRole("combobox", { name: "İşletme türü", exact: true }).selectOption("retail");
    await form.getByRole("combobox", { name: "Şehir", exact: true }).fill("Osmaniye");
    await page.getByRole("option", { name: "Osmaniye", exact: true }).click();
    await form.getByRole("combobox", { name: "İlçe", exact: true }).fill("Düziçi");
    await page.getByRole("option", { name: "Düziçi", exact: true }).click();
    await form.locator('input[name="phone"]').fill("5321234567");
    await form.getByRole("checkbox", { name: /KVKK aydınlatma metnini/ }).check();
    await form.getByRole("button", { name: "Talep özetini hazırla", exact: true }).click();
    const summary = page.getByRole("region", { name: "Talep özeti", exact: true });
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Natürel Sızma Zeytinyağı · 5 L");
    await expect(summary).toContainText("Bu sayfa e-posta göndermedi.");
    const draft = await summary.getByRole("link", { name: "E-postayla gönder", exact: true }).getAttribute("href");
    expect(draft).toMatch(/^mailto:/);
    expect(decodeURIComponent(draft!)).toContain("Natürel Sızma Zeytinyağı · 5 L");
    expect(writes).toEqual([]);
  });

  test("legacy query308 and hash navigation preserve destinations; sitemap and llms advertise only public information", async ({ page, request, baseURL }) => {
    const response = await request.get("/?teklif=sample-olive-oil-5l", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    const destination = new URL(response.headers().location, baseURL ?? "http://localhost:3004");
    expect(destination.pathname).toBe("/toptan-satis");
    expect(destination.searchParams.get("teklif")).toBe("sample-olive-oil-5l");
    for (const [hash, path] of [["toptan", "/toptan-satis"], ["teklif", "/toptan-satis"], ["hakkimizda", "/hakkimizda"], ["tesisimiz", "/hakkimizda"], ["iletisim", "/hakkimizda#iletisim"]]) {
      await page.goto(`/#${hash}`, { waitUntil: "load" });
      await expect.poll(() => new URL(page.url()).pathname + new URL(page.url()).hash).toBe(path);
    }
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("main form")).toHaveCount(0);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const llms = await (await request.get("/llms.txt")).text();
    for (const item of pages) { expect(sitemap).toContain(`https://afinazeytin.com${item.path}`); expect(llms).toContain(item.path); }
    expect(sitemap).not.toMatch(/https:\/\/afinazeytin\.com\/urun(?:ler)?(?:\/|<)/);
    expect(llms).not.toMatch(/https:\/\/afinazeytin\.com\/urun(?:ler)?(?:\/|\s)/);
  });
});

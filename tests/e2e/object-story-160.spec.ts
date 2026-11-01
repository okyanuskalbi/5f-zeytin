import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const hero = (page: Page) => page.locator("#baslangic");

test("business preparation remains reachable without claiming that requests can be sent", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const business = page.locator("#toptan-iletisim");
  await business.scrollIntoViewIfNeeded();
  await expect(business).toContainText(/kapalı/);
  const preparation = business.locator("details[data-enquiry-preparation]");
  await expect(preparation).not.toHaveAttribute("open");
  const toggle = preparation.locator("summary");
  await toggle.click();
  await expect(preparation).toHaveAttribute("open");
  const form = preparation.getByRole("form", { name: "Kurumsal teklif talebi" });
  await expect(form).toBeVisible();
  await expect(form.getByRole("button", { name: "Teklif talebini gönder" })).toBeDisabled();
  await toggle.focus();
  await toggle.press("Space");
  await expect(preparation).not.toHaveAttribute("open");
  await expect(toggle).toBeFocused();
});
test.beforeEach(async ({ page }) => {
  // Each browser context owns only its local test cart; no account/order writes.
  await page.addInitScript(key => localStorage.setItem(key, "[]"), CART_STORAGE_KEY);
});

test("the hero's selected 1 kg package opens its real detail and adds only that SKU", async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>(resolve => { releaseScripts = resolve; });
  await page.route("**/_next/static/**/*.js", async route => { await scriptsReady; await route.continue(); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const choice = hero(page).getByRole("button", { name: "Doğal Kırma Yeşil Zeytin, 1 kg seç", exact: true });
  await expect(choice).toBeDisabled();
  releaseScripts();
  await choice.click();
  await expect(choice).toBeFocused();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  const selected = hero(page).locator('[data-hero-product="sample-green-olive-1kg"]');
  await expect(selected).toContainText("Doğal Kırma Yeşil Zeytin");
  await expect(selected).toContainText("1 kg");
  await expect(selected).toContainText(/220/);
  const detailTrigger = selected.getByRole("button", { name: "Ürünü incele", exact: true });
  await detailTrigger.click();
  const detail = page.getByRole("dialog", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("radio", { name: "1 kg", exact: true })).toBeChecked();
  await expect(detail.getByLabel("Fiyat", { exact: true })).toContainText(/220/);
  await detail.getByRole("button", { name: "Kapat", exact: true }).click();
  await expect(detail).toHaveCount(0);
  await expect(detailTrigger).toBeFocused();
  await selected.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "[]"), CART_STORAGE_KEY))
    .toEqual([{ productId: "sample-green-olive-1kg", quantity: 1 }]);
  await hero(page).getByRole("button", { name: "Natürel Sızma Zeytinyağı, 1 L seç", exact: true }).click();
  const oil = hero(page).locator('[data-hero-product="sample-olive-oil-1l"]');
  await expect(oil.getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
  await expect(oil.getByRole("status")).toBeEmpty();
  await page.getByRole("banner").getByRole("button", { name: "Sepetim, 1 adet", exact: true }).click();
  const cart = page.getByRole("dialog", { name: "Sepetim (1)", exact: true });
  const line = cart.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await expect(line).toContainText("1 kg");
  await expect(line).not.toContainText("10 kg");
  await expect(line.getByLabel("Satır toplamı", { exact: true })).toContainText(/220/);
});

test("desktop scroll changes film and product planes independently and releases the document", async ({ page }) => {
  test.skip(page.viewportSize()!.width <= 900 || page.viewportSize()!.height <= 680, "Held composition is a desktop enhancement.");
  await page.goto("/", { waitUntil: "networkidle" });
  const scene = page.locator('[data-scene="afina-origin"][data-engine="motion"]');
  await expect(scene).toHaveClass(/\bis-live\b/);
  const sample = () => scene.evaluate(element => {
    const box = (selector: string) => {
      const node = element.querySelector<HTMLElement>(selector)!;
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, transform: getComputedStyle(node).transform };
    };
    return { progress: Number.parseFloat(getComputedStyle(element).getPropertyValue("--p") || "0"), film: box("[data-film-plane]"), product: box("[data-product-plane]"), copy: box("[data-copy-plane]") };
  });
  const start = await sample();
  const destination = await scene.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.top + scrollY + (box.height - innerHeight) * .7;
  });
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), destination);
  await expect.poll(async () => (await sample()).progress).toBeGreaterThan(start.progress + .2);
  const middle = await sample();
  expect(middle.film.width).toBeLessThan(start.film.width * .95);
  expect(middle.product.width).toBeGreaterThan(start.product.width * 1.02);
  expect(middle.film.transform).not.toBe(start.film.transform);
  expect(middle.product.transform).not.toBe(start.product.transform);
  await page.locator("#kurumsal").scrollIntoViewIfNeeded();
  await expect(page.locator("#kurumsal")).toBeInViewport();
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.getByRole("contentinfo")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("a compact phone opens with its slogan and primary shop action inside the first screen", async ({ page }) => {
  test.skip(page.viewportSize()!.width >= 768, "Separate compact phone composition.");
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('[data-scene="afina-origin"]')).toHaveClass(/\bis-rest\b/);
  await expect(hero(page).getByRole("heading", { level: 1 })).toBeInViewport({ ratio: 1 });
  await expect(hero(page).getByRole("link", { name: "Ürünleri Keşfet", exact: true })).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("reduced motion retains the object and real destinations without downloading the film", async ({ page }) => {
  const movies: string[] = [];
  page.on("request", request => { if (/\/videos\/afina-agac-dal\.mp4(?:\?|$)/.test(request.url())) movies.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('[data-scene="afina-origin"]')).toHaveClass(/\bis-rest\b/);
  await expect(hero(page).locator("[data-product-plane] img")).toBeVisible();
  await expect(hero(page).locator("video")).not.toHaveAttribute("src");
  await expect(hero(page).getByRole("heading", { level: 1 })).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(hero(page).locator('a[href="#toptan-iletisim"]').first()).toBeVisible();
  await hero(page).getByRole("link", { name: "Ürünleri Keşfet", exact: true }).click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.locator("#urunler")).toBeInViewport();
  expect(movies).toEqual([]);
});

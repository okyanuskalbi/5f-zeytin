import { expect, test, type Page } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const section = (page: Page) => page.getByRole("region", { name: "Ürünlerimiz", exact: true });
const row = (page: Page) => page.getByRole("region", { name: "Ürün listesi", exact: true });
const drawer = (page: Page) => page.getByRole("dialog", { name: /^Sepetim \(/ });
let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 });
    window.addEventListener("afina:product-card-settled", event => {
      if (event.target instanceof HTMLElement) event.target.dataset.testMotionSettled = "true";
    });
  });
  await page.goto("/");
  await section(page).evaluate((node) => node.scrollIntoView({ block: "start" }));
  await expect(section(page).getByRole("article")).toHaveCount((await getProducts()).length);
});
test.afterEach(() => { expect(errors).toEqual([]); });

test("every available product adds its SKU and quantity to the shared cart; sold out stays disabled", async ({ page, isMobile }) => {
  for (const product of await getProducts()) {
    const card = section(page).getByRole("article", { name: product.name, exact: true })
      .filter({ has: page.getByText(product.weight, { exact: true }) });
    const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
    if (product.stock <= 0) {
      await expect(card.getByText("Tükendi", { exact: true })).toBeVisible();
      for (const control of await card.locator("button, input").all()) await expect(control).toBeDisabled();
      continue;
    }
    const plus = card.getByRole("button", { name: "Adedi artır" });
    if (isMobile) await plus.tap(); else await plus.click();
    await expect(card.getByRole("spinbutton")).toHaveValue("2");
    if (isMobile) await add.tap(); else await add.click();
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).getByRole("group", { name: product.name, exact: true })
      .filter({ has: page.getByText(product.weight, { exact: true }) }).getByRole("status", { name: "Adet" })).toHaveText("2");
    await page.keyboard.press("Escape");
    await expect(add).toBeFocused();
  }
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
    .toEqual((await getProducts()).filter(p => p.stock > 0).map(p => ({ productId: p.id, quantity: 2 })));
});

test("v2 products retain uncut controls without paper slips or ornaments", async ({ page }) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(section(page).locator("[data-product-slip]")).toHaveCount(0);
  await expect(row(page)).not.toContainText("· · · · ·");
  for (const article of await section(page).getByRole("article").all()) {
    await expect(article).toHaveCSS("transform", "none");
    for (const control of await article.locator("button,input").all()) {
      const box = (await control.boundingBox())!;
      // Chromium may return 43.999938px for a computed 44px target at this scroll offset.
      expect(Math.round(box.width * 1000) / 1000).toBeGreaterThanOrEqual(44);
      expect(Math.round(box.height * 1000) / 1000).toBeGreaterThanOrEqual(44);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("keyboard focus reaches and purchases the last product", async ({ page }) => {
  const last = section(page).getByRole("article").last();
  await last.getByRole("button", { name: "Adedi artır" }).focus();
  await expect(last.getByRole("spinbutton")).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(last.getByRole("spinbutton")).toHaveValue("2");
});

test("reduced motion keeps products static, readable and purchasable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await section(page).evaluate((node) => node.scrollIntoView({ block: "start" }));
  for (const item of await row(page).locator("li").all()) await expect(item).toHaveCSS("transform", "none");
  for (const layer of await section(page).locator("[data-product-card-motion], [data-scene-reveal]").all()) {
    await expect(layer).toHaveCSS("transform", "none");
    await expect(layer).toHaveCSS("opacity", "1");
  }
  const add = section(page).getByRole("article").first().getByRole("button", { name: "Sepete ekle" });
  await add.focus();
  await expect(add).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(drawer(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(add).toBeFocused();
});

test("without JavaScript product details and cart link remain available", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    const loadedPosters: string[] = [];
    page.on("response", response => {
      const url = new URL(response.url());
      if (response.ok() && ((url.pathname === "/_next/image" && url.searchParams.get("url") === "/images/hero/zeytinlik-2400.webp") || /^\/images\/hero\/optimized\/(mobile|desktop)\.(avif|webp)$/.test(url.pathname))) loadedPosters.push(response.url());
    });
    await page.goto(baseURL!);
    await section(page).evaluate(node => node.scrollIntoView({ block: "start" }));
    await expect(section(page).getByRole("article")).toHaveCount((await getProducts()).length);
    // Firefox's no-JS realm cannot reliably poll an image JS property. Verify
    // the approved image response and rendered geometry independently instead.
    await expect.poll(() => loadedPosters.length).toBeGreaterThan(0);
    await expect(page.locator("[data-frame-sequence] img")).toBeVisible();
    for (const card of await section(page).getByRole("article").all()) {
      await expect(card.getByRole("heading")).toBeVisible();
      await expect(card.getByRole("button", { name: "Sepete ekle" })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Sepete git", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

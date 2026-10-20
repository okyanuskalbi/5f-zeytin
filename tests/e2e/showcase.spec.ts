import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const section = (page: Page) => page.getByRole("region", { name: "Ürünlerimiz", exact: true });
const row = (page: Page) => page.getByRole("region", { name: "Ürün fişleri", exact: true });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Sepetim", exact: true });
let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  await page.goto("/");
  await section(page).evaluate((node) => node.scrollIntoView({ block: "start" }));
  await expect(section(page).getByRole("article")).toHaveCount(3);
});
test.afterEach(() => { expect(errors).toEqual([]); });

test("every available slip adds its SKU and quantity to the shared cart; sold out stays disabled", async ({ page, isMobile }) => {
  for (const product of await getProducts()) {
    const card = section(page).getByRole("article", { name: product.name, exact: true });
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
    await expect(drawer(page).getByRole("group", { name: product.name, exact: true }).getByRole("status", { name: "Adet" })).toHaveText("2");
    await page.keyboard.press("Escape");
    await expect(add).toBeFocused();
  }
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([
    { productId: "sample-table-olive", quantity: 2 }, { productId: "sample-olive-oil", quantity: 2 },
  ]);
});

test("paper composition keeps every purchase control inside its uncut slip", async ({ page }, testInfo) => {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await section(page).evaluate((node) => {
    const box = node.getBoundingClientRect();
    const track = node.querySelector('[aria-label="Ürün fişleri"]')!;
    const trackBox = track.getBoundingClientRect();
    const slips = [...node.querySelectorAll<HTMLElement>("[data-product-slip]")].map((card) => {
      const rect = card.getBoundingClientRect();
      const title = card.querySelector("h3")!;
      return {
        width: card.offsetWidth, height: card.offsetHeight,
        bottom: rect.bottom - trackBox.top, top: rect.top - trackBox.top,
        lines: (title as HTMLElement).offsetHeight / parseFloat(getComputedStyle(title).lineHeight),
        minText: Math.min(...[...card.querySelectorAll("p,label,button,input")].map((el) => parseFloat(getComputedStyle(el).fontSize))),
        controls: [...card.querySelectorAll<HTMLElement>("button,input")].map((el) => {
          const control = el.getBoundingClientRect();
          return { width: el.offsetWidth, height: el.offsetHeight, inside: control.top >= rect.top && control.bottom <= rect.bottom };
        }),
      };
    });
    const stub = document.querySelector<HTMLElement>('[data-hero-stub][data-visible="true"]');
    const stubBox = stub?.getBoundingClientRect();
    const stubOverlapsSlip = !!stubBox && [...node.querySelectorAll("article")].some(card => {
      const b = card.getBoundingClientRect();
      return b.left < stubBox.right && b.right > stubBox.left && b.top < stubBox.bottom && b.bottom > stubBox.top;
    });
    return { width: box.width, height: box.height, viewport: innerWidth, viewportHeight: innerHeight, stubOverlapsSlip,
      rowHeight: trackBox.height, scrollWidth: track.scrollWidth, clientWidth: track.clientWidth,
      gap: getComputedStyle(node.querySelector("ul")!).gap, slips,
      documentFits: document.documentElement.scrollWidth <= innerWidth };
  });
  await mkdir("test-results/092", { recursive: true });
  await writeFile(`test-results/092/${testInfo.project.name}-geometry.json`, JSON.stringify(metrics, null, 2));
  await section(page).screenshot({ path: `test-results/092/${testInfo.project.name}-vitrin.png` });
  expect(metrics.width).toBe(metrics.viewport);
  expect(metrics.height).toBeGreaterThanOrEqual(metrics.viewportHeight * 0.96 - 1);
  expect(metrics.gap).toBe("12px");
  expect(metrics.documentFits).toBe(true);
  expect(metrics.stubOverlapsSlip).toBe(false);
  expect(new Set(metrics.slips.map(slip => slip.height)).size).toBeGreaterThan(1);
  for (const slip of metrics.slips) {
    expect(slip.minText).toBeGreaterThanOrEqual(14);
    expect(slip.lines).toBeLessThanOrEqual(2.1);
    expect(slip.top).toBeGreaterThanOrEqual(0);
    expect(slip.bottom).toBeLessThanOrEqual(metrics.rowHeight);
    for (const control of slip.controls) {
      expect(control.width).toBeGreaterThanOrEqual(44);
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.inside).toBe(true);
    }
  }
  if (metrics.viewport < 768) {
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    expect(Math.abs(metrics.slips[0].width - metrics.viewport * 0.72)).toBeLessThan(1);
    const next = await row(page).locator("li").nth(1).boundingBox();
    expect(next!.x).toBeLessThan(metrics.viewport);
    expect(next!.x).toBeGreaterThan(metrics.viewport * 0.65);
  }
});

test("native horizontal scrolling and keyboard focus reach the last slip", async ({ page }) => {
  if (page.viewportSize()!.width >= 768) return;
  await row(page).focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => row(page).evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  const last = section(page).getByRole("article").last();
  await last.getByRole("button", { name: "Adedi artır" }).focus();
  await expect(last.getByRole("spinbutton")).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(last.getByRole("spinbutton")).toHaveValue("2");
});

test("reduced motion keeps slips static, readable and purchasable", async ({ page }) => {
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

test("without JavaScript the poster, product details and cart link remain available", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(section(page).getByRole("article")).toHaveCount(3);
    await expect(section(page).locator("img")).toHaveJSProperty("complete", true);
    for (const card of await section(page).getByRole("article").all()) {
      await expect(card.getByRole("heading")).toBeVisible();
      await expect(card.getByRole("button", { name: "Sepete ekle" })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Sepete git", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

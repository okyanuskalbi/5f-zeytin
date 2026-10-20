import { expect, test, devices, type Page } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const stage = (page: Page) => page.locator("#one-cikan");
const drawer = (page: Page) => page.getByRole("dialog", { name: "Sepetim", exact: true });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
});

test("all sizes update weight and price and add their actual SKU and quantity to the shared cart", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#one-cikan");
  await expect(stage(page).getByRole("radio", { name: "10 kg", exact: true })).toBeChecked();
  const products = (await getProducts()).filter(p => p.name === "Doğal Kırma Yeşil Zeytin");
  for (const product of products) {
    await stage(page).getByRole("radio", { name: product.weight, exact: true }).check();
    await expect(stage(page).getByRole("status", { name: "Seçilen boy ve fiyat" })).toHaveText(
      `${product.weight} · ${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(product.priceKurus / 100)} ₺`);
    await expect(stage(page).getByRole("spinbutton")).toHaveValue("1");
    await stage(page).getByRole("button", { name: "Adedi artır" }).click();
    const add = stage(page).getByRole("button", { name: "Sepete ekle", exact: true });
    await add.click();
    await expect(drawer(page)).toBeVisible();
    const line = drawer(page).getByRole("group", { name: product.name, exact: true }).filter({ has: page.getByText(product.weight, { exact: true }) });
    await expect(line.getByRole("status", { name: "Adet" })).toHaveText("2");
    await page.keyboard.press("Escape");
    await expect(add).toBeFocused();
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
    .toEqual(products.map(p => ({ productId: p.id, quantity: 2 })));
  await page.getByRole("banner").getByRole("button", { name: "Sepetim, 6 adet" }).click();
  await drawer(page).getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  await expect(page.getByRole("group", { name: products[0].name, exact: true })).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("native scrolling keeps desktop image pinned, mobile image above content and controls uncut", async ({ page }, info) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const bounds = await stage(page).evaluate(node => ({ top: node.getBoundingClientRect().top + scrollY, height: node.getBoundingClientRect().height }));
  await page.evaluate(top => scrollTo(0, top + 100), bounds.top);
  const image = stage(page).locator("figure");
  const box = (await image.boundingBox())!;
  if (page.viewportSize()!.width >= 1024) {
    await expect(image).toHaveCSS("position", "sticky");
    expect(Math.abs(box.y)).toBeLessThan(2);
    expect(box.width).toBeCloseTo(page.viewportSize()!.width / 2, 0);
    expect(box.height).toBeCloseTo(page.viewportSize()!.height, 0);
    const before = await stage(page).locator("[data-featured-image]").evaluate(node => getComputedStyle(node).transform);
    await page.evaluate(({ top, height }) => scrollTo(0, top + height - innerHeight - 10), bounds);
    await expect.poll(() => stage(page).locator("[data-featured-image]").evaluate(node => getComputedStyle(node).transform)).not.toBe(before);
  } else {
    await expect(image).toHaveCSS("position", "relative");
    expect(box.height).toBeCloseTo(page.viewportSize()!.height * 0.7, 0);
    const heading = (await stage(page).getByRole("heading", { level: 2 }).boundingBox())!;
    expect(heading.y).toBeGreaterThanOrEqual(box.y + box.height);
    const add = (await stage(page).getByRole("button", { name: "Sepete ekle", exact: true }).boundingBox())!;
    expect(add.width).toBeCloseTo(page.viewportSize()!.width - 48, 0);
  }
  for (const control of await stage(page).locator("button, input, a").all()) {
    const rect = (await control.boundingBox())!;
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await stage(page).evaluate(node => node.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `test-results/103/${info.project.name}-stage.png` });
  await stage(page).screenshot({ path: `test-results/103/${info.project.name}-section.png` });
  await stage(page).getByRole("link", { name: "Toptan alım için teklif isteyin" }).click();
  await expect(page).toHaveURL(/#toptan$/);
  await expect(page.locator("#toptan")).toBeFocused();
  await expect(page.getByRole("form", { name: "Toptan talep formu" })).toBeVisible();
});

test("reduced motion and keyboard changes keep details and add-to-cart available", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#one-cikan");
  await expect(stage(page).locator("[data-featured-image]")).toHaveCSS("transform", "none");
  await stage(page).getByRole("radio", { name: "10 kg", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(stage(page).getByRole("radio", { name: "5 kg", exact: true })).toBeChecked();
  await page.keyboard.press("ArrowLeft");
  await expect(stage(page).getByRole("radio", { name: "1 kg", exact: true })).toBeChecked();
  const add = stage(page).getByRole("button", { name: "Sepete ekle", exact: true });
  await add.focus();
  await expect(add).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(drawer(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(add).toBeFocused();
  await page.screenshot({ path: `test-results/103/${info.project.name}-reduce.png` });
});

test("brand typography, contrast and visible focus survive interaction states", async ({ page }, info) => {
  await page.goto("/#one-cikan");
  await page.evaluate(() => document.fonts.ready);
  const measures = await stage(page).evaluate(node => {
    const title = node.querySelector("h2")!;
    const body = node.querySelector("p")!;
    const titleStyle = getComputedStyle(title), bodyStyle = getComputedStyle(body);
    return { headingFont: titleStyle.fontFamily, bodyFont: bodyStyle.fontFamily,
      headingLines: title.getBoundingClientRect().height / parseFloat(titleStyle.lineHeight),
      storyGap: getComputedStyle(title.parentElement!).gap };
  });
  expect(measures.headingFont).toContain("Fraunces");
  expect(measures.bodyFont).toContain("Figtree");
  expect(measures.headingLines).toBeLessThanOrEqual(2.05);
  expect(measures.storyGap).toBe("32px");
  const controls = [stage(page).getByRole("radio", { name: "1 kg", exact: true }),
    stage(page).getByRole("button", { name: "Sepete ekle", exact: true }),
    stage(page).getByRole("link", { name: "Toptan alım için teklif isteyin" })];
  for (let index = 0; index < controls.length; index++) {
    const control = controls[index];
    await page.keyboard.press("Tab");
    await control.focus();
    await expect(control).toBeFocused();
    const outline = await control.evaluate(node => {
      const painted = node.matches('input[type="radio"]') ? node.nextElementSibling! : node;
      return parseFloat(getComputedStyle(painted).outlineWidth);
    });
    expect(outline).toBeGreaterThanOrEqual(2);
    await control.hover();
    // Holding the primary pointer captures :active without triggering a purchase.
    await page.mouse.down();
    await page.screenshot({ path: `test-results/103/${info.project.name}-interaction-${index}.png` });
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
  const contrast = await stage(page).evaluate(node => {
    function luminance(color: string) {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(c => {
        const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    }
    function ratio(a: string, b: string) {
      const l = [luminance(a), luminance(b)].sort((a, b) => b - a); return (l[0] + 0.05) / (l[1] + 0.05);
    }
    const surface = getComputedStyle(node);
    const button = getComputedStyle(node.querySelector('button[type="submit"]')!);
    return { body: ratio(surface.color, surface.backgroundColor), button: ratio(button.color, button.backgroundColor) };
  });
  expect(contrast.body).toBeGreaterThanOrEqual(4.5);
  expect(contrast.button).toBeGreaterThanOrEqual(4.5);
  await info.attach("design-measures", { body: JSON.stringify({ ...measures, contrast }), contentType: "application/json" });
});

test("Pixel 7 touch layout and purchase", async ({ browser, baseURL, browserName }, info) => {
  test.skip(info.project.name !== "chromium-1440" || browserName !== "chromium", "One Pixel 7 capture per run.");
  const context = await browser.newContext({ ...devices["Pixel 7"], baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/#one-cikan");
    await stage(page).screenshot({ path: "test-results/103/Pixel-7-section.png" });
    await stage(page).getByRole("radio", { name: "1 kg", exact: true }).tap();
    await stage(page).getByRole("button", { name: "Sepete ekle", exact: true }).tap();
    await expect(drawer(page)).toBeVisible();
    await page.screenshot({ path: "test-results/103/Pixel-7-cart.png" });
  } finally { await context.close(); }
});

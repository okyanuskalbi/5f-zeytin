import { expect, test } from "@playwright/test";

const heroSelector = "[data-hero-label]";

test("label selects catalog products and sizes, then adds the selected SKU to the shared cart", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const hero = page.locator(heroSelector);
  const print = hero.getByTestId("hero-print");
  await expect(print.getByRole("heading")).toHaveText("Sofralık Zeytin");
  await expect(print).toContainText("500 G");
  await expect(print).toContainText("125,50 ₺");
  await hero.getByRole("radio", { name: "Zeytinyağı" }).click();
  await expect(print.getByRole("heading")).toHaveText("Zeytinyağı");
  await expect(print).toContainText("500 ML");
  await expect(print).toContainText("350,00 ₺");
  await expect(hero.getByRole("radiogroup", { name: "Boy" }).getByRole("radio", { name: "500 ml" })).toBeChecked();
  await hero.getByRole("button", { name: "Sepete ekle" }).click();
  const drawer = page.getByRole("dialog", { name: "Sepetim" });
  await expect(drawer.getByText("Zeytinyağı", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Sepetim, 1 adet" })).toBeVisible();
  await expect(hero.getByRole("button", { name: "Sepete ekle" })).toBeFocused();
  await hero.getByRole("radio", { name: "Salamura Zeytin" }).click();
  await expect(print).toContainText("1 KG");
  await expect(print).toContainText("220,00 ₺");
  await expect(hero.getByRole("button", { name: "Tükendi" })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("label keyboard selection, first-screen geometry, approved logo and grove remain accessible", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator(heroSelector);
  const group = hero.getByRole("radiogroup", { name: "Ürün" });
  await group.getByRole("radio", { name: "Sofralık Zeytin" }).focus();
  await page.keyboard.press("End");
  await expect(group.getByRole("radio", { name: "Zeytinyağı" })).toBeFocused();
  await expect(group.getByRole("radio", { name: "Zeytinyağı" })).toHaveCSS("outline-color", "rgb(36, 58, 41)");
  await expect(group.getByRole("radio", { name: "Zeytinyağı" })).toBeChecked();
  await page.keyboard.press("Home");
  await expect(group.getByRole("radio", { name: "Sofralık Zeytin" })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Salamura Zeytin" })).toBeChecked();
  const title = page.locator("#hero-title");
  expect(await title.evaluate((node) => node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight))).toBeLessThanOrEqual(2.01);
  const box = (await title.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(64);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(hero.getByRole("img", { name: "Afina Zeytin" })).toHaveAttribute("src", "/brand/afina-zeytin.svg");
  await expect(hero.locator("[data-frame-sequence] img")).toHaveAttribute("src", "/images/hero/zeytinlik-2400.webp");
  await expect(hero.locator("[data-frame-sequence] > div > div").first()).toHaveCSS("filter", "brightness(0.7)");
  await page.screenshot({ path: `test-results/091/${testInfo.project.name}-hero.png` });
});

test("without JavaScript the printed label and product/cart destinations remain usable", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expect(page.locator("#hero-title")).toBeVisible();
    await page.locator(heroSelector).getByRole("link", { name: "Tüm ürünler", exact: true }).click();
    await expect(page).toHaveURL(/#urunler$/);
    await expect(page.locator("#urunler").getByRole("article")).toHaveCount(3);
    await expect(page.locator("noscript").getByRole("link", { name: "Sepete git" })).toHaveAttribute("href", "/sepet");
  } finally { await context.close(); }
});

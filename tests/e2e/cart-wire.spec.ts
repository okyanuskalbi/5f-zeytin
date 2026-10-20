import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

let errors: string[] = [];
const card = (page: Page) => page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
const cartButton = (page: Page) => page.getByRole("banner").getByRole("button", { name: /^Sepetim/ });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Sepetim", exact: true });
const line = (page: Page) => page.getByRole("group", { name: "Sofralık Zeytin", exact: true });

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => { Object.assign(window, { cartWireDocument: true }); });
  // Report hydration errors as failures too, rather than accepting a recovered UI.
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
});
test.afterEach(() => { expect(errors).toEqual([]); });

test("product, badge, drawer and page share quantities across navigation and reload", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(cartButton(page)).toHaveAccessibleName("Sepetim, 0 adet");
  await expect(cartButton(page).locator('[data-slot="count-badge"]')).toHaveCount(0);
  await card(page).getByRole("spinbutton", { name: "Adet" }).fill("2");
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("2");
  await drawer(page).getByRole("button", { name: "Adedi artır" }).click();
  await drawer(page).getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  await expect(drawer(page)).toHaveCount(0);
  await expect(line(page).getByRole("status", { name: "Adet" })).toHaveText("3");
  await expect(cartButton(page)).toHaveAccessibleName("Sepetim, 3 adet");
  await expect(cartButton(page).locator('[data-slot="count-badge"]')).toHaveText("3");
  await line(page).getByRole("button", { name: "Adedi artır" }).click();
  await cartButton(page).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("4");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(line(page).getByRole("status", { name: "Adet" })).toHaveText("4");
  await cartButton(page).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("4");
  await drawer(page).getByRole("button", { name: "Sepetten sil" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Sepetiniz henüz boş.")).toBeVisible();
  await expect(cartButton(page)).toHaveAccessibleName("Sepetim, 0 adet");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("cart-wire-empty.png"), fullPage: true });
});

test("cumulative stock failure keeps the cart and quantity, then permits retry", async ({ page }) => {
  await page.goto("/");
  await card(page).getByRole("spinbutton").fill("12");
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("12");
  await page.keyboard.press("Escape");
  await card(page).getByRole("spinbutton").fill("1");
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(card(page).getByRole("alert")).toContainText("Ürün sepete eklenemedi");
  await expect(drawer(page)).toHaveCount(0);
  await expect(card(page).getByRole("spinbutton")).toHaveValue("1");
  await expect(cartButton(page)).toHaveAccessibleName("Sepetim, 12 adet");
  await expect(page.getByRole("article", { name: "Salamura Zeytin", exact: true }).getByRole("button", { name: "Sepete ekle" })).toBeDisabled();
  await cartButton(page).click();
  await drawer(page).getByRole("button", { name: "Adedi azalt" }).click();
  await page.keyboard.press("Escape");
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("12");
});

test("storage write failure keeps a single in-memory cart through client navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "afina-zeytin:cart") throw new DOMException("Test storage failure", "QuotaExceededError");
      write.call(this, key, value);
    };
  });
  await page.goto("/");
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(drawer(page).getByRole("alert")).toContainText("kaydedilemiyor");
  await page.evaluate(() => { Object.assign(window, { cartWireDocument: "same-document" }); });
  await drawer(page).getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(line(page).getByRole("status", { name: "Adet" })).toHaveText("1");
  expect(await page.evaluate(() => Reflect.get(window, "cartWireDocument"))).toBe("same-document");
  await line(page).getByRole("button", { name: "Adedi artır" }).click();
  await page.getByRole("link", { name: "Alışverişe devam et", exact: true }).click();
  await expect(cartButton(page)).toHaveAccessibleName("Sepetim, 2 adet");
  await cartButton(page).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("2");
});

test("corrupt and blocked storage recover without breaking global cart controls", async ({ page }) => {
  await page.addInitScript((key) => { localStorage.setItem(key, "broken-json"); }, CART_STORAGE_KEY);
  await page.goto("/");
  await cartButton(page).click();
  await expect(drawer(page).getByText("Sepetiniz henüz boş.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Test blocked", "SecurityError"); } });
  });
  await page.reload();
  await card(page).getByRole("button", { name: "Sepete ekle" }).click();
  await expect(drawer(page).getByRole("status", { name: "Adet" })).toHaveText("1");
  await expect(drawer(page).getByRole("alert")).toContainText("kaydedilemiyor");
});

test("keyboard and reduced motion preserve opener focus and modal isolation", async ({ page, browserName }, testInfo) => {
  const next = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const add = card(page).getByRole("button", { name: "Sepete ekle" });
    await expect(add).toBeEnabled();
    await add.focus();
    await page.keyboard.press("Enter");
    const close = drawer(page).getByRole("button", { name: "Sepeti kapat" });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(drawer(page).getByRole("button", { name: "Alışverişe devam et" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(add).toBeFocused();
    await cartButton(page).focus();
    await page.keyboard.press("Space");
    await expect(close).toBeFocused();
    await page.keyboard.press(next);
    expect(await drawer(page).evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(cartButton(page)).toBeFocused();
    expect(await cartButton(page).evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
    await expect(cartButton(page)).toHaveAttribute("aria-expanded", "false");
    if (reducedMotion === "reduce") expect(await cartButton(page).evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
    await page.screenshot({ path: testInfo.outputPath(`cart-wire-${reducedMotion}.png`), fullPage: true });
  }
});

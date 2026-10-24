import { expect, test, devices, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const drawer = (page: Page) => page.getByRole("dialog", { name: /^Sepetim \(/ });
const mini = (page: Page) => page.getByRole("complementary", { name: "Mini sepet" });
const headerCart = (page: Page) => page.getByRole("banner").getByRole("button", { name: /^Sepetim/ });
const storage = [{ productId: "sample-green-olive-1kg", quantity: 1 }];
let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text()); });
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
  test.info().annotations.push({ type: "scope", description: "Task 106 production cart" });
});
test.afterEach(() => { expect(errors).toEqual([]); });

async function load(page: Page) {
  await page.addInitScript(({ key, items }) => localStorage.setItem(key, JSON.stringify(items)), { key: CART_STORAGE_KEY, items: storage });
  await page.goto("/");
  await expect(headerCart(page)).toContainText("1");
}

test("v4 drawer: totals after quantity/remove, modal focus, escape and scroll lock at every width", async ({ page }, info) => {
  await load(page);
  await headerCart(page).click();
  const panel = drawer(page);
  const close = panel.getByRole("button", { name: "Sepeti kapat" });
  await expect(close).toBeFocused();
  if (process.env.NEXT_PUBLIC_DEMO === "1") await expect(panel.getByRole("link", { name: "Ödemeye geç" })).toHaveAttribute("href", "/odeme");
  else await expect(panel.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
  await expect(page.locator("body")).toHaveAttribute("data-scroll-locked");
  const line = panel.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await line.getByRole("button", { name: "Adedi artır" }).click();
  await expect(line.getByRole("status", { name: "Adet" })).toHaveText("2");
  await expect(panel.getByLabel("Ara toplam", { exact: true }).filter({ hasText: "440,00 ₺" })).toBeVisible();
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(panel.getByRole("link", { name: "Sepeti görüntüle" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await expect.poll(async () => Math.round((await panel.boundingBox())!.width)).toBe(page.viewportSize()!.width < 768 ? page.viewportSize()!.width : 440);
  await mkdir("test-results/106", { recursive: true });
  await page.screenshot({ path: `test-results/106/${info.project.name}-drawer.png` });
  await line.getByRole("button", { name: "Sepetten sil" }).click();
  await expect(panel.getByRole("listitem")).toHaveCount(0);
  await expect(panel.getByLabel("Ara toplam", { exact: true }).filter({ hasText: "0,00 ₺" })).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(headerCart(page)).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  await page.goto("/sepet");
  await page.screenshot({ path: `test-results/106/${info.project.name}-empty.png`, fullPage: true });
});

test("mini cart: first add, responsive/footer/route visibility and focus return; reduced motion", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(mini(page)).toHaveCount(0);
  const card = page.locator('[data-product-id="sample-green-olive-1kg"]');
  const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
  await add.click();
  await expect(card.getByRole("status")).toContainText("sepete eklendi");
  await expect(drawer(page)).toHaveCount(0);
  if (page.viewportSize()!.width >= 768) { await expect(mini(page)).toHaveCount(0); return; }
  await page.goto("/siparis-takip");
  await expect(mini(page)).toBeVisible();
  await expect(mini(page)).toContainText("1 adet");
  await expect(mini(page)).toContainText("220,00");
  await page.screenshot({ path: `test-results/106/${info.project.name}-mini.png` });
  await mini(page).getByRole("button", { name: "Sepet", exact: true }).click();
  await expect(drawer(page)).toHaveCSS("transform", "none");
  await expect(mini(page)).not.toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mini(page).getByRole("button", { name: "Sepet", exact: true })).toBeFocused();
  await page.getByRole("contentinfo").evaluate(node => node.scrollIntoView({ block: "start" }));
  await expect(mini(page)).toHaveCount(0);
  await page.screenshot({ path: `test-results/106/${info.project.name}-footer.png` });
  await page.evaluate(() => scrollTo(0, 0));
  await expect(mini(page)).toBeVisible();
  await page.goto("/sepet");
  await expect(mini(page)).toHaveCount(0);
  await page.screenshot({ path: `test-results/106/${info.project.name}-page.png`, fullPage: true });
});

test("mobile drawer: full viewport and accessible close button", async ({ page }) => {
  test.skip(page.viewportSize()!.width >= 768);
  await load(page);
  await headerCart(page).click();
  const panel = drawer(page);
  await expect.poll(async () => Math.round((await panel.boundingBox())!.height)).toBe(page.viewportSize()!.height);
  await expect(panel.getByRole("button", { name: "Sepeti genişlet" })).toHaveCount(0);
  await panel.getByRole("button", { name: "Sepeti kapat" }).click();
  await expect(panel).toHaveCount(0);
  await expect(headerCart(page)).toBeFocused();
});

test("Pixel 7: full screen drawer, touch controls and mini cart safe area", async ({ browser, browserName, baseURL }, info) => {
  test.skip(info.project.name !== "chromium-1440" || browserName !== "chromium");
  const context = await browser.newContext({ ...devices["Pixel 7"], baseURL });
  try {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page);
    await page.goto("/siparis-takip");
    await expect(mini(page)).toBeVisible();
    await mini(page).getByRole("button", { name: "Sepet", exact: true }).tap();
    await expect(drawer(page)).toHaveCSS("transform", "none");
    await expect(mini(page)).not.toBeVisible();
    const line = drawer(page).getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
    await line.getByRole("button", { name: "Adedi artır" }).tap();
    await expect(line.getByLabel("Adet", { exact: true })).toHaveText("2");
    await drawer(page).getByRole("button", { name: "Sepeti kapat" }).tap();
    await expect(drawer(page)).toHaveCount(0);
    await expect(mini(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/106/pixel7-mini.png" });
    await mini(page).getByRole("button", { name: "Sepet", exact: true }).tap();
    await page.screenshot({ path: "test-results/106/pixel7-drawer.png" });
  } finally { await context.close(); }
});

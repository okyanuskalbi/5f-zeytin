import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 }));
});

test("100: the v2 intro keeps a direct product destination without a pinned label", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-label], [data-hero-stub]")).toHaveCount(0);
  await page.locator("[data-hero-intro]").getByRole("link", { name: "Ürünleri keşfet", exact: true }).click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.locator("#urunler")).toBeFocused();
});

test("097: the process strip is typographic until distinct process imagery is approved", async ({ page }) => {
  await page.goto("/#topraktan-sofraya");
  const section = page.locator("#topraktan-sofraya");
  await expect(section.locator("img")).toHaveCount(0);
  await expect(section.locator("li h3")).toHaveText(["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"]);
  expect(await section.locator("li h3").first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(28);
});

test("114: wholesale uses the facility edge and hides the unavailable form", async ({ page }) => {
  await page.goto("/#toptan-iletisim");
  const card = page.locator("#toptan-iletisim");
  const geometry = await card.evaluate(node => ({ left: node.getBoundingClientRect().left, viewport: innerWidth }));
  expect(geometry.left).toBeLessThan(geometry.viewport * 0.2);
  await expect(card).toContainText("Toptan alım için bize yazın");
  await expect(card).toContainText("İletişim bilgileri yakında");
  await expect(card.locator("form, input, textarea, button, a")).toHaveCount(0);
});

test("100: the persistent cart preserves focus while the footer enters", async ({ page }) => {
  await page.goto("/");
  const cart = page.getByRole("banner").getByRole("button", { name: "Sepetim, 0 adet" });
  await cart.focus();
  await page.locator("footer").evaluate(node => node.scrollIntoView({ block: "start" }));
  await expect(page.locator("[data-hero-stub]")).toHaveCount(0);
  await expect(cart).toBeFocused();
  await expect(cart).toBeInViewport();
  await page.getByRole("contentinfo").getByRole("link", { name: "KVKK", exact: true }).click();
  await expect(page).toHaveURL(/\/kvkk$/);
});

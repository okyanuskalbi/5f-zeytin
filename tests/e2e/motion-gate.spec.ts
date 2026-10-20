import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 }));
});

test("097: the pinned label hands over to products within one screen of collapsing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-label]")).toHaveAttribute("data-enhanced", "true");
  const distance = await page.evaluate(() => {
    const hero = document.querySelector("[data-hero-label]")!.getBoundingClientRect();
    const products = document.querySelector("#urunler")!.getBoundingClientRect();
    return (products.top - hero.top) / innerHeight - 0.7;
  });
  expect(distance).toBeLessThanOrEqual(1);
});

test("097: the process strip is typographic until distinct process imagery is approved", async ({ page }) => {
  await page.goto("/#topraktan-sofraya");
  const section = page.locator("#topraktan-sofraya");
  await expect(section.locator("img")).toHaveCount(0);
  await expect(section.locator("li h3")).toHaveText(["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"]);
  expect(await section.locator("li h3").first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(28);
});

test("097: wholesale uses the left edge and fills its field with the confirmed product scope", async ({ page }) => {
  await page.goto("/#toptan-iletisim");
  const card = page.locator("[data-wholesale-card]");
  const geometry = await card.evaluate(node => ({ left: node.getBoundingClientRect().left, viewport: innerWidth }));
  expect(geometry.left).toBeLessThan(geometry.viewport * 0.2);
  await expect(page.locator("[data-wholesale-scope]")).toContainText("Sofralık zeytin");
});

test("097: a keyboard-focused stub yields to the header cart when the footer enters", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => scrollTo(0, innerHeight * 0.8));
  const stub = page.locator("[data-hero-stub]");
  await expect(stub).toBeVisible();
  await stub.getByRole("link").focus();
  await page.locator("footer").evaluate(node => node.scrollIntoView({ block: "start" }));
  await expect(stub).toBeHidden();
  await expect(page.getByRole("banner").getByRole("button", { name: "Sepetim, 0 adet" })).toBeFocused();
  const legal = page.getByRole("contentinfo").getByRole("link", { name: "KVKK", exact: true });
  await legal.hover();
  await legal.click();
  await expect(page).toHaveURL(/\/kvkk$/);
});

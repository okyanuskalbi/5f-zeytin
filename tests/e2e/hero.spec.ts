import { expect, test } from "@playwright/test";

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`v4: headline and purchase card fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 667 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator("[data-hero-intro]");
    const title = hero.getByRole("heading", { level: 1 });
    await expect(title).toHaveText("Düziçi'nden sofranıza.");
    expect(await title.evaluate(node => node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight))).toBeLessThanOrEqual(2.01);
    const heading = (await title.boundingBox())!;
    const card = (await hero.locator("[data-hero-card]").boundingBox())!;
    const section = (await hero.boundingBox())!;
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(width);
    expect(card.y + card.height).toBeLessThanOrEqual(section.y + section.height);
    if (width <= 900) {
      expect(card.y - (heading.y + heading.height)).toBeGreaterThanOrEqual(24);
      expect(section.y + section.height - card.y - card.height).toBeCloseTo(22, 0);
      await expect(hero.getByRole("link", { name: "Ürünleri gör" })).toBeHidden();
    }
    await expect(hero.getByRole("button", { name: "Sepete ekle", exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("v4: keyboard selection moves between both size pills", async ({ page }) => {
  await page.goto("/");
  const sizes = page.locator("[data-hero-card]").getByRole("radiogroup", { name: "Boy" });
  const large = sizes.getByRole("radio", { name: "10 kg teneke" });
  const small = sizes.getByRole("radio", { name: "1 kg", exact: true });
  await large.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(small).toBeFocused();
  await expect(small).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(large).toBeChecked();
});

test("v4: without JavaScript the poster, title, price and native anchors remain", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.locator("[data-hero-photo] img")).toBeVisible();
    await expect(page.getByLabel("Seçili boyun fiyatı")).toHaveText("₺2.200");
    await expect(page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle", exact: true })).toBeDisabled();
    await page.locator("[data-hero-intro]").getByRole("link", { name: "Ürünleri gör" }).click();
    await expect(page).toHaveURL(/#urunler$/);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Sepetim", exact: true })).toHaveAttribute("href", "/sepet");
  } finally { await context.close(); }
});

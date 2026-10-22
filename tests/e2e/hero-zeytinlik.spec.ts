import { devices, expect, test } from "@playwright/test";

// The old grove frame sequence was replaced by the approved v4 table still.
for (const name of ["iPhone SE", "iPhone 14", "Pixel 7"] as const) {
  test(`v4: ${name} card stays below the heading and inside the hero`, async ({ browser, baseURL }, info) => {
    const target = name === "Pixel 7" ? "chromium-1440" : "webkit-iphone14";
    test.skip(info.project.name !== target, `Claude capture in ${target}.`);
    const context = await browser.newContext({ ...devices[name], baseURL, reducedMotion: "reduce" });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator("[data-hero-intro]");
      const title = (await hero.locator("h1").boundingBox())!;
      const card = (await hero.locator("[data-hero-card]").boundingBox())!;
      const bounds = (await hero.boundingBox())!;
      expect(card.y - title.y - title.height).toBeGreaterThanOrEqual(24);
      expect(card.y + card.height).toBeLessThanOrEqual(bounds.y + bounds.height - 21);
      await expect(hero.locator("[data-hero-photo] img")).toBeVisible();
      await page.screenshot({ path: info.outputPath(`${name}-hero-v4.png`), animations: "disabled" });
      await hero.getByRole("button", { name: "Sepete ekle", exact: true }).click();
      await expect(page.locator("[data-mini-cart]")).toBeHidden();
      await expect(hero.getByRole("button", { name: "Eklendi", exact: true })).toBeInViewport();
      await page.locator("#urunler").scrollIntoViewIfNeeded();
      await expect(page.locator("[data-mini-cart]")).toBeVisible();
    } finally { await context.close(); }
  });
}

test("v4: unavailable hero photo preserves the dark background, heading and purchase controls", async ({ page }) => {
  await page.route("**/images/v3/hero-*", route => route.fulfill({ status: 404 }));
  await page.goto("/");
  await expect(page.locator("[data-hero-intro]")).toHaveCSS("background-color", "rgb(14, 21, 16)");
  await expect(page.locator("#hero-title")).toBeVisible();
  await page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(page.locator("[data-hero-card]").getByRole("status")).toHaveText("10 kg sepete eklendi.");
});

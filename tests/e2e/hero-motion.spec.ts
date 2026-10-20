import { expect, test } from "@playwright/test";

test("scroll adapts the persistent cart bar and reverses without the v1 label or stub", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-tone", "dark");
  await page.locator("[data-hero-intro]").getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute("data-tone", "light");
  await expect(header.getByRole("button", { name: "Sepetim, 1 adet" })).toBeInViewport();
  await expect(page.locator("[data-hero-card], [data-hero-stub]")).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(header).toHaveAttribute("data-tone", "dark");
});

test("empty cart and restored badge update through the existing header drawer", async ({ page }) => {
  await page.goto("/");
  await page.locator("#urunler").getByRole("article").first().getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  const cart = page.getByRole("banner").getByRole("button", { name: "Sepetim, 1 adet" });
  await expect(cart.locator('[data-slot="count-badge"]')).toHaveText("1");
  await cart.click();
  await page.getByRole("dialog", { name: "Sepetim" }).getByRole("button", { name: "Sepetten sil" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Sepetim, 0 adet" }).locator('[data-slot="count-badge"]')).toHaveCount(0);
});

test("reduced motion requests no frames and keeps the badge and purchase controls static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", request => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  await hero.getByRole("radio", { name: "Zeytinyağı" }).click();
  await hero.getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-slot="count-badge"]')).toHaveCSS("transform", "none");
  await expect(page.locator("[data-frame-sequence] canvas")).toHaveCount(0);
  expect(frames).toEqual([]);
});

test("live preference changes and media failure preserve the intro and its controls", async ({ page }) => {
  await page.route("**/frames/hero-zeytin/manifest.json", route => route.fulfill({ status: 500 }));
  await page.goto("/");
  await expect(page.locator("[data-frame-sequence]")).toHaveAttribute("data-status", "error");
  await expect(page.locator("#hero-title")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("[data-hero-intro]").getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-slot="count-badge"]')).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-hero-card], [data-hero-stub]")).toHaveCount(0);
});

test("restored mixed cart uses catalog prices through the persistent bar across sections", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("afina-zeytin:cart", JSON.stringify([
    { productId: "sample-table-olive", quantity: 1, priceKurus: 1 },
    { productId: "sample-olive-oil", quantity: 2 },
  ])));
  await page.goto("/");
  for (const selector of ["#urunler", "#sik-sorulanlar", "footer"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    const cart = page.getByRole("banner").getByRole("button", { name: "Sepetim, 3 adet" });
    await expect(cart).toBeInViewport();
    await cart.click();
    const drawer = page.getByRole("dialog", { name: "Sepetim" });
    await expect(drawer).toContainText("825,50 ₺");
    await drawer.getByRole("button", { name: "Sepeti kapat", exact: true }).click();
    await expect(cart).toBeFocused();
  }
});

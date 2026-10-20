import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 }));
});

test("scroll shrinks the label into an accurate persistent cart stub and reverses", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.locator("[data-hero-label]");
  const stub = page.getByRole("complementary", { name: "Etiket koçanı" });
  await expect(hero).toHaveAttribute("data-enhanced", "true");
  await expect(stub).toBeHidden();
  await hero.getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await page.evaluate(() => scrollTo(0, innerHeight * 0.4));
  await expect.poll(async () => {
    const scale = await hero.locator("[data-hero-card]").evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).a);
    return scale > 0.15 && scale < 1;
  }).toBe(true);
  await page.evaluate(() => scrollTo(0, innerHeight * 1.1));
  await expect(stub).toBeVisible();
  await expect(stub).toContainText("1 adet");
  await expect(stub).toContainText("125,50 ₺");
  expect((await stub.boundingBox())!.width).toBe(120);
  expect((await stub.boundingBox())!.x).toBeGreaterThanOrEqual(16);
  expect((await stub.boundingBox())!.y + (await stub.boundingBox())!.height).toBeLessThanOrEqual(page.viewportSize()!.height - 16);
  await page.screenshot({ path: `test-results/091/${testInfo.project.name}-stub.png` });
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  await expect(stub).toBeInViewport();
  await stub.getByRole("link", { name: "Sepete git" }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  await expect(page.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("status", { name: "Adet" })).toHaveText("1");
  await page.goto("/");
  await expect(hero.locator("[data-hero-card]")).toBeVisible();
  await expect(stub).toBeHidden();
});

test("empty stub leads to products and updates from the existing header drawer", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => scrollTo(0, innerHeight * 1.1));
  const stub = page.getByRole("complementary", { name: "Etiket koçanı" });
  await expect(stub.getByRole("link", { name: "Ürünlere göz at" })).toBeVisible();
  await stub.getByRole("link").click();
  await expect(page).toHaveURL(/#urunler$/);
  await page.getByRole("article", { name: "Sofralık Zeytin", exact: true }).getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  await expect(stub).toContainText("125,50 ₺");
  await page.getByRole("button", { name: "Sepetim, 1 adet" }).click();
  await page.getByRole("dialog", { name: "Sepetim" }).getByRole("button", { name: "Sepetten sil" }).click();
  await page.keyboard.press("Escape");
  await expect(stub.getByRole("link", { name: "Ürünlere göz at" })).toBeVisible();
});

test("reduced motion is static, requests no frames, keeps controls and header cart accessible", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", (request) => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.goto("/");
  const hero = page.locator("[data-hero-label]");
  await expect(hero).toHaveAttribute("data-static", "true");
  await hero.getByRole("radio", { name: "Zeytinyağı" }).click();
  await hero.getByRole("button", { name: "Sepete ekle" }).click();
  await page.keyboard.press("Escape");
  expect(await hero.locator("[data-hero-card]").evaluate((node) => getComputedStyle(node).transform)).toBe("none");
  await page.evaluate(() => scrollTo(0, innerHeight));
  await expect(page.locator("[data-hero-stub]")).toBeHidden();
  await expect(page.getByRole("button", { name: "Sepetim, 1 adet" })).toBeInViewport();
  expect(frames).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `test-results/091/${testInfo.project.name}-reduced.png` });
});

test("live preference changes and media failure preserve the printed label", async ({ page }) => {
  await page.route("**/frames/hero-zeytin/manifest.json", (route) => route.fulfill({ status: 500 }));
  await page.goto("/");
  await expect(page.locator("[data-frame-sequence]")).toHaveAttribute("data-status", "error");
  await expect(page.locator("#hero-title")).toBeVisible();
  await page.evaluate(() => scrollTo(0, innerHeight));
  await expect(page.locator("[data-hero-stub]")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-hero-stub]")).toBeHidden();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator("[data-hero-card]")).toBeVisible();
  await expect(page.locator("[data-hero-card]")).toHaveCSS("transform", "none");
});

test("restored mixed cart uses catalog prices and the stub clears large text while scrolling", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("afina-zeytin:cart", JSON.stringify([
    { productId: "sample-table-olive", quantity: 1, priceKurus: 1 },
    { productId: "sample-olive-oil", quantity: 2 },
  ])));
  await page.goto("/");
  const stub = page.locator("[data-hero-stub]");
  for (const screen of [1, 2, 3, 4]) {
    await page.evaluate((screen) => scrollTo(0, innerHeight * screen), screen);
    await expect(stub).toBeVisible();
    await expect(stub).toContainText("3 adet");
    await expect(stub).toContainText("825,50 ₺");
    await expect.poll(() => page.evaluate(() => {
      const stub = document.querySelector("[data-hero-stub]")!.getBoundingClientRect();
      const headings = [...document.querySelectorAll("h1,h2,h3")].filter((node) => !node.closest("[data-hero-label]"));
      return headings.every((node) => {
        const range = document.createRange(); range.selectNodeContents(node);
        return [...range.getClientRects()].every((box) => box.right <= stub.left || box.left >= stub.right || box.bottom <= stub.top || box.top >= stub.bottom);
      });
    })).toBe(true);
  }
});

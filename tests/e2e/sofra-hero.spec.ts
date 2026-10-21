import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

test("hero adds the 10 kg variant, updates the badge and confirms without opening the drawer", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  const add = hero.getByRole("button", { name: /Sepete ekle/ });
  await expect(add).toContainText("10 kg");
  await expect(add).toContainText("₺2.200,00");
  await add.click();
  await expect(hero.getByRole("status")).toContainText("10 kg sepete eklendi");
  await expect(page.getByRole("button", { name: "Sepetim, 1 adet", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "sample-green-olive-10kg", quantity: 1 }]);
  await page.getByRole("button", { name: "Sepetim, 1 adet", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toBeVisible();
});

test("both hero actions are keyboard reachable and browse reaches the pantry", async ({ page, browserName }) => {
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await page.goto("/");
  const add = page.locator("[data-hero-intro]").getByRole("button", { name: /Sepete ekle/ });
  for (let index = 0; index < 25 && !(await add.evaluate(node => node === document.activeElement)); index++) await page.keyboard.press(nextControl);
  await expect(add).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-hero-intro]").getByRole("status")).toContainText("sepete eklendi");
  await page.keyboard.press(nextControl);
  await expect(page.getByRole("link", { name: "Ürünleri gör", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#kiler$/);
  await expect(page.getByRole("heading", { name: "Kışlık kiler", exact: true })).toBeInViewport();
});

test("reduced motion keeps the complete first screen and photo still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  await expect(hero.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(hero.getByRole("button", { name: /Sepete ekle/ })).toBeInViewport();
  expect(await hero.locator("[data-hero-word]").evaluateAll(nodes => nodes.map(node => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform })))).toEqual([{ opacity: "1", transform: "none" }, { opacity: "1", transform: "none" }]);
  await page.evaluate(() => scrollTo(0, innerHeight * 0.4));
  expect(await hero.locator("[data-hero-photo]").evaluate(node => getComputedStyle(node).transform)).toBe("none");
});

test("headline stays readable in the first animation frame before hydration", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const words = page.locator("[data-hero-word]");
    const firstFrames = await words.evaluateAll(nodes => nodes.map(node => {
      for (const animation of node.getAnimations()) { animation.pause(); animation.currentTime = 0; }
      return Number(getComputedStyle(node).opacity);
    }));
    expect(firstFrames).toHaveLength(2);
    expect(firstFrames.every(opacity => opacity >= 0.5)).toBe(true);
    await expect(page.locator("[data-hero-photo] img")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ürünleri gör", exact: true })).toHaveAttribute("href", "#kiler");
  } finally { await context.close(); }
});

test("hero art direction preloads only its matching AVIF and loads no frame sequence", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/rel="preload"[^>]+as="image"[^>]+type="image\/avif"[^>]+media="\(max-width: 767px\)"/);
  const images: string[] = [];
  page.on("request", request => { if (/\/images\/v3\/hero-|\/frames\//.test(request.url())) images.push(request.url()); });
  await page.goto("/");
  const photo = page.locator("[data-hero-photo] img");
  await expect.poll(() => photo.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  const current = await photo.evaluate((node: HTMLImageElement) => node.currentSrc);
  expect(current).toContain(page.viewportSize()!.width < 768 ? "hero-mobil" : "hero-masaustu");
  expect(current).toMatch(/\.avif$/);
  expect(images).toHaveLength(1);
});

test("navbar is transparent above the hero and switches once to pantry green", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("[data-site-navbar]");
  await expect(nav).toHaveAttribute("data-tone", "hero");
  expect(await nav.evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect((await nav.boundingBox())!.height).toBeLessThanOrEqual(page.viewportSize()!.width >= 1024 ? 72 : 60);
  await page.locator("[data-hero-intro]").evaluate(node => scrollTo(0, node.clientHeight));
  await expect(nav).toHaveAttribute("data-tone", "pantry");
  await expect.poll(() => nav.evaluate(node => getComputedStyle(node).backgroundColor)).toBe("rgb(36, 58, 41)");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(nav).toHaveAttribute("data-tone", "hero");
});

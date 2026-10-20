import { expect, test, type Locator, type Page } from "@playwright/test";

const actions = [
  ["Ürünlerimizi Keşfedin", "#urunler"],
  ["Toptan Satış İçin İletişime Geçin", "#toptan-iletisim"],
] as const;

function hero(page: Page): Locator {
  return page.getByRole("region", { name: "Afina Zeytin", exact: true });
}

async function translateY(element: Locator): Promise<number> {
  return element.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42);
}

async function expectUsable(page: Page): Promise<void> {
  await expect(hero(page).getByText("Kökü toprakta. Yeri sofrada.", { exact: true })).toBeVisible();
  await expect(hero(page).getByText("Toprağın sunduğu lezzet, Afina’nın özeniyle.", { exact: true })).toBeVisible();
  for (const [name, hash] of actions) {
    const action = hero(page).getByRole("link", { name, exact: true });
    await expect(action).toHaveAttribute("href", hash);
    await action.click();
    expect(new URL(page.url()).hash).toBe(hash);
    await expect(page.locator(hash)).toBeFocused();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  // Keep the normal-motion scenario independent of the test machine's CPU count.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 });
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test("hero plays a bounded entrance once and a small scroll parallax without moving its actions", async ({ page, baseURL }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  await page.addInitScript(() => {
    const samples: number[] = [];
    Object.assign(window, { heroEntranceSamples: samples });
    const started = performance.now();
    function sample(): void {
      const entrance = document.querySelector('[data-hero-motion="entrance"]');
      if (entrance) samples.push(new DOMMatrixReadOnly(getComputedStyle(entrance).transform).m42);
      if (performance.now() - started < 5000) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  expect((await page.goto("/"))?.status()).toBe(200);
  const entrance = hero(page).locator('[data-hero-motion="entrance"]');
  const parallax = hero(page).locator('[data-hero-motion="parallax"]');
  await expect(entrance).toHaveCount(1);
  await expect(parallax).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => {
    const { heroEntranceSamples } = window as unknown as { heroEntranceSamples: number[] };
    return heroEntranceSamples.some((y) => y > 0.1 && y <= 16);
  })).toBe(true);
  await expect.poll(() => translateY(entrance)).toBeCloseTo(0, 2);

  const action = hero(page).getByRole("link", { name: actions[0][0], exact: true });
  const actionTop = (await action.boundingBox())!.y;
  const initialY = await translateY(parallax);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect.poll(async () => Math.abs(await translateY(parallax) - initialY)).toBeGreaterThan(0.5);
  expect(await translateY(parallax)).toBeGreaterThanOrEqual(-16);
  expect(await translateY(parallax)).toBeLessThanOrEqual(0);
  const scrollOffset = await page.evaluate(() => scrollY);
  expect((await action.boundingBox())!.y + scrollOffset).toBeCloseTo(actionTop, 0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => translateY(parallax)).toBeCloseTo(initialY, 1);
  expect(await translateY(entrance)).toBeCloseTo(0, 2);
  await expectUsable(page);
  expect(errors).toEqual([]);
  await page.goto("/");
  await expect.poll(() => translateY(entrance)).toBeCloseTo(0, 2);
  await page.screenshot({ path: testInfo.outputPath("hero-motion.png"), fullPage: true });
});

test("reduced motion keeps the hero static and keyboard destinations accessible", async ({ page, browserName }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(nextControl);
  await expect(page.getByRole("link", { name: "Ana içeriğe geç" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ana-icerik")).toBeFocused();
  for (const [name, hash] of actions) {
    await page.keyboard.press(nextControl);
    const action = hero(page).getByRole("link", { name, exact: true });
    await expect(action).toBeFocused();
    expect(await action.evaluate((node) => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect(await action.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe("0s");
    if (hash === actions[1][1]) await page.keyboard.press("Shift+Tab");
  }
  for (const [name, hash] of actions) {
    await hero(page).getByRole("link", { name, exact: true }).focus();
    await page.keyboard.press("Enter");
    expect(new URL(page.url()).hash).toBe(hash);
    await expect(page.locator(hash)).toBeFocused();
  }
  for (const effect of ["entrance", "parallax"]) {
    expect(await translateY(hero(page).locator(`[data-hero-motion="${effect}"]`))).toBe(0);
  }
  expect(await hero(page).evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("hero-reduced-motion.png"), fullPage: true });
});

test("changing the motion preference immediately stops and resets parallax", async ({ page }) => {
  await page.goto("/");
  const parallax = hero(page).locator('[data-hero-motion="parallax"]');
  await expect.poll(async () => Math.abs(await translateY(parallax))).toBeGreaterThan(0.1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => translateY(parallax)).toBe(0);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  expect(await translateY(parallax)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => Math.abs(await translateY(parallax))).toBeGreaterThan(0.1);
  await expectUsable(page);
});

test("a low-end device keeps nonessential hero motion static and scroll unlocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 4 });
  });
  await page.goto("/");
  await page.mouse.wheel(0, 240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  for (const effect of ["entrance", "parallax"]) {
    expect(await translateY(hero(page).locator(`[data-hero-motion="${effect}"]`))).toBe(0);
  }
  await expectUsable(page);
});

test("failed JavaScript and logo requests leave server-rendered hero links usable", async ({ page }) => {
  const failedScripts: string[] = [];
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") {
      failedScripts.push(route.request().url());
      await route.abort();
    } else if (route.request().url().includes("/brand/afina-")) {
      await route.abort();
    } else {
      await route.continue();
    }
  });
  await page.goto("/");
  expect(failedScripts.length).toBeGreaterThan(0);
  await expectUsable(page);
  for (const effect of ["entrance", "parallax"]) {
    const layer = hero(page).locator(`[data-hero-motion="${effect}"]`);
    expect(await translateY(layer)).toBe(0);
    expect(await layer.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  }
});

test("hero remains static and navigable when JavaScript is disabled", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expectUsable(page);
    for (const effect of ["entrance", "parallax"]) {
      expect(await translateY(hero(page).locator(`[data-hero-motion="${effect}"]`))).toBe(0);
    }
  } finally {
    await context.close();
  }
});

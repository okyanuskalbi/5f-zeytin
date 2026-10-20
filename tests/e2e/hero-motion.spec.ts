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

test("hero plays a bounded entrance once alongside the approved scroll sequence", async ({ page, baseURL }, testInfo) => {
  // Exercise active frames above the short-viewport poster fallback threshold.
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
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
  await expect(entrance).toHaveCount(1);
  await expect(hero(page).locator("canvas")).toHaveAttribute("data-frame", "0");
  await expect.poll(() => page.evaluate(() => {
    const { heroEntranceSamples } = window as unknown as { heroEntranceSamples: number[] };
    return heroEntranceSamples.some((y) => y > 0.1 && y <= 16);
  })).toBe(true);
  await expect.poll(() => translateY(entrance)).toBeCloseTo(0, 2);

  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    await page.evaluate(() => scrollBy(0, 240));
  } else {
    await page.mouse.wheel(0, 240);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
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
  for (const effect of ["entrance"]) {
    expect(await translateY(hero(page).locator(`[data-hero-motion="${effect}"]`))).toBe(0);
  }
  expect(await hero(page).evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("hero-reduced-motion.png"), fullPage: true });
});

test("changing the motion preference replaces video frames with the static poster", async ({ page }) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
  await page.goto("/");
  await expect(hero(page).locator("canvas")).toHaveAttribute("data-frame", "0");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero(page).locator("canvas")).toHaveCount(0);
  await expect(hero(page).locator("[data-frame-sequence] img")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero(page).locator("canvas")).toBeVisible();
  await expectUsable(page);
});

test("a low-end device keeps nonessential hero motion static and scroll unlocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 4 });
  });
  await page.goto("/");
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    await page.evaluate(() => scrollBy(0, 240));
  } else {
    await page.mouse.wheel(0, 240);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  for (const effect of ["entrance"]) {
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
  for (const effect of ["entrance"]) {
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
    for (const effect of ["entrance"]) {
      expect(await translateY(hero(page).locator(`[data-hero-motion="${effect}"]`))).toBe(0);
    }
  } finally {
    await context.close();
  }
});

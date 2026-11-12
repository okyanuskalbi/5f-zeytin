import { expect, test, type BrowserContext, type Page } from "@playwright/test";

type Sample = { text: string; opacity: number; x: number; y: number; scale: number; width: number; height: number; running: number };
type Recording = { done: boolean; samples: Record<string, Sample[]> };

async function localOnly(context: BrowserContext, baseURL?: string) {
  const origin = new URL(baseURL ?? "http://localhost:3004");
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return [origin.hostname, "localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? route.continue() : route.abort();
  });
}

/** Record the actual transient and settled styles, rather than inferring motion from source. */
async function record(page: Page, selectors: Record<string, string>, duration = 1500) {
  await page.evaluate(({ selectors, duration }) => {
    const result = { done: false, samples: Object.fromEntries(Object.keys(selectors).map(key => [key, []])) } as Recording;
    (window as unknown as { task191Recording: Recording }).task191Recording = result;
    const until = performance.now() + duration;
    const frame = () => {
      for (const [key, selector] of Object.entries(selectors)) {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) continue;
        const css = getComputedStyle(element);
        const matrix = new DOMMatrixReadOnly(css.transform);
        result.samples[key].push({ text: element.textContent ?? "", opacity: Number(css.opacity), x: matrix.m41, y: matrix.m42,
          scale: matrix.a, width: element.offsetWidth, height: element.offsetHeight,
          running: element.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length });
      }
      if (performance.now() < until) requestAnimationFrame(frame);
      else result.done = true;
    };
    requestAnimationFrame(frame);
  }, { selectors, duration });
}
async function recorded(page: Page): Promise<Record<string, Sample[]>> {
  await page.waitForFunction(() => (window as unknown as { task191Recording?: Recording }).task191Recording?.done);
  return page.evaluate(() => (window as unknown as { task191Recording: Recording }).task191Recording.samples);
}

// Task208: the catalogue is the home page's #urunler section; its category pills answer after hydration
// (the cart pill is enabled by the same hydration).
const GRID = "#urunler [data-product-grid]";
const CARD = "#urunler [data-product-grid] article[data-product-id]";
async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true })).toBeVisible();
  await expect(page.locator("[data-cart-pill]")).toBeEnabled();
}

test.describe("Task191 action-only motion", () => {
  test.beforeEach(async ({ context, browserName, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "Run this interaction matrix once with packaged Chromium.");
    await localOnly(context, baseURL);
  });

  // Task208: no page navigation and no sliding indicator any more. The chosen pill fills at once and the grid
  // answers with one short opacity pass: no travel, no scale, cards never hidden on their own.
  test("Task208: a category pill filters in place with one short opacity pass and no travel", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#urunler", { waitUntil: "load" });
    await ready(page);
    const pills = page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true });
    const persistent = await pills.elementHandle();
    await page.evaluate(() => { (window as unknown as { task208SameDocument: boolean }).task208SameDocument = true; });
    await record(page, { grid: GRID, card: CARD }, 350);
    const initial = await recorded(page);
    expect(initial.grid.length).toBeGreaterThan(0);
    expect(initial.grid.every(sample => sample.opacity === 1 && sample.y === 0 && sample.running === 0)).toBe(true);
    expect(initial.card.every(sample => sample.opacity === 1 && sample.y === 0)).toBe(true);

    await record(page, { grid: GRID, card: CARD });
    await pills.getByRole("radio", { name: "Siyah", exact: true }).click();
    await expect(page).toHaveURL(/\/\?kategori=siyah-zeytin#urunler$/);
    await expect(pills.getByRole("radio", { name: "Siyah", exact: true })).toHaveAttribute("aria-checked", "true");
    await expect(pills.getByRole("radio", { name: "Siyah", exact: true })).toHaveCSS("background-color", "rgb(36, 58, 41)");
    expect(await persistent!.evaluate(element => element === document.querySelector('#urunler [role="radiogroup"]'))).toBe(true);
    expect(await page.evaluate(() => (window as unknown as { task208SameDocument?: boolean }).task208SameDocument)).toBe(true);
    const samples = await recorded(page);
    await info.attach("category-motion-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    // The pass is visible (some frame between 0 and 1), touches opacity only, and is over well inside the recording.
    expect(samples.grid.some(sample => sample.opacity > 0 && sample.opacity < 1)).toBe(true);
    expect(samples.grid.every(sample => sample.x === 0 && sample.y === 0 && sample.scale === 1)).toBe(true);
    expect(samples.card.every(sample => sample.opacity === 1 && sample.y === 0 && sample.scale === 1)).toBe(true);
    expect(samples.grid.at(-1)).toMatchObject({ opacity: 1, y: 0, running: 0 });
    expect(samples.grid.slice(-10).every(sample => sample.opacity === 1 && sample.running === 0)).toBe(true);
    await expect(page.locator(CARD)).toHaveCount(1);
    await expect(page.locator(CARD)).toHaveAttribute("data-product-id", "sample-black-olive-1kg");
  });

  test("Task208: reduced motion category changes show the final products without any transient", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#urunler", { waitUntil: "load" });
    await ready(page);
    const pills = page.getByRole("radiogroup", { name: "Ürün kategorisi", exact: true });
    await record(page, { grid: GRID, card: CARD });
    await pills.getByRole("radio", { name: "Zeytinyağı", exact: true }).click();
    await expect(page).toHaveURL(/\/\?kategori=zeytinyagi#urunler$/);
    await expect(pills.getByRole("radio", { name: "Zeytinyağı", exact: true })).toHaveCSS("background-color", "rgb(36, 58, 41)");
    const samples = await recorded(page);
    await info.attach("reduced-category-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    expect(samples.grid.length).toBeGreaterThan(0);
    expect(samples.grid.every(sample => sample.opacity === 1 && sample.y === 0 && sample.running === 0)).toBe(true);
    expect(samples.card.every(sample => sample.opacity === 1 && sample.y === 0 && sample.running === 0)).toBe(true);
    await expect(page.locator(CARD)).toHaveCount(2);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  });

  test("stored cart hydration and later additions keep the badge stable without resizing the button", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("afina-zeytin:cart", JSON.stringify([{ productId: "sample-olive-oil-1l", quantity: 1 }]));
      const scales: number[] = [];
      (window as unknown as { task191HydrationScales: number[] }).task191HydrationScales = scales;
      const frame = () => {
        const badge = document.querySelector('button[aria-label^="Sepetim,"] span[aria-hidden="true"]');
        if (badge) scales.push(new DOMMatrixReadOnly(getComputedStyle(badge).transform).a);
        if (performance.now() < 3000) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
    // Task208: the product cards live in the home page's #urunler section.
    await page.goto("/#urunler", { waitUntil: "load" });
    const badge = page.locator('button[aria-label^="Sepetim,"] span[aria-hidden="true"]');
    await expect(badge).toHaveText("1");
    const hydration = await page.evaluate(() => (window as unknown as { task191HydrationScales: number[] }).task191HydrationScales);
    expect(hydration.length).toBeGreaterThan(0);
    expect(hydration.every(scale => scale === 1)).toBe(true);
    const card = page.locator('[data-product-id="sample-olive-oil-1l"]');
    const button = card.getByRole("button", { name: "Sepete ekle", exact: true });
    await expect(button).toBeEnabled();
    const dimensions = await button.evaluate(element => ({ width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight }));
    await record(page, { badge: 'button[aria-label^="Sepetim,"] span[aria-hidden="true"]', label: '[data-product-id="sample-olive-oil-1l"] [data-add-label]', button: '[data-product-id="sample-olive-oil-1l"] button[data-variant]' });
    await button.click();
    await expect(badge).toHaveText("2");
    await expect(card.locator("[data-add-label]")).toHaveText("Eklendi");
    const samples = await recorded(page);
    await info.attach("cart-feedback-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    expect(samples.badge.every(sample => sample.scale === 1)).toBe(true);
    expect(samples.badge.at(-1)!.scale).toBeCloseTo(1, 4);
    expect(samples.label.some(sample => sample.opacity > 0 && sample.opacity < 1)).toBe(true);
    expect(samples.button.every(sample => sample.width === dimensions.width && sample.height === dimensions.height)).toBe(true);
    expect(samples.label.at(-1)).toMatchObject({ text: "Eklendi", opacity: 1, scale: 1 });
  });

  test("FAQ remains keyboard controlled and reduced motion opens and closes immediately", async ({ page }) => {
    // Task208: the questions moved to the home page's last section.
    await page.goto("/#iletisim", { waitUntil: "load" });
    const faq = page.locator("#sik-sorulanlar details").first();
    const summary = faq.locator("summary");
    const answer = faq.locator("p");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("open", "");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(faq).not.toHaveAttribute("open", "");
    await expect(answer).toBeHidden();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.keyboard.press("Enter");
    await expect(answer).toBeVisible();
    expect(await faq.evaluate(element => getComputedStyle(element, "::details-content").transitionDuration)).toBe("0s");
    expect(await faq.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
    await page.keyboard.press("Enter");
    await expect(answer).toBeHidden();
    expect(await faq.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
  });
});

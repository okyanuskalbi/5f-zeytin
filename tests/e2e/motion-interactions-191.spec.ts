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

async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("navigation", { name: "Ürün grupları" })).toHaveAttribute("data-indicator-ready", "");
  await expect(page.locator("[data-category-indicator]")).toHaveCSS("opacity", "1");
}

test.describe("Task191 action-only motion", () => {
  test.beforeEach(async ({ context, browserName, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "Run this interaction matrix once with packaged Chromium.");
    await localOnly(context, baseURL);
  });

  test("a category click keeps navigation and moves its indicator and product entrance only after the action", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/urunler", { waitUntil: "networkidle" });
    await ready(page);
    const nav = page.getByRole("navigation", { name: "Ürün grupları" });
    const persistent = await nav.elementHandle();
    const indicator = page.locator("[data-category-indicator]");
    const before = await indicator.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41);
    await record(page, { grid: "[data-category-transition] [data-product-reveal]" }, 350);
    const initial = await recorded(page);
    expect(initial.grid.length).toBeGreaterThan(0);
    expect(initial.grid.every(sample => sample.opacity === 1 && sample.y === 0 && sample.running === 0)).toBe(true);

    await record(page, { indicator: "[data-category-indicator]", grid: "[data-category-transition] [data-product-reveal]" });
    await nav.getByRole("link", { name: "Siyah Zeytin", exact: true }).click();
    await expect(page).toHaveURL(/\/urunler\/siyah-zeytin$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Siyah Zeytin");
    expect(await persistent!.evaluate(element => element === document.querySelector('nav[aria-label="Ürün grupları"]'))).toBe(true);
    const samples = await recorded(page);
    await info.attach("category-motion-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    const last = samples.indicator.at(-1)!;
    expect(last.x).toBeGreaterThan(before);
    expect(samples.indicator.some(sample => sample.x > before + 1 && sample.x < last.x - 1)).toBe(true);
    expect(samples.grid.some(sample => sample.opacity > 0 && sample.opacity < 1)).toBe(true);
    expect(samples.grid.at(-1)).toMatchObject({ opacity: 1, y: 0, running: 0 });
    const markerBounds = await indicator.boundingBox();
    const activeBounds = await nav.getByRole("link", { name: "Siyah Zeytin", exact: true }).boundingBox();
    expect(markerBounds!.x).toBeCloseTo(activeBounds!.x, 0);
    expect(markerBounds!.width).toBeCloseTo(activeBounds!.width, 0);
  });

  test("reduced motion category changes show the final products without a transient entrance", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/urunler", { waitUntil: "networkidle" });
    await ready(page);
    await record(page, { grid: "[data-category-transition] [data-product-reveal]" });
    await page.getByRole("navigation", { name: "Ürün grupları" }).getByRole("link", { name: "Zeytinyağı", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Zeytinyağı");
    await expect(page.getByRole("navigation", { name: "Ürün grupları" }).getByRole("link", { name: "Zeytinyağı", exact: true })).toHaveCSS("background-color", "rgb(239, 229, 207)");
    const samples = await recorded(page);
    await info.attach("reduced-category-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    expect(samples.grid.length).toBeGreaterThan(0);
    expect(samples.grid.every(sample => sample.opacity === 1 && sample.y === 0 && sample.running === 0)).toBe(true);
    await expect(page.locator("article[data-product-id]")).toHaveCount(2);
  });

  test("stored cart hydration stays still and a later addition pops the badge without resizing the button", async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("afina-zeytin:cart", JSON.stringify([{ productId: "sample-olive-oil-1l", quantity: 1 }]));
      const scales: number[] = [];
      (window as unknown as { task191HydrationScales: number[] }).task191HydrationScales = scales;
      const frame = () => {
        const badge = document.querySelector('[data-slot="count-badge"]');
        if (badge) scales.push(new DOMMatrixReadOnly(getComputedStyle(badge).transform).a);
        if (performance.now() < 3000) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
    await page.goto("/urunler", { waitUntil: "networkidle" });
    const badge = page.locator('[data-slot="count-badge"]');
    await expect(badge).toHaveText("1");
    const hydration = await page.evaluate(() => (window as unknown as { task191HydrationScales: number[] }).task191HydrationScales);
    expect(hydration.length).toBeGreaterThan(0);
    expect(hydration.every(scale => scale === 1)).toBe(true);
    const card = page.locator('[data-product-id="sample-olive-oil-1l"]');
    const button = card.getByRole("button", { name: "Sepete ekle", exact: true });
    await expect(button).toBeEnabled();
    const dimensions = await button.evaluate(element => ({ width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight }));
    await record(page, { badge: '[data-slot="count-badge"]', label: '[data-product-id="sample-olive-oil-1l"] [data-add-label]', button: '[data-product-id="sample-olive-oil-1l"] button[data-variant]' });
    await button.click();
    await expect(badge).toHaveText("2");
    await expect(card.locator("[data-add-label]")).toHaveText("Eklendi ✓");
    const samples = await recorded(page);
    await info.attach("cart-feedback-samples", { body: JSON.stringify(samples), contentType: "application/json" });
    expect(samples.badge.some(sample => sample.scale > 1.05)).toBe(true);
    expect(samples.badge.at(-1)!.scale).toBeCloseTo(1, 4);
    expect(samples.label.some(sample => sample.opacity > 0 && sample.opacity < 1)).toBe(true);
    expect(samples.button.every(sample => sample.width === dimensions.width && sample.height === dimensions.height)).toBe(true);
    expect(samples.label.at(-1)).toMatchObject({ text: "Eklendi ✓", opacity: 1, scale: 1 });
  });

  test("FAQ remains keyboard controlled and reduced motion opens and closes immediately", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const faq = page.locator("details[data-faq]").first();
    const summary = faq.locator("summary");
    const answer = faq.locator("[data-faq-answer]");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("open", "");
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(faq).not.toHaveAttribute("open", "");
    await expect(summary).toHaveAttribute("aria-expanded", "false");
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

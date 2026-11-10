import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function localOnly(context: BrowserContext, baseURL?: string) {
  const origin = new URL(baseURL ?? "http://localhost:3004");
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return [origin.hostname, "localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? route.continue() : route.abort();
  });
}

async function settled(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForFunction(() => performance.now() >= 2000);
}

test.describe("Task191 light motion", () => {
  const pageErrors = new WeakMap<Page, string[]>();
  test.beforeEach(async ({ page, context, browserName, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "Run the motion matrix once with packaged Chromium.");
    await localOnly(context, baseURL);
    const errors: string[] = [];
    pageErrors.set(page, errors);
    page.on("pageerror", error => errors.push(error.message));
  });
  test.afterEach(({ page }) => { expect(pageErrors.get(page) ?? []).toEqual([]); });

  for (const width of [390, 1440]) for (const url of ["/", "/urunler", "/urunler/siyah-zeytin"]) {
    test(`${width} ${url}: opening produces zero layout shift`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        const samples: number[] = [];
        Object.assign(window, { task191Shifts: samples });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!shift.hadRecentInput) samples.push(shift.value);
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(url, { waitUntil: "load" });
      await settled(page);
      const shifts = await page.evaluate(() => (window as unknown as { task191Shifts: number[] }).task191Shifts);
      await info.attach("layout-shifts", { body: JSON.stringify(shifts), contentType: "application/json" });
      expect(shifts.reduce((sum, value) => sum + value, 0)).toBe(0);
    });
  }

  for (const width of [390, 1440]) for (const url of ["/", "/bayilik"]) {
    test(`${width} ${url}: reduced motion shows the final hero immediately`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(url, { waitUntil: "load" });
      const copy = page.locator("[data-hero-enter]");
      await expect(copy).toHaveCount(4);
      for (const element of await copy.all()) {
        await expect(element).toHaveCSS("opacity", "1");
        await expect(element).toHaveCSS("transform", "none");
        await expect(element).toHaveCSS("animation-name", "none");
      }
      if (url === "/") await expect(page.locator("[data-storefront-hero] picture img").first()).toHaveCSS("transform", "none");
      else {
        await expect(page.locator("[data-storefront-hero] picture img")).toHaveCount(0);
        await expect(page.locator("[data-storefront-hero]")).not.toHaveAttribute("data-surface", "dark");
      }
    });
  }

  for (const url of ["/", "/urunler", "/urunler/zeytinyagi", "/bayilik", "/sepet", "/hesabim"]) {
    test(`${url}: scrolling never animates or hides storefront content`, async ({ page }, info) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url, { waitUntil: "load" });
      await settled(page);
      await page.mouse.move(0, 0);
      await page.evaluate(async () => {
        for (const image of document.images) image.loading = "eager";
        await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
      });
      await page.locator("main *").evaluateAll(elements => {
        // Deferred video insertion or a genuine media fallback changes DOM
        // indexes. Follow each element itself while checking scroll styles.
        const baseline = new WeakMap(elements.map(element => {
          const style = getComputedStyle(element);
          return [element, { opacity: style.opacity, transform: style.transform }] as const;
        }));
        Object.assign(window, { task191ScrollBaseline: baseline });
      });
      const violations: unknown[] = [];
      const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      for (let y = 0; y <= bottom + 450; y += 450) {
        await page.evaluate(top => window.scrollTo({ top, behavior: "instant" }), Math.min(y, bottom));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const bad = await page.locator("main *").evaluateAll(elements => elements.flatMap(element => {
          const baseline = (window as unknown as { task191ScrollBaseline: WeakMap<Element, { opacity: string; transform: string }> }).task191ScrollBaseline;
          const initial = baseline.get(element);
          const style = getComputedStyle(element);
          if (!initial) baseline.set(element, { opacity: style.opacity, transform: style.transform });
          const box = element.getBoundingClientRect();
          const isMarquee = Boolean(element.closest("[data-home-marquee]"));
          const changed = !isMarquee && initial && (style.opacity !== initial.opacity || style.transform !== initial.transform);
          const visible = box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && style.display !== "none" && style.visibility !== "hidden";
          // Existing unavailable location pickers intentionally have a static
          // dimmed appearance. Still compare their styles at every scroll step;
          // do not turn the motion check into a change to Task189's colours.
          const content = !element.closest('[aria-hidden="true"], :disabled, [aria-disabled="true"]');
          return changed || (!isMarquee && visible && content && Number(style.opacity) !== 1)
            ? [{ tag: element.tagName, className: element.getAttribute("class"), changed, opacity: style.opacity, transform: style.transform }]
            : [];
        }));
        violations.push(...bad);
        expect(await page.locator("main").evaluateAll(roots => roots.flatMap(root => root.getAnimations({ subtree: true })).filter(animation => animation.playState === "running" && !(animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && animation.effect.target.closest("[data-home-marquee]"))).length)).toBe(0);
      }
      await info.attach("scroll-style-violations", { body: JSON.stringify(violations), contentType: "application/json" });
      expect(violations).toEqual([]);
    });
  }

  test("group photos zoom and arrows move only in response to hovering", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const link = page.locator('a[data-home-category="zeytinyagi"]');
    await link.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(link.locator("img")).toHaveCSS("transform", "none");
    await link.hover();
    await expect.poll(() => link.locator("img").evaluate(image => new DOMMatrixReadOnly(getComputedStyle(image).transform).a)).toBeGreaterThan(1);
    await expect.poll(() => link.locator("svg").evaluate(arrow => new DOMMatrixReadOnly(getComputedStyle(arrow).transform).m41)).toBeGreaterThan(0);
  });

  test("product cards lift on hover and keyboard focus, and remain still with reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/urunler", { waitUntil: "load" });
    const card = page.locator("article[data-product-id]").first();
    await card.hover();
    await expect.poll(() => card.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeLessThan(0);
    await page.mouse.move(0, 0);
    await card.getByRole("link", { name: /detayını aç/ }).focus();
    await expect.poll(() => card.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeLessThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(card).toHaveCSS("transform", "none");
    await expect(card.locator("img")).toHaveCSS("transform", "none");
  });
});

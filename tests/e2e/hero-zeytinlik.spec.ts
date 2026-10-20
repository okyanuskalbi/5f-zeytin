import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

const hero = (page: Page) => page.getByRole("region", { name: "Afina Zeytin", exact: true });
const sequence = (page: Page) => hero(page).locator("[data-frame-sequence]");
const actions = ["Ürünleri keşfet"];

test.use({ trace: "on" });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 });
  });
});

async function expectPosterAndActions(page: Page): Promise<void> {
  await page.evaluate(() => scrollTo(0, 0));
  await expect(hero(page).locator("#hero-title")).toBeVisible();
  const poster = sequence(page).locator("img");
  await expect(poster).toBeVisible();
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  for (const name of actions) {
    const link = hero(page).getByRole("link", { name, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
    await expect.poll(async () => {
      const box = (await link.boundingBox())!;
      return box.y + box.height;
    }, { message: `${name}: focus clears viewport after responsive layout settles` }).toBeLessThanOrEqual(page.viewportSize()!.height);
    const box = (await link.boundingBox())!;
    const header = (await page.getByRole("banner").boundingBox())!;
    expect(box.y, `${name}: focus clears header`).toBeGreaterThanOrEqual(header.y + header.height);
    expect(box.y + box.height, `${name}: focus clears viewport`).toBeLessThanOrEqual(page.viewportSize()!.height);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(2);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width - 2);
  }
}

// Sample the rendered photo/gradient behind each text run, preserving button backgrounds.
async function expectAA(page: Page): Promise<number> {
  await page.evaluate(() => document.fonts.ready);
  const selector = '[data-hero-intro] :is(p,h1,h2,a,button), header nav a';
  const runs = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none") return [];
    const color = style.color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const result: { text: string; color: number[]; threshold: number; x: number; y: number; width: number; height: number }[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight) result.push({
          text: node.textContent.trim(), color,
          threshold: parseFloat(style.fontSize) >= 24 ? 3 : 4.5,
          x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        });
      }
    }
    return result;
  }));
  const style = await page.addStyleTag({ content: `${selector} { color: transparent !important; text-shadow: none !important; transition: none !important; }` });
  let pixels;
  try { pixels = await sharp(await page.screenshot({ scale: "css" })).removeAlpha().raw().toBuffer({ resolveWithObject: true }); }
  finally { await style.evaluate((element) => element.parentNode?.removeChild(element)); }
  const luminance = (rgb: number[]) => rgb.map((channel) => channel / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  let minimum = Infinity;
  // The compact menu removes the old desktop navigation text from this sample.
  expect(runs.length).toBeGreaterThanOrEqual(1);
  for (const run of runs) {
    const foreground = luminance(run.color);
    let contrast = Infinity;
    for (let y = Math.max(0, Math.ceil(run.y)); y < Math.min(pixels.info.height, run.y + run.height); y++) {
      for (let x = Math.max(0, Math.ceil(run.x)); x < Math.min(pixels.info.width, run.x + run.width); x++) {
        const offset = (y * pixels.info.width + x) * pixels.info.channels;
        const background = luminance([...pixels.data.subarray(offset, offset + 3)]);
        contrast = Math.min(contrast, (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05));
      }
    }
    expect(contrast, `${run.text}: WCAG AA`).toBeGreaterThanOrEqual(run.threshold);
    minimum = Math.min(minimum, contrast);
  }
  return minimum;
}

async function seek(page: Page, progress: number): Promise<number> {
  return page.locator("[data-hero-scene]").evaluate((element, value) => {
    const top = element.getBoundingClientRect().top + scrollY;
    const distance = element.clientHeight - innerHeight;
    scrollTo(0, top + distance * value);
    // Native scroll offsets are rounded to CSS pixels. A short mobile pin can
    // advance several frames per pixel, so assert the frame at the actual offset.
    return Math.round(Math.max(0, Math.min(1, (scrollY - top) / distance)) * 120);
  }, progress);
}

test("approved grove poster fills the hero and scroll scrubs the real frames in both directions", async ({ page }, testInfo) => {
  // Scrubbing is disabled on short screens; other tests cover that poster fallback.
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  const poster = sequence(page).locator("img");
  await expect(poster).toHaveAttribute("src", "/images/hero/zeytinlik-2400.webp");
  await expect.poll(() => poster.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(hero(page).getByText(/görsel.*bekleniyor/i)).toHaveCount(0);
  const canvas = sequence(page).locator("canvas");
  await expect(canvas).toHaveAttribute("data-frame", "0");
  expect((await canvas.boundingBox())!.width).toBe(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath("hero-zeytinlik.png") });
  const contrasts = [await expectAA(page)];
  const middle = await seek(page, 0.65);
  expect(Math.abs(middle - 78)).toBeLessThanOrEqual(2);
  await expect(canvas).toHaveAttribute("data-frame", String(middle));
  contrasts.push(await expectAA(page));
  await seek(page, 1);
  await expect(canvas).toHaveAttribute("data-frame", "120");
  contrasts.push(await expectAA(page));
  await testInfo.attach("wcag-aa-contrast", { body: JSON.stringify({ progress: [0, 0.65, 1], minimumRatios: contrasts }), contentType: "application/json" });
  await seek(page, 0);
  await expect(canvas).toHaveAttribute("data-frame", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("reduced motion keeps the approved poster static and never requests video frames", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", (request) => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  await expect(sequence(page).locator("img")).toBeVisible();
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  await expectAA(page);
  await expectPosterAndActions(page);
  await page.evaluate(() => scrollBy(0, 240));
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  expect(frames).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("hero-zeytinlik-reduced.png") });
});

test("poster and actions survive disabled JavaScript and manifest failures", async ({ browser, baseURL, page }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(new URL("/", baseURL!).href);
    await expect(sequence(staticPage).locator("img")).toBeVisible();
    await hero(staticPage).getByRole("link", { name: "Ürünleri keşfet", exact: true }).scrollIntoViewIfNeeded();
    await expect(hero(staticPage).getByRole("link", { name: "Ürünleri keşfet", exact: true })).toBeInViewport();
  } finally {
    await context.close();
  }
  await page.route("**/frames/hero-zeytin/manifest.json", (route) => route.fulfill({ status: 500, body: "Unavailable" }));
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "error");
  await expect(sequence(page).locator("img")).toBeVisible();
  await expectPosterAndActions(page);
});

test("kit: short landscape keeps label keyboard actions inside the viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  await expectPosterAndActions(page);
  await page.screenshot({ path: testInfo.outputPath("landscape-focus.png") });
});

test("kit: intermediate widths and viewport changes preserve layout and focus", async ({ page }, testInfo) => {
  for (const width of [360, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(sequence(page)).toHaveAttribute("data-status", "ready");
    await expect(sequence(page).locator("canvas")).toHaveAttribute("data-frame", "0");
    await expectPosterAndActions(page);
    await page.evaluate(() => scrollTo(0, 0));
    await expectAA(page);
    await page.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    const title = page.locator("#hero-title");
    expect(await title.evaluate((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight))).toBeLessThanOrEqual(2.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width, height: 780 });
    await expect(sequence(page).locator("canvas")).toHaveCount(0);
    await expectPosterAndActions(page);
  }
});

for (const failure of ["manifest-404", "frames-404", "canvas-null", "canvas-throw", "draw-throw", "context-lost"] as const) {
  test(`kit: ${failure} preserves the poster and label actions`, async ({ page }, testInfo) => {
    if (failure === "context-lost") await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (failure === "manifest-404") await page.route("**/frames/hero-zeytin/manifest.json", (route) => route.fulfill({ status: 404 }));
    if (failure === "frames-404") await page.route("**/frames/hero-zeytin/**/frame-*.webp", (route) => route.fulfill({ status: 404 }));
    if (failure === "canvas-null" || failure === "canvas-throw") await page.addInitScript((throws) => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof getContext>) {
        if (args[0] === "2d") {
          if (throws) throw new Error("Simulated unavailable canvas");
          return null;
        }
        return getContext.apply(this, args);
      } as typeof getContext;
    }, failure === "canvas-throw");
    if (failure === "draw-throw") await page.addInitScript(() => {
      CanvasRenderingContext2D.prototype.drawImage = () => { throw new Error("Simulated lost graphics device"); };
    });
    await page.goto("/");
    await expect(sequence(page)).toHaveAttribute("data-status", failure === "manifest-404" ? "error" : "ready");
    if (failure === "context-lost") {
      await expect(sequence(page).locator("canvas")).toHaveAttribute("data-frame", "0");
      await sequence(page).locator("canvas").dispatchEvent("contextlost");
      await expect(sequence(page).locator("canvas")).toBeHidden();
    }
    if (failure === "canvas-throw" || failure === "canvas-null" || failure === "draw-throw") {
      await expect(sequence(page).locator("canvas")).toBeHidden();
    }
    await expectPosterAndActions(page);
    await page.screenshot({ path: testInfo.outputPath(`${failure}.png`) });
    expect(errors).toEqual([]);
  });
}

test("kit: slow media keeps the SSR poster geometry and label actions usable", async ({ page }, testInfo) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/frames/hero-zeytin/**", async (route) => { await delayed; await route.continue(); });
  await page.goto("/");
  try {
    await expect(sequence(page)).toHaveAttribute("data-status", "loading");
    const geometry = () => sequence(page).locator("img").evaluate((image) => {
      const box = image.getBoundingClientRect();
      return { width: box.width, height: box.height, top: box.top + scrollY };
    });
    const before = await geometry();
    await expectPosterAndActions(page);
    await page.screenshot({ path: testInfo.outputPath("slow-media.png") });
    release();
    await expect(sequence(page)).toHaveAttribute("data-status", "ready");
    expect(await geometry()).toEqual(before);
  } finally { release(); }
});

test("kit: data saver and low-end devices request no animation frames", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
  const frames: string[] = [];
  page.on("request", (request) => { if (/\/frame-\d+\.webp/.test(request.url())) frames.push(request.url()); });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: Object.assign(new EventTarget(), { saveData: true }) });
  });
  await page.goto("/");
  await expect(sequence(page)).toHaveAttribute("data-status", "ready");
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  await expectPosterAndActions(page);
  expect(frames).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("data-saver.png") });
  await page.evaluate(() => {
    const connection = (navigator as Navigator & { connection: EventTarget & { saveData: boolean } }).connection;
    connection.saveData = false;
    connection.dispatchEvent(new Event("change"));
    scrollTo(0, 0);
  });
  await expect(sequence(page).locator("canvas")).toHaveAttribute("data-frame", "0");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sequence(page).locator("canvas")).toHaveCount(0);
  const stopped = frames.length;
  await page.evaluate(() => scrollBy(0, 240));
  await page.waitForTimeout(150);
  expect(frames.length).toBe(stopped);
  // Isolate initial low-end capability detection from the earlier preference changes.
  const lowPage = await page.context().newPage();
  const lowFrames: string[] = [];
  try {
    await lowPage.emulateMedia({ reducedMotion: "no-preference" });
    await lowPage.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 4 });
      Object.defineProperty(navigator, "connection", { configurable: true, value: Object.assign(new EventTarget(), { saveData: false }) });
    });
    lowPage.on("request", (request) => { if (/\/frame-\d+\.webp/.test(request.url())) lowFrames.push(request.url()); });
    await lowPage.goto(new URL("/", page.url()).href);
    await expect(sequence(lowPage)).toHaveAttribute("data-status", "ready");
    await expect(sequence(lowPage).locator("canvas")).toHaveCount(0);
    await expectPosterAndActions(lowPage);
    expect(lowFrames).toEqual([]);
  } finally { await lowPage.close(); }
});

test("kit: scrub directions, selected network variant and performance are recorded", async ({ page, browser }, testInfo) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 900 });
  await page.addInitScript(() => {
    const audit = { cls: 0, longTasks: [] as number[], intervals: [] as number[], supported: PerformanceObserver.supportedEntryTypes };
    Object.assign(window, { heroAudit: audit });
    for (const type of ["longtask", "layout-shift"]) {
      if (!audit.supported.includes(type)) continue;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "longtask") audit.longTasks.push(entry.duration);
          else if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) audit.cls += (entry as PerformanceEntry & { value: number }).value;
        }
      }).observe({ type, buffered: true });
    }
    let last = 0;
    const started = performance.now();
    function sample(time: number): void {
      if (last) audit.intervals.push(time - last);
      last = time;
      if (time - started < 15000) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.goto("/");
  const canvas = sequence(page).locator("canvas");
  await expect(canvas).toHaveAttribute("data-frame", "0");
  const samples = [];
  for (const value of [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]) {
    const expected = await seek(page, value);
    expect(Math.abs(expected - Math.round(value * 120))).toBeLessThanOrEqual(2);
    await expect(canvas).toHaveAttribute("data-frame", String(expected));
    expect(await canvas.evaluate((node: HTMLCanvasElement) => node.getContext("2d")!.getImageData(1, 1, 1, 1).data[3])).toBe(255);
    samples.push({ progress: value, frame: Number(await canvas.getAttribute("data-frame")) });
    if ([0, 0.5, 1].includes(value)) await page.screenshot({ path: testInfo.outputPath(`scrub-${value}.png`) });
  }
  const rapid = await sequence(page).evaluate(async (element) => {
    const top = element.getBoundingClientRect().top + scrollY;
    const length = element.clientHeight - innerHeight;
    const samples: { target: number; frame: number }[] = [];
    // Slow traversal, fast traversal, and repeated direction changes at native rAF cadence.
    for (const target of [...Array.from({ length: 30 }, (_, i) => i / 29), 0, 1, 0.2, 0.8, 0.1, 0.9, 0.4, 0.6, 0]) {
      scrollTo(0, top + length * target);
      await new Promise(requestAnimationFrame);
      samples.push({ target, frame: Number(element.querySelector("canvas")?.getAttribute("data-frame")) });
    }
    return samples;
  });
  expect(rapid.every(({ frame }) => Number.isInteger(frame) && frame >= 0 && frame <= 120)).toBe(true);
  await expect(canvas).toHaveAttribute("data-frame", "0");
  await sequence(page).evaluate((element) => scrollTo(0, element.getBoundingClientRect().bottom + scrollY + innerHeight));
  await page.waitForTimeout(250);
  const offscreenFrame = await canvas.getAttribute("data-frame");
  const offscreenRequests = await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => /\/frame-\d+\.webp/.test(entry.name)).length);
  await page.waitForTimeout(250);
  expect(await canvas.getAttribute("data-frame")).toBe(offscreenFrame);
  expect(await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => /\/frame-\d+\.webp/.test(entry.name)).length)).toBe(offscreenRequests);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(canvas).toHaveAttribute("data-frame", "0");
  const metrics = await page.evaluate(() => {
    const audit = (window as unknown as { heroAudit: { cls: number; longTasks: number[]; intervals: number[]; supported: string[] } }).heroAudit;
    const network = (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .filter((entry) => /\/frames\/hero-zeytin\/|\/images\/hero\/zeytinlik/.test(entry.name))
      .map((entry) => ({ path: new URL(entry.name).pathname, encodedBodySize: entry.encodedBodySize, transferSize: entry.transferSize, duration: entry.duration }));
    const sorted = audit.intervals.toSorted((a, b) => a - b);
    return { cls: audit.cls, longTasks: audit.longTasks, supported: audit.supported, rafP95: sorted[Math.floor(sorted.length * 0.95)], rafMax: Math.max(...sorted), rafOver50ms: sorted.filter((value) => value > 50).length, network };
  });
  const expectedWidth = page.viewportSize()!.width <= 960 ? "960" : "1920";
  const frameTransfers = metrics.network.filter((entry) => /\/frame-\d+\.webp/.test(entry.path));
  expect(frameTransfers.length).toBeGreaterThan(15);
  expect(frameTransfers.every(({ path }) => path.includes(`/${expectedWidth}/`))).toBe(true);
  expect(metrics.cls).toBeLessThanOrEqual(0.01);
  await testInfo.attach("088-network-performance", {
    body: JSON.stringify({ browser: browser.version(), viewport: page.viewportSize(), dpr: 1, conditions: "localhost, no throttle, fresh context", samples, rapid, ...metrics,
      frameBytes: frameTransfers.reduce((sum, entry) => sum + entry.encodedBodySize, 0), frameTransferBytes: frameTransfers.reduce((sum, entry) => sum + entry.transferSize, 0) }, null, 2),
    contentType: "application/json",
  });
});

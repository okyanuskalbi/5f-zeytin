import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Task192 customer homepage", () => {
  test.beforeEach(async ({ context, browserName, baseURL }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged Chromium matrix.");
    const origin = new URL(baseURL ?? "http://localhost:3004");
    expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  });

  for (const width of [390, 768, 1440]) test(`${width}: stable poster, light surfaces and readable document`, async ({ page }, info) => {
    await mkdir("output/task192", { recursive: true });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [], videos: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) videos.push(request.url()); });
    await page.addInitScript(() => {
      const results = { cls: 0, lcp: "", lcpTag: "", lcpUrl: "" };
      Object.assign(window, { task192Metrics: results });
      new PerformanceObserver(list => { for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!entry.hadRecentInput) results.cls += entry.value;
      } }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { element?: Element; url?: string };
        results.lcp = entry.element?.outerHTML.slice(0, 700) ?? "";
        results.lcpTag = entry.element?.tagName ?? "";
        results.lcpUrl = entry.url ?? "";
      } }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    expect((await page.goto("/", { waitUntil: "load" }))?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Doğal, Lezzetli, Güvenilir Zeytin");
    await expect(page.locator("#baslangic img").first()).toBeVisible();
    await expect(page.locator("#baslangic video")).toHaveCount(0);
    expect(videos).toEqual([]);
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = "eager";
      await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { task192Metrics: { lcpTag: string } }).task192Metrics.lcpTag)).toBe("IMG");
    await page.screenshot({ path: `output/task192/home-${width}.png`, fullPage: true, animations: "disabled" });
    const metrics = await page.evaluate(() => (window as unknown as { task192Metrics: { cls: number; lcp: string; lcpTag: string; lcpUrl: string } }).task192Metrics);
    expect(metrics.cls).toBeLessThan(.05);
    expect(metrics.lcpTag).toBe("IMG");
    expect(metrics.lcpUrl).toContain("hero-poster");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const contrast = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(contrast.violations).toEqual([]);
    expect(errors).toEqual([]);
    await writeFile(`output/task192/metrics-${width}.json`, JSON.stringify({ metrics, videos, errors, contrastViolations: contrast.violations }, null, 2));
    await info.attach("poster-and-layout", { body: JSON.stringify(metrics), contentType: "application/json" });
  });

  test("normal motion video is deferred, silent, looping and pausable", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const result = { cls: 0, lcpTag: "", lcpUrl: "", posterPaintedAt: 0, videoRequestedAt: 0 };
      Object.assign(window, { task192Normal: result });
      new PerformanceObserver(list => { for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!entry.hadRecentInput) result.cls += entry.value;
      } }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { element?: Element; url?: string };
        result.lcpTag = entry.element?.tagName ?? ""; result.lcpUrl = entry.url ?? "";
        if (entry.url?.includes("hero-poster")) result.posterPaintedAt = entry.startTime;
      } }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) {
        if (/\/videos\/customer-home\/.+\.mp4/.test(entry.name)) result.videoRequestedAt = entry.startTime;
      } }).observe({ type: "resource", buffered: true });
    });
    await page.goto("/", { waitUntil: "load" });
    const video = page.locator("#baslangic video");
    await expect(video).toHaveCount(1);
    expect(await video.evaluate((node: HTMLVideoElement) => ({ muted: node.muted, loop: node.loop, inline: node.playsInline, preload: node.preload }))).toEqual({ muted: true, loop: true, inline: true, preload: "none" });
    const normal = await page.evaluate(() => (window as unknown as { task192Normal: { cls: number; lcpTag: string; lcpUrl: string; posterPaintedAt: number; videoRequestedAt: number } }).task192Normal);
    expect(normal.cls).toBeLessThan(.05);
    expect(normal.lcpTag).toBe("IMG");
    expect(normal.lcpUrl).toContain("hero-poster");
    expect(normal.posterPaintedAt).toBeGreaterThan(0);
    if (normal.videoRequestedAt) expect(normal.videoRequestedAt).toBeGreaterThan(normal.posterPaintedAt);
    await writeFile("output/task192/normal-metrics.json", JSON.stringify(normal, null, 2));
    const pause = page.getByRole("button", { name: /videoyu duraklat/i });
    await pause.click();
    expect(await video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
    await expect(page.getByRole("button", { name: /videoyu oynat/i })).toBeVisible();
  });
});

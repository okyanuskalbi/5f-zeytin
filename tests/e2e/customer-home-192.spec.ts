import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium, expect, test } from "@playwright/test";

// Use the Playwright-packaged full Chromium for H.264 decoding, always headless.
// Never select the user's installed Chrome or a native Chrome channel.
test.use({ browserName: "chromium", launchOptions: { executablePath: chromium.executablePath(), headless: true } });

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
    const metrics = await page.evaluate(() => (window as unknown as { task192Metrics: { cls: number; lcp: string; lcpTag: string; lcpUrl: string } }).task192Metrics);
    await page.screenshot({ path: `output/task192/home-${width}.png`, fullPage: true, animations: "disabled" });
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

  for (const { width, height, source } of [
    { width: 1440, height: 900, source: "hero-1920.mp4" },
    { width: 390, height: 844, source: "hero-720.mp4" },
  ]) test(`${width}: normal video really decodes, advances, pauses and resumes`, async ({ page }, info) => {
    await mkdir("output/task192", { recursive: true });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const requests: string[] = [];
    page.on("request", request => { if (/\/videos\/customer-home\/.+\.mp4/.test(request.url())) requests.push(request.url()); });
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
    // A successful request and an onPlay label do not prove a rendered frame.
    await page.waitForFunction(() => {
      const video = document.querySelector<HTMLVideoElement>("main video");
      return !!video && !video.paused && video.currentTime > .5;
    }, undefined, { timeout: 5000 });
    const video = page.locator("main video");
    await expect(video).toHaveCount(1);
    const playback = await video.evaluate((node: HTMLVideoElement) => {
      const legacy = node as HTMLVideoElement & { webkitDecodedFrameCount?: number };
      return { paused: node.paused, currentTime: node.currentTime, currentSrc: node.currentSrc,
        decodedFrames: typeof node.getVideoPlaybackQuality === "function" ? node.getVideoPlaybackQuality().totalVideoFrames : legacy.webkitDecodedFrameCount,
        observedAt: performance.now(), muted: node.muted, loop: node.loop, inline: node.playsInline, preload: node.preload };
    });
    expect(playback).toMatchObject({ paused: false, muted: true, loop: true, inline: true, preload: "none" });
    expect(playback.currentTime).toBeGreaterThan(.5);
    expect(playback.observedAt).toBeLessThan(5000);
    expect(new URL(playback.currentSrc).pathname).toBe(`/videos/customer-home/${source}`);
    if (playback.decodedFrames !== undefined) expect(playback.decodedFrames).toBeGreaterThan(0);
    expect([...new Set(requests.map(url => new URL(url).pathname))]).toEqual([`/videos/customer-home/${source}`]);
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime), { timeout: 1500 }).toBeGreaterThan(playback.currentTime + .2);
    await page.getByRole("button", { name: "Videoyu duraklat", exact: true }).click();
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
    const pausedAt = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
    await page.waitForTimeout(350);
    expect(Math.abs(await video.evaluate((node: HTMLVideoElement) => node.currentTime) - pausedAt)).toBeLessThan(.05);
    await page.getByRole("button", { name: "Videoyu oynat", exact: true }).click();
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused), { timeout: 1500 }).toBe(false);
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime), { timeout: 1500 }).toBeGreaterThan(pausedAt + .2);
    const normal = await page.evaluate(() => (window as unknown as { task192Normal: { cls: number; lcpTag: string; lcpUrl: string; posterPaintedAt: number; videoRequestedAt: number } }).task192Normal);
    expect(normal.cls).toBeLessThan(.05);
    expect(normal.lcpUrl).toContain("hero-poster");
    expect(normal.posterPaintedAt).toBeGreaterThan(0);
    if (normal.videoRequestedAt) expect(normal.videoRequestedAt).toBeGreaterThan(normal.posterPaintedAt);
    await writeFile(`output/task192/normal-metrics-${width}.json`, JSON.stringify({ normal, playback, pausedAt, requests }, null, 2));
    await info.attach("real-hero-playback", { body: JSON.stringify({ normal, playback, pausedAt, requests }), contentType: "application/json" });
  });

  test("saveData keeps only the eager poster and makes no MP4 request", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } }));
    const requests: string[] = [];
    page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) requests.push(request.url()); });
    await page.goto("/", { waitUntil: "load" });
    const poster = page.locator("[data-hero-photo] img");
    await expect(poster).toBeVisible();
    await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await page.waitForTimeout(800);
    await expect(page.locator("main video")).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test("a selected video receiving a real local404 keeps a usable poster fallback", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // Continue to an absent local file so the actual server returns a real404.
    await page.route("**/videos/customer-home/hero-720.mp4", route => route.continue({
      url: new URL("/videos/customer-home/missing-192-1.mp4", route.request().url()).href,
    }));
    const failedResponse = page.waitForResponse(response => response.status() === 404 && response.url().includes("/videos/customer-home/"));
    await page.goto("/", { waitUntil: "load" });
    await failedResponse;
    await expect(page.locator("main video")).toHaveCount(0);
    const poster = page.locator("[data-hero-photo] img");
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("button", { name: /Videoyu (?:duraklat|oynat)/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Doğal, Lezzetli, Güvenilir Zeytin");
    await expect(page.locator('#baslangic a[href="/urunler"]')).toBeVisible();
  });
});

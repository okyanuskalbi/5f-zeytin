import { expect, test } from "@playwright/test";

test("the accepted-source five-second film paints two loop seams and respects pause and offscreen state", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const film = page.locator("[data-cinematic-film]");
  const video = film.locator("video");
  await expect(video).toHaveAttribute("src", "/videos/afina-zeytinlik-loop-5s.mp4");
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(.1);
  const media = await video.evaluate(element => {
    const player = element as HTMLVideoElement;
    return { duration: player.duration, loop: player.loop, muted: player.muted };
  });
  expect(Math.abs(media.duration - 5)).toBeLessThan(.15);
  expect(media.loop).toBe(true); expect(media.muted).toBe(true);
  await video.evaluate(element => {
    const player = element as HTMLVideoElement & { loopProbe?: { wraps: number; frames: number; last: number; callback: number } };
    const probe = { wraps: 0, frames: 0, last: player.currentTime, callback: 0 };
    player.loopProbe = probe;
    const frame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (metadata.mediaTime < probe.last - 1) probe.wraps++;
      probe.frames++; probe.last = metadata.mediaTime;
      probe.callback = player.requestVideoFrameCallback(frame);
    };
    probe.callback = player.requestVideoFrameCallback(frame);
  });
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement & { loopProbe?: { wraps: number } }).loopProbe?.wraps ?? 0), { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  const decoded = await video.evaluate(element => {
    const player = element as HTMLVideoElement & { loopProbe?: { frames: number; callback: number } };
    const frames = player.loopProbe?.frames ?? 0;
    if (player.loopProbe) player.cancelVideoFrameCallback(player.loopProbe.callback);
    return frames;
  });
  expect(decoded).toBeGreaterThan(150);
  await expect(film).toHaveAttribute("data-show-film", "true");
  await expect(video).toHaveCSS("opacity", "1");
  const pause = film.getByRole("button", { name: "Filmi duraklat" });
  const box = await pause.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
  await pause.click();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  const stopped = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  await page.waitForTimeout(300); // Observe the decoder over time after a real pause.
  expect(await video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeCloseTo(stopped, 1);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.locator("#baslangic").scrollIntoViewIfNeeded();
  await expect(film.getByRole("button", { name: "Filmi oynat" })).toBeVisible();
  expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  await film.getByRole("button", { name: "Filmi oynat" }).click();
  await expect.poll(() => video.evaluate((element, previous) => Math.abs((element as HTMLVideoElement).currentTime - previous), stopped)).toBeGreaterThan(.05);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  await page.locator("#baslangic").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
  await expect(film.getByRole("button", { name: "Filmi duraklat" })).toBeVisible();
});

test("reduced motion makes no film request and keeps the product destination working", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/videos/afina-zeytinlik-loop-5s.mp4")) requests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-cinematic-film] video")).not.toHaveAttribute("src");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-cinematic-film] picture img")).toBeVisible();
  await page.locator("[data-hero-copy]").getByRole("link", { name: "Ürünleri Keşfet" }).click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.locator("#urunler")).toBeInViewport();
  expect(requests).toEqual([]);
});

test("data saver avoids film downloads while retaining the cinematic poster and links", async ({ page }) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.assign(connection, { saveData: true });
    Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  });
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/videos/afina-zeytinlik-loop-5s.mp4")) requests.push(request.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-cinematic-film] video")).not.toHaveAttribute("src");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(page.locator("[data-hero-copy]").getByRole("link", { name: "Kurumsal Teklif Al" })).toHaveAttribute("href", "#teklif");
  expect(requests).toEqual([]);
});

test("a failed film keeps the poster, retry control and real shopping links", async ({ page }) => {
  await page.route("**/videos/afina-zeytinlik-loop-5s.mp4", route => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-cinematic-film]").getByRole("status")).toContainText("Film açılamadı");
  await expect(page.locator("[data-cinematic-film] picture img")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tekrar dene", exact: true })).toBeVisible();
  await expect(page.locator("[data-hero-copy]").getByRole("link", { name: "Ürünleri Keşfet" })).toBeVisible();
});

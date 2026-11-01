import { expect, test } from "@playwright/test";

test("the accepted Flow film advances, pauses, resumes, holds its ending and replays", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const film = page.locator("[data-cinematic-film]");
  const video = film.locator("video");
  await expect(video).toHaveAttribute("src", "/videos/afina-agac-dal.mp4");
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(.1);
  if (await film.getByRole("button", { name: "Yeniden oynat" }).count()) {
    await film.getByRole("button", { name: "Yeniden oynat" }).click();
  }
  await expect(film).toHaveAttribute("data-show-film", "true");
  await film.getByRole("button", { name: "Filmi duraklat" }).click();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  const stopped = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  await page.waitForTimeout(300); // Observe the decoder over time after a real pause.
  expect(await video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeCloseTo(stopped, 1);
  await film.getByRole("button", { name: "Filmi oynat" }).click();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(stopped + .05);
  await expect(film.getByRole("button", { name: "Yeniden oynat" })).toBeVisible({ timeout: 12_000 });
  expect(await video.evaluate(element => (element as HTMLVideoElement).ended)).toBe(true);
  await film.getByRole("button", { name: "Yeniden oynat" }).click();
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeLessThan(2);
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
});

test("reduced motion makes no film request and keeps the product destination working", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (request.url().endsWith("/videos/afina-agac-dal.mp4")) requests.push(request.url()); });
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
  page.on("request", request => { if (request.url().endsWith("/videos/afina-agac-dal.mp4")) requests.push(request.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-cinematic-film] video")).not.toHaveAttribute("src");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(page.locator("[data-hero-copy]").getByRole("link", { name: "Kurumsal Teklif Al" })).toHaveAttribute("href", "#toptan-iletisim");
  expect(requests).toEqual([]);
});

test("a failed film keeps the poster, retry control and real shopping links", async ({ page }) => {
  await page.route("**/videos/afina-agac-dal.mp4", route => route.abort());
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-cinematic-film]").getByRole("status")).toContainText("Film açılamadı");
  await expect(page.locator("[data-cinematic-film] picture img")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tekrar dene", exact: true })).toBeVisible();
  await expect(page.locator("[data-hero-copy]").getByRole("link", { name: "Ürünleri Keşfet" })).toBeVisible();
});

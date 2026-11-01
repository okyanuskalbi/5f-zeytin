import { expect, test } from "@playwright/test";

test("the producer scene follows the visible chapter, with native reading on phones", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const story = page.locator("#uretim-yolculugu");
  const size = page.viewportSize()!;
  const sticky = size.width >= 1024 && size.height >= 760;
  await expect(story).toHaveAttribute("data-story-mode", sticky ? "sticky" : "native");
  for (const [id, label] of [["hikaye-toprak", "Toprağımız"], ["hikaye-uretim", "Üretimimiz"], ["hikaye-sofra", "Sofranız"]]) {
    const chapter = page.locator(`#${id}`);
    await chapter.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(story.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "step");
    if (sticky) await expect(story.locator("[data-story-visual]")).toHaveAttribute("data-story-active", id);
    else await expect(chapter.locator("figure img")).toBeVisible();
    await expect(chapter.getByRole("heading")).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator("#toptan-iletisim").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "İşletmeniz için AFİNA." })).toBeVisible();
  await page.locator("#iletisim-title").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Sofrada görüşürüz." })).toBeVisible();
});

test("reduced motion retains all scenes without pinned whitespace or movie downloads", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const movies: string[] = [];
  page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) movies.push(request.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#baslangic")).toHaveAttribute("data-hero-mode", "native");
  await expect(page.locator("#uretim-yolculugu")).toHaveAttribute("data-story-mode", "native");
  for (const chapter of await page.locator("[data-story-chapter]").all()) {
    await expect(chapter.locator("figure img")).toBeVisible();
  }
  expect(movies).toEqual([]);
});

import { expect, test, type Locator, type Page } from "@playwright/test";

const demoURL = process.env.FRAME_SEQUENCE_DEV_URL;
const scene = (page: Page): Locator => page.locator("[data-frame-sequence]");
const canvas = (page: Page): Locator => scene(page).locator("canvas");

async function openDemo(page: Page): Promise<void> {
  expect((await page.goto(new URL("/__demo/frames", demoURL!).href))?.status()).toBe(200);
  await expect(scene(page)).toHaveAttribute("data-status", "ready");
}

async function seek(page: Page, progress: number): Promise<void> {
  await scene(page).evaluate((element, value) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (element.clientHeight - window.innerHeight) * value);
  }, progress);
}

test("the demo is unavailable in a production build", async ({ request }) => {
  expect((await request.get("/__demo/frames")).status()).toBe(404);
});

test.describe("development frame sequence", () => {
  test.beforeEach(() => {
    if (!demoURL) throw new Error("FRAME_SEQUENCE_DEV_URL must point to this checkout's next dev server; production baseURL is verified separately.");
  });

  test("loads at most 20 frames initially, scrubs in both directions and exposes progress to text", async ({ page }, testInfo) => {
    const requests: string[] = [];
    const errors: string[] = [];
    page.on("request", (request) => {
      if (/\/frame-\d+\.webp/.test(request.url())) requests.push(request.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openDemo(page);
    await expect.poll(() => requests.length).toBe(15);
    // Let idle/observer callbacks settle: the budget must hold without scroll input.
    await page.waitForTimeout(600);
    expect(requests.length).toBeLessThanOrEqual(20);
    const expectedWidth = page.viewportSize()!.width <= 960 ? "960" : "1920";
    expect(requests.every((url) => url.includes(`/${expectedWidth}/`))).toBe(true);
    await expect(canvas(page)).toHaveAttribute("data-frame", "0");
    const initialPixel = await canvas(page).evaluate((node: HTMLCanvasElement) =>
      [...node.getContext("2d")!.getImageData(node.width / 2, node.height / 2, 1, 1).data]);
    await seek(page, 1);
    await expect(canvas(page)).toHaveAttribute("data-frame", "47");
    await expect(page.getByTestId("frame-progress")).toHaveText("100%");
    const finalPixel = await canvas(page).evaluate((node: HTMLCanvasElement) =>
      [...node.getContext("2d")!.getImageData(node.width / 2, node.height / 2, 1, 1).data]);
    expect(finalPixel).not.toEqual(initialPixel);
    await seek(page, 0);
    await expect(canvas(page)).toHaveAttribute("data-frame", "0");
    await expect(page.getByTestId("frame-progress")).toHaveText("0%");
    expect(await scene(page).evaluate((element) => Math.round(element.clientHeight / innerHeight * 100)))
      .toBe(page.viewportSize()!.width < 768 ? 210 : 300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("frames.png") });
  });

  test("reduced motion requests only the poster and keeps text and keyboard actions usable", async ({ page, browserName }, testInfo) => {
    const images: string[] = [];
    await page.emulateMedia({ reducedMotion: "reduce" });
    page.on("request", (request) => { if (request.url().endsWith(".webp")) images.push(request.url()); });
    await openDemo(page);
    await expect(scene(page).locator("img")).toBeVisible();
    await expect(canvas(page)).toBeHidden();
    await expect(page.getByRole("heading", { name: "Kare dizisi denemesi" })).toBeVisible();
    const action = page.getByRole("link", { name: "Deneme sonuna git" });
    await action.focus();
    await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(action).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#frames-end")).toBeInViewport();
    expect(await scene(page).evaluate((element) => element.clientHeight <= innerHeight)).toBe(true);
    await page.waitForTimeout(300);
    expect(images).toHaveLength(1);
    expect(images[0]).toMatch(/\/poster\.webp$/);
    await page.screenshot({ path: testInfo.outputPath("frames-reduced.png"), fullPage: true });
  });

  test("missing frames fall back to loaded pixels and changing preference stops scrubbing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.route("**/frame-0048.webp", (route) => route.abort());
    await openDemo(page);
    await expect(canvas(page)).toHaveAttribute("data-frame", "0");
    await seek(page, 0.95);
    await expect.poll(async () => Number(await canvas(page).getAttribute("data-frame"))).toBeGreaterThan(35);
    await seek(page, 1);
    await expect(canvas(page)).not.toHaveAttribute("data-frame", "47");
    expect(await canvas(page).evaluate((node: HTMLCanvasElement) =>
      node.getContext("2d")!.getImageData(node.width / 2, node.height / 2, 1, 1).data[3])).toBe(255);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(canvas(page)).toBeHidden();
    await expect(scene(page).locator("img")).toBeVisible();
    await expect(page.getByTestId("frame-progress")).toHaveText("0%");
  });

  test("manifest failures keep overlay content and a recovery message accessible", async ({ page }) => {
    await page.route("**/media/frame-demo/manifest.json", (route) => route.fulfill({ status: 500, body: "Unavailable" }));
    await page.goto(new URL("/__demo/frames", demoURL!).href);
    await expect(scene(page)).toHaveAttribute("data-status", "error");
    await expect(page.getByRole("status")).toContainText("Görsel yüklenemedi");
    await expect(page.getByRole("link", { name: "Deneme sonuna git" })).toBeVisible();
  });

  test("contain blur fill, high DPR and resizing preserve the canvas", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => { Object.defineProperty(window, "devicePixelRatio", { get: () => 2 }); });
    await page.goto(new URL("/__demo/frames?fit=contain&blurFill=1", demoURL!).href);
    await expect(scene(page)).toHaveAttribute("data-status", "ready");
    await expect(canvas(page)).toHaveAttribute("data-frame", "0");
    expect(await canvas(page).evaluate((node) => node.width)).toBe(page.viewportSize()!.width * 2);
    expect(await canvas(page).evaluate((node) =>
      node.getContext("2d")!.getImageData(2, 2, 1, 1).data[3])).toBe(255);
    await page.setViewportSize({ width: 390, height: 700 });
    await expect.poll(() => canvas(page).evaluate((node) => node.width)).toBe(780);
    await seek(page, 1);
    await expect(canvas(page)).toHaveAttribute("data-frame", "47");
  });
});

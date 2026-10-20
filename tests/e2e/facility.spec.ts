import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Read the independent editorial source so punctuation and paragraph changes
// cannot silently diverge from the official copy.
const source = readFileSync(new URL("../../docs/referans/icerik.md", import.meta.url), "utf8");
const story = source.split("### Marka hikâyesi / detay sayfası tanıtımı\n\n")[1]
  .split("\n\n###")[0].trim().split("\n\n");
const activities = source.split("### Faaliyet ve hizmet başlıkları\n\n")[1]
  .split("\n\n")[0].split(" • ");

async function expectStory(facility: Locator): Promise<void> {
  await expect(facility.getByRole("heading", { name: "Tesisimiz", exact: true })).toBeVisible();
  await expect(facility.locator("[data-facility-story] p")).toHaveText(story);
  await expect(facility.getByText("Osmaniye üretim tesisi", { exact: true })).toBeVisible();
  await expect(facility.getByRole("list", { name: "Faaliyet alanlarımız" }).getByRole("listitem"))
    .toHaveText(activities);
  await expect(facility).not.toContainText(/%\s*100\s*(organik|doğal)|sertifikalı|lider|ton kapasite/i);
}

async function expectTypography(facility: Locator): Promise<void> {
  await expect(facility.getByText(/görseli.*(yakında|hazırlanıyor)/i)).toHaveCount(0);
  // No network media or CSS image may bypass the asset approval process.
  await expect(facility.locator("img, picture, video, canvas, iframe, source, image")).toHaveCount(0);
  expect(await facility.locator("*").evaluateAll((nodes) => nodes.some((node) =>
    /url\(/i.test(getComputedStyle(node).backgroundImage),
  ))).toBe(false);
}

async function tabTo(page: Page, target: Locator, nextControl: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await target.evaluate((node) => node === document.activeElement)) return;
    await page.keyboard.press(nextControl);
  }
  await expect(target).toBeFocused();
}

test.beforeEach(async ({ baseURL }, testInfo) => {
  const target = new URL(baseURL!);
  if (!["localhost", "127.0.0.1"].includes(target.hostname)) {
    throw new Error("Facility acceptance requires this local checkout.");
  }
  testInfo.annotations.push({ type: "target-host", description: target.host });
});

test("facility presents the exact official story and typography without media placeholders", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const generatedRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/images/generated/")) generatedRequests.push(request.url());
  });
  expect((await page.goto("/#tesisimiz"))?.status()).toBe(200);
  const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
  await expectStory(facility);
  await expectTypography(facility);
  await expect(page.locator('#hikayemiz [id="tesisimiz"]')).toHaveCount(1);
  expect(await page.locator("[data-scene]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-scene"))))
    .toEqual(["hero", "story", "products", "wholesale"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(generatedRequests).toEqual([]);
  expect(errors).toEqual([]);
  await facility.screenshot({ path: testInfo.outputPath("facility.png") });
});

test("image request failures preserve the story, fallback and onward actions", async ({ page }, testInfo) => {
  let failedImages = 0;
  await page.route("**/*", (route) => {
    if (route.request().resourceType() === "image") {
      failedImages++;
      return route.abort("failed");
    }
    return route.continue();
  });
  await page.goto("/#tesisimiz");
  const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
  await expectStory(facility);
  await expectTypography(facility);
  expect(failedImages).toBeGreaterThan(0);
  const products = facility.getByRole("link", { name: "Ürünlerimizi Keşfedin" });
  await products.click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.getByRole("heading", { name: "Ürünlerimiz", exact: true })).toBeInViewport();
  await page.goto("/#tesisimiz");
  await facility.screenshot({ path: testInfo.outputPath("facility-media-error.png") });
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`keyboard navigation reaches facility and both destinations with motion=${reducedMotion}`, async ({ page, browserName }, testInfo) => {
    // Match the shell tests: macOS WebKit uses Option+Tab for all controls.
    const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.locator("header").first().getByRole("link", { name: "Afina Zeytin ana sayfa" }).focus();
    const menu = page.getByRole("button", { name: "Menüyü aç" });
    const isMobile = await menu.isVisible();
    if (isMobile) {
      await tabTo(page, menu, nextControl);
      await page.keyboard.press("Enter");
    }
    const navigation = page.getByRole("navigation", { name: isMobile ? "Site navigasyonu" : "Ana navigasyon", exact: true });
    const facilityLink = navigation.getByRole("link", { name: "Tesisimiz", exact: true });
    await tabTo(page, facilityLink, nextControl);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#tesisimiz$/);
    const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
    await expectStory(facility);
    await expect(facility.getByRole("heading", { name: "Tesisimiz", exact: true })).toBeInViewport();
    const headerBottom = await page.locator("header").first().evaluate((node) => node.getBoundingClientRect().bottom);
    expect(await facility.evaluate((node) => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
    // Begin at the fragment destination, then verify native tab order and focus.
    await facility.focus();
    const productLink = facility.getByRole("link", { name: "Ürünlerimizi Keşfedin" });
    await page.keyboard.press(nextControl);
    await expect(productLink).toBeFocused();
    expect(await productLink.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe("none");
    for (const link of await facility.getByRole("link").all()) {
      const bounds = await link.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#urunler$/);
    await expect(page.locator("#urunler")).toBeFocused();
    await page.goto("/#tesisimiz");
    await facility.focus();
    await page.keyboard.press(nextControl);
    await page.keyboard.press(nextControl);
    const wholesale = facility.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" });
    await expect(wholesale).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#toptan-iletisim$/);
    await expect(page.locator("#toptan-iletisim")).toBeFocused();
    if (reducedMotion === "reduce") {
      await page.goto("/#tesisimiz");
      expect(await facility.evaluate((node) => [node, ...node.querySelectorAll("*")].every((element) => {
        const style = getComputedStyle(element);
        return style.transform === "none" && style.opacity === "1" && style.animationName === "none";
      }))).toBe(true);
      await facility.screenshot({ path: testInfo.outputPath("facility-reduced.png") });
    }
  });
}

test("server-rendered facility copy and links work without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto("/#tesisimiz");
    const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
    await expectStory(facility);
    await expectTypography(facility);
    await facility.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" }).click();
    await expect(page).toHaveURL(/#toptan-iletisim$/);
    await expect(page.getByRole("heading", { name: "Toptan satış", exact: true })).toBeInViewport();
  } finally {
    await context.close();
  }
});

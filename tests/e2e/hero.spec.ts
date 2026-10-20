import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const officialCopy = readFileSync(new URL("../../docs/referans/icerik.md", import.meta.url), "utf8")
  .split("## 04 / ZEYTİN & ZEYTİNYAĞI")[1]!;
const headline = "Kökü toprakta. Yeri sofrada.";
const subtitle = "Toprağın sunduğu lezzet, Afina’nın özeniyle.";
const actions = [
  ["Ürünlerimizi Keşfedin", "#urunler"],
  ["Toptan Satış İçin İletişime Geçin", "#toptan-iletisim"],
] as const;

async function expectNoOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function expectDestination(page: Page, action: Locator, hash: string): Promise<void> {
  await action.click();
  expect(new URL(page.url()).hash).toBe(hash);
  const destination = page.locator(hash);
  await expect(destination).toBeVisible();
  await expect(destination).toBeFocused();
  const headerBottom = await page.getByRole("banner").evaluate((element) => element.getBoundingClientRect().bottom);
  expect((await destination.boundingBox())!.y).toBeGreaterThanOrEqual(headerBottom);
}

test("hero matches official copy and links to retail and wholesale destinations", async ({ page, baseURL }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  expect((await page.goto("/"))?.status()).toBe(200);
  const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
  await expect(hero).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText("Afina Zeytin");
  expect(officialCopy).toContain(`${headline} ${subtitle}`);
  await expect(hero.getByText(headline, { exact: true })).toBeVisible();
  await expect(hero.getByText(subtitle, { exact: true })).toBeVisible();
  await expect(hero.getByText("Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.", { exact: true })).toBeVisible();
  await expect(hero.getByRole("link")).toHaveCount(2);
  for (const [name, hash] of actions) {
    expect(officialCopy).toContain(name);
    const action = hero.getByRole("link", { name, exact: true });
    await expect(action).toHaveAttribute("href", hash);
    const box = (await action.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expectDestination(page, action, hash);
  }
  await expect(page.locator("#urunler").getByRole("article")).toHaveCount(3);
  await expect(page.locator("#urunler").getByRole("article", { name: "Sofralık Zeytin", exact: true })).toBeVisible();
  await expect(page.locator("#toptan-iletisim").getByText("Toptan talep formu henüz kullanıma açık değil.", { exact: true })).toBeVisible();
  await expect(page.locator("#toptan-iletisim").getByRole("button")).toHaveCount(0);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("hero.png"), fullPage: true });
});

test("hero uses the approved logo and grove poster without unapproved scene media", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
  await expect(hero.locator("[data-frame-sequence] img")).toBeVisible();
  await expect(hero.getByText("Onaylı sahne görseli bekleniyor.", { exact: true })).toHaveCount(0);
  await expect(hero.locator("video")).toHaveCount(0);
  const logo = page.getByRole("banner").getByRole("img", { name: "Afina Zeytin", exact: true });
  await expect(logo).toHaveAttribute("src", "/brand/afina-zeytin.svg");
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(requests.some((url) => url.includes("/images/generated/"))).toBe(false);
  await expectNoOverflow(page);
});

test("hero content and actions remain usable when logo requests fail", async ({ page }, testInfo) => {
  await page.route("**/brand/afina-*.svg", (route) => route.abort());
  await page.goto("/");
  const logo = page.getByRole("banner").getByRole("img", { name: "Afina Zeytin", exact: true });
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 0)).toBe(true);
  const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
  await expect(hero.getByText(headline, { exact: true })).toBeVisible();
  await expect(hero.getByText(subtitle, { exact: true })).toBeVisible();
  for (const [name, hash] of actions) {
    await expectDestination(page, hero.getByRole("link", { name, exact: true }), hash);
  }
  await expectNoOverflow(page);
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("hero-logo-error.png"), fullPage: true });
});

test("hero supports keyboard focus, native anchors and reduced motion", async ({ page, browserName }, testInfo) => {
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.keyboard.press(nextControl);
    await expect(page.getByRole("link", { name: "Ana içeriğe geç" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#ana-icerik")).toBeFocused();
    const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
    for (const [name, hash] of actions) {
      await page.keyboard.press(nextControl);
      const action = hero.getByRole("link", { name, exact: true });
      await expect(action).toBeFocused();
      expect(await action.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
      if (reducedMotion === "reduce") {
        expect(await action.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
      }
      // Tab order is checked before activation; Shift+Tab restores the first CTA.
      if (hash === "#toptan-iletisim") {
        await page.keyboard.press("Shift+Tab");
      }
    }
    for (const [name, hash] of actions) {
      const action = hero.getByRole("link", { name, exact: true });
      await action.focus();
      await page.keyboard.press("Enter");
      expect(new URL(page.url()).hash).toBe(hash);
      await expect(page.locator(hash)).toBeFocused();
    }
    await page.goto("/");
    if (reducedMotion === "reduce") {
      expect(await hero.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
    }
    await expectNoOverflow(page);
    if (reducedMotion === "reduce") {
      await page.screenshot({ path: testInfo.outputPath("hero-reduced-motion.png"), fullPage: true });
    }
  }
});

test("hero stays readable and navigable without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
  });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
    await expect(hero.getByText(headline, { exact: true })).toBeVisible();
    await expect(hero.getByText(subtitle, { exact: true })).toBeVisible();
    for (const [name, hash] of actions) {
      await expectDestination(page, hero.getByRole("link", { name, exact: true }), hash);
    }
    await expectNoOverflow(page);
  } finally {
    await context.close();
  }
});

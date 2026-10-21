import { mkdir } from "node:fs/promises";
import { devices, expect, test, type BrowserContextOptions, type Page } from "@playwright/test";
import sharp from "sharp";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Claude owns execution. Use chromium-1440 + webkit-iphone14, headless,
// --workers=2. WebKit emulation does not replace the real iOS Safari recheck.
const targets: { name: string; project: string; options: BrowserContextOptions }[] = [
  { name: "desktop", project: "chromium-1440", options: { viewport: { width: 1440, height: 900 } } },
  { name: "laptop", project: "chromium-1440", options: { viewport: { width: 1280, height: 800 } } },
  { name: "iphone14", project: "webkit-iphone14", options: devices["iPhone 14"] },
  { name: "iphone-se", project: "webkit-iphone14", options: devices["iPhone SE"] },
  { name: "pixel7", project: "chromium-1440", options: devices["Pixel 7"] },
  { name: "landscape", project: "webkit-iphone14", options: devices["iPhone 14 landscape"] },
];

async function paint(page: Page): Promise<void> {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function viewportImages(page: Page): Promise<void> {
  await expect.poll(() => page.locator("main img").evaluateAll(nodes => nodes.every(node => {
    const box = node.getBoundingClientRect();
    return box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth
      || (node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0);
  }))).toBe(true);
  await page.locator("main img").evaluateAll(async nodes => {
    await Promise.all(nodes.map(node => {
      const box = node.getBoundingClientRect();
      return node instanceof HTMLImageElement && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth ? node.decode() : undefined;
    }));
  });
}

async function reviewScreens(page: Page, name: string): Promise<void> {
  for (const [index, selector] of ["[data-hero-intro]", "#kiler", "#tesisimiz"].entries()) {
    const section = page.locator(selector);
    await section.evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
    await paint(page);
    await viewportImages(page);
    await page.screenshot({ path: `test-results/115/${name}-${index + 1}.png`, animations: "disabled" });
  }
}

for (const target of targets) {
  test(`115: ${target.name} filmstrip, heading bounds and round-trip scroll`, async ({ browser, browserName, baseURL }, info) => {
    test.skip(info.project.name !== target.project, `Run in ${target.project}.`);
    test.setTimeout(90_000);
    const context = await browser.newContext({ ...target.options, baseURL });
    try {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.locator("[data-hero-photo] img").evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      const directory = `test-results/115/${target.name}`;
      await mkdir(directory, { recursive: true });
      if (target.name === "desktop" || target.name === "iphone14") await reviewScreens(page, target.name);

      // Horizontal bounds catch clipped words; the filmstrip still needs a
      // human check for blank scenes, overlap and the approved B composition.
      for (const heading of await page.locator("main h1, main h2, main h3").all()) {
        expect(await heading.evaluate(node => {
          const box = node.getBoundingClientRect();
          return box.width > 0 && box.left >= 0 && box.right <= innerWidth + 1 && node.scrollWidth <= node.clientWidth + 1;
        })).toBe(true);
      }
      const bounds = await page.evaluate(() => ({ height: innerHeight, bottom: document.documentElement.scrollHeight - innerHeight }));
      const step = Math.max(1, Math.round(bounds.height * 0.4));
      const frames: Buffer[] = [];
      for (let top = 0; top < bounds.bottom + step; top += step) {
        await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), Math.min(top, bounds.bottom));
        await paint(page);
        await viewportImages(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
        frames.push(await page.screenshot({ path: `${directory}/scroll-${String(frames.length).padStart(2, "0")}.png`, animations: "disabled" }));
      }
      const tiles = await Promise.all(frames.map(frame => sharp(frame).resize({ width: 240 }).png().toBuffer()));
      const tileHeight = (await sharp(tiles[0]).metadata()).height!;
      await sharp({ create: { width: 240, height: tileHeight * tiles.length, channels: 3, background: "#FAF7F0" } })
        .composite(tiles.map((input, index) => ({ input, left: 0, top: tileHeight * index })))
        .jpeg({ quality: 80 }).toFile(`test-results/115/filmstrip-${target.name}.jpg`);

      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      // Mobile WebKit has no wheel API; its native scroll fallback is recorded
      // explicitly, not presented as synthesized iOS touch or physical Safari.
      const mobileWebKit = browserName === "webkit" && target.options.isMobile;
      for (const direction of [1, -1]) {
        for (let tick = 0; tick < Math.ceil(bounds.bottom / 120) + 30; tick++) {
          if (await page.evaluate(d => d > 0 ? scrollY + innerHeight >= document.documentElement.scrollHeight - 1 : scrollY <= 1, direction)) break;
          if (mobileWebKit) await page.evaluate(delta => scrollBy(0, delta), direction * 120);
          else await page.mouse.wheel(0, direction * 120);
          await paint(page);
        }
        if (direction > 0) await expect(page.getByRole("contentinfo").getByText("© 2026 AFİNA ZEYTİN", { exact: true })).toBeInViewport();
        else await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
      }

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      const hero = page.locator("[data-hero-intro]");
      await expect(hero.getByRole("button", { name: /Sepete ekle/ })).toBeEnabled();
      await expect(hero.locator("[data-hero-photo]")).toHaveCSS("transform", "none");
      for (const word of await hero.locator("[data-hero-word]").all()) {
        await expect(word).toHaveCSS("opacity", "1");
        await expect(word).toHaveCSS("transform", "none");
      }
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test("115: hero CTA is gold before hydration, after hydration and after press", async ({ browser, baseURL }, info) => {
  test.skip(!["chromium-1440", "webkit-iphone14"].includes(info.project.name), "Use desktop Chromium and iPhone WebKit.");
  await mkdir("test-results/115", { recursive: true });
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({
      ...(info.project.name === "webkit-iphone14" ? devices["iPhone 14"] : { viewport: { width: 1440, height: 900 } }),
      baseURL, javaScriptEnabled,
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      // The label changes to Eklendi after press; keep the same DOM target.
      const button = page.locator("[data-hero-intro] button");
      await expect(button).toHaveCSS("opacity", "1");
      await expect(button).toHaveCSS("background-color", "rgb(212, 180, 131)");
      if (javaScriptEnabled) await expect(button).toBeEnabled();
      else await expect(button).toBeDisabled();
      await page.mouse.move(0, 0);
      const capture = await button.screenshot({ path: `test-results/115/cta-${info.project.name}-${javaScriptEnabled ? "hydrated" : "ssr"}.png`, animations: "disabled", scale: "css" });
      const { height } = await sharp(capture).metadata();
      const pixel = await sharp(capture).extract({ left: 8, top: Math.floor(height! / 2), width: 1, height: 1 }).removeAlpha().raw().toBuffer();
      expect([...pixel]).toEqual([212, 180, 131]);
      if (javaScriptEnabled) {
        await button.click();
        await page.mouse.move(0, 0);
        await expect(page.locator("[data-hero-intro]").getByRole("status")).toContainText("sepete eklendi");
        await expect(button).toHaveCSS("opacity", "1");
        await expect(button).toHaveCSS("background-color", "rgb(212, 180, 131)");
        await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toHaveCount(0);
      }
    } finally { await context.close(); }
  }
});

test("115: hero → pantry → drawer → cart preserves both variants and checkout gate", async ({ page }, info) => {
  test.skip(!["chromium-1440", "webkit-iphone14"].includes(info.project.name), "Use desktop Chromium and iPhone WebKit.");
  await page.goto("/");
  await page.locator("[data-hero-intro]").getByRole("button", { name: /Sepete ekle/ }).click();
  await page.getByRole("link", { name: "Ürünleri gör", exact: true }).click();
  const family = page.locator('[data-pantry-family="dogal-kirma"]');
  await family.getByRole("radio", { name: "1 kg", exact: true }).click();
  await family.getByRole("button", { name: "Ekle", exact: true }).click();
  await expect(family.getByRole("status")).toContainText("sepete eklendi");
  const expected = [{ productId: "sample-green-olive-10kg", quantity: 1 }, { productId: "sample-green-olive-1kg", quantity: 1 }];
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Sepetim, 2 adet", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(drawer.getByRole("status", { name: "Adet" })).toHaveText(["1", "1"]);
  await drawer.getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  await expect(page.getByRole("main").getByRole("group", { name: "Doğal Kırma Yeşil Zeytin", exact: true })).toHaveCount(2);
  if (process.env.NEXT_PUBLIC_DEMO === "1") {
    await page.getByRole("main").getByRole("link", { name: "Ödemeye geç", exact: true }).click();
    await expect(page).toHaveURL(/\/odeme$/);
    await expect(page.getByRole("main").getByRole("complementary", { name: "Sipariş özeti" })).toContainText("Doğal Kırma Yeşil Zeytin");
    await expect(page.getByRole("main").getByLabel("Ad soyad", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole("main").getByRole("button", { name: "Ödemeye geç", exact: true })).toBeDisabled();
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
});

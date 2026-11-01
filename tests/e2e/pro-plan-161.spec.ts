import { expect, test, type Locator, type Page } from "@playwright/test";

const sections = ["baslangic", "uretim-yolculugu", "tesisimiz", "urunler", "toptan-iletisim", "teklif", "iletisim"];
const gallery = (page: Page) => page.locator("#urunler");
const lastProduct = (page: Page) => gallery(page).locator("[data-product-id]").last();
const isMovie = (url: string) => /\/videos\/[^?#]+\.mp4(?:\?|$)/.test(url);

async function painted(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function expectFullPoster(page: Page): Promise<void> {
  const hero = await page.locator("#baslangic [data-hero-visual]").boundingBox();
  const poster = await page.locator("#baslangic [data-cinematic-scrub] picture img").boundingBox();
  expect(hero).not.toBeNull(); expect(poster).not.toBeNull();
  for (const axis of ["x", "y", "width", "height"] as const) expect(Math.abs(hero![axis] - poster![axis])).toBeLessThanOrEqual(1);
  await expect(page.locator("#baslangic [data-cinematic-controls]")).toHaveCount(0);
}

async function galleryState(page: Page) {
  return gallery(page).evaluate(root => {
    const viewport = root.querySelector<HTMLElement>("[data-gallery-viewport]")!;
    const track = root.querySelector<HTMLElement>("[data-gallery-track]")!;
    const transform = getComputedStyle(track).transform;
    return {
      progress: Number.parseFloat(getComputedStyle(root).getPropertyValue("--sc-p") || "0"),
      x: transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41,
      travel: Math.max(0, track.scrollWidth - viewport.clientWidth),
      top: root.getBoundingClientRect().top + scrollY,
      range: root.getBoundingClientRect().height - innerHeight,
    };
  });
}

async function expectHorizontallyVisible(viewport: Locator, target: Locator): Promise<void> {
  const [windowBox, targetBox] = await Promise.all([viewport.boundingBox(), target.boundingBox()]);
  expect(windowBox).not.toBeNull(); expect(targetBox).not.toBeNull();
  expect(targetBox!.x).toBeGreaterThanOrEqual(windowBox!.x - 2);
  expect(targetBox!.x + targetBox!.width).toBeLessThanOrEqual(windowBox!.x + windowBox!.width + 2);
}

async function expectNaturalGallery(page: Page): Promise<void> {
  const root = gallery(page);
  await expect(root).toHaveAttribute("data-gallery-mode", "native");
  await expect(root.locator("[data-product-id]")).toHaveCount(6);
  const geometry = await root.evaluate(element => {
    const track = element.querySelector<HTMLElement>("[data-gallery-track]")!;
    return { section: element.getBoundingClientRect().height, content: track.getBoundingClientRect().height, viewport: innerHeight };
  });
  expect(geometry.section).toBeLessThan(Math.max(geometry.content + 400, geometry.viewport * 1.5));
  const target = lastProduct(page).getByRole("button", { name: /detayını aç$/ });
  await target.focus();
  await expect(target).toBeFocused();
  await expect(target).toBeInViewport();
  await expectHorizontallyVisible(root.locator("[data-gallery-viewport]"), lastProduct(page));
}

test("seven sourced sections retain real destinations and a complete compact-phone opening", async ({ page }) => {
  if (page.viewportSize()!.width < 768) await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main section[data-sc-scene]")).toHaveCount(7);
  expect(await page.locator("main section[data-sc-scene]").evaluateAll(nodes => nodes.map(node => node.id))).toEqual(sections);
  for (const id of sections) {
    const section = page.locator(`#${id}`);
    await expect(section).toHaveAttribute("data-21st-source", /^\d+$/);
    await expect(section).toHaveAttribute("data-sc-device", /\S/);
    await expect(section.getByRole("heading").first()).toBeAttached();
  }
  const opening = page.locator("#baslangic");
  const shop = opening.getByRole("link", { name: "Ürünleri Keşfet", exact: true });
  await expect(shop).toHaveAttribute("href", "#urunler");
  await expect(opening.getByRole("link", { name: "Kurumsal Teklif Al", exact: true })).toHaveAttribute("href", "#teklif");
  if (page.viewportSize()!.width < 768) {
    await expect(opening.getByRole("heading", { level: 1 })).toBeInViewport({ ratio: 1 });
    await expect(shop).toBeInViewport({ ratio: 1 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const first = gallery(page).locator("[data-product-id]").first();
  const image = await first.locator('button[aria-haspopup="dialog"]').first().boundingBox();
  const picture = await first.locator("picture").first().boundingBox();
  const name = await first.locator("h3").boundingBox();
  expect(picture!.y + picture!.height).toBeLessThanOrEqual(image!.y + image!.height + 1);
  expect(picture!.y + picture!.height).toBeLessThanOrEqual(name!.y);
  expect((await first.getByRole("button", { name: /^Teklife ekle/ }).boundingBox())!.height).toBeLessThanOrEqual(60);
});

test("desktop gallery follows linear scroll immediately, exposes the last focused SKU and releases the page", async ({ page }) => {
  test.skip(page.viewportSize()!.width < 1024, "Linear held gallery is a desktop enhancement.");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(gallery(page)).toHaveAttribute("data-gallery-mode", "scrub");
  await expect(gallery(page)).toHaveAttribute("data-sc-device", "pan");
  await expect(gallery(page)).toHaveAttribute("data-21st-source", "24623");
  const start = await galleryState(page);
  expect(start.travel).toBeGreaterThan(page.viewportSize()!.width * .5);
  expect(start.range).toBeGreaterThan(0);
  for (const progress of [0, .25, .5, .75, 1, .25]) {
    await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), start.top + start.range * progress);
    await painted(page);
    const current = await galleryState(page);
    expect(current.progress).toBeCloseTo(progress, 1);
    // Sample the first painted update, not eventual spring settling.
    expect(Math.abs(current.x + current.travel * current.progress)).toBeLessThanOrEqual(2);
  }
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), start.top);
  await painted(page);
  const target = lastProduct(page).getByRole("button", { name: /detayını aç$/ });
  await target.focus();
  await expect(target).toBeFocused();
  await expect.poll(async () => (await galleryState(page)).progress).toBeGreaterThan(.5);
  await expectHorizontallyVisible(gallery(page).locator("[data-gallery-viewport]"), lastProduct(page));
  await expect(target).toBeInViewport();
  await page.locator("#toptan-iletisim").scrollIntoViewIfNeeded();
  await expect(page.locator("#toptan-iletisim").getByRole("heading").first()).toBeInViewport();
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.getByRole("contentinfo")).toBeInViewport();
});

test("phone and tablet retain a native gallery without a desktop scroll-height tax", async ({ page }) => {
  test.skip(page.viewportSize()!.width >= 1024, "Native rail is the phone/tablet composition.");
  await page.goto("/", { waitUntil: "networkidle" });
  await expectNaturalGallery(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a motion preference change releases the gallery and resizing remeasures its real travel", async ({ page }) => {
  const width = page.viewportSize()!.width;
  test.skip(width < 1024, "Desktop enhancement transition.");
  await page.goto("/", { waitUntil: "networkidle" });
  const before = await galleryState(page);
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), before.top + before.range / 2);
  await painted(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectNaturalGallery(page);
  await expect(page.locator("#baslangic video")).not.toHaveAttribute("src");
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(gallery(page)).toHaveAttribute("data-gallery-mode", "scrub");
  const after = await galleryState(page);
  expect(Math.abs(after.travel - before.travel)).toBeGreaterThan(1);
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), after.top + after.range * .75);
  await painted(page);
  const sampled = await galleryState(page);
  expect(Math.abs(sampled.x + sampled.travel * sampled.progress)).toBeLessThanOrEqual(2);
  await gallery(page).locator("[data-gallery-viewport]").focus();
  await lastProduct(page).getByRole("button", { name: /detayını aç$/ }).focus();
  await painted(page);
  await expectHorizontallyVisible(gallery(page).locator("[data-gallery-viewport]"), lastProduct(page));
});

test("gallery SKU and business segment reach an actual, unsent email enquiry summary", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.method() === "POST") writes.push(request.url()); });
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>(resolve => { releaseScripts = resolve; });
  await page.route("**/_next/static/**/*.js", async route => { await scriptsReady; await route.continue(); });
  try {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const oneKg = gallery(page).locator('[data-product-id="sample-green-olive-1kg"]');
  const choose = oneKg.getByRole("button", { name: /^Teklife ekle/ });
  await expect(choose).toBeDisabled();
  releaseScripts();
  await expect(choose).toBeEnabled();
  await choose.focus();
  await choose.click();
  await expect(page).toHaveURL(/#teklif$/);
  const quote = page.locator("#teklif");
  const form = quote.getByRole("form");
  await expect(form.getByRole("combobox", { name: "İlgilendiğiniz ürün", exact: true })).toHaveValue("sample-green-olive-1kg");
  await page.locator("#toptan-iletisim").getByRole("button", { name: /Market.*bayi/i }).click();
  await expect(form.getByRole("combobox", { name: "İşletme türü", exact: true })).toHaveValue("retail");
  await form.getByRole("textbox", { name: "Adınız veya firma adı", exact: true }).fill("Yerel QA İşletmesi");
  await form.getByRole("textbox", { name: "Miktar", exact: true }).fill("24 kavanoz");
  await form.getByRole("textbox", { name: "Şehir", exact: true }).fill("Osmaniye");
  await form.getByRole("textbox", { name: "Telefon", exact: true }).fill("05320000000");
  await form.getByRole("checkbox", { name: /KVKK aydınlatma metnini/ }).check();
  await form.getByRole("button", { name: "Talep özetini hazırla", exact: true }).click();
  const mail = quote.getByRole("link", { name: "E-postayla gönder", exact: true });
  await expect(mail).toBeVisible();
  const uri = new URL((await mail.getAttribute("href"))!);
  expect(uri.protocol).toBe("mailto:");
  expect(uri.pathname).toBe("info@afina.com.tr");
  const body = uri.searchParams.get("body")!;
  for (const value of ["Yerel QA İşletmesi", "Doğal Kırma Yeşil Zeytin", "1 kg", "24 kavanoz", "Osmaniye", "05320000000"]) expect(body).toContain(value);
  expect(body).toMatch(/market|bayi/i);
  expect(body).not.toContain("10 kg");
  await expect(form).not.toContainText(/Talebiniz gönderildi/);
  await expect(quote.getByRole("region", { name: "Talep özeti", exact: true })).toContainText("Bu sayfa e-posta göndermedi.");
  expect(writes).toEqual([]);
  // Deliberately do not open the mail link: this is draft preparation, not delivery.
  } finally { releaseScripts(); }
});

test("reduced motion keeps six products reachable and never fetches a film", async ({ page }) => {
  const movies: string[] = [];
  page.on("request", request => { if (isMovie(request.url())) movies.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expectNaturalGallery(page);
  await expect(page.locator("#baslangic video")).not.toHaveAttribute("src");
  await expectFullPoster(page);
  await expect(page.locator("#baslangic h1")).toHaveText("Kökü toprakta. Yeri sofrada.");
  await page.locator("#iletisim").scrollIntoViewIfNeeded();
  await expect(page.locator("#iletisim")).toBeInViewport();
  expect(movies).toEqual([]);
});

test("data saver preserves the film poster without requesting a video", async ({ page }) => {
  const movies: string[] = [];
  page.on("request", request => { if (isMovie(request.url())) movies.push(request.url()); });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { configurable: true,
    value: { saveData: true, addEventListener() {}, removeEventListener() {} } }));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#baslangic video")).not.toHaveAttribute("src");
  await expectFullPoster(page);
  await expect(page.locator("#baslangic picture img").first()).toBeVisible();
  expect(movies).toEqual([]);
});

test("JavaScript-off keeps the native catalogue, anchors and safe form available", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL,
    viewport: testInfo.project.use.viewport ?? { width: 390, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("#baslangic h1")).toBeVisible();
    await expectFullPoster(page);
    await expect(page.locator("main section[data-sc-scene]")).toHaveCount(7);
    await expect(gallery(page)).toHaveAttribute("data-gallery-mode", "native");
    await expect(gallery(page).locator("[data-product-id]")).toHaveCount(6);
    const shop = page.locator("#baslangic").getByRole("link", { name: "Ürünleri Keşfet", exact: true });
    await shop.click();
    await expect(page).toHaveURL(/#urunler$/);
    const viewport = gallery(page).locator("[data-gallery-viewport]");
    await viewport.scrollIntoViewIfNeeded();
    await viewport.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    const finalTrigger = lastProduct(page).getByRole("button", { name: /detayını aç$/ });
    await expect(finalTrigger).toBeInViewport();
    await expectHorizontallyVisible(viewport, lastProduct(page));
    const form = page.locator("#teklif").getByRole("form");
    await expect(form).toHaveAttribute("method", "post");
    await expect(form.getByRole("button", { name: "Talep özetini hazırla", exact: true })).toBeDisabled();
  } finally { await context.close(); }
});

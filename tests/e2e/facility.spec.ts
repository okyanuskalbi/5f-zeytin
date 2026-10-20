import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";

const source = readFileSync(new URL("../../docs/referans/icerik.md", import.meta.url), "utf8");
const story = source.split("### Marka hikâyesi / detay sayfası tanıtımı\n\n")[1].split("\n\n###")[0].trim().split("\n\n");
const definition = source.split("### KISA MARKA TANIMI / WEB SİTESİ KARTI\n\n")[1].split("\n\n")[0];
const values = ["Ellek, Düziçi / Osmaniye", "Sofralık zeytin, salamura zeytin, zeytinyağı", "Perakende + toptan", "2021’den bu yana"];

async function expectContent(facility: Locator): Promise<void> {
  await expect(facility.getByRole("heading", { name: "Tesisimiz", level: 2, exact: true })).toBeVisible();
  await expect(facility.locator("[data-facility-lead]")).toHaveText(story[1]);
  await expect(facility.locator("[data-facility-definition]")).toHaveText(definition);
  await expect(facility.locator("dt")).toHaveText(["Konum", "Ürünler", "Satış", "Faaliyet"]);
  await expect(facility.locator("dd")).toHaveText(values);
  await expect(facility.getByRole("img", { name: "Osmaniye il sınırı ve Düziçi", exact: true })).toBeVisible();
  await expect(facility.locator("svg[role=img] path")).toHaveCount(1);
  await expect(facility.locator("svg[role=img] circle")).toHaveCount(1);
  await expect(facility).not.toContainText(/%\s*100\s*(organik|doğal)|sertifikalı|lider|ton kapasite/i);
}

async function expectTypography(facility: Locator): Promise<void> {
  await expect(facility.getByText(/görsel.*(yakında|hazırlanıyor)/i)).toHaveCount(0);
  await expect(facility.locator("img, picture, video, canvas, iframe, source, image")).toHaveCount(0);
  expect(await facility.locator("*").evaluateAll(nodes => nodes.some(node => /url\(/i.test(getComputedStyle(node).backgroundImage)))).toBe(false);
}

async function tabTo(page: Page, target: Locator, nextControl: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (await target.evaluate(node => node === document.activeElement)) return;
    await page.keyboard.press(nextControl);
  }
  await expect(target).toBeFocused();
}

test.beforeEach(async ({ baseURL }) => {
  if (!["localhost", "127.0.0.1"].includes(new URL(baseURL!).hostname)) throw new Error("Local checkout required.");
});

test("official copy, plate facts and map reflow without loading unapproved photos or uploading data", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const requests: { method: string; url: string }[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push({ method: request.method(), url: request.url() }));
  expect((await page.goto("/#tesisimiz"))?.status()).toBe(200);
  const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
  await expectContent(facility);
  await expectTypography(facility);
  await page.evaluate(() => document.fonts.ready);
  await facility.focus(); // Settles motion and starts the section's keyboard order.
  const metrics = await facility.evaluate(node => {
    const title = node.querySelector("h2")!;
    const lead = node.querySelector("[data-facility-lead]")!;
    const left = node.querySelector("[data-facility-typography]")!.getBoundingClientRect();
    const tile = node.querySelector("svg[role=img]")!.parentElement!.getBoundingClientRect();
    const mapBottom = node.querySelector("svg[role=img]")!.getBoundingClientRect().bottom;
    const mapLabelTop = node.querySelector("svg[role=img]")!.nextElementSibling!.getBoundingClientRect().top;
    const facts = node.querySelector("dl")!;
    return { width: innerWidth, fits: document.documentElement.scrollWidth <= innerWidth,
      titleLines: title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight),
      leadLines: lead.getBoundingClientRect().height / parseFloat(getComputedStyle(lead).lineHeight),
      leadSize: parseFloat(getComputedStyle(lead).fontSize),
      factsColumns: getComputedStyle(facts).gridTemplateColumns.split(" ").length,
      mapLabelGap: mapLabelTop - mapBottom,
      layout: { leftX: left.x, leftRight: left.right, rightX: tile.x, rightTop: tile.top, leftTop: left.top, leftBottom: left.bottom },
      minText: Math.min(...[...node.querySelectorAll("p,dt,dd,a")].map(el => parseFloat(getComputedStyle(el).fontSize))),
      headingFont: getComputedStyle(title).fontFamily, bodyFont: getComputedStyle(lead).fontFamily,
      gap: getComputedStyle(node.querySelector("dl")!).gap,
    };
  });
  await mkdir("test-results/093", { recursive: true });
  await writeFile(`test-results/093/${testInfo.project.name}-metrics.json`, JSON.stringify(metrics, null, 2));
  await writeFile(`test-results/093/${testInfo.project.name}-network.json`, JSON.stringify(requests, null, 2));
  // Preserve the actual viewport. Tall locator screenshots can resize WebKit
  // and move fixed header/stub layers into positions a phone never displays.
  await page.screenshot({ path: `test-results/093/${testInfo.project.name}-tesisimiz.png` });
  await facility.getByRole("img").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/093/${testInfo.project.name}-map-facts.png` });
  expect(metrics.fits).toBe(true);
  expect(metrics.titleLines).toBeLessThanOrEqual(2);
  expect(metrics.factsColumns).toBe(2);
  expect(metrics.mapLabelGap).toBeGreaterThanOrEqual(4);
  expect(metrics.minText).toBeGreaterThanOrEqual(13);
  if (metrics.width < 768) {
    expect(metrics.layout.rightTop).toBeGreaterThanOrEqual(metrics.layout.leftBottom);
    expect(metrics.leadSize).toBe(20);
  } else {
    expect(metrics.layout.rightX).toBeGreaterThan(metrics.layout.leftRight);
    expect(Math.abs(metrics.layout.rightTop - metrics.layout.leftTop)).toBeLessThan(1);
  }
  expect(requests.filter(r => r.method !== "GET" || !["localhost", "127.0.0.1"].includes(new URL(r.url).hostname))).toEqual([]);
  expect(requests.filter(r => /\/images\/(tesis|generated)\//.test(decodeURIComponent(r.url)))).toEqual([]);
  expect(errors).toEqual([]);
});

test("failed image requests preserve the full section and product action", async ({ page }) => {
  await page.route("**/*", route => route.request().resourceType() === "image" ? route.abort("failed") : route.continue());
  await page.goto("/#tesisimiz");
  const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
  await expectContent(facility);
  await expectTypography(facility);
  await facility.getByRole("link", { name: "Ürünlerimizi Keşfedin" }).click();
  await expect(page).toHaveURL(/#urunler$/);
  await expect(page.getByRole("heading", { name: "Ürünlerimiz", exact: true })).toBeInViewport();
});

test("the compact cart label never covers the facility copy, map or facts while scrolling", async ({ page }, testInfo) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 }));
  await page.goto("/");
  const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
  for (const selector of ["h2", "[data-facility-definition]", "dl", "dd:last-child"]) {
    await facility.locator(selector).first().evaluate(node => node.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => facility.evaluate(node => {
      const stub = document.querySelector<HTMLElement>('[data-hero-stub][data-visible="true"]');
      if (!stub || getComputedStyle(stub).visibility === "hidden") return [];
      const box = stub.getBoundingClientRect();
      return [...node.querySelectorAll("h2,p,dt,dd,a,svg[role=img]")].filter(el => {
        // Compare painted text lines, not the unused width of a block heading.
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = el.matches("svg") ? [el.getBoundingClientRect()] : [...range.getClientRects()];
        return rects.some(b => b.top < innerHeight && b.bottom > 0 && b.left < box.right && b.right > box.left && b.top < box.bottom && b.bottom > box.top);
      }).map(el => el.textContent?.slice(0, 45));
    })).toEqual([]);
    await mkdir("test-results/093", { recursive: true });
    await page.screenshot({ path: `test-results/093/${testInfo.project.name}-scroll-${selector.replace(/[^a-z]/g, "")}.png` });
  }
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`keyboard navigation reaches the section and both destinations with motion=${reducedMotion}`, async ({ page, browserName }, testInfo) => {
    const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Afina Zeytin ana sayfa" }).focus();
    const menu = page.getByRole("button", { name: "Menüyü aç" });
    const isMobile = await menu.isVisible();
    if (isMobile) { await tabTo(page, menu, nextControl); await page.keyboard.press("Enter"); }
    const nav = page.getByRole("navigation", { name: isMobile ? "Site navigasyonu" : "Ana navigasyon", exact: true });
    await tabTo(page, nav.getByRole("link", { name: "Tesisimiz", exact: true }), nextControl);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#tesisimiz$/);
    const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
    await expectContent(facility);
    await expect(facility.getByRole("heading", { name: "Tesisimiz", exact: true })).toBeInViewport();
    const headerBottom = await page.locator("header").evaluate(node => node.getBoundingClientRect().bottom);
    expect(await facility.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
    await facility.focus();
    const product = facility.getByRole("link", { name: "Ürünlerimizi Keşfedin" });
    await page.keyboard.press(nextControl);
    await expect(product).toBeFocused();
    expect(await product.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe("none");
    for (const link of await facility.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(Math.round(box!.height * 1000) / 1000).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
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
      expect(await facility.evaluate(node => [node, ...node.querySelectorAll("*")].every(el => {
        const s = getComputedStyle(el);
        return s.transform === "none" && s.opacity === "1" && s.animationName === "none";
      }))).toBe(true);
      await mkdir("test-results/093", { recursive: true });
      await page.screenshot({ path: `test-results/093/${testInfo.project.name}-reduced.png` });
    }
  });
}

test("server-rendered copy, region and onward actions work without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto("/#tesisimiz");
    const facility = page.getByRole("region", { name: "Tesisimiz", exact: true });
    await expectContent(facility);
    await expectTypography(facility);
    await facility.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" }).click();
    await expect(page).toHaveURL(/#toptan-iletisim$/);
    await expect(page.getByRole("heading", { name: "Toptan satış", exact: true })).toBeInViewport();
  } finally { await context.close(); }
});

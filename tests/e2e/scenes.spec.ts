import { fileURLToPath } from "node:url";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { build } from "vite";

let assets: Map<string, string | Buffer>;
let html: string;
type Sample = { scene: string; y: number };
type SceneWindow = Window & { sceneSamples: Sample[] };
const sceneLayers = "[data-scene-reveal]";

test.beforeAll(async () => {
  const target = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3004");
  if (!["localhost", "127.0.0.1"].includes(target.hostname)) {
    throw new Error("Scene fixtures require this local checkout.");
  }
  const root = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
  // Reuse the existing HTML shell. Compile the real Home with boundary data
  // in memory, without adding an application route or changing its data source.
  const result = await build({
    configFile: false, root, base: "/__scenes-fixture/", publicDir: false, logLevel: "error",
    resolve: { alias: { "@": root } },
    plugins: [{
      name: "scene-boundary-fixture", enforce: "pre",
      // Next's CommonJS image entry nests its default outside the Next compiler.
      // Keep the real image implementation in this Vite-only boundary fixture.
      resolveId(id) { if (id === "next/image") return "\0scene-next-image"; },
      load(id) { if (id === "\0scene-next-image") return 'export { Image as default } from "next/dist/client/image-component"; export { getImageProps } from "next/dist/shared/lib/image-external";'; },
      transform(_code, id) {
        if (id === `${root}/tests/e2e/fixtures/product-card.tsx`) return `
          import { createRoot } from "react-dom/client";
          import Home from "../../../app/page";
          import "../../../app/globals.css";
          void Home().then(element => createRoot(document.getElementById("root")).render(element));
        `;
        if (id === `${root}/lib/catalog/static-products.ts`) return `
          export async function getProducts() {
            const count = Number(new URLSearchParams(location.search).get("count") ?? 7);
            return Array.from({ length: count }, (_, index) => ({
              id: "boundary-" + index, name: "Sınır ürünü " + (index + 1),
              category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 3,
            }));
          }
        `;
      },
    }],
    build: { write: false, rollupOptions: { input: fileURLToPath(new URL("fixtures/product-card.html", import.meta.url)) } },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle)) throw new Error("Expected a completed scene fixture bundle.");
  assets = new Map(bundle.output.map((entry) => [entry.fileName,
    entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source),
  ]));
  html = [...assets.keys()].find((name) => name.endsWith("product-card.html"))!;
});

test.beforeEach(async ({ page, baseURL }, testInfo) => {
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 8 });
    const samples: Sample[] = [];
    Object.assign(window, { sceneSamples: samples });
    function sample(): void {
      for (const node of document.querySelectorAll("[data-scene-reveal], [data-facility-enter]")) {
        const y = new DOMMatrixReadOnly(getComputedStyle(node).transform).m42;
        if (Math.abs(y) > 0.05) samples.push({ scene: (node.closest("[data-scene]")?.getAttribute("data-scene") ?? "faq"), y });
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
});

async function samples(page: Page): Promise<Sample[]> {
  return page.evaluate(() => (window as unknown as SceneWindow).sceneSamples);
}

async function reveal(element: Locator): Promise<void> {
  await element.evaluate((node) => node.scrollIntoView({ block: "center" }));
}

async function expectStatic(layers: Locator): Promise<void> {
  await expect.poll(() => layers.evaluateAll((nodes) => nodes.flatMap((node) => {
    const style = getComputedStyle(node);
    return new DOMMatrixReadOnly(style.transform).m42 === 0 && style.opacity === "1"
      ? [] : [{ element: node.outerHTML.slice(0, 180), transform: style.transform, opacity: style.opacity }];
  }))).toEqual([]);
}

async function expectFlow(page: Page): Promise<void> {
  await expect(page.locator("[data-scene-flow]")).toHaveCount(1);
  expect(await page.locator("[data-scene]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-scene"))))
    .toEqual(["hero", "products", "story", "moments", "wholesale"]);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "Kökü toprakta. Yeri sofrada." })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Tesisimiz", exact: true })).toContainText("Afina Zeytin, Osmaniye’deki fabrikasıyla");
  await expect(page.getByRole("region", { name: "Ürünlerimiz", exact: true }).getByRole("article")).toHaveCount(3);
  await expect(page.locator('img[src*="/images/generated/"]')).toHaveCount(0);
  await expect(page.locator('[data-scene="hero"] img[src="/images/hero/zeytinlik-2400.webp"]')).toBeVisible();
  await expect(page.locator('[data-scene]:not([data-scene="hero"]) canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("landing composes ordered hero, story and product scenes with visible SSR content", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  expect((await page.goto("/"))?.status()).toBe(200);
  await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
  await expectFlow(page);
  const cards = page.locator("#urunler article");
  expect(await cards.locator("h3").allTextContents()).toEqual(["Sofralık Zeytin", "Salamura Zeytin", "Zeytinyağı"]);
  await expect(cards.first().getByText("125,50 ₺", { exact: true })).toBeVisible();
  await expect(cards.first().getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
  await expect(cards.nth(1).getByText("Tükendi", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("scenes.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("scene entrances follow native scroll once, without moving product controls twice", async ({ page }) => {
  await page.goto("/");
  await expectFlow(page);
  const catalogBefore = await page.locator("#urunler article").allTextContents();
  for (const scene of ["story", "products", "wholesale"]) {
    const layer = page.locator(`[data-scene="${scene}"] ${scene === "story" ? "[data-facility-enter]" : sceneLayers}`).first();
    await expect(layer).toHaveCount(1);
    await reveal(layer);
    await expect.poll(async () => (await samples(page)).some((entry) => entry.scene === scene)).toBe(true);
    await expectStatic(layer);
  }
  expect((await samples(page)).every(({ y }) => y >= 0 && y <= 16)).toBe(true);
  expect(await page.locator("#urunler article").allTextContents()).toEqual(catalogBefore);
  await expect(page.locator(`${sceneLayers} article, ${sceneLayers} button, ${sceneLayers} input`)).toHaveCount(0);
  // Finish newly encountered FAQ layers before recording a re-entry. Their
  // first entrance is independent of whether story/products have entered once.
  await expectStatic(page.locator(sceneLayers));
  await page.evaluate(() => { (window as unknown as SceneWindow).sceneSamples.length = 0; scrollTo(0, 0); });
  await reveal(page.locator('[data-scene="story"]'));
  await page.evaluate(() => new Promise<void>((resolve) => {
    let frames = 12;
    const tick = (): void => { if (--frames === 0) resolve(); else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  expect(await samples(page)).toEqual([]);
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    await page.evaluate(() => scrollBy(0, 240));
  } else {
    await page.mouse.wheel(0, 240);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("[data-scene-flow]")).toHaveCSS("touch-action", "auto");
});

test("keyboard and reduced motion keep scene links, quantity and native scrolling usable", async ({ page, browserName }, testInfo) => {
  const tab = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await expectFlow(page);
    const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
    const discover = hero.getByRole("link", { name: "Ürünleri keşfet", exact: true });
    const wholesale = page.locator("#tesisimiz").getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true });
    await wholesale.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#toptan-iletisim")).toBeFocused();
    await expect(page.locator("#toptan-iletisim")).toBeInViewport();
    await page.evaluate(() => scrollTo(0, 0));
    await discover.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#urunler")).toBeFocused();
    const quantity = page.locator("#urunler article").first().getByRole("spinbutton");
    await quantity.focus();
    await expect(quantity).toBeFocused();
    await page.keyboard.press(tab);
    await expect(page.locator("#urunler article").first().getByRole("button", { name: "Adedi artır" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(quantity).toHaveValue("2");
    await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); scrollTo(0, 0); });
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    if (reducedMotion === "reduce") {
      await expectStatic(page.locator(`${sceneLayers}, [data-product-card-motion], [data-hero-motion]`));
      expect(await samples(page)).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath("scenes-reduced.png"), fullPage: true });
    }
  }
});

test("changing motion preference during a scene entrance immediately restores a static flow", async ({ page }) => {
  await page.goto("/");
  const story = page.locator('[data-scene="story"]');
  await reveal(story);
  await expect.poll(async () => (await samples(page)).some(({ scene }) => scene === "story")).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStatic(page.locator(`${sceneLayers}, [data-product-card-motion], [data-hero-motion]`));
  await page.evaluate(() => { (window as unknown as SceneWindow).sceneSamples.length = 0; scrollTo(0, 0); });
  await reveal(page.locator("#urunler"));
  await expectStatic(page.locator(sceneLayers));
  expect(await samples(page)).toEqual([]);
  await expectFlow(page);
});

test("failed observer and failed JavaScript preserve all scenes and anchor navigation", async ({ page }) => {
  for (const failure of ["observer", "script"]) {
    if (failure === "observer") {
      await page.addInitScript(() => {
        window.IntersectionObserver = class { constructor() { throw new Error("Observer unavailable"); } } as unknown as typeof IntersectionObserver;
      });
    } else {
      await page.route("**/*", (route) => route.request().resourceType() === "script" ? route.abort() : route.continue());
    }
    await page.goto("/");
    await expectFlow(page);
    await expectStatic(page.locator(sceneLayers));
    const discover = page.getByRole("region", { name: "Afina Zeytin", exact: true })
      .getByRole("link", { name: "Ürünleri keşfet", exact: true });
    await discover.click();
    await expect(page.locator("#urunler")).toBeInViewport();
    await expect(page.locator("#urunler article").first().getByRole("button", { name: "Sepete ekle", exact: true })).toBeVisible();
  }
});

test("JavaScript-disabled SSR includes every scene and both CTA destinations", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expectFlow(page);
    await expectStatic(page.locator(sceneLayers));
    const hero = page.getByRole("region", { name: "Afina Zeytin", exact: true });
    for (const [name, id] of [["Ürünleri keşfet", "urunler"], ["Toptan Satış İçin İletişime Geçin", "toptan-iletisim"]]) {
      await (id === "urunler" ? hero : page.locator("#tesisimiz")).getByRole("link", { name, exact: true }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  } finally {
    await context.close();
  }
});

test("low-end touch devices keep scenes static and quantity controls at least 44px", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ hasTouch: true, viewport: testInfo.project.use.viewport });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 4 });
    });
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL!).href);
    await expectFlow(page);
    await page.getByRole("region", { name: "Afina Zeytin", exact: true })
      .getByRole("link", { name: "Ürünleri keşfet", exact: true }).tap();
    const card = page.locator("#urunler article").first();
    const increase = card.getByRole("button", { name: "Adedi artır" });
    await increase.tap();
    await expect(card.getByRole("spinbutton")).toHaveValue("2");
    const box = (await increase.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expectStatic(page.locator(`${sceneLayers}, [data-product-card-motion], [data-hero-motion]`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});

test("the composed Home caps seven supplied products at six and keeps an empty catalog navigable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.stack ?? error.message));
  await page.route("**/__scenes-fixture/**", async (route) => {
    const name = new URL(route.request().url()).pathname.replace("/__scenes-fixture/", "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown scene fixture asset", contentType:
      name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
  await page.goto("/__scenes-fixture/?count=7");
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  await expect(page.locator("[data-scene-flow]")).toHaveCount(1);
  await expect(page.locator("#urunler article")).toHaveCount(6);
  expect(await page.locator("#urunler article h3").allTextContents()).toEqual(Array.from({ length: 6 }, (_, i) => `Sınır ürünü ${i + 1}`));
  await expect(page.getByText("Sınır ürünü 7", { exact: true })).toHaveCount(0);
  await page.goto("/__scenes-fixture/?count=0");
  await expect(page.locator("#urunler article")).toHaveCount(0);
  await expect(page.locator("#urunler").getByRole("status")).toHaveText("Görüntülenecek ürün bulunmuyor.");
  await page.locator("#tesisimiz").getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true }).click();
  await expect(page.locator("#toptan-iletisim")).toBeInViewport();
});

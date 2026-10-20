import { fileURLToPath } from "node:url";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { build } from "vite";

let assets: Map<string, string | Buffer>;
let html: string;
type MotionWindow = Window & { cardSamples: { name: string; y: number }[] };

test.beforeAll(async () => {
  if (process.env.PLAYWRIGHT_BASE_URL !== undefined) {
    throw new Error("Card motion fixtures require the local checkout; unset PLAYWRIGHT_BASE_URL.");
  }
  const root = fileURLToPath(new URL("../..", import.meta.url));
  // Reuse Task 030's real-component fixture; no application test route or server.
  const result = await build({
    configFile: false, root, base: "/__card-motion-fixture/", publicDir: false, logLevel: "error",
    resolve: { alias: { "@": root } },
    build: { write: false, rollupOptions: { input: fileURLToPath(new URL("fixtures/product-card.html", import.meta.url)) } },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle)) throw new Error("Expected a completed fixture bundle.");
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
    const samples: { name: string; y: number }[] = [];
    Object.assign(window, { cardSamples: samples });
    function sample(): void {
      for (const node of document.querySelectorAll("[data-product-card-motion]")) {
        const y = new DOMMatrixReadOnly(getComputedStyle(node).transform).m42;
        if (Math.abs(y) > 0.05) samples.push({ name: node.querySelector("h3")?.textContent ?? "", y });
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.route("**/__card-motion-fixture/**", async (route) => {
    const name = new URL(route.request().url()).pathname.replace("/__card-motion-fixture/", "") || html;
    let body = assets.get(name);
    // Put existing fixture cards below the fold to exercise scroll entry reliably.
    if (typeof body === "string" && name.endsWith(".html")) {
      body = body.replace("</head>", "<style>main{padding-top:110vh!important}</style></head>");
    }
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType:
      name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
});

function layer(card: Locator): Locator {
  return card.locator("..");
}

async function translateY(element: Locator): Promise<number> {
  return element.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42);
}

async function reveal(card: Locator): Promise<void> {
  await card.evaluate((node) => node.scrollIntoView({ block: "center" }));
}

async function samples(page: Page): Promise<{ name: string; y: number }[]> {
  return page.evaluate(() => (window as unknown as MotionWindow).cardSamples);
}

async function expectStatic(card: Locator): Promise<void> {
  await expect(layer(card)).toHaveAttribute("data-product-card-motion", "");
  await expect.poll(() => translateY(layer(card))).toBe(0);
  await expect(layer(card)).toHaveCSS("opacity", "1");
}

test("each landing product enters once on scroll, preserving catalog data and visible actions", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  expect((await page.goto("/"))?.status()).toBe(200);
  await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
  const catalog = page.getByRole("region", { name: "Ürünlerimiz", exact: true });
  const cards = catalog.getByRole("article");
  await expect(cards).toHaveCount(3);
  const before = await cards.allTextContents();
  for (const name of ["Sofralık Zeytin", "Salamura Zeytin", "Zeytinyağı"]) {
    const card = catalog.getByRole("article", { name, exact: true });
    await expect(layer(card)).toHaveAttribute("data-product-card-motion", "");
    await reveal(card);
    await expect.poll(async () => (await samples(page)).some((entry) => entry.name === name && entry.y > 0.05)).toBe(true);
    await expectStatic(card);
    await expect(card.getByRole("button", { name: "Sepete ekle", exact: true })).toBeVisible();
  }
  expect(await cards.allTextContents()).toEqual(before);
  expect((await samples(page)).every(({ y }) => y >= 0 && y <= 16)).toBe(true);
  await page.evaluate(() => { (window as unknown as MotionWindow).cardSamples.length = 0; scrollTo(0, 0); });
  await expect(cards.first()).not.toBeInViewport();
  await reveal(cards.first());
  await expect(cards.first()).toBeInViewport();
  // Observe several frames after re-entry, rather than an assertion before IO delivery.
  await page.evaluate(() => new Promise<void>((resolve) => {
    let remaining = 8;
    function frame(): void { if (--remaining === 0) resolve(); else requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }));
  expect(await samples(page)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("card-motion-catalog.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("scroll preserves quantity and callback error/retry, loading, empty and sold-out states", async ({ page }) => {
  const submissions: { productId: string; quantity: number }[] = [];
  await page.route("**/__product-card-action", async (route) => {
    submissions.push(route.request().postDataJSON());
    await route.fulfill({ status: submissions.length === 1 ? 503 : 200, contentType: "application/json", body: "{}" });
  });
  await page.goto("/__card-motion-fixture/");
  const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
  await expectStatic(card);
  await expect(card).not.toBeInViewport();
  await reveal(card);
  await expect.poll(async () => (await samples(page)).some(({ name }) => name === "Sofralık Zeytin")).toBe(true);
  const quantity = card.getByRole("spinbutton");
  await quantity.fill("2");
  await expectStatic(card);
  const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
  await add.click();
  await expect(card.getByRole("alert")).toHaveText("Ürün sepete eklenemedi. Tekrar deneyin.");
  await page.evaluate(() => scrollTo(0, 0));
  await reveal(card);
  await expect(quantity).toHaveValue("2");
  await add.click();
  await expect(card.getByRole("status")).toHaveText("2 adet ürün sepete eklendi.");
  expect(submissions).toEqual(Array(2).fill({ productId: "fixture-olive", quantity: 2 }));
  const soldOut = page.getByRole("article", { name: "Salamura Zeytin", exact: true });
  await reveal(soldOut);
  await expect(soldOut.getByText("Tükendi", { exact: true })).toBeVisible();
  await expect(soldOut.getByRole("button", { name: "Sepete ekle", exact: true })).toBeDisabled();
  await expect(page.getByRole("status", { name: "Ürün yükleniyor" })).toHaveAttribute("aria-busy", "true");
  await expect(page.getByText("Görüntülenecek ürün bulunmuyor.", { exact: true })).toBeVisible();
});

test("keyboard and reduced motion keep controls static, focused and operable", async ({ page, browserName }, testInfo) => {
  await page.route("**/__product-card-action", (route) => route.fulfill({ status: 200, body: "{}" }));
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/__card-motion-fixture/");
    const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
    const quantity = card.getByRole("spinbutton");
    // Tab directly into an offscreen card: focus must suppress its entrance.
    await page.keyboard.press(nextControl);
    await expect(quantity).toBeFocused();
    await expectStatic(card);
    await page.keyboard.press(nextControl);
    await expect(card.getByRole("button", { name: "Adedi artır" })).toBeFocused();
    await page.keyboard.press(nextControl);
    const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
    await expect(add).toBeFocused();
    await expect(add).toBeInViewport();
    expect(await add.evaluate((node) => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Enter");
    await expect(card.getByRole("status")).toHaveText("1 adet ürün sepete eklendi.");
    const soldOut = page.getByRole("article", { name: "Salamura Zeytin", exact: true });
    await reveal(soldOut);
    await reveal(card);
    await expectStatic(card);
    if (reducedMotion === "reduce") {
      await expectStatic(soldOut);
      expect(await samples(page)).toEqual([]);
      expect(await layer(card).evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath("card-motion-reduced-keyboard.png"), fullPage: true });
    }
  }
});

test("changing the preference stops an active entrance immediately and does not replay it", async ({ page }) => {
  await page.goto("/__card-motion-fixture/");
  const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
  await reveal(card);
  await expect.poll(() => translateY(layer(card))).toBeGreaterThan(0.05);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStatic(card);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => { (window as unknown as MotionWindow).cardSamples.length = 0; scrollTo(0, 0); });
  await reveal(card);
  await expectStatic(card);
  expect(await samples(page)).toEqual([]);
});

test("touch taps preserve native scroll, quantity and a visible purchase action", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ hasTouch: true, reducedMotion: "no-preference", viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    // Reuse the fixture routes installed on the test page in this touch context.
    await page.route("**/__card-motion-fixture/**", async (route) => {
      const name = new URL(route.request().url()).pathname.replace("/__card-motion-fixture/", "") || html;
      await route.fulfill({ status: 200, body: assets.get(name)!, contentType:
        name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
    await page.route("**/__product-card-action", (route) => route.fulfill({ status: 200, body: "{}" }));
    await page.goto(new URL("/__card-motion-fixture/", baseURL!).href);
    const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
    const increase = card.getByRole("button", { name: "Adedi artır" });
    await increase.tap();
    await expect(card.getByRole("spinbutton")).toHaveValue("2");
    await expectStatic(card);
    const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
    await add.tap();
    await expect(card.getByRole("status")).toHaveText("2 adet ürün sepete eklendi.");
    for (const control of await card.locator("button, input").all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});

test("low-end hardware and unavailable animation APIs leave readable static cards", async ({ page }) => {
  for (const mode of ["low-end", "observer-failure"] as const) {
    await page.addInitScript((mode) => {
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => mode === "low-end" ? 4 : 8 });
      if (mode === "observer-failure") {
        window.IntersectionObserver = class { constructor() { throw new Error("Unavailable animation API"); } } as unknown as typeof IntersectionObserver;
      }
    }, mode);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/__card-motion-fixture/");
    const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
    await reveal(card);
    await expectStatic(card);
    await expect(card.getByRole("button", { name: "Sepete ekle", exact: true })).toBeVisible();
    expect(await samples(page)).toEqual([]);
    expect(errors).toEqual([]);
  }
});

test("failed JavaScript leaves server-rendered catalog content and actions visible", async ({ page }) => {
  const failedScripts: string[] = [];
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") {
      failedScripts.push(route.request().url());
      await route.abort();
    } else await route.continue();
  });
  await page.goto("/");
  expect(failedScripts.length).toBeGreaterThan(0);
  const cards = page.getByRole("region", { name: "Ürünlerimiz", exact: true }).getByRole("article");
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await reveal(card);
    await expectStatic(card);
    await expect(card.getByRole("heading")).toBeVisible();
    await expect(card.getByRole("button", { name: "Sepete ekle", exact: true })).toBeVisible();
  }
});

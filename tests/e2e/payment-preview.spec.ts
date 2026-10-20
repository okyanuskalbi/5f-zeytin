import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { build } from "vite";

const warning = "Test anahtarı eksik — .env.local'e ekleyin";
const resultWarning = "Önizleme yönlendirme sonucu, ödeme teyidi değildir.";
const iframeUrl = "https://www.paytr.com/odeme/guvenli/mocktoken123";
const resizerUrl = "https://www.paytr.com/js/iframeResizer.min.js";
const resizer = `window.iFrameResize = function(options, frame) {
  window.__resizerOrigin = options.checkOrigin;
  frame.style.height = '720px';
  frame.iFrameResizer = {removeListeners: function() {window.__resizerRemoved = true;}};
};`;

test("credential-free dev route shows the exact warning without token or PayTR requests", async ({ page, baseURL, request }, testInfo) => {
  const target = new URL(baseURL!);
  expect(["localhost", "127.0.0.1"]).toContain(target.hostname);
  testInfo.annotations.push({ type: "target-host", description: target.host });
  const paymentRequests: string[] = [];
  page.on("request", (req) => { if (/paytr-token|paytr\.com/.test(req.url())) paymentRequests.push(req.url()); });
  const response = await page.goto("/odeme-onizleme");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
  await expect(page.getByRole("alert")).toHaveText(warning);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Test ekranını aç" })).toHaveCount(0);
  await expect(page.locator("main input")).toHaveCount(0);
  expect(paymentRequests).toEqual([]);
  const token = await request.post("/api/odeme-onizleme/paytr-token", { headers: { Origin: target.origin } });
  expect(token.status()).toBe(503);
  expect((await token.json()).error.message).toBe(warning);
});

test("ok and fail query strings never confirm a payment", async ({ page }) => {
  for (const status of ["ok", "fail"]) {
    const response = await page.goto(`/odeme-onizleme/sonuc/${status}?paid=true&status=success&amount=999999`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("status")).toHaveText(resultWarning);
    await expect(page.getByText("Bu dönüş sipariş durumunu değiştirmez.")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Önizlemeye dön" })).toHaveAttribute("href", "/odeme-onizleme");
  }
});

test.describe("mock PayTR component", () => {
  let assets: Map<string, string | Buffer>;
  let html: string;
  test.beforeAll(async ({ baseURL }) => {
    if (!["localhost", "127.0.0.1"].includes(new URL(baseURL!).hostname)) throw new Error("Payment fixtures require a local dev server.");
    const root = fileURLToPath(new URL("../..", import.meta.url));
    const result = await build({ configFile: false, root, base: "/__payment-preview-fixture/", publicDir: false, logLevel: "error",
      resolve: { alias: { "@": root } }, build: { write: false,
        rollupOptions: { input: fileURLToPath(new URL("fixtures/payment-preview.html", import.meta.url)) } } });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed fixture bundle.");
    assets = new Map(bundle.output.map((entry) => [entry.fileName,
      entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    html = [...assets.keys()].find((name) => name.endsWith("payment-preview.html"))!;
  });
  test.beforeEach(async ({ page }) => {
    await page.route("**/__payment-preview-fixture/**", async (route) => {
      const name = new URL(route.request().url()).pathname.replace("/__payment-preview-fixture/", "") || html;
      const body = assets.get(name);
      await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown asset",
        contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
    await page.route("**/api/odeme-onizleme/paytr-token", (route) => route.fulfill({ json: { iframeUrl, token: "mocktoken123" } }));
    await page.route(resizerUrl, (route) => route.fulfill({ contentType: "application/javascript", body: resizer }));
    await page.route(iframeUrl, (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body><p>Mock PayTR test frame</p></body></html>" }));
  });

  test("mock token renders the PayTR URL and applies iframeResizer", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route("**/api/odeme-onizleme/paytr-token", async (route) => {
      await gate;
      expect(route.request().postData()).toBeNull();
      await route.fulfill({ json: { iframeUrl, token: "mocktoken123" } });
    });
    await page.goto("/__payment-preview-fixture/");
    await page.getByRole("button", { name: "Test ekranını aç" }).click();
    await expect(page.getByRole("status")).toHaveText("Test oturumu hazırlanıyor…");
    release();
    await expect(page.locator("iframe")).toHaveAttribute("src", iframeUrl);
    await expect(page.getByRole("status")).toContainText("çerçevesi yüklendi");
    await expect(page.locator("iframe")).toHaveCSS("height", "720px");
    expect(await page.evaluate(() => (window as unknown as { __resizerOrigin: string[] }).__resizerOrigin)).toEqual(["https://www.paytr.com"]);
    await expect(page.locator("main input")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("provider error can be retried with the keyboard and reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    let calls = 0;
    await page.route("**/api/odeme-onizleme/paytr-token", (route) => {
      calls++;
      return route.fulfill(calls === 1 ? { status: 502, json: { error: { message: "secret upstream reason" } } } : { json: { iframeUrl, token: "mocktoken123" } });
    });
    await page.goto("/__payment-preview-fixture/");
    const open = page.getByRole("button", { name: "Test ekranını aç" });
    await open.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert")).toContainText("açılamadı");
    await expect(page.getByRole("alert")).not.toContainText("secret");
    const retry = page.getByRole("button", { name: "Yeniden dene" });
    await retry.focus();
    expect(await retry.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("çerçevesi yüklendi");
    expect(calls).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("a stalled resizer still times out when the iframe has already loaded", async ({ page }) => {
    await page.clock.install();
    await page.route(resizerUrl, () => new Promise<void>(() => {}));
    await page.goto("/__payment-preview-fixture/");
    await page.getByRole("button", { name: "Test ekranını aç" }).click();
    await expect(page.frameLocator("iframe").getByText("Mock PayTR test frame")).toBeVisible();
    await page.clock.fastForward(15_001);
    await expect(page.getByRole("alert")).toContainText("yüklenemedi");
    await expect(page.getByRole("button", { name: "Yeniden dene" })).toBeEnabled();
  });

  test("iframe failure removes the resizer listeners and allows retry", async ({ page }) => {
    await page.goto("/__payment-preview-fixture/");
    await page.getByRole("button", { name: "Test ekranını aç" }).click();
    await expect(page.locator("iframe")).toHaveCSS("height", "720px");
    await page.locator("iframe").dispatchEvent("error");
    await expect(page.getByRole("alert")).toContainText("yüklenemedi");
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.locator(`script[src="${resizerUrl}"]`)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __resizerRemoved: boolean }).__resizerRemoved)).toBe(true);
    await page.getByRole("button", { name: "Yeniden dene" }).click();
    await expect(page.getByRole("status")).toContainText("çerçevesi yüklendi");
  });

  test("an unexpected iframe origin is rejected before embedding", async ({ page }) => {
    await page.route("**/api/odeme-onizleme/paytr-token", (route) => route.fulfill({ json: { iframeUrl: "https://attacker.invalid/", token: "mocktoken123" } }));
    await page.goto("/__payment-preview-fixture/");
    await page.getByRole("button", { name: "Test ekranını aç" }).click();
    await expect(page.getByRole("alert")).toContainText("açılamadı");
    await expect(page.locator("iframe")).toHaveCount(0);
  });
});

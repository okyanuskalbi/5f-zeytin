import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { build } from "vite";

let assets: Map<string, string | Buffer>;
let html: string;

// Use the existing local component-fixture pattern; no public test route/server.
test.beforeAll(async () => {
  if (process.env.PLAYWRIGHT_BASE_URL !== undefined) {
    throw new Error("Product card fixtures require the local checkout; unset PLAYWRIGHT_BASE_URL.");
  }
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const result = await build({
    configFile: false, root, base: "/__product-card-fixture/", publicDir: false, logLevel: "error",
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

test("product cards: catalog, quantity limits, pending/error/retry, empty, stock, keyboard and reduced motion", async ({ page, baseURL, browserName }, testInfo) => {
  const errors: string[] = [];
  const mediaRequests: string[] = [];
  const submissions: { productId: string; quantity: number }[] = [];
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.resourceType() === "image") mediaRequests.push(request.url()); });
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });

  await test.step("real landing reads the static catalog and keeps unconnected cart actions honest", async () => {
    expect((await page.goto("/"))?.status()).toBe(200);
    await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
    const catalog = page.getByRole("region", { name: "Ürünlerimiz", exact: true });
    const cards = catalog.getByRole("article");
    await expect(cards).toHaveCount(3);
    for (const name of ["Sofralık Zeytin", "Salamura Zeytin", "Zeytinyağı"]) {
      await expect(catalog.getByRole("article", { name, exact: true })).toBeVisible();
    }
    await expect(cards.first().getByText("500 g", { exact: true })).toBeVisible();
    await expect(cards.first().getByText("125,50 ₺", { exact: true })).toBeVisible();
    await expect(cards.first().getByRole("button", { name: "Sepete ekle", exact: true })).toBeDisabled();
    await expect(cards.first().getByText("Sepete ekleme henüz kullanıma açık değil.")).toBeVisible();
    await expect(catalog.getByText(/%100 organik|%100 doğal|temsili/i)).toHaveCount(0);
    await expect(catalog.getByRole("img")).toHaveCount(0);
    expect(mediaRequests.some((url) => url.includes("/images/generated/"))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("product-catalog.png"), fullPage: true });
  });

  await page.route("**/__product-card-fixture/**", async (route) => {
    const name = new URL(route.request().url()).pathname.replace("/__product-card-fixture/", "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType:
      name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
  let release: (() => void) | undefined;
  let reject = false;
  await page.route("**/__product-card-action", async (route) => {
    submissions.push(route.request().postDataJSON());
    await new Promise<void>((resolve) => { release = resolve; });
    await route.fulfill({ status: reject ? 503 : 200, body: "{}", contentType: "application/json" });
  });
  await page.goto("/__product-card-fixture/");
  const card = page.getByRole("article", { name: "Sofralık Zeytin", exact: true });
  const quantity = card.getByRole("spinbutton", { name: "Adet", exact: true });
  const add = card.getByRole("button", { name: "Sepete ekle", exact: true });
  const decrease = card.getByRole("button", { name: "Adedi azalt" });
  const increase = card.getByRole("button", { name: "Adedi artır" });

  await test.step("loading, empty, sold-out and numeric limits", async () => {
    await expect(page.getByRole("status", { name: "Ürün yükleniyor" })).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("Görüntülenecek ürün bulunmuyor.", { exact: true })).toBeVisible();
    const soldOut = page.getByRole("article", { name: "Salamura Zeytin", exact: true });
    await expect(soldOut.getByText("Tükendi", { exact: true })).toBeVisible();
    for (const control of await soldOut.locator("button, input").all()) await expect(control).toBeDisabled();
    await expect(quantity).toHaveValue("1");
    await expect(decrease).toBeDisabled();
    await increase.click();
    await increase.click();
    await expect(quantity).toHaveValue("3");
    await expect(increase).toBeDisabled();
    for (const value of ["0", "-1", "1.5", "4", ""]) {
      await quantity.fill(value);
      await add.click();
      await expect(card.getByRole("alert")).toContainText("1 ile 3 arasında tam sayı");
      await expect(quantity).toHaveAttribute("aria-invalid", "true");
      expect(submissions).toHaveLength(0);
    }
    await quantity.fill("2");
  });

  await test.step("async action carries only id/quantity, blocks duplicates and recovers from failure", async () => {
    reject = true;
    await add.click();
    await expect.poll(() => submissions.length).toBe(1);
    await expect(card).toHaveAttribute("aria-busy", "true");
    await expect(card.getByRole("button", { name: "Ekleniyor…" })).toBeDisabled();
    await card.getByRole("button", { name: "Ekleniyor…" }).click({ force: true });
    expect(submissions).toHaveLength(1);
    await expect(quantity).toBeDisabled();
    await expect(increase).toBeDisabled();
    release!();
    await expect(card.getByRole("alert")).toHaveText("Ürün sepete eklenemedi. Tekrar deneyin.");
    await expect(quantity).toHaveValue("2");
    await expect(add).toBeEnabled();
    reject = false;
    await add.click();
    await expect.poll(() => submissions.length).toBe(2);
    release!();
    await expect(card.getByRole("status")).toHaveText("2 adet ürün sepete eklendi.");
    expect(submissions).toEqual(Array(2).fill({ productId: "fixture-olive", quantity: 2 }));
    await expect(card.getByRole("alert")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("product-card-success.png"), fullPage: true });
  });

  await test.step("keyboard and both motion preferences preserve content, focus and actions", async () => {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await quantity.fill("2");
      await decrease.focus();
      await page.keyboard.press(nextControl);
      await expect(quantity).toBeFocused();
      await page.keyboard.press(nextControl);
      await expect(increase).toBeFocused();
      await page.keyboard.press(nextControl);
      await expect(add).toBeFocused();
      expect(await add.evaluate((node) => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
      if (reducedMotion === "reduce") {
        await expect(add).toHaveCSS("transition-duration", "0s");
        expect(await card.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
      }
      await page.keyboard.press("Enter");
      await expect.poll(() => submissions.length).toBe(reducedMotion === "reduce" ? 4 : 3);
      release!();
      await expect(card.getByRole("status")).toHaveText("2 adet ürün sepete eklendi.");
      await expect(card.getByRole("heading", { name: "Sofralık Zeytin" })).toBeVisible();
    }
    for (const control of await card.locator("button, input").all()) {
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("product-card-reduced-motion.png"), fullPage: true });
  });

  await test.step("changed stock rejects stale quantities and changing product resets feedback/quantity", async () => {
    await page.getByRole("button", { name: "Stoğu azalt" }).click();
    await add.click();
    await expect(card.getByRole("alert")).toContainText("1 ile 1 arasında tam sayı");
    expect(submissions).toHaveLength(4);
    await page.getByRole("button", { name: "Ürünü değiştir" }).click();
    const replacement = page.getByRole("article", { name: "Zeytinyağı", exact: true });
    await expect(replacement.getByRole("spinbutton")).toHaveValue("1");
    await expect(replacement.getByRole("alert")).toHaveCount(0);
    await expect(replacement.getByRole("status")).toBeEmpty();
  });
  expect(errors).toEqual([]);
});

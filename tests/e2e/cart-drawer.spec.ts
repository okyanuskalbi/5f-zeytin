import { fileURLToPath } from "node:url";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { build } from "vite";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

let assets: Map<string, string | Buffer>;
let html: string;
const initialItems = [{ productId: "fixture-olive", quantity: 1 }, { productId: "fixture-oil", quantity: 2 }];

// Bundle the actual drawer/store/CSS; no public test route or duplicate cart logic.
test.beforeAll(async () => {
  if (process.env.PLAYWRIGHT_BASE_URL !== undefined) {
    throw new Error("Cart drawer fixtures require the local checkout; unset PLAYWRIGHT_BASE_URL.");
  }
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const result = await build({
    configFile: false, root, base: "/__cart-drawer-fixture/", publicDir: false, logLevel: "error",
    resolve: { alias: { "@": root } },
    build: { write: false, rollupOptions: { input: fileURLToPath(new URL("fixtures/cart-drawer.html", import.meta.url)) } },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle)) throw new Error("Expected a completed fixture bundle.");
  assets = new Map(bundle.output.map((entry) => [entry.fileName,
    entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source),
  ]));
  html = [...assets.keys()].find((name) => name.endsWith("cart-drawer.html"))!;
});

test.beforeEach(async ({ page, baseURL }, testInfo) => {
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  await page.route("**/__cart-drawer-fixture/**", async (route) => {
    const name = new URL(route.request().url()).pathname.replace("/__cart-drawer-fixture/", "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType:
      name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
});

async function loadCart(page: Page, mode = "normal", items: unknown = initialItems): Promise<void> {
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: CART_STORAGE_KEY, value: typeof items === "string" ? items : JSON.stringify(items) });
  await page.goto(`/__cart-drawer-fixture/?mode=${mode}`);
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Sepetim", exact: true })).toBeVisible();
}

async function assertFits(dialog: Locator, page: Page): Promise<void> {
  const box = (await dialog.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(box.x + box.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("cart drawer: quantity, limits, persistence, removal, empty state and CTA destinations", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await loadCart(page);
  const dialog = page.getByRole("dialog", { name: "Sepetim", exact: true });
  const olive = dialog.getByRole("group", { name: "Sofralık Zeytin", exact: true });
  const decrease = olive.getByRole("button", { name: "Adedi azalt" });
  const increase = olive.getByRole("button", { name: "Adedi artır" });
  await expect(decrease).toBeDisabled();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("1");
  await expect(dialog.getByText("725,50 ₺", { exact: true })).toBeVisible();
  await increase.click();
  await increase.click();
  await expect(increase).toBeDisabled();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("3");
  await expect(dialog.getByText("976,50 ₺", { exact: true })).toBeVisible();
  await decrease.click();
  await expect(dialog.getByText("851,00 ₺", { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY))
    .toEqual([{ productId: "fixture-olive", quantity: 2 }, initialItems[1]]);
  await assertFits(dialog, page);
  await page.screenshot({ path: testInfo.outputPath("cart-filled.png"), fullPage: true });

  await expect(dialog.getByRole("link", { name: "Sepeti görüntüle" })).toHaveAttribute("href", "/sepet");
  await expect(dialog.getByRole("link", { name: "Ödemeye geç" })).toHaveAttribute("href", "/odeme");
  await dialog.getByRole("link", { name: "Sepeti görüntüle" }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  // These routes belong to Tasks 037/046; this test verifies navigation, not checkout.
  await page.goto("/__cart-drawer-fixture/");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  await dialog.getByRole("link", { name: "Ödemeye geç" }).click();
  await expect(page).toHaveURL(/\/odeme$/);
  await page.goto("/__cart-drawer-fixture/");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();

  for (const name of ["Sofralık Zeytin", "Zeytinyağı"]) {
    await dialog.getByRole("group", { name, exact: true }).getByRole("button", { name: "Sepetten sil" }).click();
    await expect(dialog.getByRole("button", { name: "Sepeti kapat" })).toBeFocused();
  }
  await expect(dialog.getByText("Sepetiniz henüz boş.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
  await expect(dialog.getByRole("link", { name: "Ödemeye geç" })).toHaveCount(0);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("cart-empty.png"), fullPage: true });
  await dialog.getByRole("button", { name: "Alışverişe devam et" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sepeti aç", exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test("cart drawer: keyboard focus trap, all dismissal paths, external opener and reduced motion", async ({ page, browserName }, testInfo) => {
  await loadCart(page);
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  const dialog = page.getByRole("dialog", { name: "Sepetim", exact: true });
  const trigger = page.getByRole("button", { name: "Sepeti aç", exact: true });
  await page.keyboard.press("Escape");
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const first = dialog.getByRole("button", { name: "Sepeti kapat" });
    const last = dialog.getByRole("button", { name: "Alışverişe devam et" });
    await expect(first).toBeFocused();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAccessibleDescription(/Ürünlerinizi/);
    await expect(page.getByRole("main")).toHaveCount(0);
    await page.keyboard.press(`Shift+${nextControl}`);
    await expect(last).toBeFocused();
    await page.keyboard.press(nextControl);
    await expect(first).toBeFocused();
    expect(await first.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
    if (reducedMotion === "reduce") {
      for (const item of [dialog, first, last]) {
        expect(await item.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.animationName === "none" && style.transitionDuration.split(",").every((duration) => parseFloat(duration) === 0);
        })).toBe(true);
      }
    }
    // Traverse real controls and change a quantity from the keyboard.
    await page.keyboard.press(nextControl);
    if (reducedMotion === "reduce") {
      await expect(dialog.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("button", { name: "Adedi azalt" })).toBeFocused();
      await page.keyboard.press(nextControl);
    }
    const increase = dialog.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("button", { name: "Adedi artır" });
    await expect(increase).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("group", { name: "Sofralık Zeytin", exact: true }).getByRole("status", { name: "Adet" })).toHaveText(reducedMotion === "reduce" ? "3" : "2");
    await assertFits(dialog, page);
    await page.screenshot({ path: testInfo.outputPath(`cart-keyboard-${reducedMotion}.png`), fullPage: true });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked");
  }
  await trigger.click();
  await dialog.getByRole("button", { name: "Sepeti kapat" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  const overlay = page.locator('[data-slot="dialog-overlay"]');
  await overlay.click({ position: { x: 1, y: 1 } });
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const external = page.getByRole("button", { name: "Dışarıdan aç" });
  await external.focus();
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("button", { name: "Sepeti kapat" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(external).toBeFocused();
});

test("cart drawer: storage failures and stale stock report errors and allow recovery", async ({ page }, testInfo) => {
  await loadCart(page, "write-error");
  const dialog = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(dialog.getByRole("alert")).toContainText("kaydedilemiyor");
  const olive = dialog.getByRole("group", { name: "Sofralık Zeytin", exact: true });
  await olive.getByRole("button", { name: "Adedi artır" }).click();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  await page.screenshot({ path: testInfo.outputPath("cart-storage-error.png"), fullPage: true });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Kaydı etkinleştir" }).click();
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await olive.getByRole("button", { name: "Adedi artır" }).click();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("3");

  await page.goto("/__cart-drawer-fixture/?mode=stale-stock");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await olive.getByRole("button", { name: "Adedi artır" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Adet güncellenemedi");
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("1");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Stoğu yenile" }).click();
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await olive.getByRole("button", { name: "Adedi artır" }).click();
  await expect(olive.getByRole("status", { name: "Adet" })).toHaveText("2");
  await expect(dialog.getByRole("alert")).toHaveCount(0);
});

test("cart drawer: corrupt/unreadable storage, unavailable catalog and six lines fit a short viewport", async ({ page }, testInfo) => {
  await loadCart(page, "normal", "{broken-json");
  const dialog = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(dialog.getByText("Sepetiniz henüz boş.")).toBeVisible();
  await page.goto("/__cart-drawer-fixture/?mode=read-error");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("kaydedilemiyor");
  await expect(dialog.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Kaydı etkinleştir" }).click();
  await page.getByRole("button", { name: "Ürün ekle" }).click();
  await page.goto("/__cart-drawer-fixture/?mode=unavailable");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(dialog.getByText("Bu ürün artık kullanılamıyor.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Sepetten sil" }).click();
  await expect(dialog.getByText("Sepetiniz henüz boş.")).toBeVisible();

  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify([
    { productId: "fixture-olive", quantity: 1 }, { productId: "fixture-oil", quantity: 1 },
    ...Array.from({ length: 4 }, (_, index) => ({ productId: `fixture-extra-${index}`, quantity: 1 })),
  ])), CART_STORAGE_KEY);
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/__cart-drawer-fixture/");
  await page.getByRole("button", { name: "Sepeti aç", exact: true }).click();
  await expect(dialog.getByRole("listitem")).toHaveCount(6);
  await assertFits(dialog, page);
  for (const button of await dialog.locator("button, a").all()) {
    const box = (await button.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  const lastLine = dialog.getByRole("group", { name: "Uzun ürün adı 4 · Sofralar için salamura zeytin", exact: true });
  await lastLine.getByRole("button", { name: "Sepetten sil" }).click();
  await expect(dialog.getByRole("listitem")).toHaveCount(5);
  await dialog.getByRole("link", { name: "Ödemeye geç" }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole("link", { name: "Ödemeye geç" })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("cart-short-screen.png"), fullPage: true });
});

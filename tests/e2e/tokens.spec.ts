import { fileURLToPath } from "node:url";
import { expect, test, type Locator } from "@playwright/test";
import { build } from "vite";

// Bundle the actual primitives and production CSS without adding a public demo route
// or starting another server. Playwright serves these assets only inside this test.
let assets: Map<string, string | Buffer>;
let html: string;

test.beforeAll(async () => {
  if (process.env.PLAYWRIGHT_BASE_URL !== undefined) {
    throw new Error("Token component fixtures require the local checkout; unset PLAYWRIGHT_BASE_URL.");
  }
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const result = await build({
    configFile: false,
    root,
    base: "/__tokens-fixture/",
    publicDir: false,
    logLevel: "error",
    resolve: { alias: { "@": root } },
    build: {
      write: false,
      rollupOptions: { input: fileURLToPath(new URL("fixtures/tokens.html", import.meta.url)) },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle)) throw new Error("Expected a completed fixture bundle.");
  assets = new Map(bundle.output.map((entry) => [entry.fileName,
    entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source),
  ]));
  html = [...assets.keys()].find((name) => name.endsWith("tokens.html"))!;
});

async function contrast(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    function luminance(color: string): number {
      const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    }
    let background = getComputedStyle(element).backgroundColor;
    let parent = element.parentElement;
    while (background === "rgba(0, 0, 0, 0)" && parent) {
      background = getComputedStyle(parent).backgroundColor;
      parent = parent.parentElement;
    }
    const values = [luminance(getComputedStyle(element).color), luminance(background)].sort((a, b) => a - b);
    return (values[1] + 0.05) / (values[0] + 0.05);
  });
}

test("brand tokens, button states and dialog remain accessible with keyboard and reduced motion", async ({ page, baseURL, browserName }, testInfo) => {
  const errors: string[] = [];
  // Safari on macOS uses Option-Tab for all controls with default keyboard settings.
  const nextControl = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  page.on("pageerror", (error) => errors.push(error.message));
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  testInfo.annotations.push({ type: "keyboard-navigation", description: nextControl });

  await test.step("production page uses the brand and readable typography", async () => {
    expect((await page.goto("/"))?.status()).toBe(200);
    await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
    const tokens = await page.locator("body").evaluate((body) => {
      const style = getComputedStyle(body);
      return { background: style.backgroundColor, foreground: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight };
    });
    expect(tokens.background).toBe("rgb(245, 241, 231)");
    expect(tokens.foreground).toBe("rgb(36, 58, 41)");
    expect(parseFloat(tokens.fontSize)).toBeGreaterThanOrEqual(16);
    expect(parseFloat(tokens.lineHeight) / parseFloat(tokens.fontSize)).toBeGreaterThanOrEqual(1.5);
    expect(await contrast(page.locator("body"))).toBeGreaterThanOrEqual(4.5);
  });

  await page.route("**/__tokens-fixture/**", async (route) => {
    const name = new URL(route.request().url()).pathname.replace("/__tokens-fixture/", "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType:
      name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
  await page.goto("/__tokens-fixture/");
  const primary = page.getByRole("button", { name: "Ürünlerimizi Keşfedin" });
  const trigger = page.getByRole("button", { name: "Bilgiyi aç" });

  await test.step("normal, hover, disabled, contrast and long labels", async () => {
    await primary.click();
    await expect(page.getByRole("status")).toHaveText("İşlem sayısı: 1");
    const disabled = page.getByRole("button", { name: "Kullanılamıyor" });
    await expect(disabled).toBeDisabled();
    await disabled.click({ force: true });
    await expect(page.getByRole("status")).toHaveText("İşlem sayısı: 1");
    await page.mouse.move(0, 0);
    await expect(primary).toHaveCSS("background-color", "rgb(36, 58, 41)");
    await expect(page.getByRole("button", { name: "Altın vurgu" })).toHaveCSS("background-color", "rgb(212, 180, 131)");
    await primary.hover();
    await expect(primary).toHaveCSS("background-color", "rgb(53, 78, 59)");
    for (const item of [primary, page.getByRole("button", { name: "Altın vurgu" }),
      page.getByRole("button", { name: "Toptan Satış İçin İletişime Geçin" }),
      page.getByRole("button", { name: "Vazgeç", exact: true }), page.getByRole("link", { name: "Ayrıntılar" }),
      page.getByRole("button", { name: "Hata durumunu göster" }),
      page.getByTestId("gold-on-ivory"), page.getByTestId("gold-on-olive")]) {
      expect(await contrast(item)).toBeGreaterThanOrEqual(4.5);
    }
    for (const button of await page.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      expect(await button.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath("tokens-normal.png"), fullPage: true });
  });

  await test.step("error feedback has readable contrast and supports recovery", async () => {
    await page.getByRole("button", { name: "Hata durumunu göster" }).click();
    await expect(page.getByRole("alert")).toHaveText("İşlem tamamlanamadı. Tekrar deneyin.");
    expect(await contrast(page.getByRole("alert"))).toBeGreaterThanOrEqual(4.5);
    const retry = page.getByRole("button", { name: "Tekrar dene" });
    await expect(retry).toHaveAttribute("aria-invalid", "true");
    await expect(retry).toHaveCSS("border-color", "rgb(148, 59, 50)");
    await page.screenshot({ path: testInfo.outputPath("tokens-error.png"), fullPage: true });
    await page.getByRole("button", { name: "Hata durumunu göster" }).focus();
    await page.keyboard.press(nextControl);
    await expect(retry).toBeFocused(); // Disabled button is skipped by the keyboard.
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(retry).toHaveAttribute("aria-invalid", "false");
  });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await test.step(`dialog keyboard, focus trap, dismissal and ${reducedMotion}`, async () => {
      await page.emulateMedia({ reducedMotion });
      if (reducedMotion === "reduce") await expect(trigger).toHaveCSS("transition-duration", "0s");
      await page.getByRole("button", { name: "Tekrar dene" }).focus();
      await page.keyboard.press(nextControl);
      await expect(trigger).toBeFocused();
      expect(await trigger.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Ürün bilgisi" });
      await expect(dialog).toBeVisible();
      // Radix hides the surrounding tree from assistive technology while modal.
      await expect(page.getByRole("main")).toHaveCount(0);
      await expect(dialog).toHaveAccessibleDescription(/Türkçe karakterler/);
      expect(await contrast(dialog)).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(dialog.getByText(/Çığ, özen/))).toBeGreaterThanOrEqual(4.5);
      const first = dialog.getByRole("button", { name: "Vazgeç", exact: true });
      const last = dialog.getByRole("button", { name: "Kapat", exact: true });
      await expect(first).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(last).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(first).toBeFocused();
      if (reducedMotion === "reduce") {
        for (const element of [dialog, last]) {
          expect(await element.evaluate((node) => {
            const style = getComputedStyle(node);
            return style.transitionDuration.split(",").every((duration) => parseFloat(duration) === 0)
              && style.animationName === "none";
          })).toBe(true);
        }
      }
      const box = (await dialog.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`tokens-dialog-${reducedMotion}.png`), fullPage: true });
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(page.getByRole("main")).toBeVisible();
      await trigger.click();
      await page.getByRole("dialog").getByRole("button", { name: "Kapat", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

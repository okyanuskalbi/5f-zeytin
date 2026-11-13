import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

type State = { name: string; url: string; prepare?: (page: Page) => Promise<void>; mobileOnly?: boolean };
const states: State[] = [
  { name: "ana-sayfa", url: "/" },
  // Task208: the catalogue, its categories and both business forms are states of the home page.
  { name: "urunler", url: "/#urunler", prepare: async page => {
    await expect(page.locator("#urunler").getByRole("radio", { name: "Tümü", exact: true })).toBeChecked();
    await expect(page.locator("#urunler article[data-product-id]")).toHaveCount(6);
  } },
  ...([["kategori-siyah", "siyah-zeytin", "Siyah"], ["kategori-yesil", "yesil-zeytin", "Yeşil"], ["kategori-kirma", "kirma-zeytin", "Kırma"], ["kategori-yag", "zeytinyagi", "Zeytinyağı"]] as const).map(([name, group, pill]): State => ({
    name, url: `/?kategori=${group}#urunler`, prepare: async page => {
      await expect(page.locator("#urunler").getByRole("radio", { name: pill, exact: true })).toBeChecked();
      await expect(page.locator("#urunler article[data-product-id]").first()).toBeVisible();
    },
  })),
  { name: "bayilik", url: "/?sekme=bayilik#toptan-bayilik", prepare: async page => {
    // Task209: a phone shows the dealership form in its full-screen sheet; wider screens keep the pill.
    if ((page.viewportSize()?.width ?? 1440) <= 767) await expect(page.getByRole("dialog", { name: "Bayilik başvurusu", exact: true })).toBeVisible();
    else await expect(page.locator("#toptan-bayilik").getByRole("radio", { name: "Bayilik", exact: true })).toBeChecked();
    await expect(page.getByRole("button", { name: "Başvuru E-postasını Hazırla" })).toBeEnabled();
  } },
  { name: "bayilik-hata", url: "/?sekme=bayilik#toptan-bayilik", prepare: async page => {
    await expect(page.getByRole("button", { name: "Başvuru E-postasını Hazırla" })).toBeEnabled();
    await page.getByRole("button", { name: "Başvuru E-postasını Hazırla" }).click();
    await expect(page.locator("#basvuru form").getByRole("alert")).toContainText("Lütfen işaretli alanları kontrol edin.");
  } },
  { name: "giris", url: "/giris" },
  { name: "kayit", url: "/kayit" },
  { name: "hesabim-girissiz", url: "/hesabim" },
  { name: "sepet", url: "/sepet", prepare: async page => {
    await expect(page.getByRole("list", { name: "Sepetteki ürünler" })).toBeVisible();
  } },
  { name: "siparis-takip", url: "/siparis-takip" },
  { name: "kvkk", url: "/kvkk" },
  { name: "iade", url: "/iade" },
  { name: "mesafeli-satis", url: "/mesafeli-satis" },
  { name: "bulunamayan", url: "/task189-bulunamayan-sayfa" },
  { name: "odeme", url: "/odeme" },
  { name: "odeme-onizleme-kapali", url: "/odeme-onizleme" },
  { name: "urun-detayi-mevcut", url: "/urun/naturel-sizma-zeytinyagi?boy=1%20L", prepare: async page => {
    await expect(page.locator("[data-product-page]").getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } },
  { name: "urun-detayi-mevcut-degil", url: "/urun/salamura-siyah-zeytin", prepare: async page => {
    await expect(page.locator("[data-product-page]").getByRole("button", { name: "Mevcut değil" })).toBeDisabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } },
  { name: "sepet-cekmecesi", url: "/", prepare: async page => {
    await page.getByRole("banner").getByRole("button", { name: "Sepetim, 1 adet" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("list", { name: "Sepetteki ürünler" })).toBeVisible();
  } },
  { name: "telefon-menusu", url: "/", mobileOnly: true, prepare: async page => {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await expect(page.getByRole("dialog", { name: "Site menüsü" })).toBeVisible();
  } },
  { name: "teklif-hata", url: "/?sekme=toptan#toptan-bayilik", prepare: async page => {
    await expect(page.getByRole("button", { name: "Talep özetini hazırla" })).toBeEnabled();
    await page.getByRole("button", { name: "Talep özetini hazırla" }).click();
    await expect(page.locator('#toptan [aria-invalid="true"]').first()).toBeVisible();
  } },
];

async function pixelDifference(light: Buffer, dark: Buffer) {
  const a = await sharp(light).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(dark).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return { changedRatio: 1, maxDelta: 255, dimensionsEqual: false };
  let changed = 0, maxDelta = 0;
  for (let offset = 0; offset < a.data.length; offset += 4) {
    let delta = 0;
    for (let channel = 0; channel < 3; channel++) delta = Math.max(delta, Math.abs(a.data[offset + channel] - b.data[offset + channel]));
    maxDelta = Math.max(maxDelta, delta);
    if (delta > 8) changed++;
  }
  return { changedRatio: changed / (a.info.width * a.info.height), maxDelta, dimensionsEqual: true };
}

/** Compare the real cart/observer state, never a timer, hidden overlay or mask. */
async function settleCaptureState(page: Page, width: number, state: State) {
  // Task208: the catalogue and form states live on the home page, which (as before) shows no phone mini cart.
  const cartRoutes = new Set(["siparis-takip", "bulunamayan", "urun-detayi-mevcut", "urun-detayi-mevcut-degil"]);
  const hasMiniCart = width < 768 && cartRoutes.has(state.name);
  if (hasMiniCart) await expect(page.locator("[data-mini-cart-reserve]")).toBeVisible();
  else await expect(page.locator("[data-mini-cart-reserve]")).toHaveCount(0);

  if (await page.locator('[role="dialog"]').count() === 0) {
    // At the bottom the footer observer has an unambiguous intersecting state.
    // This also exercises the mobile reserve after the fixed cart disappears.
    await page.evaluate(bottom => window.scrollTo({ top: bottom ? document.documentElement.scrollHeight : 0, behavior: "instant" }), hasMiniCart);
    if (hasMiniCart) await expect(page.locator("footer")).toBeInViewport();
  }

  const footerVisible = await page.locator("footer").evaluate(footer => {
    const box = footer.getBoundingClientRect();
    return box.top < innerHeight && box.bottom > 0;
  });
  const miniCart = page.locator("[data-mini-cart]");
  if (!hasMiniCart || footerVisible) await expect(miniCart).toHaveCount(0);
  else {
    await expect(miniCart).toBeVisible();
    await expect(miniCart).toHaveCSS("opacity", "1");
    await expect.poll(async () => {
      const box = await miniCart.boundingBox();
      return box ? Math.abs(box.y + box.height - (page.viewportSize()?.height ?? 0)) : Infinity;
    }).toBeLessThanOrEqual(1);
  }
  return { scrollY: await page.evaluate(() => scrollY), footerVisible, miniCart: !hasMiniCart || footerVisible ? "absent" : "visible" };
}

test.describe("Task189 local colour contrast and operating-system invariance", () => {
  // This one suite supplies its own two widths; do not repeat it for all fifteen projects.
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium-390", "Run this matrix once with chromium-390.");
  });
  test.setTimeout(120_000);

  for (const width of [390, 1440]) for (const state of states.filter(item => width === 390 || !item.mobileOnly)) {
    test(`${width} ${state.name}: zero contrast violations and identical light/dark`, async ({ browser, baseURL }, testInfo) => {
      const origin = new URL(baseURL ?? "http://localhost:3004");
      expect(["localhost", "127.0.0.1", "[::1]"]).toContain(origin.hostname);
      const output = path.resolve("output/task189-sonra");
      await mkdir(output, { recursive: true });
      const screenshots: Buffer[] = [];
      const modes = [];
      for (const colorScheme of ["light", "dark"] as const) {
        const context = await browser.newContext({ baseURL: origin.href, viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        try {
          await context.route("**/*", route => {
            const url = new URL(route.request().url());
            return [origin.hostname, "localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? route.continue() : route.abort();
          });
          await context.addInitScript(() => {
            localStorage.setItem("afina-zeytin:cart", JSON.stringify([{ productId: "sample-olive-oil-1l", quantity: 1 }]));
          });
          const page = await context.newPage();
          await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
          const response = await page.goto(state.url, { waitUntil: "load" });
          expect(response?.status()).toBe(["bulunamayan", "odeme-onizleme-kapali"].includes(state.name) ? 404 : 200);
          await expect(page.locator("main")).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          // Load off-screen pictures too so full-page mode comparisons do not
          // depend on when lazy images happen to enter the viewport.
          await page.evaluate(async () => {
            for (const image of document.images) image.loading = "eager";
            await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
          });
          await state.prepare?.(page);
          await page.evaluate(async () => {
            // Native lazy images outside the viewport intentionally have no request
            // yet. decode() on those can wait indefinitely until they are scrolled in.
            for (const image of document.images) image.loading = "eager";
            await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
          });
          const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
          const violations = results.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })) }));
          expect.soft(violations, `${state.name} ${width} ${colorScheme}`).toEqual([]);
          const capture = await settleCaptureState(page, width, state);
          modes.push({ colorScheme, capture, violations, incomplete: results.incomplete.map(rule => ({ id: rule.id, nodes: rule.nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })) })) });
          screenshots.push(await page.screenshot({ path: path.join(output, `${width}-${state.name}-${colorScheme}.png`), fullPage: true, animations: "disabled", caret: "hide" }));
        } finally { await context.close(); }
      }
      const difference = await pixelDifference(screenshots[0], screenshots[1]);
      const report = { state: state.name, width, modes, difference, negligiblePixelThreshold: 0.001, ignoredChannelDelta: 8 };
      await writeFile(path.join(output, `${width}-${state.name}.json`), JSON.stringify(report, null, 2));
      await testInfo.attach("contrast-and-mode-report", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
      expect.soft(difference.dimensionsEqual).toBe(true);
      expect.soft(difference.changedRatio, "Only <=0.1% pixels may differ by more than 8/255 in any colour channel.").toBeLessThanOrEqual(0.001);
    });
  }
});

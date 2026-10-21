import { expect, test } from "@playwright/test";
const families = [
  { name: "Doğal Kırma Yeşil Zeytin", variants: [{ id: "sample-green-olive-1kg", weight: "1 kg", priceKurus: 22000, stock: 12 }, { id: "sample-green-olive-10kg", weight: "10 kg", priceKurus: 220000, stock: 6 }] },
  { name: "Salamura Siyah Zeytin", variants: [{ id: "sample-black-olive-1kg", weight: "1 kg", priceKurus: 22000, stock: 0 }] },
  { name: "Natürel Sızma Zeytinyağı", variants: [{ id: "sample-olive-oil-1l", weight: "1 L", priceKurus: 35000, stock: 8 }, { id: "sample-olive-oil-5l", weight: "5 L", priceKurus: 175000, stock: 6 }] },
  { name: "Salamura Yeşil Zeytin", variants: [{ id: "sample-brined-green-olive-5kg", weight: "5 kg", priceKurus: 110000, stock: 8 }] },
];

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
test.beforeEach(async ({ page }) => { await page.goto("/"); await page.locator("#kiler").scrollIntoViewIfNeeded(); });

test("each size changes price and adds the correct SKU; sold out cannot be added", async ({ page }) => {
  const expected: { productId: string; quantity: number }[] = [];
  for (const family of families) {
    const article = page.getByRole("article", { name: family.name, exact: true });
    for (const variant of family.variants) {
      await article.getByRole("radio", { name: variant.weight, exact: true }).click();
      await expect(article.getByLabel("Fiyat", { exact: true })).toContainText(money.format(variant.priceKurus / 100));
      if (variant.stock === 0) { await expect(article.getByRole("button", { name: "Tükendi", exact: true })).toBeDisabled(); continue; }
      await article.getByRole("button", { name: "Ekle", exact: true }).click();
      await expect(article.getByRole("button", { name: "Eklendi ✓", exact: true })).toBeVisible();
      expected.push({ productId: variant.id, quantity: 1 });
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("afina-zeytin:cart")!))).toEqual(expected);
  await page.getByRole("button", { name: "Sepetim, 5 adet", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(drawer.locator("li picture img")).toHaveCount(5);
  const last = drawer.locator("li").last();
  await last.getByRole("button", { name: "Sepetten sil", exact: true }).scrollIntoViewIfNeeded();
  const body = await drawer.locator('[class*="drawerBody"]').boundingBox();
  const button = await last.getByRole("button", { name: "Sepetten sil", exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThanOrEqual(body!.y + body!.height + 1);
  await page.keyboard.press("Escape");
  await page.goto("/sepet");
  await expect(page.getByRole("list", { name: "Sepetteki ürünler" }).locator("picture img")).toHaveCount(5);
});

test("quick view click, gallery, quantity, focus trap, ESC, back, forward and deep links", async ({ page }) => {
  const opener = page.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin hızlı görünüm", exact: true });
  await opener.click();
  const panel = page.getByRole("dialog", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(/\?urun=dogal-kirma/);
  await expect(panel.getByRole("button", { name: "Hızlı görünümü kapat" })).toBeFocused();
  await panel.getByRole("tab", { name: "Sofra görünümü" }).click();
  await expect(panel.getByRole("tabpanel").locator("img")).toHaveAttribute("width", "800");
  await panel.getByRole("radio", { name: "10 kg", exact: true }).click();
  await panel.getByLabel("Adet", { exact: true }).fill("2");
  await panel.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(panel.getByRole("status").filter({ hasText: "sepete eklendi" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("afina-zeytin:cart")!))).toEqual([{ productId: "sample-green-olive-10kg", quantity: 2 }]);
  await panel.getByRole("link", { name: "Toptan teklif iste" }).focus();
  await page.keyboard.press("Tab");
  expect(await panel.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(panel).toBeVisible();
  await page.goBack();
  await expect(panel).toHaveCount(0);
  await page.goForward();
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Hızlı görünümü kapat" }).click();
  await expect(panel).toHaveCount(0);
  await page.goto("/?utm_source=acceptance&urun=dogal-kirma");
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL(/utm_source=acceptance/);
});

test("keyboard reaches name, radio group and add with visible focus and arrow selection", async ({ page, browserName }) => {
  const next = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  const article = page.getByRole("article", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  const name = article.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin", exact: true });
  await name.focus();
  await page.keyboard.press(next);
  await expect(article.getByRole("radio", { name: "1 kg", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(article.getByRole("radio", { name: "10 kg", exact: true })).toBeChecked();
  await expect(article.getByLabel("Fiyat", { exact: true })).toContainText("₺2.200,00");
  await page.keyboard.press(next);
  const add = article.getByRole("button", { name: "Ekle", exact: true });
  await expect(add).toBeFocused();
  expect(await add.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(article.getByRole("button", { name: "Eklendi ✓", exact: true })).toBeVisible();
});

test("44px targets, shelf contact, no clipped labels or horizontal overflow", async ({ page }) => {
  await page.evaluate(() => document.fonts.ready);
  for (const article of await page.locator("#kiler article").all()) {
    await article.scrollIntoViewIfNeeded();
    for (const control of await article.locator("button").all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(43.99); expect(box.height).toBeGreaterThanOrEqual(43.99);
    }
    await expect.poll(async () => article.evaluate(node => {
      const img = node.querySelector('picture img')!.getBoundingClientRect();
      const origin = node.getBoundingClientRect();
      const shelf = parseFloat(getComputedStyle(node, "::after").top) + origin.top;
      return Math.abs(img.bottom - shelf);
    })).toBeLessThanOrEqual(2);
    await expect.poll(async () => article.locator('[data-kraft-tag]').evaluate(node => {
      const tag = node.getBoundingClientRect();
      return tag.right > innerWidth || tag.left < 0;
    })).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("113-a: tags hang below unobscured products; four families and parcel share one desktop shelf", async ({ page, viewport }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const geometry = await page.locator("#kiler").evaluate(section => {
    const products = [...section.querySelectorAll("article")].map(article => {
      const product = article.querySelector("picture img")!.getBoundingClientRect();
      const tag = article.querySelector("[data-kraft-tag]")!.getBoundingClientRect();
      return { top: product.top, bottom: product.bottom, height: product.height,
        intersection: Math.max(0, Math.min(product.right, tag.right) - Math.max(product.left, tag.left)) * Math.max(0, Math.min(product.bottom, tag.bottom) - Math.max(product.top, tag.top)), tagTop: tag.top };
    });
    const parcel = section.querySelector("[data-pantry-parcel]")!;
    return { products, parcelShelf: parcel.getBoundingClientRect().top + parseFloat(getComputedStyle(parcel, "::after").top) };
  });
  for (const product of geometry.products) {
    expect(product.intersection).toBe(0);
    expect(product.tagTop).toBeGreaterThan(product.bottom);
  }
  if (viewport!.width >= 1024) {
    for (const product of geometry.products) expect(Math.abs(product.bottom - geometry.parcelShelf)).toBeLessThanOrEqual(2);
    expect(Math.max(...geometry.products.map(product => product.height))).toBeGreaterThanOrEqual(319);
    expect(Math.max(...geometry.products.map(product => product.height))).toBeLessThanOrEqual(321);
  }
});

test("113-a: add is olive with cream text and contrast at least 4.5 in default, hover and focus states", async ({ page }) => {
  const add = page.locator("#kiler article").first().getByRole("button", { name: "Ekle", exact: true });
  for (const state of ["default", "hover", "focus"]) {
    if (state === "hover") await add.hover();
    if (state === "focus") await add.focus();
    const colors = await add.evaluate(node => {
      const css = getComputedStyle(node);
      const luminance = (color: string): number => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
      const a = luminance(css.color), b = luminance(css.backgroundColor);
      return { background: css.backgroundColor, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), outline: css.outlineStyle };
    });
    expect(colors.ratio).toBeGreaterThanOrEqual(4.5);
    if (state === "default") expect(colors.background).toBe("rgb(36, 58, 41)");
    if (state === "focus") expect(colors.outline).not.toBe("none");
  }
});

test("113-a: both olive and oil sizes swap the visible shelf photograph and keep shelf contact", async ({ page }) => {
  for (const [family, variants] of [
    ["Doğal Kırma Yeşil Zeytin", [["10 kg", "urun-01-kirma-10kg"], ["1 kg", "urun-02-kirma-1kg"]]],
    ["Natürel Sızma Zeytinyağı", [["5 L", "urun-05-yag-5l"], ["1 L", "urun-04-yag-1l"]]],
  ] as const) {
    const article = page.getByRole("article", { name: family, exact: true });
    for (const [size, filename] of variants) {
      await article.getByRole("radio", { name: size, exact: true }).click();
      await expect.poll(async () => article.locator("picture img").evaluateAll(images => images.filter(img => getComputedStyle(img.parentElement!.parentElement!).opacity === "1").map(img => (img as HTMLImageElement).currentSrc).join())).toContain(filename);
      await expect.poll(() => article.locator("picture img").count()).toBe(1);
      await expect.poll(() => article.locator("picture img").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    }
  }
});

test("113-a: settled quick view stays inside viewport, is wide enough and locks background scroll", async ({ page, viewport }) => {
  await page.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin hızlı görünüm", exact: true }).click();
  const panel = page.getByRole("dialog");
  await expect(panel).toHaveCSS("transform", "none");
  const box = (await panel.boundingBox())!;
  if (viewport!.width >= 768) expect(box.width).toBeGreaterThanOrEqual(440);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width + 1);
  expect(await panel.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.move(8, 200);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.hasAttribute("data-scroll-locked"))).toBe(false);
});

test("mobile bottom sheet expands and drag dismisses", async ({ page, viewport }) => {
  test.skip(viewport!.width >= 768, "Bottom sheet is mobile only");
  await page.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin hızlı görünüm", exact: true }).click();
  const panel = page.getByRole("dialog");
  const handle = panel.getByRole("button", { name: "Görünümü genişlet" });
  await handle.click();
  await expect(panel).toHaveAttribute("data-snap", "expanded");
  const box = (await panel.getByRole("button", { name: "Görünümü daralt" }).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 240, { steps: 16 });
  await page.mouse.up();
  await expect(panel).toHaveCount(0);
});

test("reduced motion retains content, chips and quick view without transforms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.reload();
  const article = page.locator("#kiler article").first();
  await article.scrollIntoViewIfNeeded();
  await expect(article.locator("[data-kraft-tag]")).toHaveCSS("transform", "none");
  await expect(article.locator('button').first()).toHaveCSS("transform", "none");
  await article.getByRole("radio", { name: "10 kg", exact: true }).click();
  await article.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

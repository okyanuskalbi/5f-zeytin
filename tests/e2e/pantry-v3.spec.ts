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

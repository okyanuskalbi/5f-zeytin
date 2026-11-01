import { expect, test, type Page } from "@playwright/test";

const sectionIds = [
  "baslangic", "kurumsal", "tesisimiz", "urunler", "uretim-yolculugu", "toptan-iletisim", "iletisim",
] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    return {
      clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      outside: [...document.querySelectorAll("header, main > section, footer")].flatMap(element => {
        const box = element.getBoundingClientRect();
        return box.left < -1 || box.right > clientWidth + 1
          ? [{ element: element.id || element.tagName, left: box.left, right: box.right }] : [];
      }),
    };
  });
  expect(geometry.scrollWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.outside, JSON.stringify(geometry)).toEqual([]);
}

test.beforeEach(async ({ page, baseURL }, testInfo) => {
  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  expect((await page.goto("/", { waitUntil: "domcontentloaded" }))?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // The server-rendered header is visible before its React/cart hydration.
  // Use an actual enabled control as readiness, rather than a timing sleep.
  await expect(page.getByRole("banner").getByRole("button", { name: /^Sepetim,/ })).toBeEnabled();
});

test("cinematic opening fills the viewport behind readable copy and both real destinations", async ({ page }) => {
  const hero = page.locator("#baslangic");
  const copy = hero.locator("[data-hero-copy]");
  const visual = hero.locator("[data-hero-visual]");
  await expect(copy).toBeVisible();
  await expect(visual).toBeVisible();
  await expect(copy.getByRole("heading", { level: 1 })).toHaveText("Kökü toprakta. Yeri sofrada.");
  await expect(copy.getByRole("link", { name: "Ürünleri Keşfet" })).toHaveAttribute("href", "#urunler");
  await expect(copy.getByRole("link", { name: "Kurumsal Teklif Al" })).toHaveAttribute("href", "#toptan-iletisim");
  const [copyBox, visualBox, heroBox] = await Promise.all([copy.boundingBox(), visual.boundingBox(), hero.boundingBox()]);
  expect(copyBox).not.toBeNull();
  expect(visualBox).not.toBeNull();
  expect(heroBox).not.toBeNull();
  expect(visualBox!.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 2);
  const titleBox = await copy.getByRole("heading", { level: 1 }).boundingBox();
  expect(titleBox!.y).toBeGreaterThanOrEqual(visualBox!.y);
  expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(visualBox!.y + visualBox!.height + 1);
  expect(heroBox!.height).toBeLessThan(page.viewportSize()!.height * 1.6);
  await expectNoHorizontalOverflow(page);
});

test("solid light navigation uses the readable original logo", async ({ page }) => {
  const header = page.getByRole("banner");
  const logo = header.getByRole("img", { name: "AFİNA ZEYTİN", exact: true });
  await expect(header.getByRole("link", { name: "Afina Zeytin ana sayfa" })).toHaveAttribute("href", "/");
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await logo.evaluate((image: HTMLImageElement) => image.currentSrc)).not.toContain("-dark");
  const surface = await header.evaluate(element => {
    const style = getComputedStyle(element);
    const color = style.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
    return { color, backdrop: style.backdropFilter };
  });
  expect(surface.color.length).toBeGreaterThanOrEqual(3);
  expect(Math.min(...surface.color.slice(0, 3))).toBeGreaterThan(180);
  expect(surface.color[3] ?? 1).toBeGreaterThanOrEqual(0.95);
  expect(surface.backdrop).toBe("none");
});

test("all landing sections remain within the actual viewport while scrolling", async ({ page }) => {
  await expectNoHorizontalOverflow(page);
  for (const id of sectionIds) {
    const section = page.locator(`#${id}`);
    await expect(section).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
  }
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
});

test("account navigation and mobile menu keep Escape dismissal and focus return", async ({ page }) => {
  if (page.viewportSize()!.width >= 1281) {
    await expect(page.getByRole("banner").getByRole("link", { name: "Hesabım", exact: true })).toHaveAttribute("href", "/hesabim");
    return;
  }
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
  const trigger = page.getByRole("button", { name: "Menüyü aç", includeHidden: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Site menüsü" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Hesabım", exact: true })).toHaveAttribute("href", "/hesabim");
  for (const href of ["/#kurumsal", "/#tesisimiz", "/#urunler", "/#toptan-iletisim", "/#iletisim"]) {
    await expect(menu.locator(`a[href="${href}"]`)).toBeVisible();
  }
  await expect(menu.getByRole("link", { name: "Sepetim", exact: true })).toHaveAttribute("href", "/sepet");
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const menuBox = await menu.boundingBox();
  expect(menuBox!.x).toBeGreaterThanOrEqual(-1);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(viewportWidth + 1);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expectNoHorizontalOverflow(page);
});

test("real catalog detail opens and closes without submitting an order or account form", async ({ page }) => {
  const product = page.locator("#urunler [data-product-id]").first();
  await expect(product).toBeVisible();
  const trigger = product.getByRole("button", { name: /detayını aç$/ });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const detail = page.locator("[data-product-detail]");
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute("role", "dialog");
  await expect(detail.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(detail.getByLabel("Fiyat", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("urun")).toBe(true);
  const dimensions = await detail.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  await page.keyboard.press("Escape");
  await expect(detail).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(new URL(page.url()).searchParams.has("urun")).toBe(false);
});

test("adding a product updates the isolated browser cart and its drawer", async ({ page }) => {
  const product = page.locator("#urunler [data-product-id]").first();
  const add = product.getByRole("button", { name: "Sepete ekle", exact: true });
  await expect(add).toBeEnabled();
  await add.click();
  const cartTrigger = page.getByRole("banner").getByRole("button", { name: "Sepetim, 1 adet" });
  await expect(cartTrigger).toBeVisible();
  await cartTrigger.click();
  const cart = page.getByRole("dialog", { name: "Sepetim (1)" });
  await expect(cart).toBeVisible();
  await expect(cart.getByRole("list", { name: "Sepetteki ürünler" })).toBeVisible();
  await expect(cart.getByRole("button", { name: "Ödemeye geç", exact: true })).toBeDisabled();
  expect(await cart.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(cart).toHaveCount(0);
  await expect(cartTrigger).toBeFocused();
});

test("membership entry keeps registration values while opening required legal information", async ({ page, context }) => {
  if (page.viewportSize()!.width < 1281) {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await page.getByRole("dialog", { name: "Site menüsü" }).getByRole("link", { name: "Hesabım", exact: true }).click();
    await expect(page).toHaveURL(/\/giris\?next=/);
    await expect(page.getByRole("form", { name: "E-posta ile giriş" })).toBeVisible();
    return;
  }
  const trigger = page.getByRole("banner").getByRole("link", { name: "Hesabım", exact: true });
  await trigger.click();
  const membership = page.getByRole("dialog", { name: "AFİNA üyelik" });
  await expect(membership).toBeVisible();
  await membership.getByRole("button", { name: "Hesap oluştur", exact: true }).click();
  const form = membership.getByRole("form", { name: "E-posta ile üyelik" });
  await form.getByLabel("Ad soyad", { exact: true }).fill("Deniz Test");
  const popupPromise = context.waitForEvent("page");
  await form.getByRole("link", { name: "KVKK aydınlatma metnini" }).click();
  const legal = await popupPromise;
  await legal.waitForLoadState("domcontentloaded");
  expect(new URL(legal.url()).pathname).toBe("/kvkk");
  await legal.close();
  await expect(membership).toBeVisible();
  await expect(form.getByLabel("Ad soyad", { exact: true })).toHaveValue("Deniz Test");
  await page.keyboard.press("Escape");
  await expect(membership).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

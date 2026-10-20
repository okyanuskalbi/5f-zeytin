import { expect, test, type Page } from "@playwright/test";

const documents = [
  { path: "/kvkk", title: "KVKK", label: "KVKK", scope: "Toptan talep, sipariş ve pazarlama izni" },
  { path: "/mesafeli-satis", title: "Mesafeli Satış Sözleşmesi", label: "Mesafeli Satış Sözleşmesi", scope: "Satıcı bilgileri ve satış koşulları" },
  { path: "/iade", title: "İade ve İptal", label: "İade ve İptal", scope: "İade ve iptal koşulları" },
] as const;

async function expectNoOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

for (const document of documents) {
  test(`draft ${document.path} is readable and explicitly awaits approved content`, async ({ page, baseURL }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
    expect((await page.goto(document.path))?.status()).toBe(200);
    await expect(page).toHaveTitle(`${document.title} — Taslak | Afina Zeytin`);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    const main = page.getByRole("main");
    await expect(main).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(main.getByRole("heading", { level: 1, name: document.title, exact: true })).toBeVisible();
    const draft = main.getByRole("region", { name: "Taslak — onay bekleniyor" });
    await expect(draft).toBeVisible();
    await expect(draft).toContainText("Onaylı metin henüz eklenmedi.");
    await expect(draft).toContainText("İletişim bilgileri ve yasal metin onayı bekleniyor.");
    const seller = main.getByRole("region", { name: "Satıcı bilgileri", exact: true });
    await expect(seller).toContainText("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ");
    await expect(seller).toContainText("0091520061");
    await expect(seller).toContainText("No: 35, Ellek Beldesi, Düziçi / Osmaniye");
    await expect(main.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
    await expect(main.getByRole("heading", { level: 2, name: document.scope })).toBeVisible();
    await expect(main.locator('form, input, button[type="submit"]')).toHaveCount(0);
    const navigation = main.getByRole("navigation", { name: "Hukuk sayfaları" });
    await expect(navigation.getByRole("link")).toHaveCount(3);
    for (const item of documents) {
      const link = navigation.getByRole("link", { name: item.label, exact: true });
      await expect(link).toHaveAttribute("href", item.path);
      if (item.path === document.path) await expect(link).toHaveAttribute("aria-current", "page");
      else await expect(link).not.toHaveAttribute("aria-current");
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(main.getByRole("link", { name: "Ana sayfaya dön" })).toHaveAttribute("href", "/");
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
    if (["chromium-320", "chromium-1440", "webkit-390"].includes(testInfo.project.name)) {
      await page.screenshot({ path: testInfo.outputPath("legal-draft.png"), fullPage: true });
    }
  });
}

test("skip link, document navigation and return work by keyboard with reduced motion", async ({ page, browserName }) => {
  const tab = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const document of documents) {
      await page.goto(document.path);
      await page.keyboard.press(tab);
      await expect(page.getByRole("link", { name: "Ana içeriğe geç" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#ana-icerik")).toBeFocused();
      const main = page.getByRole("main");
      const navigation = main.getByRole("navigation", { name: "Hukuk sayfaları" });
      for (const item of documents) {
        await page.keyboard.press(tab);
        const link = navigation.getByRole("link", { name: item.label, exact: true });
        await expect(link).toBeFocused();
        await expect(link).toBeInViewport();
        expect(await link.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
      }
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/iade$/);
      await expect(page.getByRole("heading", { level: 1, name: "İade ve İptal" })).toBeVisible();
      // Continue from the current document link to the final return link.
      const returnLink = page.getByRole("main").getByRole("link", { name: "Ana sayfaya dön" });
      await page.getByRole("main").getByRole("link", { name: "İade ve İptal", exact: true }).focus();
      await page.keyboard.press(tab);
      await expect(returnLink).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Kökü toprakta. Yeri sofrada.", exact: true })).toBeVisible();
      await expectNoOverflow(page);
    }
  }
});

test("missing legal document returns 404 and footer recovers to a readable draft", async ({ page }) => {
  expect((await page.goto("/kvkk/bulunamayan-metin"))?.status()).toBe(404);
  const legal = page.getByRole("contentinfo").getByRole("navigation", { name: "Yasal bilgiler" });
  await legal.getByRole("link", { name: "KVKK", exact: true }).click();
  await expect(page).toHaveURL(/\/kvkk$/);
  await expect(page.getByRole("main").getByRole("region", { name: "Taslak — onay bekleniyor" })).toBeVisible();
  await expectNoOverflow(page);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("footer links and legal content remain available", async ({ page }) => {
    await page.goto("/");
    for (const document of documents) {
      const legal = page.getByRole("contentinfo").getByRole("navigation", { name: "Yasal bilgiler" });
      await legal.getByRole("link", { name: document.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${document.path}$`));
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1, name: document.title, exact: true })).toBeVisible();
      await expect(main.getByRole("region", { name: "Taslak — onay bekleniyor" })).toBeVisible();
      await expectNoOverflow(page);
    }
    await page.getByRole("main").getByRole("link", { name: "Ana sayfaya dön" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

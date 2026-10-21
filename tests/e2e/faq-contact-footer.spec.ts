import { expect, test } from "@playwright/test";

const questions = [
  "Afina Zeytin hangi ürün alanlarında çalışıyor?",
  "Afina Zeytin perakende müşterilere de ulaşıyor mu?",
  "Afina Zeytin’in üretim tesisi nerede?",
];
const address = "Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye";

test("verified native disclosures support pointer and keyboard with expanded state", async ({ page }) => {
  await page.goto("/#sik-sorulanlar");
  const faq = page.getByRole("region", { name: "Sık sorulanlar", exact: true });
  await expect(faq.locator("summary")).toHaveText(questions);
  for (const item of await faq.locator("details").all()) {
    const summary = item.locator("summary");
    const answer = item.locator("[data-faq-answer]");
    await expect(summary).toHaveAttribute("aria-expanded", "false");
    await expect(answer).not.toBeVisible();
    await summary.focus();
    await expect(summary).toBeFocused();
    expect(await summary.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Enter");
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(summary).toHaveAttribute("aria-expanded", "false");
    await summary.click();
    await expect(answer).toBeVisible();
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const text = (await answer.innerText()).trim();
    expect(text).toMatch(/^\p{Lu}/u);
    expect(text).toMatch(/\.$/);
    expect(text.split(/\s+/).length).toBeGreaterThanOrEqual(6);
    await summary.click();
  }
});

test("one preview note, public seller identity and no unavailable form or fabricated channels", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#toptan");
  await expect(contact).toContainText("Toptan alım için bize yazın");
  await expect(contact).toContainText("İletişim bilgileri yakında");
  await expect(contact.locator("form, input, textarea, button, a")).toHaveCount(0);
  await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/henüz kullanıma açık değil|Gerçek satış kataloğu/);
  const footer = page.getByRole("contentinfo");
  await expect(footer.locator("address")).toHaveText(address);
  await expect(footer).toContainText("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ · Düziçi VD · VKN 0091520061");
  await expect(footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu", exact: true })).toHaveAttribute("href", "https://afina.com.tr");
  await footer.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true }).click();
  await expect(page).toHaveURL(/#toptan-iletisim$/);
  await expect(page.locator("#toptan-iletisim")).toBeFocused();
  await expect(page.locator("#toptan-title")).toBeInViewport();
});

test("footer legal destinations and focus remain usable", async ({ page }) => {
  for (const [name, href] of [["KVKK", "/kvkk"], ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis"], ["İade ve İptal", "/iade"]]) {
    await page.goto("/");
    const link = page.getByRole("contentinfo").getByRole("link", { name, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Ana sayfaya dön", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  }
});

test("FAQ disclosure and footer destinations work without JavaScript", async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: page.viewportSize()!, reducedMotion: "reduce" });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/#sik-sorulanlar");
    await expect(staticPage.locator("#sik-sorulanlar summary")).toHaveText(questions);
    for (const details of await staticPage.locator("#sik-sorulanlar details").all()) {
      await details.locator("summary").click();
      await expect(details.locator("[data-faq-answer]")).toBeVisible();
    }
    await expect(staticPage.locator("#toptan form")).toHaveCount(0);
    await staticPage.getByRole("contentinfo").getByRole("link", { name: "KVKK", exact: true }).click();
    await expect(staticPage.getByRole("heading", { level: 1, name: "KVKK", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test("footer controls retain hover, press and focus when brand images fail", async ({ page }) => {
  await page.route("**/brand/afina-*.svg", route => route.abort());
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const name of ["Afina Zeytin ana sayfa", "KVKK", "AFİNA Şirketler Topluluğu"]) {
    const link = footer.getByRole("link", { name, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await link.hover();
    await page.mouse.down();
    expect(await link.evaluate(node => node.matches(":active"))).toBe(true);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
  await expect(footer.locator("address")).toHaveText(address);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

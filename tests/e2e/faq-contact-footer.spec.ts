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

test("one preview note, public seller identity and the wholesale form destination", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#toptan-iletisim h2")).toHaveText("Market, restoran, otel, bayi.");
  await expect(page.locator('#toptan-iletisim a[href^="tel:"], #toptan-iletisim a[href*="wa.me"]')).toHaveCount(0);
  await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/henüz kullanıma açık değil|Gerçek satış kataloğu|Örnek süre|İletişim bilgileri yakında/);
  const footer = page.getByRole("contentinfo");
  await expect(footer.locator("address")).toHaveText(address);
  await expect(footer).toContainText("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ · Düziçi VD · VKN 0091520061");
  await expect(footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu", exact: true })).toHaveAttribute("href", "https://afina.com.tr");
  await expect(footer.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true })).toHaveAttribute("href", "/#toptan-iletisim");
});

test("footer legal destinations and focus remain usable", async ({ page }) => {
  for (const [name, href] of [["KVKK", "/kvkk"], ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis"], ["İade ve İptal", "/iade"]]) {
    await page.goto("/");
    const link = page.getByRole("contentinfo").getByRole("navigation", { name: "Yasal bilgiler" }).getByRole("link", { name, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(page.viewportSize()!.width >= 1024 ? 32 : 44);
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
    await expect(staticPage.locator("#toptan-iletisim h2")).toHaveText("Market, restoran, otel, bayi.");
    await expect(staticPage.getByRole("contentinfo").getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true })).toHaveAttribute("href", "/#toptan-iletisim");
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
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(page.viewportSize()!.width >= 1024 ? 32 : 44);
    await link.hover();
    await page.mouse.down();
    expect(await link.evaluate(node => node.matches(":active"))).toBe(true);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
  await expect(footer.locator("address")).toHaveText(address);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

// Tasks 117/123: written for Claude's browser acceptance; Coder does not run this suite.
test("footer columns, payment brands and community attribution adapt without overflow", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const width of [320, 375, 390, 393, 430, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await footer.scrollIntoViewIfNeeded();
    const headings = footer.getByRole("heading", { level: 2 });
    await expect(headings).toHaveText(["AFİNA ZEYTİN", "Alışveriş", "Yardım", "İletişim"]);
    const positions = await headings.evaluateAll(nodes => nodes.slice(1).map(node => {
      const { x, y } = node.getBoundingClientRect();
      return { x, y };
    }));
    if (width >= 768) {
      expect(Math.max(...positions.map(item => item.y)) - Math.min(...positions.map(item => item.y))).toBeLessThan(1);
    } else if (width < 768) {
      expect(Math.abs(positions[0].y - positions[1].y)).toBeLessThan(1);
      expect(positions[1].y).toBeLessThan(positions[2].y);
    }
    const brand = footer.locator('[aria-labelledby="footer-brand-title"]');
    const brandBox = (await brand.boundingBox())!;
    if (width >= 1024) expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(positions[0].x);
    else expect(brandBox.y + brandBox.height).toBeLessThanOrEqual(positions[0].y);
    const payment = footer.getByRole("group", { name: "Güvenli ödeme", exact: true });
    await expect(payment.getByText("Güvenli Ödeme", { exact: true })).toBeVisible();
    for (const name of ["PayTR", "Visa", "Mastercard", "Troy"]) {
      const logo = payment.getByRole("img", { name, exact: true });
      await expect(logo).toBeVisible();
      await expect.poll(() => logo.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect((await logo.boundingBox())!.height).toBeGreaterThanOrEqual(24);
      expect((await logo.boundingBox())!.height).toBeLessThanOrEqual(28);
      const backgrounds = await logo.evaluate(image => {
        const values = [];
        for (let node: Element | null = image; node && node.tagName !== "FOOTER"; node = node.parentElement) values.push(getComputedStyle(node).backgroundColor);
        return values;
      });
      expect(backgrounds.every(color => color === "rgba(0, 0, 0, 0)")).toBe(true);
    }
    const provider = (await payment.getByRole("img", { name: "PayTR", exact: true }).boundingBox())!;
    const cards = (await payment.getByRole("list", { name: "Kabul edilen kartlar" }).boundingBox())!;
    if (width < 768) {
      expect(provider.y + provider.height).toBeLessThan(cards.y);
      expect(Math.abs(cards.x - (await payment.boundingBox())!.x)).toBeLessThan(1);
    }
    const community = footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu", exact: true });
    await expect(community).toHaveAttribute("href", "https://afina.com.tr");
    await expect(community).toHaveAttribute("target", "_blank");
    await expect(community).toHaveAttribute("rel", "noopener");
    await expect(community).toContainText("Bir AFİNA Şirketler Topluluğu markası");
    const communityLogo = (await community.getByRole("img").boundingBox())!;
    expect(communityLogo.height).toBeGreaterThanOrEqual(24);
    expect(communityLogo.height).toBeLessThanOrEqual(28);
    for (const link of await footer.getByRole("link").all()) {
      const box = (await link.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(width >= 1024 ? 32 : 44);
    }
    await expect(page.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await footer.getByRole("link", { name: "Sık sorulan sorular", exact: true }).click();
  await expect(page).toHaveURL(/#sik-sorulanlar$/);
  await expect(page.getByRole("heading", { name: "Sık sorulanlar", exact: true })).toBeInViewport();
});


// Task 121: Claude runs these browser checks, including the device scroll strips.
test("wholesale CTA opens the labelled existing form and restores keyboard focus", async ({ page }) => {
  await page.goto("/#toptan-iletisim");
  const trigger = page.getByRole("button", { name: "Toptan teklif isteyin", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Toptan teklif isteyin", exact: true });
  await expect(dialog.getByRole("heading", { name: "Toptan teklif isteyin" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Talebi gönder" })).toBeDisabled();
  await expect(dialog).toContainText("Bilgileriniz gönderilmez.");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

for (const viewport of [{ width: 390, height: 844 }, { width: 375, height: 667 }, { width: 393, height: 851 }]) {
  test(`mobile buy bar respects hero, overlays and seller information at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const bar = page.locator("[data-mobile-buy-bar]");
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await page.evaluate(() => window.scrollTo(0, document.querySelector("[data-hero-intro]")!.getBoundingClientRect().height + 20));
    await expect(bar).toHaveAttribute("data-visible", "true");
    await expect(bar).toHaveAttribute("role", "region");
    const add = bar.getByRole("button", { name: "Sepete ekle", exact: true });
    expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await add.click();
    await expect(bar.getByRole("button", { name: "Eklendi ✓", exact: true })).toBeVisible();
    await expect(page.locator("[data-mini-cart]")).toHaveCount(0);
    await page.getByRole("button", { name: /^Sepetim,/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await page.keyboard.press("Escape");
    await expect(bar).toHaveAttribute("data-visible", "true");
    await page.getByRole("button", { name: "Toptan teklif isteyin", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Toptan teklif isteyin", exact: true })).toBeVisible();
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("contentinfo").getByText(/VKN 0091520061/)).toBeInViewport();
    const reserved = await page.evaluate(() => ({ padding: parseFloat(getComputedStyle(document.body).paddingBottom), height: document.querySelector("[data-mobile-buy-bar]")!.getBoundingClientRect().height }));
    expect(reserved.padding).toBeGreaterThanOrEqual(reserved.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

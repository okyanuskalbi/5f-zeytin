import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const questions = [
  "Afina Zeytin hangi ürün alanlarında çalışıyor?",
  "Toptan zeytin veya zeytinyağı talebi iletilebilir mi?",
  "Afina Zeytin perakende müşterilere de ulaşıyor mu?",
  "Afina Zeytin'in üretim tesisi hangi şehirde?",
];
const address = "Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye";

async function open(page: Page): Promise<void> {
  // Firefox revalidates the cached landing when returning from a legal page.
  expect([200, 304]).toContain((await page.goto("/"))?.status());
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ baseURL }) => {
  if (!["localhost", "127.0.0.1"].includes(new URL(baseURL!).hostname)) throw new Error("Local checkout required.");
});

test("confirmed FAQs stay open, channels stay absent and the contact/footer layout uses the approved assets", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const media: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (/\/images\/(tesis|generated)\//.test(request.url())) media.push(request.url()); });
  await open(page);
  const faq = page.getByRole("region", { name: "Sık sorulanlar", exact: true });
  const contact = page.getByRole("region", { name: "Toptan satış", exact: true });
  const footer = page.getByRole("contentinfo");
  await expect(faq.getByRole("heading", { level: 3 })).toHaveText(questions);
  await expect(faq.locator("[data-faq-answer]")).toHaveText([
    "Sofralık zeytin • Salamura zeytin • Zeytinyağı", "Toptan satış",
    "ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor.",
    "Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin",
  ]);
  await expect(faq.locator("details, button")).toHaveCount(0);
  await expect(faq).not.toContainText(/kargo|iade|minimum|saklanır|sertifika|teyit|stok|sıkım/i);
  await expect(contact.locator("address")).toHaveText(address);
  await expect(footer.locator("address")).toHaveText(address);
  await expect(contact.locator("img, video, canvas")).toHaveCount(0);
  await expect(contact.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true })).toHaveAttribute("href", "#toptan-iletisim");
  await expect(contact.getByRole("form", { name: "Toptan talep formu" })).toBeVisible();
  await expect(contact.getByRole("button", { name: "Talebi gönder", exact: true })).toBeDisabled();
  await expect(contact.getByRole("button", { name: "Talebi gönder", exact: true })).toHaveAccessibleDescription("Toptan talep gönderimi henüz kullanıma açık değil. Bilgileriniz gönderilmez.");
  for (const region of [contact, footer]) {
    await expect(region.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
    await expect(region).not.toContainText(/teyit|gönderildi/i);
  }
  await expect(footer.locator("[data-footer-scallop]")).toHaveCount(12);
  const stamp = footer.locator("[data-footer-stamp] img");
  await stamp.scrollIntoViewIfNeeded();
  await expect.poll(() => stamp.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  expect(new URL((await stamp.getAttribute("src"))!, page.url()).searchParams.get("url")).toBe("/images/hero/zeytinlik-1200.webp");
  await expect(stamp).toHaveAttribute("loading", "lazy");
  await expect(stamp).toHaveAttribute("sizes", "88px");
  await expect(footer).toContainText("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ. · Düziçi VD · VKN 0091520061");
  await expect(footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu" })).toHaveAttribute("href", "https://afina.com.tr");
  const metrics = await page.evaluate(() => {
    const faq = document.querySelector("#sik-sorulanlar")!;
    const contact = document.querySelector("#toptan-iletisim")!;
    const footer = document.querySelector("footer")!;
    const card = contact.querySelector("[data-wholesale-card]")!;
    const answers = faq.lastElementChild!;
    return {
      width: innerWidth, height: innerHeight, columns: getComputedStyle(answers).columnCount,
      faqPadding: getComputedStyle(faq).paddingTop, questionFont: getComputedStyle(faq.querySelector("h3")!).fontFamily,
      headingFont: getComputedStyle(faq.querySelector("h2")!).fontFamily, cardWidth: card.getBoundingClientRect().width,
      cardPadding: getComputedStyle(card).paddingTop, background: getComputedStyle(contact).backgroundColor,
      imprintSize: getComputedStyle(footer.querySelector('nav[aria-label="Yasal bilgiler"]')!).fontSize,
      headings: [...faq.querySelectorAll("h2"), contact.querySelector("h2")!].map(node => ({
        height: node.getBoundingClientRect().height, line: parseFloat(getComputedStyle(node).lineHeight),
      })),
    };
  });
  expect(metrics.columns).toBe(metrics.width >= 1024 ? "2" : "1");
  expect(metrics.headingFont).toMatch(/Fraunces/i);
  expect(metrics.questionFont).toMatch(/Figtree/i);
  expect(metrics.cardWidth).toBeLessThanOrEqual(380);
  if (metrics.width >= 1200) expect(metrics.cardWidth).toBe(380);
  expect(metrics.background).toBe("rgb(36, 58, 41)");
  expect(metrics.imprintSize).toBe("14px");
  for (const heading of metrics.headings) expect(heading.height / heading.line).toBeLessThanOrEqual(2.05);
  await mkdir("test-results/095", { recursive: true });
  for (const [name, region] of [["faq", faq], ["contact", contact], ["footer", footer]] as const) {
    await region.evaluate(node => node.scrollIntoView({ block: "start" }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
    await page.screenshot({ path: `test-results/095/${testInfo.project.name}-${name}.png` });
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
  await page.screenshot({ path: `test-results/095/${testInfo.project.name}-footer-end.png` });
  await writeFile(`test-results/095/${testInfo.project.name}-metrics.json`, JSON.stringify({ metrics, errors, media }, null, 2));
  await noOverflow(page);
  expect(errors).toEqual([]);
  expect(media).toEqual([]);
});

test("all footer legal links navigate to their actual draft pages and back", async ({ page }) => {
  for (const [name, href] of [["KVKK", "/kvkk"], ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis"], ["İade ve İptal", "/iade"]]) {
    await open(page);
    const link = page.getByRole("contentinfo").getByRole("link", { name, exact: true });
    expect((await page.request.get(href)).status()).toBe(200);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
    await expect(page.getByText("Taslak — onay bekleniyor", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Ana sayfaya dön" }).click();
    await expect(page).toHaveURL(/\/$/);
  }
});

test("keyboard anchors and three footer links retain visible focus, hover and press states", async ({ page, browserName }) => {
  await open(page);
  const footer = page.getByRole("contentinfo");
  const contactLink = footer.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin", exact: true });
  await contactLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#toptan-iletisim$/);
  await expect(page.locator("#toptan-iletisim")).toBeFocused();
  await expect(page.locator("#toptan-iletisim")).toBeInViewport();
  for (const link of [footer.getByRole("link", { name: "Tesisimiz", exact: true }), footer.getByRole("link", { name: "KVKK", exact: true }), footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu", exact: true })]) {
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    const box = (await link.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    await link.hover();
    const point = (await link.boundingBox())!;
    await page.mouse.move(point.x + 4, point.y + 4);
    await page.mouse.down();
    expect(await link.evaluate(node => node.matches(":active"))).toBe(true);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
  const firstLegal = footer.getByRole("link", { name: "KVKK", exact: true });
  await firstLegal.focus();
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(footer.getByRole("link", { name: "Mesafeli Satış Sözleşmesi", exact: true })).toBeFocused();
  await noOverflow(page);
});

test("reduced motion and JavaScript-free rendering keep every answer, address and legal link readable", async ({ page, browser, baseURL }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await page.locator("#toptan-iletisim").scrollIntoViewIfNeeded();
  await expect(page.locator("#toptan-title")).toHaveCSS("transform", "none");
  await expect(page.locator("[data-footer-stamp]")).toHaveCSS("transform", "none");
  await page.screenshot({ path: `test-results/095/${testInfo.project.name}-reduced.png` });
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: page.viewportSize()!, reducedMotion: "reduce" });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  await expect(staticPage.locator("#sik-sorulanlar h3")).toHaveText(questions);
  await expect(staticPage.locator("#toptan-iletisim address")).toHaveText(address);
  await staticPage.getByRole("contentinfo").getByRole("link", { name: "KVKK", exact: true }).click();
  await expect(staticPage.getByRole("heading", { level: 1, name: "KVKK", exact: true })).toBeVisible();
  await context.close();
});

test("missing stamp and community images do not remove their text, address or navigation", async ({ page }) => {
  await page.route("**/images/hero/**", route => route.abort());
  await page.route("**/brand/afina-topluluk.svg", route => route.abort());
  await open(page);
  const footer = page.getByRole("contentinfo");
  await expect(footer.locator("address")).toHaveText(address);
  await expect(footer.getByRole("link", { name: "AFİNA Şirketler Topluluğu", exact: true })).toHaveAccessibleName("AFİNA Şirketler Topluluğu");
  await footer.getByRole("link", { name: "KVKK", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "KVKK", exact: true })).toBeVisible();
  await noOverflow(page);
});

test("the floating label stays clear of the FAQ, visit card and footer imprint during scroll", async ({ page }) => {
  await open(page);
  for (const selector of ["#sik-sorulanlar", "#toptan-iletisim", "footer"]) {
    const region = page.locator(selector);
    const bounds = await region.evaluate(node => ({ top: node.getBoundingClientRect().top + scrollY, height: node.getBoundingClientRect().height }));
    for (const fraction of [0, 0.5, 1]) {
      await page.evaluate(({ top, height, fraction }) => scrollTo(0, top + fraction * height - innerHeight / 2), { ...bounds, fraction });
      await expect.poll(() => region.evaluate(node => {
        const stub = document.querySelector<HTMLElement>("[data-hero-stub]");
        if (!stub || getComputedStyle(stub).visibility !== "visible") return false;
        const box = stub.getBoundingClientRect();
        const obstacles = node.matches("footer") ? [node.querySelector("svg")!.nextElementSibling!] : node.matches("#toptan-iletisim") ? [node.firstElementChild!] : [...node.querySelectorAll("h2,h3,p")];
        return obstacles.some(obstacle => {
          const rect = obstacle.getBoundingClientRect();
          return box.left < rect.right && box.right > rect.left && box.top < rect.bottom && box.bottom > rect.top;
        });
      })).toBe(false);
    }
  }
});

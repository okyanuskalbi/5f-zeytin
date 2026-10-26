import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Claude runs these after npm run build, against next start (never next dev):
// npm run test:e2e -- tests/e2e/task136-security.spec.ts --project=chromium-390 --project=webkit-390
let errors: string[] = [];

test.beforeEach(async ({ page, baseURL }, info) => {
  errors = [];
  test.skip(!["chromium-390", "webkit-390"].includes(info.project.name));
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Task 136/141 acceptance requires a local production target.");
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && /refused to|content.security.policy/i.test(message.text())) errors.push(message.text());
  });
  await page.exposeFunction("recordCspViolation", (violation: string) => { errors.push(violation); });
  await page.addInitScript(() => {
    // Install before any document scripts/styles execute, on every navigation.
    document.addEventListener("securitypolicyviolation", event => {
      const report = (window as unknown as { recordCspViolation: (violation: string) => Promise<void> }).recordCspViolation;
      void report(`${event.disposition}: ${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 1 }])), CART_STORAGE_KEY);
});
test.afterEach(() => { expect(errors).toEqual([]); });

test("all paths expose enforced CSP with zero policy violations or refused resources", async ({ page }) => {
  for (const path of ["/", "/sepet", "/odeme", "/giris", "/kayit", "/hesabim", "/siparis-takip", "/kvkk", "/admin"]) {
    const response = await page.goto(path);
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
    // Auth pages can retain their stricter no-referrer policy.
    expect(["strict-origin-when-cross-origin", "no-referrer"]).toContain(headers["referrer-policy"]);
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("upgrade-insecure-requests");
    expect(headers["content-security-policy-report-only"]).toBeUndefined();
    await expect(page.locator("main")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (path === "/kayit") {
      await page.getByRole("button", { name: "Şifreyi göster" }).click();
      await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("type", "text");
    }
  }
});

test("enforced CSP permits adding to cart, opening the menu and expanding FAQ answers", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero-intro]");
  await hero.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(hero.getByRole("status")).toContainText("sepete eklendi");
  await expect(page.getByRole("banner").getByRole("button", { name: "Sepetim, 2 adet" })).toBeVisible();

  const menu = page.getByRole("button", { name: "Menüyü aç" });
  await menu.click();
  await expect(page.getByRole("dialog", { name: "Site menüsü" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site menüsü" })).toHaveCount(0);
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  const faq = page.locator("#sik-sorulanlar details").first();
  const question = faq.locator("summary");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(faq.locator("[data-faq-answer]")).toBeVisible();
});

test("sensitive and legal pages omit the mobile cart while the landing keeps its existing buy bar", async ({ page }) => {
  await page.goto("/");
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  await expect(page.getByRole("region", { name: "Hızlı satın alma" })).toBeVisible();
  await expect(page.locator("[data-mini-cart]")).toHaveCount(0);
  for (const path of ["/giris", "/kayit", "/hesabim", "/odeme", "/kvkk", "/iade", "/mesafeli-satis", "/sepet"]) {
    await page.goto(path);
    await expect(page.getByRole("banner").getByRole("button", { name: /^Sepetim/ })).toContainText("1");
    await expect(page.locator("[data-mini-cart], [data-mini-cart-reserve], [data-mobile-buy-bar]")).toHaveCount(0);
  }
});

import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Claude runs these locally: --project=chromium-390 --project=webkit-390.
test.beforeEach(async ({ page, baseURL }, info) => {
  test.skip(!["chromium-390", "webkit-390"].includes(info.project.name));
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Task 136 acceptance requires a local target.");
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 1 }])), CART_STORAGE_KEY);
});

test("all paths expose report-only CSP without CSP-caused runtime failures", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && /content.security.policy/i.test(message.text()) && !/report[ -]only/i.test(message.text())) errors.push(message.text());
  });
  for (const path of ["/", "/sepet", "/kayit", "/admin"]) {
    const response = await page.goto(path);
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
    // Auth pages can retain their stricter no-referrer policy.
    expect(["strict-origin-when-cross-origin", "no-referrer"]).toContain(headers["referrer-policy"]);
    expect(headers["content-security-policy-report-only"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toBeUndefined();
    await expect(page.locator("main")).toBeVisible();
    if (path === "/kayit") {
      await page.getByRole("button", { name: "Şifreyi göster" }).click();
      await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("type", "text");
    }
  }
  expect(errors).toEqual([]);
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

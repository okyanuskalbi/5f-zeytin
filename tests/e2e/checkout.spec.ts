import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const demo = process.env.NEXT_PUBLIC_DEMO === "1";
const main = (page: Page) => page.getByRole("main");
async function seed(page: Page) {
  await page.addInitScript(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([{ productId: "sample-table-olive", quantity: 2 }])); }, CART_STORAGE_KEY);
}
async function fillDetails(page: Page) {
  for (const [label, value] of [["Ad soyad", "Deniz Sofra"], ["E-posta", "deniz@example.test"], ["Telefon", "+905321234567"], ["Mahalle", "Örnek Mahallesi"], ["Açık adres", "Örnek Sokak No: 12"], ["Posta kodu", "80700"]]) await main(page).getByLabel(label, { exact: true }).fill(value);
  await main(page).getByLabel("İl", { exact: true }).selectOption("Osmaniye");
  await main(page).getByLabel("İlçe", { exact: true }).selectOption("Düziçi");
}
async function delivery(page: Page) {
  await main(page).getByRole("button", { name: "Teslimata devam et" }).click();
  await main(page).getByRole("radio", { name: /Standart kargo/ }).check();
  await main(page).getByRole("button", { name: "Ödemeye devam et" }).click();
}
async function photograph(page: Page, state: string, project: string) {
  await mkdir("test-results/110", { recursive: true });
  await page.evaluate(async () => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); await document.fonts.ready; });
  await page.screenshot({ path: `test-results/110/${state}-${project}.png`, fullPage: true });
}

test("production checkout is upcoming and ignores forged step/payment result parameters", async ({ page }, info) => {
  test.skip(demo, "Requires production without demo opt-in.");
  await page.goto("/odeme?step=3&status=success&paid=true");
  await expect(main(page)).toContainText("Yakında");
  await expect(main(page).locator("form, input, iframe")).toHaveCount(0);
  await photograph(page, "production", info.project.name);
});

test.describe("checkout mock journeys", () => {
  test.skip(!demo, "Requires a production build with NEXT_PUBLIC_DEMO=1.");
  test.beforeEach(async ({ page }) => { await seed(page); });

  test("validation, dependent districts, corporate billing and forward/back retain details", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/odeme?step=3&status=success");
    await expect(main(page).locator('[aria-current="step"]')).toContainText("Bilgiler");
    await expect(main(page).getByLabel("İlçe", { exact: true })).toBeDisabled();
    await expect(main(page).getByLabel("İl", { exact: true }).locator("option")).toHaveCount(82);
    await main(page).getByRole("button", { name: "Teslimata devam et" }).click();
    await expect(main(page).getByRole("alert")).toBeFocused();
    await expect(main(page).getByLabel("Ad soyad", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await fillDetails(page);
    await expect(main(page).getByLabel("Telefon", { exact: true })).toHaveValue("0532 123 45 67");
    await main(page).getByLabel("İl", { exact: true }).selectOption("İstanbul");
    await expect(main(page).getByLabel("İlçe", { exact: true })).toHaveValue("");
    await expect(main(page).getByLabel("İlçe", { exact: true }).locator("option")).not.toContainText(["Düziçi"]);
    await main(page).getByLabel("İlçe", { exact: true }).selectOption("Kadıköy");
    await main(page).getByRole("radio", { name: "Kurumsal", exact: true }).check();
    await main(page).getByRole("button", { name: "Teslimata devam et" }).click();
    await expect(main(page).getByLabel("VKN", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await main(page).getByLabel("Firma unvanı", { exact: true }).fill("Örnek AŞ");
    await main(page).getByLabel("VKN", { exact: true }).fill("1234567890");
    await main(page).getByLabel("Vergi dairesi", { exact: true }).fill("Kadıköy");
    await photograph(page, "corporate", info.project.name);
    await main(page).getByRole("button", { name: "Teslimata devam et" }).click();
    await expect(main(page).getByRole("heading", { name: "Teslimat seçimi", exact: true })).toBeFocused();
    await main(page).getByRole("button", { name: "Ödemeye devam et" }).click();
    await expect(main(page).getByRole("alert")).toContainText("Kargo seçimini yapın");
    await main(page).getByRole("radio", { name: /Standart kargo/ }).check();
    await photograph(page, "delivery", info.project.name);
    await main(page).getByRole("button", { name: "Bilgilere dön" }).click();
    await expect(main(page).getByLabel("Ad soyad", { exact: true })).toHaveValue("Deniz Sofra");
    await expect(main(page).getByLabel("VKN", { exact: true })).toHaveValue("1234567890");
    await main(page).getByRole("radio", { name: "Bireysel", exact: true }).check();
    await expect(main(page).getByLabel("VKN", { exact: true })).toHaveCount(0);
    await delivery(page);
    await main(page).getByRole("button", { name: "Teslimata dön" }).click();
    await expect(main(page).getByRole("radio", { name: /Standart kargo/ })).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("consents gate the keyless PayTR warning; no false order or payment success", async ({ page }, info) => {
    const writes: string[] = [];
    page.on("request", request => { if (request.method() === "POST") writes.push(request.url()); });
    await page.goto("/odeme");
    await fillDetails(page);
    await delivery(page);
    await expect(main(page).getByRole("heading", { name: "Ödeme onayı", exact: true })).toBeFocused();
    await expect(main(page).getByLabel("Kupon kodu", { exact: true })).toBeDisabled();
    await expect(main(page).getByRole("button", { name: "Kuponu uygula" })).toBeDisabled();
    await main(page).getByRole("button", { name: "PayTR ekranına geç" }).click();
    await expect(main(page).getByRole("alert")).toContainText("Mesafeli satış");
    await expect(main(page)).not.toContainText("Test anahtarı eksik");
    await main(page).getByRole("checkbox", { name: /Mesafeli satış/ }).check();
    await main(page).getByRole("button", { name: "PayTR ekranına geç" }).click();
    await expect(main(page).getByRole("alert")).toContainText("Ön bilgilendirme");
    await main(page).getByRole("checkbox", { name: /Ön bilgilendirme/ }).check();
    await main(page).getByRole("button", { name: "PayTR ekranına geç" }).click();
    await expect(main(page).getByRole("alert")).toContainText("Test anahtarı eksik");
    await expect(main(page).locator("iframe")).toHaveCount(0);
    await expect(main(page).getByRole("button", { name: "Siparişi tamamla" })).toHaveCount(0);
    await expect(main(page)).toContainText("Kesin toplam henüz hesaplanmadı");
    await expect(main(page).getByRole("link", { name: "Mesafeli satış sözleşmesi (taslak)" })).toHaveAttribute("href", "/mesafeli-satis");
    await expect(main(page).getByRole("link", { name: "Ön bilgilendirme (taslak)" })).toHaveAttribute("href", "/mesafeli-satis#taslak-basligi");
    await photograph(page, "payment", info.project.name);
    await main(page).getByRole("checkbox", { name: /Mesafeli satış/ }).uncheck();
    await expect(main(page)).not.toContainText("Test anahtarı eksik");
    expect(writes).toEqual([]);
    expect(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))).not.toContain("deniz@example.test");
    await page.reload();
    await expect(main(page).locator('[aria-current="step"]')).toContainText("Bilgiler");
    await expect(main(page).getByLabel("Ad soyad", { exact: true })).toHaveValue("");
  });

  test("cart summary, guest path and optional Google demo stay in checkout", async ({ page }, info) => {
    await page.goto("/sepet");
    await main(page).getByRole("link", { name: "Ödemeye geç" }).click();
    await expect(page).toHaveURL(/\/odeme$/);
    await expect(main(page).getByRole("complementary", { name: "Sipariş özeti" })).toContainText("Sofralık Zeytin");
    await expect(main(page).getByRole("complementary", { name: "Sipariş özeti" })).toContainText("251,00");
    await expect(main(page)).toContainText("Misafir olarak devam edebilirsiniz");
    await photograph(page, "details", info.project.name);
    await main(page).getByRole("button", { name: "Google ile devam et", exact: true }).click();
    await expect(main(page).getByLabel("E-posta", { exact: true })).toHaveValue("demo@example.test");
    await expect(page).toHaveURL(/\/odeme$/);
    await expect(main(page)).toContainText("Demo Google profili");
    await page.evaluate(key => localStorage.setItem(key, "[]"), CART_STORAGE_KEY);
    await page.reload();
    await expect(main(page)).toContainText("Sepetiniz boş");
    await expect(main(page).locator("form")).toHaveCount(0);
  });

  test("mobile and reduced-motion keep steps, focus and touch targets usable", async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/odeme");
    await fillDetails(page);
    await main(page).getByRole("button", { name: "Teslimata devam et" }).focus();
    await page.keyboard.press("Enter");
    await expect(main(page).getByRole("heading", { name: "Teslimat seçimi", exact: true })).toBeFocused();
    await main(page).getByRole("radio", { name: /Standart kargo/ }).check();
    await main(page).getByRole("button", { name: "Ödemeye devam et" }).click();
    await main(page).getByRole("checkbox", { name: /Mesafeli satış/ }).check();
    await main(page).getByRole("checkbox", { name: /Ön bilgilendirme/ }).check();
    await main(page).getByRole("button", { name: "PayTR ekranına geç" }).click();
    for (const control of await main(page).locator('button:not(:disabled), input:not([type="checkbox"]):not(:disabled), select:not(:disabled)').all()) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
    await photograph(page, "reduced-motion", info.project.name);
  });
});

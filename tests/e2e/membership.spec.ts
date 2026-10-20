import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const demo = process.env.NEXT_PUBLIC_DEMO === "1";

test("production without demo exposes honest upcoming states", async ({ page }, testInfo) => {
  test.skip(demo, "Production gate is checked on the build without the demo opt-in.");
  await mkdir("test-results/108", { recursive: true });
  for (const route of ["/giris", "/hesabim"]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toContainText("Yakında");
    await expect(page.getByRole("main").locator("form, input")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Google ile devam et" })).toHaveCount(0);
    await page.screenshot({ path: `test-results/108/production-${route.slice(1)}-${testInfo.project.name}.png`, fullPage: true });
  }
});

test.describe("membership mock journeys", () => {
  test.skip(!demo, "Mock journeys require NEXT_PUBLIC_DEMO=1 at build time.");

  test("Google adapter, profile, tabs, order link and sign out preserve guest cart", async ({ page }) => {
    await page.addInitScript(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([{ productId: "sample-table-olive", quantity: 2 }])); }, CART_STORAGE_KEY);
    await page.goto("/giris");
    await expect(page.getByRole("main")).toContainText("Demo");
    await page.getByRole("button", { name: "Google ile devam et", exact: true }).click();
    await expect(page).toHaveURL(/\/hesabim$/);
    await expect(page.getByLabel("E-posta", { exact: true })).toHaveValue("demo@example.test");
    await page.getByLabel("Ad soyad", { exact: true }).fill("Deniz Sofra");
    await page.getByLabel("Telefon", { exact: true }).fill("05321234567");
    await page.getByRole("button", { name: "Profili kaydet" }).click();
    await expect(page.getByRole("status")).toContainText("Profil güncellendi");
    await page.reload();
    await expect(page.getByLabel("Ad soyad", { exact: true })).toHaveValue("Deniz Sofra");
    await page.getByRole("tab", { name: "Siparişlerim" }).click();
    await expect(page.getByRole("link", { name: "Takip et" }).first()).toHaveAttribute("href", "/siparis-takip?no=DEMO-10801");
    await page.getByRole("tab", { name: "Profil", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Adreslerim" })).toBeFocused();
    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page).toHaveURL(/\/giris$/);
    await page.goto("/hesabim");
    await expect(page.getByRole("link", { name: "Giriş yap" })).toBeVisible();
    await page.goto("/sepet");
    await expect(page.getByRole("main")).toContainText("Sepetim");
    await expect(page.getByRole("main").getByRole("status", { name: "Adet" })).toHaveText("2");
  });

  test("email registration, required separate consent, errors, login and reset", async ({ page }) => {
    await page.goto("/giris");
    await page.getByRole("tab", { name: "Üye ol" }).click();
    await page.getByRole("button", { name: "Üyelik oluştur" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Geçerli bir e-posta");
    await expect(page.getByRole("main").getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    await expect(page.getByLabel("E-posta", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("E-posta", { exact: true })).toHaveAttribute("aria-describedby", "auth-email-error");
    await page.getByLabel("Ad soyad", { exact: true }).fill("Deniz Test");
    await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
    await page.getByLabel("Şifre", { exact: true }).fill("Sofrada123!");
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("autocomplete", "new-password");
    await page.getByRole("button", { name: "Şifreyi göster" }).click();
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Üyelik oluştur" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("KVKK");
    await page.getByRole("checkbox", { name: /KVKK/ }).check();
    await page.getByRole("button", { name: "Üyelik oluştur" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Açık rıza");
    await page.getByRole("checkbox", { name: /Açık rıza/ }).check();
    await expect(page.getByRole("checkbox", { name: /Ticari/ })).not.toBeChecked();
    await page.getByRole("button", { name: "Üyelik oluştur" }).click();
    await expect(page).toHaveURL(/\/hesabim$/);
    await page.getByRole("tab", { name: "Siparişlerim" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Henüz siparişiniz yok");
    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("autocomplete", "current-password");
    await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
    await page.getByLabel("Şifre", { exact: true }).fill("Wrong123!");
    await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("E-posta veya şifre");
    await page.getByLabel("Şifre", { exact: true }).fill("Sofrada123!");
    await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
    await expect(page).toHaveURL(/\/hesabim$/);
    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await page.getByRole("button", { name: "Şifremi unuttum" }).click();
    await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
    await page.getByRole("button", { name: "Sıfırlama bağlantısı iste" }).click();
    await expect(page.getByRole("status")).toContainText("e-posta gönderilmedi");
  });

  test("addresses create edit default delete, persistence and validation", async ({ page }) => {
    await page.goto("/giris");
    await page.getByRole("button", { name: "Google ile devam et", exact: true }).click();
    await page.getByRole("tab", { name: "Adreslerim" }).click();
    await page.getByRole("button", { name: "Adres ekle" }).click();
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Adres başlığı");
    for (const [label, value] of [["Adres başlığı", "Ev"], ["Alıcı", "Deniz Test"], ["Telefon", "05321234567"], ["İl", "Osmaniye"], ["İlçe", "Düziçi"], ["Açık adres", "Örnek Mahallesi 12"], ["Posta kodu", "80700"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Varsayılan");
    await page.getByRole("button", { name: "Adres ekle" }).click();
    for (const [label, value] of [["Adres başlığı", "İş"], ["Alıcı", "Deniz Test"], ["Telefon", "05321234567"], ["İl", "Osmaniye"], ["İlçe", "Düziçi"], ["Açık adres", "İş Mahallesi 24"], ["Posta kodu", "80700"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await page.getByRole("button", { name: "Varsayılan yap" }).click();
    const work = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "İş", exact: true }) });
    await expect(work).toContainText("Varsayılan adres");
    await work.getByRole("button", { name: "Düzenle" }).click();
    await page.getByLabel("Adres başlığı", { exact: true }).fill("Ofis");
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await page.reload();
    await page.getByRole("tab", { name: "Adreslerim" }).click();
    await expect(page.getByRole("heading", { name: "Ofis", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Profil", exact: true }).click();
    await page.getByRole("tab", { name: "Adreslerim" }).click();
    await expect(page.getByRole("heading", { name: "Ofis", exact: true })).toBeVisible();
    const office = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Ofis", exact: true }) });
    await office.getByRole("button", { name: "Sil", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
    await expect(office).toBeVisible();
    await office.getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("button", { name: "Adresi sil" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Varsayılan adres");
    await page.getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("button", { name: "Adresi sil" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Henüz adresiniz yok");
  });

  test("responsive captures and reduced motion keep content and actions usable", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.url().startsWith("http://127.0.0.1:") && response.status() >= 400) errors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
    await mkdir("test-results/108", { recursive: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/giris");
    await expect(page.getByRole("button", { name: "Google ile devam et", exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/108/giris-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("tab", { name: "Üye ol" }).click();
    await page.screenshot({ path: `test-results/108/kayit-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("button", { name: "Google ile devam et", exact: true }).click();
    await expect(page.getByLabel("Ad soyad", { exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/108/profil-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("tab", { name: "Adreslerim" }).click();
    await page.getByRole("button", { name: "Adres ekle" }).click();
    await page.screenshot({ path: `test-results/108/adres-${testInfo.project.name}.png`, fullPage: true });
    await page.getByRole("tab", { name: "Siparişlerim" }).click();
    await page.screenshot({ path: `test-results/108/hesabim-${testInfo.project.name}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("checkout suggests optional Google login while keeping the guest path", async ({ page }) => {
    const devURL = process.env.FRAME_SEQUENCE_DEV_URL;
    test.skip(!devURL, "Payment preview is intentionally unavailable in production.");
    await page.goto(`${devURL}/odeme-onizleme`);
    await expect(page.getByRole("link", { name: "Google ile hızlı giriş" })).toHaveAttribute("href", "/giris");
    await expect(page.getByRole("complementary", { name: "İsteğe bağlı üyelik" })).toContainText("Misafir olarak ödemeye devam edebilirsiniz");
    await expect(page.locator("form")).toHaveCount(0);
  });
});

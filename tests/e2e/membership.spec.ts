import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

const demo = process.env.NEXT_PUBLIC_DEMO === "1";

// Preserve account demo acceptance without depending on removed Google mock UI.
async function seedDemoSession(page: Page) {
  // Seed once on this page, so logout and reload cannot silently sign in again.
  await page.goto("/hesabim");
  await page.evaluate(() => sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify({ id: "demo-google", name: "Demo Misafir", email: "demo@example.test", phone: "" })));
}

test("production without demo exposes honest upcoming states", async ({ page }, testInfo) => {
  test.skip(demo, "Production gate is checked on the build without the demo opt-in.");
  await mkdir("test-results/108", { recursive: true });
  for (const route of ["/hesabim"]) {
    await page.goto(route);
    await expect(page.getByRole("main")).toContainText("yakında.");
    await expect(page.getByRole("main").locator("form, input")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Google ile devam et" })).toHaveCount(0);
    await page.screenshot({ path: `test-results/108/production-${route.slice(1)}-${testInfo.project.name}.png`, fullPage: true });
  }
});

test.describe("membership mock journeys", () => {
  test.skip(!demo, "Mock journeys require NEXT_PUBLIC_DEMO=1 at build time.");

  test("demo profile, tabs, order link and sign out preserve guest cart", async ({ page }) => {
    await page.addInitScript(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 2 }])); }, CART_STORAGE_KEY);
    await seedDemoSession(page);
    await page.goto("/hesabim");
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

  // Real registration/login acceptance now lives in register.spec.ts and login.spec.ts.

  test("addresses create edit default delete, persistence and validation", async ({ page }) => {
    await seedDemoSession(page);
    await page.goto("/hesabim");
    await page.getByRole("tab", { name: "Adreslerim" }).click();
    await page.getByRole("button", { name: "Adres ekle" }).click();
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Adres başlığı");
    for (const [label, value] of [["Adres başlığı", "Ev"], ["Alıcı", "Deniz Test"], ["Telefon", "05321234567"], ["İl", "Osmaniye"], ["İlçe", "Düziçi"], ["Açık adres", "Örnek Mahallesi 12"], ["Posta kodu", "80700"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Varsayılan");
    await expect(page.getByRole("form", { name: "Adres bilgileri" })).toHaveCount(0);
    await page.getByRole("button", { name: "Adres ekle" }).click();
    await expect(page.getByLabel("Adres başlığı", { exact: true })).toHaveValue("");
    for (const [label, value] of [["Adres başlığı", "İş"], ["Alıcı", "Deniz Test"], ["Telefon", "05321234567"], ["İl", "Osmaniye"], ["İlçe", "Düziçi"], ["Açık adres", "İş Mahallesi 24"], ["Posta kodu", "80700"]]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("form", { name: "Adres bilgileri" })).toHaveCount(0);
    const work = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "İş", exact: true }) });
    await work.getByRole("button", { name: "Varsayılan yap" }).click();
    await expect(work).toContainText("Varsayılan adres");
    await work.getByRole("button", { name: "Düzenle" }).click();
    await page.getByLabel("Adres başlığı", { exact: true }).fill("Ofis");
    await page.getByRole("button", { name: "Adresi kaydet" }).click();
    await expect(page.getByRole("heading", { name: "Ofis", exact: true })).toBeVisible();
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
    await expect(page.getByRole("button", { name: "E-posta ile giriş yap", exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/108/giris-${testInfo.project.name}.png`, fullPage: true });
    await page.goto("/kayit");
    await page.screenshot({ path: `test-results/108/kayit-${testInfo.project.name}.png`, fullPage: true });
    await seedDemoSession(page);
    await page.goto("/hesabim");
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

import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const demo = process.env.NEXT_PUBLIC_DEMO === "1";
const main = (page: Page) => page.getByRole("main");
async function lookup(page: Page, no: string, contact = "demo@example.test") {
  await page.getByLabel("Sipariş numarası", { exact: true }).fill(no);
  await page.getByLabel("E-posta veya telefon son 4", { exact: true }).fill(contact);
  await page.getByRole("button", { name: "Siparişimi bul" }).click();
}
async function photograph(page: Page, name: string, project: string) {
  await mkdir("test-results/109", { recursive: true });
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: `test-results/109/${name}-${project}.png`, fullPage: true });
}

test("production tracking is upcoming without explicit demo opt-in", async ({ page }, info) => {
  test.skip(demo, "Requires the production build without demo opt-in.");
  for (const query of ["", "?no=DEMO-10801"]) {
    await page.goto(`/siparis-takip${query}`);
    await expect(main(page)).toContainText("Yakında");
    await expect(main(page).locator("form, input, article")).toHaveCount(0);
    await expect(main(page)).not.toContainText("demo@example.test");
    await expect(main(page).getByRole("link")).toHaveAttribute("href", "/#urunler");
  }
  await photograph(page, "production", info.project.name);
});

test.describe("tracking mock journeys", () => {
  test.skip(!demo, "Requires NEXT_PUBLIC_DEMO=1 at build time.");

  test("three timelines, timestamps, summary masking and conditional shipping", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/siparis-takip");
    await expect(main(page)).toContainText("Demo sipariş takibi");
    await photograph(page, "form", info.project.name);
    for (const [no, status, completed] of [["DEMO-10902", "Hazırlanıyor", 3], ["DEMO-10801", "Kargoya verildi", 4], ["DEMO-10800", "Teslim edildi", 6]] as const) {
      await lookup(page, no, no === "DEMO-10800" ? "4567" : "demo@example.test");
      const result = main(page).getByRole("article");
      await expect(result.getByRole("heading", { name: no })).toBeFocused();
      await expect(result.locator('[aria-current="step"]')).toContainText(status);
      await expect(result.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(completed));
      await expect(result.locator("ol > li")).toHaveCount(6);
      await expect(result.locator("ol time")).toHaveCount(completed);
      await expect(result.locator("ol > li").first()).toContainText(/09:00/);
      await expect(result).toContainText("D*** S*** · Ö*** Mah. No: **");
      await expect(result).toContainText("2 adet");
      await expect(result).toContainText("Toplam");
      if (status === "Hazırlanıyor") {
        await expect(result).toContainText("Kargo bilgileri henüz eklenmedi");
        await expect(result.getByRole("button", { name: "Takip numarasını kopyala" })).toHaveCount(0);
      } else {
        await expect(result).toContainText("Örnek kargo firması");
        await expect(result).toContainText("DEMO-KARGO-");
        // No carrier decision: show an honest pending link instead of inventing an external service.
        await expect(result.getByRole("link", { name: /Kargo firmasında takip et/ })).toHaveCount(0);
        await expect(result).toContainText("firma belirlendiğinde");
      }
      if (status === "Kargoya verildi") await expect(result).toContainText("Tahmini teslim: 23 Ekim 2026");
      else await expect(result).not.toContainText("Tahmini teslim:");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await photograph(page, no, info.project.name);
    }
    expect(errors).toEqual([]);
  });

  test("generic not-found, field validation, no-only URL and attempt limit survive reload", async ({ page }) => {
    await page.goto("/siparis-takip?no=DEMO-10801");
    await expect(page.getByLabel("Sipariş numarası", { exact: true })).toHaveValue("DEMO-10801");
    await expect(main(page).getByRole("article")).toHaveCount(0);
    await page.getByRole("button", { name: "Siparişimi bul" }).click();
    await expect(page.getByLabel("E-posta veya telefon son 4", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("E-posta veya telefon son 4", { exact: true })).toBeFocused();
    await lookup(page, "DEMO-10801", "wrong@example.test");
    const message = await main(page).getByRole("alert").innerText();
    await lookup(page, "DEMO-00000");
    await expect(main(page).getByRole("alert")).toHaveText(message);
    await expect(main(page).getByRole("article")).toHaveCount(0);
    for (let i = 0; i < 3; i++) await lookup(page, `DEMO-0000${i}`);
    await page.reload();
    await lookup(page, "DEMO-10801", "4567");
    await expect(main(page).getByRole("alert")).toContainText("Deneme sınırına ulaştınız");
    await expect(main(page).getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    await expect(main(page).getByRole("article")).toHaveCount(0);
  });

  test("clipboard success and denial give honest feedback", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { async writeText(value: string) { sessionStorage.setItem("copied-tracking", value); } } }));
    await page.goto("/siparis-takip");
    await lookup(page, "DEMO-10801");
    await page.getByRole("button", { name: "Takip numarasını kopyala" }).click();
    await expect(main(page).getByRole("status").filter({ hasText: "kopyalandı" })).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("copied-tracking"))).toBe("DEMO-KARGO-10801");
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { async writeText() { throw new Error("denied"); } } }));
    await page.getByRole("button", { name: "Takip numarasını kopyala" }).click();
    await expect(main(page).getByRole("status").filter({ hasText: "Kopyalanamadı" })).toBeVisible();
    await lookup(page, "DEMO-10800");
    await expect(main(page)).not.toContainText("Kopyalanamadı");
  });

  test("account links open owned orders directly; sign-out and other demo users cannot", async ({ page }) => {
    await page.goto("/giris");
    await page.getByRole("button", { name: "Google ile devam et", exact: true }).click();
    await page.getByRole("tab", { name: "Siparişlerim" }).click();
    await page.getByRole("link", { name: "Takip et" }).first().click();
    await expect(main(page).getByRole("article")).toContainText("DEMO-10801");
    await page.getByRole("navigation", { name: "Siparişleriniz" }).getByRole("button", { name: /DEMO-10800/ }).click();
    await expect(main(page).getByRole("article")).toContainText("DEMO-10800");
    await page.goto("/siparis-takip");
    await page.getByRole("navigation", { name: "Siparişleriniz" }).getByRole("button", { name: /DEMO-10801/ }).click();
    await expect(main(page).getByRole("article")).toContainText("DEMO-10801");
    await page.goto("/hesabim");
    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page).toHaveURL(/\/giris$/);
    await page.goto("/siparis-takip?no=DEMO-10801");
    await expect(main(page).getByRole("article")).toHaveCount(0);
    await page.evaluate(() => sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify({ id: "demo-other", name: "Other User", email: "other@example.test", phone: "" })));
    await page.reload();
    await expect(main(page).getByRole("article")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Siparişleriniz" })).toHaveCount(0);
  });

  test("keyboard and reduced-motion keep all content and controls accessible", async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/siparis-takip");
    const number = page.getByLabel("Sipariş numarası", { exact: true });
    await number.focus();
    await number.fill("DEMO-10801");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-posta veya telefon son 4", { exact: true })).toBeFocused();
    await page.keyboard.type("4567");
    const submit = page.getByRole("button", { name: "Siparişimi bul" });
    if (info.project.use.isMobile) {
      // iOS WebKit Tab visits text inputs only; exercise its actual touch submit.
      await submit.tap();
    } else {
      await page.keyboard.press("Tab");
      await expect(submit).toBeFocused();
      expect(await submit.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
      await page.keyboard.press("Enter");
    }
    await expect(main(page).getByRole("article")).toBeVisible();
    await expect(page.getByTestId("tracking-progress-fill")).toHaveCSS("transform", /matrix\(0\.666/);
    expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
    for (const button of await main(page).getByRole("button").all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await photograph(page, "reduced-motion", info.project.name);
  });
});

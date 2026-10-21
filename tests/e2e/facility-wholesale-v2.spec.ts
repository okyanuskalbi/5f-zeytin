import { expect, test } from "@playwright/test";

// V3 replaces the former neon map band and unavailable wholesale form.
test("trust strip and facility use the approved flat table-white surface", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByRole("region", { name: "Alışveriş bilgileri" });
  await expect(strip.getByRole("listitem")).toHaveCount(3);
  await expect(strip).toContainText("Kargo 2–4 iş günü");
  await expect(strip).toContainText("Örnek süre");
  await expect(strip).toContainText("PayTR ile güvenli ödeme");
  await expect(strip).toContainText("Kendi tesisimizde dolum");
  for (const surface of [strip, page.locator("#tesisimiz")]) {
    await expect(surface).toHaveCSS("background-color", "rgb(250, 247, 240)");
  }
  await expect(strip.locator("svg[aria-hidden=true]")).toHaveCount(3);
  await expect(page.locator("#toptan form, #toptan input, #toptan button, #toptan a")).toHaveCount(0);
  await expect(page.locator("#toptan")).toContainText("İletişim bilgileri yakında");
});

test("reduced motion leaves all facility copy and native disclosures accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#tesisimiz");
  await expect(page.locator("#tesisimiz h2")).toBeVisible();
  await expect(page.locator("#toptan-title")).toBeVisible();
  for (const details of await page.locator("#sik-sorulanlar details").all()) {
    await details.locator("summary").click();
    await expect(details.locator("[data-faq-answer]")).toBeVisible();
  }
});

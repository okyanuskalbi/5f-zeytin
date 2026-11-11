import { expect, test } from "@playwright/test";
import { verifiedFaqs } from "../../lib/site/faqs";

test("native factual answers support pointer and keyboard", async ({ page }) => {
  await page.goto("/hakkimizda#sik-sorulanlar");
  const faq = page.locator("#sik-sorulanlar");
  await expect(faq.locator("summary")).toHaveText(verifiedFaqs.map(item => item.question));
  for (const item of await faq.locator("details").all()) {
    const summary = item.locator("summary");
    const answer = item.locator("p");
    await expect(answer).toBeHidden();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(item).toHaveAttribute("open", "");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(item).not.toHaveAttribute("open", "");
    await summary.click();
    await expect(answer).toBeVisible();
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

test("footer keeps official contact, categories, legal links and local payment artwork", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator('a[href="mailto:info@afina.com.tr"]')).toBeVisible();
  await expect(footer.locator('a[href="tel:+903288827708"]')).toBeVisible();
  await expect(footer.getByRole("navigation", { name: "Kategoriler" }).getByRole("link")).toHaveCount(5);
  for (const href of ["/toptan-satis", "/bayilik", "/kvkk", "/mesafeli-satis", "/iade"]) await expect(footer.locator(`a[href="${href}"]`)).toBeVisible();
  const images = footer.getByRole("group", { name: "Güvenli ödeme" }).locator("img");
  await expect(images).toHaveCount(4);
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute("src", /^\/images\/payment\//);
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  expect(await footer.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
});

test("FAQ and legal destinations remain available without JavaScript", async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: page.viewportSize()!, reducedMotion: "reduce" });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/hakkimizda#sik-sorulanlar");
    for (const details of await staticPage.locator("#sik-sorulanlar details").all()) {
      await details.locator("summary").click();
      await expect(details.locator("p")).toBeVisible();
    }
    await staticPage.getByRole("contentinfo").getByRole("link", { name: "KVKK", exact: true }).click();
    await expect(staticPage).toHaveURL(/\/kvkk$/);
    await expect(staticPage.getByRole("heading", { level: 1 })).toBeVisible();
  } finally { await context.close(); }
});

test("the wholesale page retains the labelled manual request form", async ({ page }) => {
  await page.goto("/toptan-satis#toptan");
  const form = page.getByRole("form", { name: "Kurumsal teklif talebi" });
  await expect(form).toBeVisible();
  await expect(form.getByRole("button", { name: "Talep özetini hazırla" })).toBeVisible();
  await expect(form.getByRole("link", { name: /KVKK/ })).toHaveAttribute("href", "/kvkk");
  await expect(page.locator("[data-mobile-buy-bar]")).toHaveCount(0);
});

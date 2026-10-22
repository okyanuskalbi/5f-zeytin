import { expect, test, type Page } from "@playwright/test";

// Claude executes: headless bundled Chromium only, --project=chromium-1440 --workers=2.
// Lighthouse gates: mobile >=85, simulated LCP <2.5s, CLS <0.1, font CLS <=0.02, A11y >=95.
test.beforeEach(async ({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-1440", "Single headless Chromium project owns these responsive cases.");
});

async function readStep(page: Page, index: number): Promise<void> {
  const row = page.locator(`article[data-story-step="${index}"]`);
  await row.locator("figure").scrollIntoViewIfNeeded();
  await expect(row.locator("figure")).toHaveCSS("opacity", "1");
  await expect(row.locator("img")).toBeVisible();
}

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`v4 quality at ${width}px: headings, overflow, anchors, targets and native scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("article[data-product-id]")).toHaveCount(6);
    await expect(page.locator("[data-story-step]")).toHaveCount(3);
    await expect(page.locator("[data-faq]")).toHaveCount(3);
    for (const selector of ["[data-hero-intro]", "#urunler", "#tesisimiz", "[data-hero-band]", "#toptan-iletisim", "#sik-sorulanlar", "footer"]) {
      await page.locator(selector).evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      const headings = await page.locator(`${selector} h1, ${selector} h2, ${selector} h3`).evaluateAll(nodes => nodes.filter(node => !node.classList.contains("sr-only")).map(node => {
        const style = getComputedStyle(node);
        return { text: node.textContent, lines: node.getBoundingClientRect().height / parseFloat(style.lineHeight), clipped: node.scrollWidth > node.clientWidth + 1 };
      }));
      for (const heading of headings) {
        // The task's two-line display-heading gate applies at 390/768/1440.
        // Long product names at the narrower widths must remain fully available.
        if ([390, 768, 1440].includes(width)) expect(heading.lines, heading.text ?? "").toBeLessThanOrEqual(2.05);
        expect(heading.clipped, heading.text ?? "").toBe(false);
      }
    }
    await page.locator("#urunler").scrollIntoViewIfNeeded();
    for (const control of await page.locator('#urunler button, [data-hero-card] label').all()) {
      const box = await control.boundingBox();
      if (box) { expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); }
    }
    await page.getByRole("link", { name: "Ana içeriğe geç" }).focus();
    await expect(page.getByRole("link", { name: "Ana içeriğe geç" })).toHaveCSS("outline-width", "2px");
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect(page.locator("footer")).toBeInViewport();
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 768, 1440]) {
  test(`v4 independent story rows stay readable in both scroll directions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    for (const index of [0, 1, 2, 1, 0]) await readStep(page, index);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("#tesisimiz article")).toHaveCount(3);
    await expect(page.locator("[data-story-sticky]")).toHaveCount(0);
    for (const node of await page.locator("#tesisimiz figure, [data-hero-photo], [data-band-photo], [data-product-reveal]").all()) {
      await expect(node).toHaveCSS("transform", "none");
      await expect(node).toHaveCSS("opacity", "1");
    }
    await expect(page.locator("#tesisimiz img")).toHaveCount(3);
    await expect(page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle" })).toBeEnabled();
  });
}

test("mobile buy bar reserves space, hides at hero/footer/dialogs and remains operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const bar = page.locator("[data-mobile-buy-bar]");
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  await page.locator("#urunler").evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
  await expect(bar).toHaveAttribute("data-visible", "true");
  const reserve = await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBottom));
  expect(reserve).toBeGreaterThanOrEqual((await bar.boundingBox())!.height - 1);
  await bar.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await expect(bar.getByRole("status")).toContainText("sepete eklendi");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(page.getByRole("dialog", { name: "Site menüsü" })).toBeVisible();
  await expect(bar).toHaveAttribute("data-visible", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeFocused();
  await expect(bar).toHaveAttribute("data-visible", "true");
  await page.getByRole("button", { name: /Sepetim,/ }).click();
  await expect(page.getByRole("dialog", { name: /^Sepetim \(/ })).toBeVisible();
  await expect(bar).toHaveAttribute("data-visible", "false");
  await page.keyboard.press("Escape");
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(bar).toHaveAttribute("data-visible", "false");
});

test("200% text sizing keeps hero controls and the mobile bar reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await expect(page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle" })).toBeVisible();
  await page.locator("#urunler").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator("[data-mobile-buy-bar]")).toHaveAttribute("data-visible", "true");
});

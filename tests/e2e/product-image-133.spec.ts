import { expect, test } from "@playwright/test";

const products = ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-olive-oil-1l", "sample-olive-oil-5l", "sample-brined-green-olive-5kg"];

test.beforeEach(async ({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-390", "One packaged Chromium matrix.");
});
for (const width of [390, 1440]) for (const reducedMotion of ["reduce", "no-preference"] as const) for (const id of products) {
  test(`${id}, ${width}, ${reducedMotion}: complete packaging and stable image space`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(`/?urun=${id}`);
    const detail = page.locator("[data-product-page]");
    await expect(detail).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const container = detail.locator("[data-product-detail-image]");
    const image = container.locator("img");
    await container.scrollIntoViewIfNeeded();
    const reserved = (await container.boundingBox())!;
    for (const [label, filename] of [["Sofra görseli", "sahne"], ["Stüdyo görseli", "studyo"]]) {
      const button = detail.getByRole("button", { name: label });
      await button.click();
      await expect(image).toHaveAttribute("src", new RegExp(filename));
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      // Task205: the studio photograph is contained whole; the wide table scene fills the 4:5 stage,
      // cropped towards its right side where the packaging stands (all six scenes checked by eye).
      await expect(image).toHaveCSS("object-fit", filename === "studyo" ? "contain" : "cover");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      const current = (await container.boundingBox())!;
      expect(current.width).toBeCloseTo(reserved.width, 0);
      expect(current.height).toBeCloseTo(reserved.height, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
    await page.keyboard.press("Escape");
    await expect(detail).toBeVisible();
  });
}

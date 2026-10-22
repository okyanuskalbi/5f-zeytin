import { expect, test, type Locator } from "@playwright/test";

// Claude will run browser acceptance; Coder writes this suite without running it.
const products = [
  "sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg",
  "sample-olive-oil-1l", "sample-olive-oil-5l", "sample-brined-green-olive-5kg",
];
type Bounds = { x: number; y: number; width: number; height: number };
async function bounds(locator: Locator): Promise<Bounds> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}
function sameBounds(actual: Bounds, expected: Bounds, tolerance = 1): void {
  for (const edge of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(actual[edge] - expected[edge]), edge).toBeLessThanOrEqual(tolerance);
  }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    for (const id of products) {
      test(`${id}, ${viewport.width}×${viewport.height}, ${reducedMotion}: image fills the stable gallery`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion });
        await page.goto(`/?urun=${id}`);
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        const idle = async () => {
          await expect.poll(() => dialog.evaluate(node => node.getAnimations({ subtree: true })
            .filter(animation => animation.playState === "running").length)).toBe(0);
        };
        await idle();
        const gallery = dialog.locator("[data-product-detail-gallery]");
        const image = dialog.locator("[data-product-detail-image] img");
        const info = dialog.locator("[data-product-detail-info]");
        const thumbnails = dialog.getByRole("group", { name: "Ürün görselleri" });
        const reserved = await bounds(gallery);

        for (const [label, filename] of [["Stüdyo görseli", "studyo"], ["Sofra görseli", "sahne"], ["Stüdyo görseli", "studyo"]]) {
          await thumbnails.getByRole("button", { name: label }).click();
          await expect(image).toHaveAttribute("src", new RegExp(filename));
          await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
          await idle();
          sameBounds(await bounds(gallery), reserved);
          sameBounds(await bounds(image), await bounds(gallery));
          await expect(image).toHaveCSS("object-fit", "cover");
          await expect(image).toHaveCSS("object-position", filename === "studyo" ? "50% 50%" : /(?:80|85|90)% 50%/);
          const column = await bounds(gallery);
          const strip = await bounds(thumbnails);
          expect(strip.x).toBeGreaterThanOrEqual(column.x);
          expect(strip.x + strip.width).toBeLessThanOrEqual(column.x + column.width);
          expect(strip.y).toBeGreaterThanOrEqual(column.y);
          expect(Math.abs(column.y + column.height - strip.y - strip.height - 16)).toBeLessThanOrEqual(1);
          await expect(thumbnails.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true");

          if (viewport.width >= 768) {
            const right = await bounds(info);
            expect(Math.abs(column.y + column.height - right.y - right.height)).toBeLessThanOrEqual(2);
            expect(Math.abs(column.height - (await bounds(dialog)).height)).toBeLessThanOrEqual(2);
            await info.evaluate(node => { node.scrollTop = 200; });
            sameBounds(await bounds(gallery), reserved);
          } else {
            expect(Math.abs(column.height - Math.min(viewport.height * 0.62, viewport.width * 1.25))).toBeLessThanOrEqual(1);
            expect(Math.abs((await bounds(info)).y - column.y - column.height - 16)).toBeLessThanOrEqual(1);
          }
        }
        expect((await bounds(dialog)).height).toBeLessThanOrEqual(viewport.height - 48 + 1);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
      });
    }
  }
}

import { expect, test } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";

// Claude runs this with the configured mobile/desktop projects and measures LCP.
test("keeps first-screen hero images eager and product variant headings distinct", async ({ page }) => {
  await page.goto("/");
  for (const image of await page.locator("[data-hero-intro] img").all()) {
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
  }
  for (const image of await page.locator("article[data-product-id] img").all()) {
    await expect(image).toHaveAttribute("loading", "lazy");
  }
  for (const product of await getProducts()) {
    await expect(page.getByRole("heading", { level: 3, name: `${product.name}, ${product.weight}`, exact: true })).toHaveCount(1);
  }
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /^https:\/\/afinazeytin\.com\/?$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "tr_TR");
});

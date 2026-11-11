import { expect, test } from "@playwright/test";
import { getProducts } from "../../lib/catalog/static-products";

// Claude runs this with the configured mobile/desktop projects and measures LCP.
test("keeps first-screen hero images eager and product variant headings distinct", async ({ page }) => {
  await page.goto("/");
  for (const image of await page.locator('[data-home-section="hero"] img').all()) {
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
  }
  for (const image of await page.locator("article[data-product-id] img").all()) {
    await expect(image).toHaveAttribute("loading", "lazy");
  }
  for (const product of await getProducts()) {
    const headings = page.locator(`article[data-product-id="${product.id}"] h3`);
    expect(await headings.count()).toBeGreaterThan(0);
    for (const heading of await headings.all()) await expect(heading).toHaveText(product.name);
  }
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /^https:\/\/afinazeytin\.com\/?$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "tr_TR");
});

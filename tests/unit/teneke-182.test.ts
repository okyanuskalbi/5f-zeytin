import { expect, it } from "vitest";
import { getProducts } from "@/lib/catalog/static-products";
import { getProductDetails } from "@/lib/catalog/product-details";

it.each([
  ["sample-green-olive-10kg", 220000, 6],
  ["sample-brined-green-olive-5kg", 110000, 8],
] as const)("%s keeps commerce identity and switches to 3 L", async (id, priceKurus, stock) => {
  const product = (await getProducts()).find(product => product.id === id)!;
  expect(product).toMatchObject({ id, priceKurus, stock, weight: "3 L" });
  expect(getProductDetails(product)?.description).toContain("3 L yuvarlak teneke");
  expect(getProductDetails(product)?.description).not.toMatch(/10 kg|5 kg/);
});

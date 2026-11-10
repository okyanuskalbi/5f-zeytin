import { expect, it } from "vitest";
import { getGroupTrail, getTopLevelGroup, productGroups, productsForGroup, sortProducts } from "@/lib/catalog/groups";
import { getProductFamilies } from "@/lib/catalog/static-products";

it("keeps oil and olives at the root with three olive children in one category source", () => {
  expect(productGroups.filter(group => group.parentId === null).map(group => group.id)).toEqual(["zeytinyagi", "zeytin"]);
  expect(productGroups.filter(group => group.parentId === "zeytin").map(group => group.id)).toEqual(["siyah-zeytin", "yesil-zeytin", "kirma-zeytin"]);
  expect(getGroupTrail("kirma-zeytin").map(group => group.id)).toEqual(["zeytin", "kirma-zeytin"]);
  expect(getTopLevelGroup("kirma-zeytin")?.id).toBe("zeytin");
  expect(getGroupTrail("unknown")).toEqual([]);
});

it("includes every olive family and all four sizes in the olive parent without changing oil", async () => {
  const families = await getProductFamilies();
  const olives = productsForGroup(families, "zeytin");
  expect(olives).toHaveLength(4);
  expect(new Set(olives.map(product => product.familyId)).size).toBe(3);
  expect(olives.every(product => product.category !== "zeytinyagi")).toBe(true);
  expect(productsForGroup(families, "zeytinyagi")).toHaveLength(2);
});

it("sorts by integer price stably and leaves the catalogue input unchanged", async () => {
  const products = productsForGroup(await getProductFamilies());
  const snapshot = products.map(product => product.id);
  expect(sortProducts(products, "fiyat-artan").map(product => product.priceKurus)).toEqual([22000, 22000, 35000, 110000, 175000, 220000]);
  expect(sortProducts(products, "fiyat-azalan").map(product => product.priceKurus)).toEqual([220000, 175000, 110000, 35000, 22000, 22000]);
  expect(sortProducts(products, "onerilen").map(product => product.id)).toEqual(snapshot);
  expect(sortProducts(products, "bad").map(product => product.id)).toEqual(snapshot);
  expect(products.map(product => product.id)).toEqual(snapshot);
});

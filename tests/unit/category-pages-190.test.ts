// @vitest-environment node
import { expect, it } from "vitest";
import config from "@/next.config";
import sitemap from "@/app/sitemap";
import { getGroupTrail, getProductGroup, productGroups, productsForGroup } from "@/lib/catalog/groups";
import { getProductFamilies } from "@/lib/catalog/static-products";
import type { ProductFamily } from "@/types/catalog";

// Task208: the category pages (`/urunler/<grup>`) were retired; each address redirects to the matching category
// pill of the home page. What the pill shows is covered in category-navigation-190 and storefront-shop-205.
it("defines the two root groups and three ordered olive children and assigns every family to one known group", async () => {
  expect(productGroups.map(group => [group.id, group.name, group.photo])).toEqual([
    ["zeytinyagi", "Zeytinyağı", "zeytinyagi"], ["zeytin", "Zeytin", "siyah-zeytin"],
    ["siyah-zeytin", "Siyah Zeytin", "siyah-zeytin"], ["yesil-zeytin", "Yeşil Zeytin", "yesil-zeytin"], ["kirma-zeytin", "Kırma Zeytin", "kirma-zeytin"],
  ]);
  for (const family of await getProductFamilies()) expect(productGroups.filter(group => group.id === family.groupId)).toHaveLength(1);
});

it.each([
  ["zeytin", ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-brined-green-olive-5kg"]],
  ["siyah-zeytin", ["sample-black-olive-1kg"]], ["yesil-zeytin", ["sample-brined-green-olive-5kg"]],
  ["kirma-zeytin", ["sample-green-olive-10kg", "sample-green-olive-1kg"]], ["zeytinyagi", ["sample-olive-oil-1l", "sample-olive-oil-5l"]],
] as const)("keeps every approved size in %s and its hierarchical trail", async (id, ids) => {
  expect(productsForGroup(await getProductFamilies(), id).map(product => product.id)).toEqual(ids);
  const group = getProductGroup(id)!;
  expect(getGroupTrail(id).at(-1)).toBe(group);
  expect(getGroupTrail(id).map(item => item.id)).toEqual(group.parentId ? [group.parentId, id] : [id]);
});

it("redirects every category address permanently to its pill on the home page and keeps both out of the sitemap", async () => {
  const redirects = await config.redirects?.() ?? [];
  expect(redirects).toContainEqual({ source: "/urunler/:kategori", destination: "/?kategori=:kategori#urunler", permanent: true });
  expect(redirects).toContainEqual({ source: "/urunler", destination: "/#urunler", permanent: true });
  expect(sitemap().some(entry => /\/urunler(\/|$)|kategori=/.test(entry.url))).toBe(false);
});

it("includes all sizes from two separate families assigned to one group", async () => {
  const families = await getProductFamilies();
  const black = families.find(family => family.groupId === "siyah-zeytin")!;
  const second: ProductFamily = { ...black, id: "second-black", variants: [
    { ...black.variants[0], id: "test-black-small", familyId: "second-black" },
    { ...black.variants[0], id: "test-black-large", familyId: "second-black", weight: "2 kg" },
  ] };
  expect(productsForGroup([...families, second], "siyah-zeytin").map(product => product.id)).toEqual(["sample-black-olive-1kg", "test-black-small", "test-black-large"]);
});

it("knows no unknown group, so an unknown address can never show another group's products", () => {
  expect(getProductGroup("olmayan")).toBeUndefined();
  expect(getGroupTrail("olmayan")).toEqual([]);
});

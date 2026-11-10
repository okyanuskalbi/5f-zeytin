import type { ProductFamily, ProductVariant } from "@/types/catalog";

/** The public category tree; checkout product categories remain unchanged. */
export const productGroups = [
  { id: "zeytinyagi", name: "Zeytinyağı", photo: "zeytinyagi", parentId: null },
  { id: "zeytin", name: "Zeytin", photo: "siyah-zeytin", parentId: null },
  { id: "siyah-zeytin", name: "Siyah Zeytin", photo: "siyah-zeytin", parentId: "zeytin" },
  { id: "yesil-zeytin", name: "Yeşil Zeytin", photo: "yesil-zeytin", parentId: "zeytin" },
  { id: "kirma-zeytin", name: "Kırma Zeytin", photo: "kirma-zeytin", parentId: "zeytin" },
] as const;

export type ProductGroupId = (typeof productGroups)[number]["id"];
export type ProductSort = "onerilen" | "fiyat-artan" | "fiyat-azalan";

export function getProductGroup(id: string) {
  return productGroups.find(group => group.id === id);
}

export function getTopLevelGroup(id: string) {
  const group = getProductGroup(id);
  return group?.parentId ? getProductGroup(group.parentId) : group;
}

export function getGroupTrail(id: string) {
  const group = getProductGroup(id);
  const parent = group?.parentId ? getProductGroup(group.parentId) : undefined;
  return parent && group ? [parent, group] : group ? [group] : [];
}

export function productsForGroup(families: readonly ProductFamily[], groupId?: ProductGroupId): ProductVariant[] {
  const descendants = productGroups.filter(group => group.parentId === groupId).map(group => group.id);
  return families.filter(family => groupId === undefined || family.groupId === groupId || descendants.some(id => family.groupId === id))
    .flatMap(family => family.variants).sort((a, b) => a.imageKey.localeCompare(b.imageKey));
}

export function sortProducts(products: readonly ProductVariant[], order: string): ProductVariant[] {
  if (order === "fiyat-artan") return [...products].sort((a, b) => a.priceKurus - b.priceKurus);
  if (order === "fiyat-azalan") return [...products].sort((a, b) => b.priceKurus - a.priceKurus);
  return [...products];
}

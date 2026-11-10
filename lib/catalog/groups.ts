import type { ProductFamily, ProductVariant } from "@/types/catalog";

/** Storefront navigation groups are independent of product families and checkout categories. */
export const productGroups = [
  { id: "siyah-zeytin", name: "Siyah Zeytin", photo: "siyah-zeytin" },
  { id: "yesil-zeytin", name: "Yeşil Zeytin", photo: "yesil-zeytin" },
  { id: "kirma-zeytin", name: "Kırma Zeytin", photo: "kirma-zeytin" },
  { id: "zeytinyagi", name: "Zeytinyağı", photo: "zeytinyagi" },
] as const;

export type ProductGroupId = (typeof productGroups)[number]["id"];

export function getProductGroup(id: string) {
  return productGroups.find(group => group.id === id);
}

export function productsForGroup(families: readonly ProductFamily[], groupId?: ProductGroupId): ProductVariant[] {
  return families.filter(family => groupId === undefined || family.groupId === groupId)
    .flatMap(family => family.variants).sort((a, b) => a.imageKey.localeCompare(b.imageKey));
}

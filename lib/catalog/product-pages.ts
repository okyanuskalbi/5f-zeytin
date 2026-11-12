import type { ProductFamily, ProductVariant } from "../../types/catalog";

/** Public URL names are independent of stable family and checkout identifiers. */
export const familySlugs: Readonly<Record<string, string>> = {
  "dogal-kirma": "dogal-kirma-yesil-zeytin",
  "salamura-siyah": "salamura-siyah-zeytin",
  "naturel-sizma": "naturel-sizma-zeytinyagi",
  "salamura-yesil": "salamura-yesil-zeytin",
};

export function getFamilySlug(familyId: string): string | undefined {
  return Object.hasOwn(familySlugs, familyId) ? familySlugs[familyId] : undefined;
}

export function productHref(product: Pick<ProductVariant, "familyId" | "weight">): string {
  const slug = getFamilySlug(product.familyId);
  return slug ? `/urun/${slug}?boy=${encodeURIComponent(product.weight)}` : "/#urunler";
}

export function getFamilyBySlug(families: readonly ProductFamily[], slug: string): ProductFamily | undefined {
  return families.find(family => getFamilySlug(family.id) === slug);
}

/** Prefer the selected product's upper category, then fill from the real
 * catalogue. Stable order and one card per SKU keep the choice predictable. */
export function selectRelatedProducts(products: readonly ProductVariant[], current: ProductVariant): ProductVariant[] {
  const seen = new Set<string>([current.id]);
  const unique = products.filter(product => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
  const sameParent = (product: ProductVariant): boolean => (product.category === "zeytinyagi") === (current.category === "zeytinyagi");
  return [...unique.filter(sameParent), ...unique.filter(product => !sameParent(product))].slice(0, 4);
}

/** Frozen legacy URL aliases; tests compare these to all six display variants.
 * This plain, dependency-free table is also consumed by Next's config loader. */
export const legacyProductRoutes: Readonly<Record<string, string>> = {
  "sample-green-olive-1kg": "/urun/dogal-kirma-yesil-zeytin?boy=1%20kg",
  "sample-green-olive-10kg": "/urun/dogal-kirma-yesil-zeytin?boy=3%20L",
  "sample-black-olive-1kg": "/urun/salamura-siyah-zeytin?boy=1%20kg",
  "sample-olive-oil-1l": "/urun/naturel-sizma-zeytinyagi?boy=1%20L",
  "sample-olive-oil-5l": "/urun/naturel-sizma-zeytinyagi?boy=5%20L",
  "sample-brined-green-olive-5kg": "/urun/salamura-yesil-zeytin?boy=3%20L",
};

import type { Product } from "@/types/catalog";
import { isCategoryLabel } from "@/lib/catalog/category-label";

export const catalogProductLimit = 6;

/** Display prices only; checkout must reread and calculate prices on the server. */
export type CatalogResponse = Readonly<{
  data: readonly Product[];
  source: "database" | "static";
}>;

export type CatalogErrorResponse = Readonly<{
  error: { code: "catalog_unavailable"; message: string };
}>;

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonnegativeInteger(value: unknown): value is number {
  // Match the PostgreSQL integer columns, including their upper bound.
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647;
}

/** Validate untrusted data and construct an allowlisted, fresh public projection. */
export function parseCatalogProducts(input: unknown): readonly Product[] | null {
  if (!Array.isArray(input) || input.length > catalogProductLimit) return null;
  const products: Product[] = [];
  const ids = new Set<string>();
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const { id, name, category, weight, priceKurus, stock, categoryLabel = null, showCategoryLabel = true } = item;
    if (!nonblank(id) || !nonblank(name) || !nonblank(weight) ||
      !["sofralik-zeytin", "salamura-zeytin", "zeytinyagi"].includes(category) ||
      !isCategoryLabel(categoryLabel) || typeof showCategoryLabel !== "boolean" ||
      !nonnegativeInteger(priceKurus) || !nonnegativeInteger(stock) || ids.has(id)) return null;
    ids.add(id);
    products.push({ id, name, category, categoryLabel: categoryLabel?.trim() || null, showCategoryLabel, weight, priceKurus, stock });
  }
  return products;
}

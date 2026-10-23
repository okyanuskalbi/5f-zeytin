import type { Product } from "@/types/catalog";

const categoryLabels: Record<Product["category"], { card: string; detail: string }> = {
  "sofralik-zeytin": { card: "Sofralık", detail: "Sofralık zeytin" },
  "salamura-zeytin": { card: "Salamura", detail: "Salamura zeytin" },
  zeytinyagi: { card: "Zeytinyağı", detail: "Zeytinyağı" },
};

export function isCategoryLabel(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.trim().length <= 40 && !/[<>]/.test(value));
}

/** Preserve the existing compact card names and full detail names for defaults. */
export function getCategoryLabel(product: Product, format: "card" | "detail" = "detail"): string | null {
  if (product.showCategoryLabel === false) return null;
  return product.categoryLabel?.trim() || categoryLabels[product.category][format];
}

import { expect, it } from "vitest";
import { getCategoryLabel } from "@/lib/catalog/category-label";
import type { Product } from "@/types/catalog";

it.each([
  ["sofralik-zeytin", "Sofralık", "Sofralık zeytin"],
  ["salamura-zeytin", "Salamura", "Salamura zeytin"],
  ["zeytinyagi", "Zeytinyağı", "Zeytinyağı"],
] as const)("preserves current default names for %s and shares overrides across both formats", (category, card, detail) => {
  const product: Product = { id: "test", name: "Test", category, weight: "1 kg", priceKurus: 1, stock: 1 };
  expect(getCategoryLabel(product, "card")).toBe(card);
  expect(getCategoryLabel(product)).toBe(detail);
  expect(getCategoryLabel({ ...product, categoryLabel: " " })).toBe(detail);
  for (const format of ["card", "detail"] as const) {
    expect(getCategoryLabel({ ...product, categoryLabel: "  Kahvaltılık  " }, format)).toBe("Kahvaltılık");
    expect(getCategoryLabel({ ...product, showCategoryLabel: false }, format)).toBeNull();
  }
});

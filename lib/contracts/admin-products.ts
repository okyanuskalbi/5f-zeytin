import type { Product } from "@/types/catalog";
import { isCategoryLabel } from "@/lib/catalog/category-label";

export type ProductInput = Omit<Product, "id"> & {
  categoryLabel: string | null; showCategoryLabel: boolean; isActive: boolean; upsellIds: string[];
};
export type AdminProduct = ProductInput & { id: string };
export type ProductSort = "name" | "priceKurus" | "stock" | "isActive";
export type AdminProductsResponse = {
  data: AdminProduct[]; total: number; activeCount: number; page: number;
  options: { id: string; name: string }[];
};
export const adminProductPageSize = 20;
export const validProductId = (value: unknown): value is string => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
const text = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const integer = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647;

/** A strict allowlist also prevents image approval, slot and currency mass assignment. */
export function parseProductInput(value: unknown): ProductInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const keys = ["name", "category", "categoryLabel", "showCategoryLabel", "weight", "priceKurus", "stock", "isActive", "upsellIds"];
  if (Object.keys(input).length !== keys.length || Object.keys(input).some(key => !keys.includes(key))) return null;
  const { name, category, categoryLabel, showCategoryLabel, weight, priceKurus, stock, isActive, upsellIds } = input;
  if (!text(name, 160) || !text(weight, 80) || typeof category !== "string" || !["sofralik-zeytin", "salamura-zeytin", "zeytinyagi"].includes(category) ||
    !isCategoryLabel(categoryLabel) || typeof showCategoryLabel !== "boolean" ||
    !integer(priceKurus) || !integer(stock) || typeof isActive !== "boolean" || !Array.isArray(upsellIds) ||
    upsellIds.length > 5 || !upsellIds.every(validProductId) || new Set(upsellIds).size !== upsellIds.length) return null;
  return { name: name.trim(), category: category as Product["category"], categoryLabel: categoryLabel?.trim() || null,
    showCategoryLabel, weight: weight.trim(), priceKurus, stock, isActive, upsellIds: [...upsellIds] };
}

/** Never render a provider row or a raw error without projecting/validating it. */
export function parseAdminProduct(value: unknown): AdminProduct | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!validProductId(row.id) || row.currency !== "TRY" || !Array.isArray(row.product_upsells)) return null;
  const input = parseProductInput({ name: row.name, category: row.category, weight: row.weight,
    categoryLabel: row.category_label, showCategoryLabel: row.show_category_label,
    priceKurus: row.price_kurus, stock: row.stock, isActive: row.is_active,
    upsellIds: row.product_upsells.map(relation => relation?.upsell_id) });
  return input && !input.upsellIds.includes(row.id) ? { id: row.id, ...input } : null;
}

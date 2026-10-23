import type { AdminProduct, ProductInput } from "@/lib/contracts/admin-products";

// Synthetic records only; never imported by production code or seeded remotely.
export const productInput: ProductInput = {
  name: "Test zeytin", category: "sofralik-zeytin", weight: "1 kg",
  categoryLabel: null, showCategoryLabel: true,
  priceKurus: 12500, stock: 3, isActive: false, upsellIds: [],
};
export const adminProduct: AdminProduct = { ...productInput, id: "fixture-product" };
export const productRow = {
  id: adminProduct.id, name: productInput.name, category: productInput.category,
  category_label: null, show_category_label: true,
  weight: productInput.weight, price_kurus: 12500, currency: "TRY", stock: 3,
  is_active: false, product_upsells: [],
};

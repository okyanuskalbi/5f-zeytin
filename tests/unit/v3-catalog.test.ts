import { describe, expect, it } from "vitest";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { createCartStore } from "@/lib/cart/store";

describe("v3 aile ve varyant kataloğu", () => {
  it("dört ailede yalnız onaylı altı boyu sunar", async () => {
    const families = await getProductFamilies();
    expect(families.map(family => [family.name, family.variants.map(variant => variant.weight)])).toEqual([
      ["Doğal Kırma Yeşil Zeytin", ["1 kg", "10 kg"]],
      ["Salamura Siyah Zeytin", ["1 kg"]],
      ["Natürel Sızma Zeytinyağı", ["1 L", "5 L"]],
      ["Salamura Yeşil Zeytin", ["5 kg"]],
    ]);
    const products = await getProducts();
    expect(products).toHaveLength(6);
    expect(new Set(products.map(product => product.id)).size).toBe(6);
    for (const variant of families.flatMap(family => family.variants)) {
      expect(variant.imageKey).toBeTruthy();
      expect(products.find(product => product.id === variant.id)).toEqual(expect.objectContaining(variant));
    }
  });

  it("aynı ailenin farklı boylarını ayrı sepet satırlarında saklar", async () => {
    const products = await getProducts();
    const [family] = await getProductFamilies();
    const store = createCartStore({ products });
    store.setProducts(products);
    store.addItem(family.variants[0].id, 1);
    store.addItem(family.variants[1].id, 2);
    expect(store.getSnapshot().items).toEqual([
      { productId: family.variants[0].id, quantity: 1 },
      { productId: family.variants[1].id, quantity: 2 },
    ]);
  });
});

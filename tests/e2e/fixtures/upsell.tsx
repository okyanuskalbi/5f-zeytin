import { useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { CartSummary } from "../../../components/cart/CartSummary";
import { CartDrawer } from "../../../components/cart/CartDrawer";
import { Button } from "../../../components/ui/button";
import { createCartStore } from "../../../lib/cart/store";
import type { Product } from "../../../types/catalog";
import "../../../app/globals.css";

// Entirely test-only relationships, availability and campaign values.
const products: readonly Product[] = [
  { id: "olive", name: "Test Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 8 },
  { id: "oil", name: "Test Zeytinyağı", category: "zeytinyagi", weight: "500 ml", priceKurus: 30000, stock: 3 },
  { id: "empty", name: "Test Tükenmiş", category: "zeytinyagi", weight: "1 L", priceKurus: 40000, stock: 0 },
  { id: "inactive", name: "Test Pasif", category: "salamura-zeytin", weight: "1 kg", priceKurus: 10000, stock: 4 },
  { id: "unrelated", name: "Test İlişkisiz", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 15000, stock: 4 },
];
const mode = new URLSearchParams(location.search).get("mode");
let addFails = mode === "add-error";
let storageFails = mode === "storage-error";
const baseStore = createCartStore({ products, storage: {
  getItem: (key) => localStorage.getItem(key),
  setItem(key, value) { if (storageFails) throw new Error("Test storage failure"); localStorage.setItem(key, value); },
} });
const store = { ...baseStore, addItem(productId: string, quantity = 1) {
  if (addFails) throw new RangeError("Test stock failure");
  baseStore.addItem(productId, quantity);
} };
const upsell = {
  activeProductIds: ["olive", "oil", "empty", "unrelated", "missing"],
  relations: ["olive", "oil", "oil", "empty", "inactive", "missing"].map((targetProductId) => ({ sourceProductId: "olive", targetProductId })),
};
const tiers = [{ minimumQuantity: 3, percentOff: 5 }, { minimumQuantity: 6, percentOff: 10 }];

function Fixture(): JSX.Element {
  const [catalog, setCatalog] = useState<readonly Product[] | null>(mode === "catalog-error" ? null : products);
  const [refreshing, setRefreshing] = useState(mode === "refreshing");
  const [configured, setConfigured] = useState(mode !== "no-config");
  const [open, setOpen] = useState(false);
  const invalidTiers = mode === "bad-threshold" ? [{ minimumQuantity: 1, percentOff: 5 }]
    : mode === "bad-rate" ? [{ minimumQuantity: 3, percentOff: 101 }]
    : mode === "duplicate-tier" ? [tiers[0], tiers[0]] : tiers;
  return <>
    <CartSummary store={store} products={catalog} refreshing={refreshing}
      upsell={configured ? upsell : undefined}
      quantityDiscount={configured ? { productIds: ["olive"], tiers: invalidTiers } : undefined}
      onRefresh={() => {
        setCatalog(mode === "stock-change" ? [{ ...products[0], stock: 0 }, ...products.slice(1)]
          : mode === "target-change" ? [products[0], { ...products[1], stock: 0 }, ...products.slice(2)]
          : mode === "catalog-error" && catalog !== null ? null : products);
      }} />
    {catalog !== null && <CartDrawer store={store} products={catalog} open={open} onOpenChange={setOpen} trigger={<Button>Sepeti aç</Button>} />}
    <Button onClick={() => { addFails = false; storageFails = false; }}>Hatayı düzelt</Button>
    <Button onClick={() => setRefreshing(false)}>Yenilemeyi bitir</Button>
    <Button onClick={() => setConfigured(!configured)}>Yapılandırmayı değiştir</Button>
  </>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);

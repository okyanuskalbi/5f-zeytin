import { useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { CartSummary } from "../../../components/cart/CartSummary";
import { CartDrawer } from "../../../components/cart/CartDrawer";
import { Button } from "../../../components/ui/button";
import { createCartStore } from "../../../lib/cart/store";
import type { Product } from "../../../types/catalog";
import "../../../app/globals.css";

// Test-only catalog/failures; no fixture routes or catalog data ship to the app.
const products: readonly Product[] = [
  { id: "fixture-olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 3 },
  { id: "fixture-oil", name: "Zeytinyağı", category: "zeytinyagi", weight: "1 L", priceKurus: 30000, stock: 5 },
  ...Array.from({ length: 4 }, (_, index): Product => ({
    id: `fixture-extra-${index}`, name: `Uzun ürün adı ${index + 1} · Sofralar için salamura zeytin`,
    category: "salamura-zeytin", weight: "1 kg", priceKurus: 10000, stock: 3,
  })),
];
const mode = new URLSearchParams(location.search).get("mode");
let storageFails = mode === "write-error" || mode === "read-error";
let quantityFails = false;
const baseStore = createCartStore({ products, storage: {
  getItem(key) { if (storageFails && mode === "read-error") throw new Error("Fixture read failure"); return localStorage.getItem(key); },
  setItem(key, value) { if (storageFails) throw new Error("Fixture write failure"); localStorage.setItem(key, value); },
} });
const store = { ...baseStore, setQuantity(productId: string, quantity: number) {
  if (quantityFails) throw new RangeError("Fixture stock failure");
  baseStore.setQuantity(productId, quantity);
} };

function Fixture(): JSX.Element {
  const [catalog, setCatalog] = useState<readonly Product[] | null>(mode === "catalog-error" ? null : products);
  const [open, setOpen] = useState(false);
  return <>
    <CartSummary store={store} products={catalog} onRefresh={() => {
      setCatalog(mode === "stock-change" ? [{ ...products[0], priceKurus: 15075, stock: 1 }, ...products.slice(2)]
        : mode === "catalog-error" && catalog !== null ? null : products);
    }} />
    {catalog !== null && <CartDrawer store={store} products={catalog} open={open} onOpenChange={setOpen} trigger={<Button>Sepeti aç</Button>} />}
    <Button onClick={() => { storageFails = false; }}>Kaydı etkinleştir</Button>
    <Button onClick={() => { quantityFails = true; }}>Stok hatasını tetikle</Button>
    <Button onClick={() => { quantityFails = false; }}>Stoğu düzelt</Button>
  </>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);

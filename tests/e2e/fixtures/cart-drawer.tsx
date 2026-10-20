import { useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { CartDrawer } from "../../../components/cart/CartDrawer";
import { Button } from "../../../components/ui/button";
import { createCartStore } from "../../../lib/cart/store";
import type { Product } from "../../../types/catalog";
import "../../../app/globals.css";

// Only Playwright serves this fixture. Its catalog and failure controls never ship.
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
const store = createCartStore({
  products: mode === "stale-stock" ? products.map((product) => ({ ...product, stock: 1 })) : products,
  storage: {
    getItem(key) {
      if (storageFails && mode === "read-error") throw new Error("Fixture read failure");
      return localStorage.getItem(key);
    },
    setItem(key, value) {
      if (storageFails) throw new Error("Fixture write failure");
      localStorage.setItem(key, value);
    },
  },
});

function CartDrawerFixture(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <main style={{ padding: "1rem", minHeight: "150vh" }}>
      <h1>Sepet drawer davranış testi</h1>
      <CartDrawer store={store} products={mode === "unavailable" ? [] : products} open={open} onOpenChange={setOpen}
        trigger={<Button>Sepeti aç</Button>} />
      <Button onClick={() => setOpen(true)}>Dışarıdan aç</Button>
      <Button onClick={() => store.setProducts(products)}>Stoğu yenile</Button>
      <Button onClick={() => { storageFails = false; }}>Kaydı etkinleştir</Button>
      <Button onClick={() => store.addItem(products[0].id)}>Ürün ekle</Button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<CartDrawerFixture />);

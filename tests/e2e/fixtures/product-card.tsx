import { useState, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { ProductCard } from "../../../components/catalog/ProductCard";
import { Button } from "../../../components/ui/button";
import type { Product } from "../../../types/catalog";
import "../../../app/globals.css";

// Test data and a test-only callback: no cart, provider or database writes.
const product: Product = {
  id: "fixture-olive", name: "Sofralık Zeytin", category: "sofralik-zeytin",
  weight: "500 g", priceKurus: 12550, stock: 3,
};

function ProductCardFixture(): JSX.Element {
  const [stock, setStock] = useState(product.stock);
  const [replacement, setReplacement] = useState(false);
  const current = replacement
    ? { ...product, id: "fixture-oil", name: "Zeytinyağı", category: "zeytinyagi" as const }
    : { ...product, stock };

  return (
    <main style={{ maxWidth: "32rem", margin: "0 auto", padding: "1rem" }}>
      <h1>Ürün kartı davranış testi</h1>
      <ProductCard product={current} onAddToCart={async (productId, quantity) => {
        const response = await fetch("/__product-card-action", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) throw new Error("Fixture failure");
      }} />
      <Button onClick={() => setStock(1)}>Stoğu azalt</Button>
      <Button onClick={() => setReplacement(true)}>Ürünü değiştir</Button>
      <ProductCard product={{ ...product, id: "sold-out", name: "Salamura Zeytin", stock: 0 }} />
      <ProductCard product={null} loading />
      <ProductCard product={null} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<ProductCardFixture />);

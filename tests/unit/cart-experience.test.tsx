import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { createCartStore } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

const products: readonly Product[] = [
  { id: "olive", name: "Test Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 3 },
  { id: "oil", name: "Test Zeytinyağı", category: "zeytinyagi", weight: "1 L", priceKurus: 30000, stock: 2 },
];
afterEach(cleanup);

it("adds an approved drawer suggestion, updates totals, and preserves modal focus when it disappears", () => {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  function Fixture() {
    const [open, setOpen] = useState(true);
    return <CartDrawer store={store} products={products} open={open} onOpenChange={setOpen}
      upsell={{ activeProductIds: ["olive", "oil"], relations: [{ sourceProductId: "olive", targetProductId: "oil" }] }} />;
  }
  render(<Fixture />);
  const dialog = within(screen.getByRole("dialog", { name: "Sepetim" }));
  fireEvent.click(dialog.getByRole("button", { name: "Test Zeytinyağı sepete ekle" }));
  expect(store.getSnapshot().items).toEqual([{ productId: "olive", quantity: 1 }, { productId: "oil", quantity: 1 }]);
  expect(dialog.getByText("425,50 ₺", { exact: true })).toBeDefined();
  expect(dialog.queryByRole("button", { name: "Test Zeytinyağı sepete ekle" })).toBeNull();
  expect(document.activeElement).toBe(dialog.getByRole("button", { name: "Sepeti kapat" }));
});

it("does not infer suggestions without approved relationships", () => {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  render(<CartDrawer store={store} products={products} open onOpenChange={() => {}} />);
  expect(screen.queryByRole("region", { name: "Sofranızı tamamlayın" })).toBeNull();
});

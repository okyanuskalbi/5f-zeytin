import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { createCartStore } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

const products: readonly Product[] = [
  { id: "olive", name: "Test Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 3 },
  { id: "oil", name: "Test Zeytinyağı", category: "zeytinyagi", weight: "1 L", priceKurus: 30000, stock: 2 },
];
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("adds an approved drawer suggestion, updates totals, and preserves modal focus when it disappears", () => {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  function Fixture() {
    const [open, setOpen] = useState(true);
    return <CartDrawer store={store} products={products} open={open} onOpenChange={setOpen}
      upsell={{ activeProductIds: ["olive", "oil"], relations: [{ sourceProductId: "olive", targetProductId: "oil" }] }} />;
  }
  render(<Fixture />);
  const dialog = within(screen.getByRole("dialog", { name: /^Sepetim \(/ }));
  fireEvent.click(dialog.getByRole("button", { name: "Test Zeytinyağı sepete ekle" }));
  expect(store.getSnapshot().items).toEqual([{ productId: "olive", quantity: 1 }, { productId: "oil", quantity: 1 }]);
  expect(dialog.getByLabelText("Ara toplam").textContent).toBe("425,50 ₺");
  expect(dialog.queryByRole("button", { name: "Test Zeytinyağı sepete ekle" })).toBeNull();
  expect(document.activeElement).toBe(dialog.getByRole("button", { name: "Sepeti kapat" }));
});

it("does not infer suggestions without approved relationships", () => {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  render(<CartDrawer store={store} products={products} open onOpenChange={() => {}} />);
  expect(screen.queryByRole("region", { name: "Sofranıza ekleyin" })).toBeNull();
});

it("keeps checkout unavailable when no approved checkout destination is supplied", () => {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  render(<CartDrawer store={store} products={products} open onOpenChange={() => {}} checkoutHref={null} />);
  expect(screen.queryByRole("link", { name: "Ödemeye geç" })).toBeNull();
  expect(screen.getByRole("button", { name: "Ödemeye geç" }).hasAttribute("disabled")).toBe(true);
});

it("keeps one payment-information group in the right scroll area through phone, landscape and desktop rotation", () => {
  let viewport = { width: 1024, height: 768 };
  const listeners = new Set<() => void>();
  const originalMatchMedia = window.matchMedia;
  vi.stubGlobal("matchMedia", (query: string) => query.startsWith("(max-width: 767px)") ? {
    media: query, get matches() {
      return viewport.width <= 767 || (query.includes("(orientation: landscape)") && viewport.width <= 900
        && viewport.height <= 500 && viewport.width > viewport.height);
    },
    addEventListener: (_: string, notify: () => void) => listeners.add(notify),
    removeEventListener: (_: string, notify: () => void) => listeners.delete(notify),
  } : originalMatchMedia?.(query) ?? {
    media: query, matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  });
  const store = createCartStore({ products, storage: null });
  store.addItem("olive");
  const view = render(<CartDrawer store={store} products={products} open onOpenChange={() => {}} checkoutHref="/odeme" />);
  const increase = screen.getByRole("button", { name: "Adedi artır" });
  act(() => increase.focus());
  for (const [width, height, compact] of [[1024, 768, false], [390, 844, true], [844, 390, true], [768, 1024, false], [320, 568, true]] as const) {
    act(() => { viewport = { width, height }; listeners.forEach(notify => notify()); });
    // Include hidden nodes: responsive CSS must not conceal a duplicate DOM copy.
    expect(screen.getAllByRole("group", { name: "Güvenli ödeme", hidden: true })).toHaveLength(1);
    // The compact panel puts support information in the product scroll body,
    // leaving its anchored footer available for the payment action.
    const payment = screen.getByRole("group", { name: "Güvenli ödeme" });
    expect(payment.closest('[tabindex="-1"]') === increase.closest('[tabindex="-1"]')).toBe(compact);
    for (const name of ["PayTR", "Visa", "Mastercard", "Troy"])
      expect(screen.getAllByRole("img", { name, hidden: true })).toHaveLength(1);
    expect(document.activeElement).toBe(increase);
    expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("125,50 ₺");
    expect(screen.getByRole("link", { name: "Ödemeye geç" }).getAttribute("href")).toBe("/odeme");
  }
  fireEvent.click(increase);
  expect(store.getSnapshot().items).toEqual([{ productId: "olive", quantity: 2 }]);
  expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
  view.unmount();
  expect(listeners.size).toBe(0);
});

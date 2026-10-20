import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

afterEach(() => { cleanup(); localStorage.clear(); });

it("preserves unread intent when the real drawer mounts after catalog recovery", () => {
  const products: readonly Product[] = [{ id: "olive", name: "Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 10000, stock: 3 }];
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: "olive", quantity: 2 }]));
  let updateCatalog!: () => void;
  // Real CartDrawer effects are essential here: hydration must wait for stock.
  function Wrapper({ children }: { children: React.ReactNode }) {
    const [catalog, setCatalog] = useState<readonly Product[] | null>(null);
    useEffect(() => { updateCatalog = () => setCatalog(products); }, []);
    return <CartProvider products={catalog}>{children}</CartProvider>;
  }
  const { result } = renderHook(() => useCart(), { wrapper: Wrapper });
  expect(result.current!.state.hydrated).toBe(false);
  act(() => updateCatalog());
  expect(result.current!.state.items).toEqual([{ productId: "olive", quantity: 2 }]);
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: "olive", quantity: 2 }]);
  act(() => result.current!.addItem("olive", 1));
  expect(result.current!.state.items).toEqual([{ productId: "olive", quantity: 3 }]);
});

import { useEffect, useState } from "react";

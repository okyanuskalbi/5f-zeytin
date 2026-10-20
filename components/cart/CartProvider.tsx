"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type JSX, type ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MiniCart } from "@/components/cart/MiniCart";
import type { UpsellConfiguration } from "@/components/cart/Upsell";
import { createCartStore } from "@/lib/cart/store";
import type { CartState, CartStore } from "@/lib/cart/types";
import type { Product } from "@/types/catalog";

type CartContextValue = {
  store: CartStore;
  state: CartState;
  products: readonly Product[] | null;
  open: boolean;
  openCart: (opener?: HTMLElement) => void;
  addItem: (productId: string, quantity: number, opener?: HTMLElement) => void;
  checkoutHref: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

/** One owner in the persistent layout; no mutable cart is shared across SSR requests. */
export function CartProvider({ products, children, upsell, checkoutHref = null }: { products: readonly Product[] | null; children: ReactNode; upsell?: UpsellConfiguration | null; checkoutHref?: string | null }): JSX.Element {
  const [store] = useState(() => createCartStore({ products: products ?? [] }));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Do not prune unread intent after a failed catalog read, or reset a live cart
    // on RSC refresh. Stock reconciliation remains explicit in CartSummary.
    if (products !== null && !store.getSnapshot().hydrated) store.setProducts(products);
  }, [store, products]);

  function openCart(opener?: HTMLElement): void {
    if (products === null) return;
    returnFocusRef.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOpen(true);
  }

  function addItem(productId: string, quantity: number, opener?: HTMLElement): void {
    if (products === null) throw new Error("Katalog yüklenemedi.");
    // A rejected edit must leave the drawer closed and preserve the saved cart.
    store.addItem(productId, quantity);
    openCart(opener);
  }

  return <CartContext.Provider value={{ store, state, products, open, openCart, addItem, checkoutHref }}>
    {children}
    <MiniCart />
    {products !== null && state.hydrated && <CartDrawer store={store} products={products} open={open} onOpenChange={setOpen} returnFocusRef={returnFocusRef} upsell={upsell} checkoutHref={checkoutHref} />}
  </CartContext.Provider>;
}

/** Standalone card fixtures can still supply their own callback without a provider. */
export function useCart(): CartContextValue | null { return useContext(CartContext); }

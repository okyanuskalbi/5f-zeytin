"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";
import styles from "./AddToCart.module.css";

export function AddToCart({ product, quantity = 1 }: { product: Product; quantity?: number }): JSX.Element {
  const cart = useCart();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);
  const soldOut = product.stock === 0;

  function add(): void {
    if (!cart?.state.hydrated || cart.products === null || soldOut) return;
    clearTimeout(reset.current);
    try {
      cart.store.addItem(product.id, quantity);
      setState("added");
      reset.current = setTimeout(() => setState("idle"), 2400);
    } catch { setState("error"); }
  }

  return <div className={styles.addArea}>
    <button type="button" className={styles.add} onClick={add}
      disabled={soldOut || !cart?.state.hydrated || cart.products === null}>
      {soldOut ? "Mevcut değil" : state === "added" ? "Eklendi ✓" : "Sepete ekle"}
    </button>
    <p className={styles.notice} role="status" aria-atomic="true">{state === "added" ? `${product.name}, ${product.weight} sepete eklendi.` : ""}</p>
    {state === "error" && <p className={styles.error} role="alert">Stok sınırını veya adedi kontrol edip tekrar deneyin.</p>}
  </div>;
}

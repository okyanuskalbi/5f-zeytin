"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";
import styles from "./Pantry.module.css";

export function AddToCart({ product, quantity = 1, compact = false }: { product: Product; quantity?: number; compact?: boolean }): JSX.Element {
  const cart = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const busy = useRef(false);
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  useEffect(() => () => { clearTimeout(reset.current); if (frame.current !== undefined) cancelAnimationFrame(frame.current); }, []);
  const soldOut = product.stock === 0;

  function add(): void {
    if (!cart || busy.current || soldOut) return;
    busy.current = true;
    clearTimeout(reset.current);
    setState("loading");
    // Yield one paint for honest local progress, with no artificial request delay.
    frame.current = requestAnimationFrame(() => {
      try {
        cart.store.addItem(product.id, quantity);
        setState("added");
        reset.current = setTimeout(() => setState("idle"), 2200);
      } catch { setState("error"); }
      busy.current = false;
    });
  }

  return <div className={styles.addArea}>
    <button type="button" className={styles.add} onClick={add} aria-busy={state === "loading"}
      disabled={soldOut || state === "loading" || !cart?.state.hydrated || cart.products === null}>
      {soldOut ? "Tükendi" : state === "loading" ? "Ekleniyor…" : state === "added" ? "Eklendi ✓" : compact ? "Ekle" : "Sepete ekle"}
    </button>
    <p className={styles.notice} role="status" aria-atomic="true">{state === "added" ? `${product.name}, ${product.weight} sepete eklendi.` : ""}</p>
    {state === "error" && <p className={styles.error} role="alert">Stok sınırını veya adedi kontrol edip tekrar deneyin.</p>}
  </div>;
}

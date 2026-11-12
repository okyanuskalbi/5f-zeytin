"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";
import styles from "./AddToCart.module.css";

const ADDED_VISIBLE_MS = 1600;
const ADDED_LABEL = "Eklendi";

/**
 * Cart behaviour is unchanged; only the pill is new. Stacked label measures
 * (after 21st.dev Add to Cart Button #34564) keep the width stable between states.
 */
export function AddToCart({ product, quantity = 1, label = "Sepete ekle", variant = "primary", disabled = false, size }: {
  product: Product; quantity?: number; label?: string; variant?: "primary" | "ghost"; disabled?: boolean; size?: "md" | "lg";
}): JSX.Element {
  const cart = useCart();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);
  const soldOut = product.stock === 0;
  const waiting = !cart?.state.hydrated || cart.products === null;
  const added = state === "added";

  function add(): void {
    if (!cart?.state.hydrated || cart.products === null || soldOut || disabled) return;
    clearTimeout(reset.current);
    try {
      cart.store.addItem(product.id, quantity);
      setState("added");
      reset.current = setTimeout(() => setState("idle"), ADDED_VISIBLE_MS);
    } catch { setState("error"); }
  }

  return <div className={styles.addArea}>
    <PillButton fullWidth size={size} variant={variant === "ghost" ? "outline" : "primary"} icon={added ? "check" : "cart"}
      disabled={soldOut || disabled} aria-disabled={waiting && !soldOut && !disabled ? true : undefined} onClick={add}>
      {soldOut ? "Mevcut değil" : <span className={styles.labelSlot}>
        <span className={styles.labelMeasure} data-add-label-measure aria-hidden="true">{label}</span>
        <span className={styles.labelMeasure} aria-hidden="true">{ADDED_LABEL}</span>
        <span className={styles.labelText} data-add-label data-phase={added ? "added" : "idle"}>{added ? ADDED_LABEL : label}</span>
      </span>}
    </PillButton>
    <p className={styles.notice} role="status" aria-atomic="true">{added ? `${product.name}, ${product.weight} sepete eklendi.` : ""}</p>
    {state === "error" && <p className={styles.error} role="alert">Stok sınırını veya adedi kontrol edip tekrar deneyin.</p>}
  </div>;
}

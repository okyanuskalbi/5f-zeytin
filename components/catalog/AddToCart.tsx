"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import { PurchaseButton } from "./PurchaseButton";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";
import styles from "./AddToCart.module.css";

export function AddToCart({ product, quantity = 1, label = "Sepete ekle", variant = "primary", disabled = false }: {
  product: Product; quantity?: number; label?: string; variant?: "primary" | "ghost"; disabled?: boolean;
}): JSX.Element {
  const cart = useCart();
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);
  const soldOut = product.stock === 0;
  const unavailable = disabled || soldOut || !cart?.state.hydrated || cart.products === null;

  function add(): void {
    if (!cart?.state.hydrated || cart.products === null || soldOut || disabled) return;
    clearTimeout(reset.current);
    try {
      cart.store.addItem(product.id, quantity);
      setState("added");
      reset.current = setTimeout(() => setState("idle"), 2400);
    } catch { setState("error"); }
  }

  return <div className={styles.addArea}>
    <PurchaseButton className={soldOut ? styles.unavailable : undefined} data-variant={variant} onClick={add} disabled={unavailable}>
      {soldOut ? "Mevcut değil" : <span className={styles.labelSlot}>
        <span className={styles.labelMeasure} data-add-label-measure aria-hidden="true">{label}</span>
        <span className={styles.labelMeasure} aria-hidden="true">Eklendi ✓</span>
        <AnimatePresence initial={false} mode="wait">
          <m.span key={state === "added" ? "added" : "idle"} className={styles.labelText} data-add-label
            initial={reduced ? false : { opacity: 0, scale: motionTokens.storefront.addedScale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: motionTokens.storefront.addedScale, transition: { duration: motionTokens.duration.fast } }}
            transition={{ duration: reduced ? 0 : motionTokens.duration.crossfade }}>
            {state === "added" ? "Eklendi ✓" : label}
          </m.span>
        </AnimatePresence>
      </span>}
    </PurchaseButton>
    <p className={styles.notice} role="status" aria-atomic="true">{state === "added" ? `${product.name}, ${product.weight} sepete eklendi.` : ""}</p>
    {state === "error" && <p className={styles.error} role="alert">Stok sınırını veya adedi kontrol edip tekrar deneyin.</p>}
  </div>;
}

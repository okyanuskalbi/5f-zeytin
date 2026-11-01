"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import * as motion from "motion/react-m";
import { useCart } from "@/components/cart/CartProvider";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
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
  const motionEnabled = !reduced && !unavailable;

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
    <motion.button type="button" className={styles.add} data-variant={variant} onClick={add}
      initial={false} disabled={unavailable}
      whileHover={motionEnabled ? { y: motionTokens.interaction.hoverY } : undefined}
      whileTap={motionEnabled ? { scale: motionTokens.interaction.tapScale } : undefined}
      transition={motionEnabled ? springs.action : { duration: 0 }}
      style={motionEnabled ? undefined : { transform: "none" }}>
      {soldOut ? "Mevcut değil" : state === "added" ? "Eklendi ✓" : label}
    </motion.button>
    <p className={styles.notice} role="status" aria-atomic="true">{state === "added" ? `${product.name}, ${product.weight} sepete eklendi.` : ""}</p>
    {state === "error" && <p className={styles.error} role="alert">Stok sınırını veya adedi kontrol edip tekrar deneyin.</p>}
  </div>;
}

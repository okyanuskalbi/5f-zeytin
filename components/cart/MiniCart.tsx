"use client";

import { useEffect, useState, type JSX } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { useCartViewport } from "@/components/cart/useCartViewport";
import { motionTokens, springs } from "@/lib/ui-motion";
import styles from "./CartExperience.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

export function MiniCart(): JSX.Element | null {
  const cart = useCart();
  const mobile = useCartViewport();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  if (!cart || !mobile || !cart.state.hydrated || cart.products === null || pathname === "/" || /^\/(sepet|odeme)(\/|-|$)/.test(pathname ?? "")) return null;
  const count = cart.state.items.reduce((sum, item) => sum + item.quantity, 0);
  if (!count) return null;
  const known = cart.state.items.every(item => cart.products!.some(product => product.id === item.productId && product.stock >= item.quantity));
  const subtotal = cart.state.items.reduce((sum, item) => sum + (cart.products!.find(product => product.id === item.productId)?.priceKurus ?? 0) * item.quantity, 0);
  return <>
    <div className={styles.miniReserve} data-mini-cart-reserve="" aria-hidden="true" />
    <AnimatePresence>
      {!footerVisible && <motion.aside key="mini-cart" aria-label="Mini sepet" data-mini-cart="" data-cart-open={cart.open} className={styles.mini}
        initial={reduced ? false : { opacity: 0, y: motionTokens.distance.lg }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0 } }} transition={reduced ? { duration: 0 } : springs.drawer}>
        <p aria-live="polite" aria-atomic="true">{count} adet · Ara toplam (tahmini)<strong>{known ? money.format(subtotal / 100) : "Tutar güncellenecek"}</strong></p>
        <Button onClick={event => cart.openCart(event.currentTarget)}>Sepet</Button>
      </motion.aside>}
    </AnimatePresence>
  </>;
}

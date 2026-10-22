"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { motion } from "motion/react";
import { useCart } from "@/components/cart/CartProvider";
import { AddToCart } from "@/components/catalog/AddToCart";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./MobileBuyBar.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function MobileBuyBar({ product }: { product?: Product }): JSX.Element | null {
  const cart = useCart();
  const reduced = usePrefersReducedMotion();
  const bar = useRef<HTMLDivElement>(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!product) return;
    function sync(): void {
      const hero = document.querySelector("[data-hero-intro]");
      const footer = document.querySelector("footer");
      const heroVisible = !!hero && hero.getBoundingClientRect().bottom > 0;
      const footerEnd = !!footer && footer.getBoundingClientRect().bottom <= window.innerHeight + 120;
      const dialogOpen = !!document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([data-state="closed"]), [role="alertdialog"][aria-modal="true"]:not([data-state="closed"])');
      setEligible(window.innerWidth <= 900 && window.scrollY > window.innerHeight * .8 && !heroVisible && !footerEnd && !dialogOpen);
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("pageshow", sync);
    // Radix portals (menu, quick view, form) can open without any scroll event.
    const dialogs = new MutationObserver(sync);
    dialogs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "data-state", "aria-modal"] });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("pageshow", sync);
      dialogs.disconnect();
    };
  }, [product]);

  useEffect(() => {
    if (!product || !bar.current) return;
    const element = bar.current;
    function measure(): void {
      // Include wrapping feedback, text zoom and the device safe area.
      document.documentElement.style.setProperty("--mobile-buy-bar-height", `${element.getBoundingClientRect().height}px`);
    }
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.documentElement.style.removeProperty("--mobile-buy-bar-height");
    };
  }, [product]);

  if (!product) return null;
  const visible = eligible && !cart?.open;
  return <motion.div ref={bar} data-mobile-buy-bar="" data-visible={visible} data-reduced-motion={reduced}
    role={visible ? "region" : undefined} aria-label="Hızlı satın alma" aria-hidden={!visible} inert={!visible}
    className={styles.bar} initial={false}
    animate={{ y: reduced ? 0 : visible ? 0 : "110%", opacity: visible ? 1 : 0 }}
    transition={{ duration: reduced ? 0 : motionTokens.duration.landing }}>
    <div className={styles.product}><small>Doğal Kırma · {product.weight}</small><strong>{money.format(product.priceKurus / 100)}</strong></div>
    <AddToCart product={product} />
  </motion.div>;
}

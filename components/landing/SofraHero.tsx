"use client";

import { useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { Check } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useCart } from "@/components/cart/CartProvider";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./SofraHero.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol" });

export function SofraHero({ product, children }: { product?: Product; children: ReactNode }): JSX.Element {
  const section = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = usePrefersReducedMotion();
  const cart = useCart();
  const [feedback, setFeedback] = useState<"idle" | "added" | "error">("idle");
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const transform = useTransform(scrollYProgress, [0, 1], ["scale(1)", "scale(1.04)"]);
  const available = !!product && product.stock > 0;

  useEffect(() => () => clearTimeout(timer.current), []);

  function add(): void {
    if (!product || !cart) return;
    clearTimeout(timer.current);
    try {
      // The hero confirms inline; only the customer's cart control opens a drawer.
      cart.store.addItem(product.id, 1);
      setFeedback("added");
      timer.current = setTimeout(() => setFeedback("idle"), 2400);
    } catch {
      setFeedback("error");
    }
  }

  return <section ref={section} data-hero-intro="" aria-labelledby="hero-title" className={styles.hero}>
    <motion.div data-hero-photo="" className={styles.photo} style={reduced ? undefined : { transform }}>
      {children}
    </motion.div>
    <div aria-hidden="true" className={styles.curtain} />
    <div className={styles.copy}>
      <h1 id="hero-title"><span data-hero-word="">Düziçi’nden</span>{" "}<span data-hero-word="">sofranıza.</span></h1>
      <p className={styles.description}>Doğal Kırma Yeşil Zeytin,<br className={styles.desktopBreak} /> kendi tesisimizde.</p>
      <div className={styles.actions}>
        <motion.button type="button" className={styles.purchase} onClick={add}
          disabled={!available || !cart?.state.hydrated || cart.products === null}
          whileTap={reduced ? undefined : { transform: `scale(${motionTokens.scale.press})` }}
          transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
          {available ? <>
            <span>{`${feedback === "added" ? "Eklendi" : "Sepete ekle"} — ${product.weight} · ${money.format(product.priceKurus / 100)}`}</span>
            {feedback === "added" && <Check size={18} aria-hidden="true" />}
          </> : "Ürün şu an mevcut değil"}
        </motion.button>
        <a href="#kiler" tabIndex={0} className={styles.browse} onClick={event => {
          // Preserve modified clicks and the native no-JS fragment fallback.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const target = document.getElementById("kiler");
          if (!target) return;
          event.preventDefault();
          history.replaceState(null, "", "#kiler");
          target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
        }}>Ürünleri gör</a>
      </div>
      <div className={styles.feedback}>
        <p role="status" aria-atomic="true">{feedback === "added" ? `${product?.weight} sepete eklendi.` : ""}</p>
        {feedback === "error" && <p role="alert">Stok sınırına ulaştınız. Sepetinizdeki adedi kontrol edin.</p>}
      </div>
    </div>
  </section>;
}

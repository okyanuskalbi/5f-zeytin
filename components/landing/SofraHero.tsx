"use client";

import { useEffect, useRef, useState, type JSX, type MouseEvent, type ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { motion, useAnimate } from "motion/react";
import { useCart } from "@/components/cart/CartProvider";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./SofraHero.module.css";

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const sizes = [
  { id: "sample-green-olive-1kg", label: "1 kg" },
  { id: "sample-green-olive-10kg", label: "10 kg teneke" },
] as const;

export function SofraHero({ products = [], productImage, children }: {
  products?: readonly Product[]; productImage: ReactNode; children: ReactNode;
}): JSX.Element {
  const [scope, animate] = useAnimate<HTMLElement>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = usePrefersReducedMotion();
  const cart = useCart();
  const [selected, setSelected] = useState<string>(sizes[1].id);
  const [feedback, setFeedback] = useState<"idle" | "added" | "error">("idle");
  const product = products.find(item => item.id === selected);
  const available = !!product && product.stock > 0;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const section = scope.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    // Keep the existing mobile cart from covering the hero's purchase card.
    const observer = new IntersectionObserver(([entry]) => section.toggleAttribute("data-hero-visible", entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, [scope]);
  useEffect(() => {
    if (reduced) return;
    const photo = animate("[data-hero-photo]", { transform: [...motionTokens.hero.kenBurns] }, {
      duration: motionTokens.hero.duration, ease: "easeInOut", repeat: Infinity, repeatType: "reverse",
    });
    const hint = animate("[data-scroll-line]", { transform: ["scaleY(.2)", "scaleY(1)", "scaleY(.2)"] }, {
      duration: motionTokens.hero.hintDuration, ease: "easeInOut", repeat: Infinity,
    });
    const syncVisibility = (): void => {
      for (const control of [photo, hint]) {
        if (document.visibilityState === "hidden") control.pause();
        else control.play();
      }
    };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      photo.stop(); hint.stop();
    };
  }, [animate, reduced]);

  function select(id: string): void {
    clearTimeout(timer.current);
    setSelected(id);
    setFeedback("idle");
  }

  function add(): void {
    if (!available || !cart?.state.hydrated || cart.products === null) return;
    clearTimeout(timer.current);
    try {
      // Confirm inline; only the customer's cart control opens the drawer.
      cart.store.addItem(product.id, 1);
      setFeedback("added");
      timer.current = setTimeout(() => setFeedback("idle"), 2400);
    } catch {
      setFeedback("error");
    }
  }

  function browse(event: MouseEvent<HTMLAnchorElement>, id: string): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(history.state, "", url);
    target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  }

  return <section ref={scope} data-hero-intro="" data-hero-visible="" data-reduced-motion={reduced} aria-labelledby="hero-title" className={styles.hero}>
    <div data-hero-photo="" className={styles.photo}>{children}</div>
    <div aria-hidden="true" className={styles.curtain} />
    <div className={styles.layout}>
      <div className={styles.copy}>
        <p className={styles.kicker}>ELLEK, DÜZİÇİ · OSMANİYE</p>
        <h1 id="hero-title"><span>Düziçi&apos;nden</span>{" "}<em>sofranıza.</em></h1>
        <p className={styles.description}>Doğal kırma yeşil zeytin, salamura zeytin ve natürel sızma zeytinyağı. Kendi tesisimizde seçilir, dolum yapılır, kapınıza gelir.</p>
        <div className={styles.actions}>
          <a href="#urunler" className={styles.browse} onClick={event => browse(event, "urunler")}>Ürünleri gör</a>
          <a href="#tesisimiz" className={styles.browse} onClick={event => browse(event, "tesisimiz")}>Tesisimiz</a>
        </div>
      </div>
      <div data-hero-card="" className={styles.card}>
        <div className={styles.productImage}>{productImage}</div>
        <div className={styles.details}>
          <h3>Doğal Kırma Yeşil Zeytin</h3>
          <RadioGroup.Root aria-label="Boy" orientation="horizontal" className={styles.sizes} value={selected} onValueChange={select}>
            {sizes.map(size => <RadioGroup.Item key={size.id} value={size.id} className={styles.size}>{size.label}</RadioGroup.Item>)}
          </RadioGroup.Root>
          <div className={styles.buyRow}>
            <span aria-label="Seçili boyun fiyatı" className={styles.price}>{product ? money.format(product.priceKurus / 100) : "—"}</span>
            <motion.button type="button" className={styles.purchase} onClick={add}
              disabled={!available || !cart?.state.hydrated || cart.products === null}
              whileTap={reduced ? undefined : { transform: `scale(${motionTokens.scale.press})` }}
              transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
              {available ? feedback === "added" ? "Eklendi" : "Sepete ekle" : "Ürün şu an mevcut değil"}
            </motion.button>
          </div>
          <p role="status" aria-atomic="true" className={styles.feedback}>{feedback === "added" ? `${product?.weight} sepete eklendi.` : ""}</p>
          {feedback === "error" && <p role="alert" className={styles.feedback}>Stok sınırına ulaştınız. Sepetinizdeki adedi kontrol edin.</p>}
        </div>
      </div>
    </div>
    <div aria-hidden="true" data-scroll-hint="" className={styles.scrollHint}><i data-scroll-line="" />KAYDIR</div>
  </section>;
}

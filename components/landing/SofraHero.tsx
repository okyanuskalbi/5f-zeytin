"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type JSX, type MouseEvent, type ReactNode } from "react";
import * as motion from "motion/react-m";
import { useCart } from "@/components/cart/CartProvider";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import layers from "@/lib/media/hero-layers.json";
import type { V3Image } from "@/lib/media/v3-assets";
import type { Product } from "@/types/catalog";
import { HeroDepthMotion } from "./HeroDepthMotion";
import styles from "./SofraHero.module.css";

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const sizes = [
  { id: "sample-green-olive-1kg", label: "1 kg" },
  { id: "sample-green-olive-10kg", label: "10 kg teneke" },
] as const;

function LayerPicture({ image, sizes, bit, loaded, failed }: {
  image: V3Image; sizes: string; bit: number; loaded: (bit: number) => void; failed: () => void;
}): JSX.Element {
  const srcSet = (format: string): string => image.outputs.filter(output => output.format === format).map(output => `${output.file} ${output.width}w`).join(", ");
  const fallback = image.outputs.find(output => output.format === "webp")!;
  // At 390px and 1440px these product planes sit inside the first-screen hero.
  // The desktop tin can become LCP; paint each layer without waiting for JS.
  // Keep all three eager/high; the mobile purchase-card LCP is eager in Hero.
  return <picture>
    <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
    <img data-scene-bit={bit} src={fallback.file} srcSet={srcSet("webp")} sizes={sizes} alt="" aria-hidden="true"
      width={fallback.width} height={fallback.height} loading="eager" fetchPriority="high" decoding="async"
      onLoad={event => {
        const image = event.currentTarget;
        if (typeof image.decode === "function") image.decode().then(() => loaded(bit), failed);
        else loaded(bit);
      }} onError={failed} />
  </picture>;
}

export function SofraHero({ products = [], productImage, children }: {
  products?: readonly Product[]; productImage: ReactNode; children: ReactNode;
}): JSX.Element {
  const scope = useRef<HTMLElement>(null);
  const sizeGroup = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = usePrefersReducedMotion();
  const cart = useCart();
  const openDetail = useProductDetail();
  const [selected, setSelected] = useState<string>(sizes[1].id);
  const [feedback, setFeedback] = useState<"idle" | "added" | "error">("idle");
  const [active, setActive] = useState(false);
  const [layerState, setLayerState] = useState(0);
  const loaded = useCallback((bit: number) => setLayerState(state => state < 0 ? state : state | bit), []);
  const failed = useCallback(() => setLayerState(-1), []);
  const layersReady = layerState === 7;
  const product = products.find(item => item.id === selected);
  const available = !!product && product.stock > 0;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const section = scope.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    const sync = (): void => setActive(visible && document.visibilityState === "visible");
    // Keep the existing mobile cart from covering the hero's purchase card.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      section.toggleAttribute("data-hero-visible", visible);
      sync();
    });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    // Cached images can finish before hydration attaches onLoad.
    for (const image of scope.current?.querySelectorAll<HTMLImageElement>("[data-scene-bit]") ?? []) {
      if (!image.complete) continue;
      Promise.resolve().then(() => {
        if (cancelled) return;
        if (image.naturalWidth === 0) { failed(); return; }
        const complete = (): void => { if (!cancelled) loaded(Number(image.dataset.sceneBit)); };
        const error = (): void => { if (!cancelled) failed(); };
        if (typeof image.decode === "function") image.decode().then(complete, error);
        else complete();
      });
    }
    return () => { cancelled = true; };
  }, [loaded, failed]);

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

  return <section ref={scope} data-hero-intro="" data-hero-visible="" data-reduced-motion={reduced} aria-labelledby="hero-title" className={styles.hero}
    style={{ "--hero-reveal-duration": `${motionTokens.hero.revealDuration}s`, "--hero-reveal-distance": `${motionTokens.distance.xs}px`, "--hero-mobile-factor": motionTokens.hero.mobileFactor } as CSSProperties}>
    {active && !reduced && <HeroDepthMotion target={scope} />}
    <div data-layer="plate" data-hero-photo="" aria-hidden="true" className={styles.photo}>{children}</div>
    <div aria-hidden="true" className={styles.curtain} />
    <div className={styles.layout}>
      <div data-hero-copy="" className={styles.copy}>
        <p className={styles.kicker}>ELLEK, DÜZİÇİ · OSMANİYE</p>
        <h1 id="hero-title"><span>Düziçi&apos;nden</span>{" "}<em>sofranıza.</em></h1>
        <p className={styles.description}>Doğal kırma yeşil zeytin, salamura zeytin ve natürel sızma zeytinyağı. Kendi tesisimizde seçilir, dolum yapılır, kapınıza gelir.</p>
        <div className={styles.actions}>
          <a href="#urunler" className={styles.browse} onClick={event => browse(event, "urunler")}>Ürünleri gör</a>
          <a href="#tesisimiz" className={styles.browse} onClick={event => browse(event, "tesisimiz")}>Tesisimiz</a>
        </div>
      </div>
      <div data-layer="products" aria-hidden="true" data-ready={layersReady} data-failed={layerState < 0} className={styles.products}>
        <div data-product="tin" className={styles.tin}>
          <i data-contact-shadow="" className={styles.contactShadow} />
          <LayerPicture image={layers.assets.teneke} sizes="(max-width: 900px) 18svh, 32svh" bit={1} loaded={loaded} failed={failed} />
        </div>
        <div data-product="jar" className={styles.jar}>
          <i data-contact-shadow="" className={styles.contactShadow} />
          <LayerPicture image={layers.assets.kavanoz} sizes="(max-width: 900px) 8svh, 14svh" bit={2} loaded={loaded} failed={failed} />
        </div>
      </div>
      <div data-layer="branch" aria-hidden="true" data-ready={layersReady} data-failed={layerState < 0} className={styles.branch}>
        <LayerPicture image={layers.assets["on-dal"]} sizes="(max-width: 900px) 80vw, 72vw" bit={4} loaded={loaded} failed={failed} />
      </div>
      <div data-hero-card="" className={styles.card}>
        <div className={styles.productImage}>{productImage}</div>
        <div className={styles.details}>
          <h2><button type="button" className={styles.detailTrigger} aria-haspopup="dialog"
            onClick={event => openDetail?.(selected, event.currentTarget)}>Doğal Kırma Yeşil Zeytin</button></h2>
          <div role="radiogroup" aria-label="Boy" className={styles.sizes}>
            {sizes.map(size => <label key={size.id} className={styles.size} data-state={selected === size.id ? "checked" : "unchecked"}>
              <input className="sr-only" type="radio" name={sizeGroup} value={size.id} checked={selected === size.id}
                onChange={() => select(size.id)} />{size.label}
            </label>)}
          </div>
          <div className={styles.buyRow}>
            <span aria-label="Seçili boyun fiyatı" data-pending={!product} className={styles.price}>{product ? money.format(product.priceKurus / 100) : "Fiyat yakında"}</span>
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
  </section>;
}

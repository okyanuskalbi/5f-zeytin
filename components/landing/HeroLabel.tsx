"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type JSX, type KeyboardEvent } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useCart } from "@/components/cart/CartProvider";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/catalog";
import styles from "./Hero.module.css";

const motionTokens = { duration: { instant: 0, print: 0.2 }, stubWidth: 120, scrollDistance: 0.7 } as const;
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPrice = (kurus: number): string => `${money.format(kurus / 100)} ₺`;
const preference = "(prefers-reduced-motion: reduce), (max-height: 500px)";
// Resize the same approved source through Next's image service. The original
// remains the fallback; ScrollFrameSequence and the approved files are intact.
const responsivePoster = getImageProps({ src: "/images/hero/zeytinlik-2400.webp", alt: "", width: 2400, height: 1350, sizes: "100vw" }).props.srcSet;

function useStaticLabel(): boolean {
  const subscribe = useCallback((notify: () => void) => {
    if (typeof matchMedia !== "function") return () => {};
    const media = matchMedia(preference);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, []);
  return useSyncExternalStore(subscribe,
    () => typeof matchMedia !== "function" || matchMedia(preference).matches || navigator.hardwareConcurrency <= 4,
    () => true);
}

// Adapted from 21st ddoemonn/segmented-control (23552): controlled radio
// semantics and roving focus; AFİNA uses flat ink segments, without a spring thumb.
function Segments({ label, options, value, onChange }: {
  label: string; options: readonly string[]; value: string; onChange: (value: string) => void;
}): JSX.Element {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % options.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
    onChange(options[next]);
  }
  return <div role="radiogroup" aria-label={label} className={styles.segments}>
    {options.map((option, index) => <button key={option} ref={(node) => { buttons.current[index] = node; }}
      type="button" role="radio" aria-checked={option === value} tabIndex={option === value ? 0 : -1}
      onClick={() => onChange(option)} onKeyDown={(event) => navigate(event, index)}>{option}</button>)}
  </div>;
}

function ProductPrint({ product, staticLabel }: { product: Product | undefined; staticLabel: boolean }): JSX.Element {
  const present = useIsPresent();
  return <motion.div aria-hidden={!present || undefined} className={styles.print}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: staticLabel ? motionTokens.duration.instant : motionTokens.duration.print }}>
    {product ? <>
      <h2 className={styles.ribbon}>{product.name}</h2>
      <div className={styles.figures}>
        <p className={styles.weight}>{product.weight.toLocaleUpperCase("tr-TR")}</p>
        <p className={styles.price}>{formatPrice(product.priceKurus)}</p>
      </div>
    </> : <p className={styles.ribbon}>Afina Zeytin</p>}
  </motion.div>;
}

export function HeroLabel({ products }: { products: readonly Product[] }): JSX.Element {
  const cart = useCart();
  const [selectedId, setSelectedId] = useState(products[0]?.id);
  const selected = products.find((product) => product.id === selectedId) ?? products[0];
  const names = [...new Set(products.map((product) => product.name))];
  const sizes = products.filter((product) => product.name === selected?.name);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const root = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const stub = useRef<HTMLElement>(null);
  const staticLabel = useStaticLabel();
  const [collapsed, setCollapsed] = useState(false);
  const { scrollY } = useScroll();
  const geometry = useMotionValue({ start: 0, left: 0, top: 0, width: 0, bottom: 0, distance: 1 });
  const progress = useTransform(() => staticLabel ? 0 : Math.max(0, Math.min(1,
    (scrollY.get() - geometry.get().start) / geometry.get().distance)));
  const scale = useTransform(() => 1 + (motionTokens.stubWidth / (geometry.get().width || motionTokens.stubWidth) - 1) * progress.get());
  const x = useTransform(() => (16 - geometry.get().left) * progress.get());
  const y = useTransform(() => (geometry.get().bottom - geometry.get().top) * progress.get());
  const opacity = useTransform(progress, [0.85, 1], [1, 0]);
  const compact = collapsed && !staticLabel;

  useMotionValueEvent(progress, "change", (value) => setCollapsed(value >= 0.995));

  // Keep the compact label in the lower-left safe area, moving it only when
  // a heading or control would otherwise pass beneath its paper surface.
  useEffect(() => {
    if (!compact) return;
    const element = stub.current!;
    if (root.current?.querySelector("[data-hero-card]")?.contains(document.activeElement)) {
      element.querySelector("a")?.focus({ preventScroll: true });
    }
    let frame: number | undefined;
    function place(): void {
      frame = undefined;
      element.style.removeProperty("--stub-left");
      element.style.removeProperty("--stub-bottom");
      element.style.removeProperty("visibility");
      element.inert = false;
      const box = element.getBoundingClientRect();
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;
      const footer = document.querySelector("footer")?.getBoundingClientRect();
      if (footer && footer.top < innerHeight && footer.bottom > headerBottom) {
        if (element.contains(document.activeElement)) {
          document.querySelector<HTMLButtonElement>('header button[aria-label^="Sepetim,"]')?.focus({ preventScroll: true });
        }
        element.style.visibility = "hidden";
        element.inert = true;
        return;
      }
      if (element.contains(document.activeElement)) return;
      const obstacles = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button,input,select,textarea,[data-product-slip],[data-showcase-copy],[data-facility-safe],[data-moments-safe],[data-reading-safe]")]
        .filter((node) => !root.current?.contains(node) && node.getClientRects().length > 0)
        .flatMap((node) => {
          // A showcase slip is one paper object, including the space around
          // its purchase controls. Keep the stub outside the whole panel.
          if (node.matches("[data-product-slip],[data-showcase-copy],[data-facility-safe],[data-moments-safe],[data-reading-safe]")) return [node.getBoundingClientRect()];
          const range = document.createRange();
          range.selectNodeContents(node);
          return [...range.getClientRects()];
        }).filter((rect) => rect.bottom > headerBottom && rect.top < innerHeight && rect.width > 0);
      const overlaps = (left: number, top: number): boolean => obstacles.some((rect) =>
        left < rect.right + 8 && left + box.width > rect.left - 8 && top < rect.bottom + 8 && top + box.height > rect.top - 8);
      if (!overlaps(box.left, box.top)) return;
      const xs = [box.left, ...obstacles.map((rect) => rect.right + 8)]
        .filter((left) => left >= box.left && left + box.width <= innerWidth - 16);
      const ys = [box.top, ...obstacles.map((rect) => rect.top - box.height - 8)]
        .filter((top) => top >= headerBottom + 16 && top <= box.top);
      const candidates = ys.flatMap((top) => xs.map((left) => ({ top, left })))
        .sort((a, b) => (a.left - box.left + box.top - a.top) - (b.left - box.left + box.top - b.top));
      const space = candidates.find(({ left, top }) => !overlaps(left, top));
      if (space) {
        element.style.setProperty("--stub-left", `${space.left}px`);
        element.style.setProperty("--stub-bottom", `${innerHeight - space.top - box.height}px`);
      } else {
        const readingSectionVisible = [...document.querySelectorAll("#urunler, #tesisimiz, #topraktan-sofraya, #sik-sorulanlar, #toptan-iletisim, footer")]
          .some(section => { const rect = section.getBoundingClientRect(); return rect.top < innerHeight && rect.bottom > headerBottom; });
        if (readingSectionVisible) {
          // A narrow reading column can leave no safe 120px space. The header
          // cart stays available; temporarily remove the duplicate stub rather
          // than covering official copy, facility facts or the draggable strip.
          element.style.visibility = "hidden";
          element.inert = true;
        }
      }
    }
    function schedule(): void { if (frame === undefined) frame = requestAnimationFrame(place); }
    const stop = scrollY.on("change", schedule);
    // Native animation completion can follow the last scroll frame. Reuse the
    // same placement scheduler once the slips have reached their final bounds.
    window.addEventListener("afina:product-card-settled", schedule);
    window.addEventListener("afina:facility-settled", schedule);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      stop(); window.removeEventListener("afina:product-card-settled", schedule); window.removeEventListener("afina:facility-settled", schedule); window.removeEventListener("resize", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
      element.style.removeProperty("--stub-left"); element.style.removeProperty("--stub-bottom");
      element.style.removeProperty("visibility"); element.inert = false;
    };
  }, [compact, scrollY]);

  // 21st danielpetho/stacking-cards (25275): a stable anchor and scroll-driven
  // transforms. The 120px stub outlives the scene; it shares the existing cart.
  useEffect(() => {
    const section = root.current!;
    if (staticLabel || typeof ResizeObserver === "undefined") {
      delete section.dataset.enhanced;
      return;
    }
    function measure(): void {
      const anchored = anchor.current;
      const ticket = stub.current;
      // A queued ResizeObserver delivery can run during a client navigation.
      if (!section.isConnected || !anchored || !ticket) return;
      const box = anchored.getBoundingClientRect();
      const start = section.getBoundingClientRect().top + window.scrollY;
      const top = box.top + window.scrollY;
      const bottom = innerHeight - ticket.getBoundingClientRect().height - parseFloat(getComputedStyle(ticket).bottom);
      geometry.set({ start, left: box.left, top, width: box.width, bottom, distance: innerHeight * motionTokens.scrollDistance });
      section.style.setProperty("--dock-left", `${box.left}px`);
      section.style.setProperty("--dock-top", `${top}px`);
      section.style.setProperty("--dock-width", `${box.width}px`);
      section.style.setProperty("--dock-height", `${box.height}px`);
      section.dataset.enhanced = "true";
    }
    const observer = new ResizeObserver(measure);
    observer.observe(anchor.current!);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); delete section.dataset.enhanced; };
  }, [geometry, staticLabel]);

  function select(product: Product | undefined): void {
    if (!product) return;
    setSelectedId(product.id);
    setFeedback({ error: false, message: "" });
  }
  const count = cart?.state.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const total = cart?.state.items.reduce((sum, item) => sum + (cart.products?.find((product) => product.id === item.productId)?.priceKurus ?? 0) * item.quantity, 0) ?? 0;
  const canAdd = !!cart?.products && cart.state.hydrated;

  return <section ref={root} aria-label="Afina Zeytin" data-hero-label="" data-static={staticLabel} className={styles.hero}>
    <ScrollFrameSequence src="/frames/hero-zeytin/manifest.json"
      poster={{ src: "/images/hero/zeytinlik-2400.webp", srcSet: responsivePoster, width: 2400, height: 1350 }}
      scrollLength={150} positionX={1} mediaClassName={styles.media} label="" />
    <div className={styles.stage}>
      <div ref={anchor} className={styles.anchor}>
        <motion.div data-hero-card="" aria-hidden={compact || undefined} inert={compact}
          className={styles.card} style={{ scale, x, y, opacity }}>
          <div className={styles.brandRow}>
            <Image src="/brand/afina-zeytin.svg" alt="Afina Zeytin" width={104} height={80} className={styles.logo} />
            <p className={styles.sample}>Örnek ürünler<br />ve fiyatlar</p>
          </div>
          <div data-testid="hero-print" className={styles.printStack} aria-live="polite" aria-atomic="true">
            <AnimatePresence initial={false}>
              <ProductPrint key={selected?.id ?? "empty"} product={selected} staticLabel={staticLabel} />
            </AnimatePresence>
          </div>
          <h1 id="hero-title" className={styles.title}><span>Kökü toprakta.</span>{" "}<span>Yeri sofrada.</span></h1>
          {selected && <div className={styles.choices}>
            <Segments label="Ürün" options={names} value={selected.name} onChange={(name) => select(products.find((product) => product.name === name && product.weight === selected.weight) ?? products.find((product) => product.name === name))} />
            <Segments label="Boy" options={sizes.map((product) => product.weight)} value={selected.weight}
              onChange={(weight) => select(sizes.find((product) => product.weight === weight))} />
          </div>}
          <div className={styles.bottom}>
            <p className={styles.origin}>Osmaniye / Düziçi</p>
            {selected && <Button disabled={!canAdd || selected.stock <= 0} className={styles.add}
              onClick={(event) => {
                try { cart!.addItem(selected.id, 1, event.currentTarget); setFeedback({ error: false, message: "1 adet ürün sepete eklendi." }); }
                catch { setFeedback({ error: true, message: "Ürün sepete eklenemedi. Stok sınırını kontrol edin." }); }
              }}>{selected.stock <= 0 ? "Tükendi" : "Sepete ekle"}</Button>}
            <a href="#urunler" className={styles.all}>Tüm ürünler</a>
          </div>
          <p role={feedback.error ? "alert" : "status"} className={styles.feedback}>{feedback.message}</p>
        </motion.div>
      </div>
    </div>
    <aside ref={stub} aria-label="Etiket koçanı" aria-hidden={!compact} inert={!compact}
      data-hero-stub="" data-visible={compact} className={styles.stub}>
      {count > 0 ? <>
        <p className={styles.stubCount}>{count} adet</p>
        <p className={styles.stubTotal}>{formatPrice(total)}</p>
        <Link href="/sepet">Sepete git</Link>
      </> : <a href="#urunler">Ürünlere göz at</a>}
    </aside>
    <noscript><p className={styles.noScript}>Ürün ve boy seçeneklerini <a href="#urunler">ürün listesinde</a> inceleyin. <a href="/sepet">Sepete git</a></p></noscript>
  </section>;
}

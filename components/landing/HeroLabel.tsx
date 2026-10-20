"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type JSX, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDeferredEnhancement } from "@/lib/media/use-deferred-enhancement";
import { heroPoster } from "@/lib/media/hero-poster";
import { useCart } from "@/components/cart/CartProvider";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/catalog";
import styles from "./Hero.module.css";

const HeroLabelMotion = dynamic(() => import("./HeroLabelMotion").then((module) => module.HeroLabelMotion), { ssr: false });
const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPrice = (kurus: number): string => `${money.format(kurus / 100)} ₺`;
const preference = "(prefers-reduced-motion: reduce), (max-height: 500px)";

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

function ProductPrint({ product }: { product: Product | undefined }): JSX.Element {
  return <div className={styles.print}>
    {product ? <>
      <h2 className={styles.ribbon}>{product.name}</h2>
      <div className={styles.figures}>
        <p className={styles.weight}>{product.weight.toLocaleUpperCase("tr-TR")}</p>
        <p className={styles.price}>{formatPrice(product.priceKurus)}</p>
      </div>
    </> : <p className={styles.ribbon}>Afina Zeytin</p>}
  </div>;
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
  const compact = collapsed && !staticLabel;
  const enhanced = useDeferredEnhancement(root, !staticLabel);

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
      poster={heroPoster} deferPlayback initialCount={10}
      scrollLength={150} positionX={1} mediaClassName={styles.media} label="" />
    <div className={styles.stage}>
      <div ref={anchor} className={styles.anchor}>
        <div data-hero-card="" aria-hidden={compact || undefined} inert={compact}
          className={styles.card}>
          <div className={styles.brandRow}>
            <Image src="/brand/afina-zeytin.svg" alt="Afina Zeytin" width={104} height={80} sizes="(max-width: 767px) 80px, 104px" className={styles.logo} />
            <p className={styles.sample}>Örnek ürünler<br />ve fiyatlar</p>
          </div>
          <div data-testid="hero-print" className={styles.printStack} aria-live="polite" aria-atomic="true">
            <ProductPrint key={selected?.id ?? "empty"} product={selected} />
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
        </div>
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
    {enhanced && <HeroLabelMotion root={root} anchor={anchor} stub={stub} staticLabel={staticLabel} setCollapsed={setCollapsed} />}
    <noscript><p className={styles.noScript}>Ürün ve boy seçeneklerini <a href="#urunler">ürün listesinde</a> inceleyin. <a href="/sepet">Sepete git</a></p></noscript>
  </section>;
}

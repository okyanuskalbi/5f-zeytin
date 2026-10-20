"use client";

import { useRef, useState, type JSX, type KeyboardEvent } from "react";
import { heroPoster } from "@/lib/media/hero-poster";
import { useCart } from "@/components/cart/CartProvider";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/catalog";
import styles from "./Hero.module.css";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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


// The v1 purchase contract remains available in document flow until the v2
// showcase/quick-view tasks take ownership. No label, dock or floating stub.
export function HeroIntro({ products }: { products: readonly Product[] }): JSX.Element {
  const cart = useCart();
  const [selectedId, setSelectedId] = useState(products[0]?.id);
  const selected = products.find((product) => product.id === selectedId) ?? products[0];
  const names = [...new Set(products.map((product) => product.name))];
  const sizes = products.filter((product) => product.name === selected?.name);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  function select(product: Product | undefined): void {
    if (!product) return;
    setSelectedId(product.id);
    setFeedback({ error: false, message: "" });
  }
  const canAdd = !!cart?.products && cart.state.hydrated;
  return <section aria-label="Afina Zeytin" data-hero-intro="" className={styles.hero}>
    <ScrollFrameSequence src="/frames/hero-zeytin/manifest.json" poster={heroPoster}
      deferPlayback initialCount={10} scrollLength={150} positionX={1} mediaClassName={styles.media} label="" />
    <div data-surface="dark" className={styles.stage}>
      <h1 id="hero-title" className={styles.title}><span>Kökü toprakta.</span>{" "}<span>Yeri sofrada.</span></h1>
      <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
      <Button asChild><a href="#urunler">Tüm ürünler</a></Button>
    </div>
    <div data-nav-light="" className={styles.purchase}>
      {selected && <>
        <div data-testid="hero-product" aria-live="polite" aria-atomic="true">
          <h2>{selected.name}</h2>
          <p>{selected.weight.toLocaleUpperCase("tr-TR")} · <span className="tabular-nums">{money.format(selected.priceKurus / 100)} ₺</span></p>
          <p className={styles.sample}>Örnek ürünler ve fiyatlar</p>
        </div>
        <div className={styles.choices}>
          <Segments label="Ürün" options={names} value={selected.name} onChange={(name) => select(products.find((product) => product.name === name && product.weight === selected.weight) ?? products.find((product) => product.name === name))} />
          <Segments label="Boy" options={sizes.map((product) => product.weight)} value={selected.weight} onChange={(weight) => select(sizes.find((product) => product.weight === weight))} />
          <Button disabled={!canAdd || selected.stock <= 0} onClick={(event) => {
            try { cart!.addItem(selected.id, 1, event.currentTarget); setFeedback({ error: false, message: "1 adet ürün sepete eklendi." }); }
            catch { setFeedback({ error: true, message: "Ürün sepete eklenemedi. Stok sınırını kontrol edin." }); }
          }}>{selected.stock <= 0 ? "Tükendi" : "Sepete ekle"}</Button>
          <p role={feedback.error ? "alert" : "status"}>{feedback.message}</p>
        </div>
      </>}
      <noscript><p>Ürün ve boy seçeneklerini <a href="#urunler">ürün listesinde</a> inceleyin. <a href="/sepet">Sepete git</a></p></noscript>
    </div>
  </section>;
}

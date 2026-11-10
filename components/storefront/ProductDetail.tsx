"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore, type JSX } from "react";
import { m, useReducedMotion } from "motion/react";
import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { AddToCart } from "@/components/catalog/AddToCart";
import { V3Picture } from "@/components/media/V3Picture";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { getProductDetails } from "@/lib/catalog/product-details";
import { getProductGroup, getGroupTrail } from "@/lib/catalog/groups";
import { selectRelatedProducts } from "@/lib/catalog/product-pages";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductFamily, ProductVariant } from "@/types/catalog";
import { ProductTile } from "./ProductTile";
import styles from "./ProductDetail.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const sizeEvent = "afina:product-size-change";
function subscribe(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener(sizeEvent, notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener(sizeEvent, notify); };
}
const selectedSize = () => new URL(window.location.href).searchParams.get("boy") ?? "";
const serverSize = () => "";

export function ProductDetail({ family, related }: { family: ProductFamily; related: readonly ProductVariant[] }): JSX.Element {
  const requestedSize = useSyncExternalStore(subscribe, selectedSize, serverSize);
  const product = family.variants.find(item => item.weight === requestedSize || item.id === requestedSize) ?? family.variants[0];
  const cart = useCart();
  const reduced = useReducedMotion();
  const sizeGroup = useId();
  const [selection, setSelection] = useState({ id: product.id, quantity: 1, scene: false });
  if (selection.id !== product.id) setSelection({ id: product.id, quantity: 1, scene: false });
  const details = getProductDetails(product);
  const relatedProducts = selectRelatedProducts(related, product);
  const group = getProductGroup(family.groupId);
  const inCart = cart?.state.items.find(item => item.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const quantity = Math.min(selection.quantity, Math.max(1, remaining));
  const studio = product.galleryKeys.find(key => key.endsWith("-studyo")) ?? product.imageKey;
  const scene = product.galleryKeys.find(key => key.endsWith("-sahne"));
  const activeImage = selection.scene && scene ? scene : studio;
  const gallery = [{ key: studio, label: "Stüdyo görseli" }, ...(scene ? [{ key: scene, label: "Sofra görseli" }] : [])];

  function selectSize(weight: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("boy", weight);
    history.replaceState(history.state, "", url);
    window.dispatchEvent(new Event(sizeEvent));
  }

  return <main className={styles.root}><div className={styles.container}>
    <nav className={styles.breadcrumb} aria-label="İçerik yolu"><ol>
      <li><Link href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><Link href="/urunler">Ürünler</Link></li>
      {getGroupTrail(family.groupId).map(item => <li key={item.id}><span aria-hidden="true">/</span><Link href={`/urunler/${item.id}`}>{item.name}</Link></li>)}
      <li><span aria-hidden="true">/</span><span aria-current="page">{family.name}</span></li>
    </ol></nav>
    <article className={styles.product} data-product-page data-product-id={product.id} data-surface="light" data-reduced-motion={Boolean(reduced)}>
      <div className={styles.gallery} data-product-detail-gallery>
        <div className={styles.image} data-product-detail-image>
          <V3Picture image={v3Image(activeImage)} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1312px) 48vw, 600px" eager />
        </div>
        <div role="group" aria-label="Ürün görselleri" className={styles.thumbnails}>{gallery.map((image, index) => <m.button key={image.key} type="button" aria-label={image.label} aria-pressed={selection.scene === (index === 1)} onClick={() => setSelection({ ...selection, scene: index === 1 })}
          whileTap={reduced ? undefined : { scale: .98 }} transition={{ type: "spring", stiffness: 240, damping: 28 }}>
          <V3Picture image={v3Image(image.key)} sizes="64px" decorative />
        </m.button>)}</div>
        <p className={styles.caption}>Ürün görselleri temsilidir.</p>
      </div>
      <div className={styles.info} data-product-detail-info>
        <h1 className={styles.title}>{family.name}</h1>
        <p className={styles.description}>{details?.description}</p>
        <div className={styles.choice}>
          <span>Ambalaj boyu</span>
          {family.variants.length > 1 ? <div role="radiogroup" aria-label="Boy" className={styles.sizes}>{family.variants.map(variant => <label key={variant.id} className={styles.size} data-state={variant.id === product.id ? "checked" : "unchecked"}><input className="sr-only" type="radio" name={sizeGroup} value={variant.id} checked={variant.id === product.id} onChange={() => selectSize(variant.weight)} /><Check size={16} aria-hidden="true" />{variant.weight}</label>)}</div> : <p className={styles.weight}>{product.weight}</p>}
        </div>
        <div className={styles.priceRow}><p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p><p className={styles.stock} role="status">{product.stock === 0 ? "Mevcut değil" : remaining === 0 ? "Ürünün tamamı sepetinizde." : "Stokta mevcut"}</p></div>
        <div data-product-detail-purchase className={styles.purchase}>
          {product.stock > 0 && <div className={styles.quantityRow}><span>Adet</span><div role="group" aria-label="Adet seçimi" className={styles.quantity}>
            <button type="button" aria-label="Adedi azalt" disabled={quantity <= 1 || remaining === 0} onClick={() => setSelection({ ...selection, quantity: quantity - 1 })}><Minus size={18} aria-hidden="true" /></button>
            <output aria-label="Adet" aria-live="polite">{quantity}</output>
            <button type="button" aria-label="Adedi artır" disabled={quantity >= remaining} onClick={() => setSelection({ ...selection, quantity: quantity + 1 })}><Plus size={18} aria-hidden="true" /></button>
          </div></div>}
          <div className={styles.add}><AddToCart key={product.id} product={product} quantity={quantity} disabled={remaining === 0} /></div>
          <Link href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`} className={styles.quote}>Teklife ekle</Link>
        </div>
        <div className={styles.payment}><span>Ödeme seçenekleri</span><PaymentLogos tone="dark" /></div>
        {details && <section className={styles.details} aria-labelledby="bilgi-title"><h2 id="bilgi-title">Ürün bilgileri</h2><dl>{details.information.filter(row => row.label !== "Kargo").map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>}
        <section className={styles.storage} aria-labelledby="saklama-title"><h2 id="saklama-title">Saklama bilgisi</h2><p>Saklama ve son tüketim bilgileri için ürün ambalajını kontrol edin.</p></section>
      </div>
    </article>
    {relatedProducts.length > 0 && <section aria-labelledby="benzer-title" className={styles.related}>
      <header><h2 id="benzer-title">Benzer Ürünler</h2><Link href={`/urunler/${group?.parentId ?? group?.id ?? ""}`}>Kategorideki ürünler</Link></header>
      <div className={styles.relatedGrid}>{relatedProducts.map(item => <ProductTile key={item.id} product={item} />)}</div>
    </section>}
  </div></main>;
}

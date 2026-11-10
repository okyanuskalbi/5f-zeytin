"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type JSX } from "react";
import { useAnimate } from "motion/react-mini";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { V3Picture } from "@/components/media/V3Picture";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { getProductDetails } from "@/lib/catalog/product-details";
import { productImageFocus } from "@/lib/catalog/product-image-focus";
import { getProductGroup, getGroupTrail } from "@/lib/catalog/groups";
import { selectRelatedProducts } from "@/lib/catalog/product-pages";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import type { ProductFamily, ProductVariant } from "@/types/catalog";
import { AddToCart } from "./AddToCart";
import { ProductCard } from "./ProductCard";
import styles from "./ProductPage.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const changeEvent = "afina:product-size-change";
function subscribe(notify: () => void): () => void {
  window.addEventListener("popstate", notify); window.addEventListener(changeEvent, notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener(changeEvent, notify); };
}
const sizeSnapshot = () => new URL(window.location.href).searchParams.get("boy") ?? "";
const serverSize = () => "";

export function ProductPage({ family, related }: { family: ProductFamily; related: readonly ProductVariant[] }): JSX.Element {
  const requestedSize = useSyncExternalStore(subscribe, sizeSnapshot, serverSize);
  const product = family.variants.find(variant => variant.weight === requestedSize || variant.id === requestedSize) ?? family.variants[0];
  const cart = useCart();
  const reduced = usePrefersReducedMotion();
  const [mainImage, animateImage] = useAnimate<HTMLDivElement>();
  const sizeGroup = useId();
  const [selection, setSelection] = useState({ id: product.id, quantity: 1, scene: false });
  if (selection.id !== product.id) setSelection({ id: product.id, quantity: 1, scene: false });
  const details = getProductDetails(product);
  const relatedProducts = selectRelatedProducts(related, product);
  const group = getProductGroup(family.groupId);
  const inCart = cart?.state.items.find(item => item.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const quantity = Math.min(selection.quantity, Math.max(1, remaining));
  const studioKey = product.galleryKeys.find(key => key.endsWith("-studyo")) ?? product.imageKey;
  const sceneKey = product.galleryKeys.find(key => key.endsWith("-sahne"));
  const activeImageKey = selection.scene && sceneKey ? sceneKey : studioKey;
  const previousImageKey = useRef(activeImageKey);
  const gallery = [{ key: studioKey, label: "Stüdyo görseli" }, ...(sceneKey ? [{ key: sceneKey, label: "Sofra görseli" }] : [])];

  useEffect(() => {
    const changed = previousImageKey.current !== activeImageKey;
    previousImageKey.current = activeImageKey;
    if (!changed || reduced || !mainImage.current) return;
    const node = mainImage.current;
    const controls = animateImage(node, { opacity: [0, 1] }, { duration: motionTokens.duration.crossfade });
    return () => { controls.stop(); node.style.opacity = "1"; };
  }, [activeImageKey, animateImage, mainImage, reduced]);

  function selectSize(weight: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("boy", weight);
    history.replaceState(history.state, "", url);
    window.dispatchEvent(new Event(changeEvent));
  }

  return <main className={styles.root}><div className={styles.container}>
    <nav className={styles.breadcrumb} aria-label="İçerik yolu"><ol>
      <li><Link href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><Link href="/urunler">Ürünler</Link></li>
      {getGroupTrail(family.groupId).map(node => <li key={node.id}><span aria-hidden="true">/</span><Link href={`/urunler/${node.id}`}>{node.name}</Link></li>)}
      <li><span aria-hidden="true">/</span><span aria-current="page">{family.name}</span></li>
    </ol></nav>
    <article className={styles.product} data-product-page data-product-id={product.id} data-surface="light" data-reduced-motion={reduced}>
      <div className={styles.gallery} data-product-detail-gallery>
        <div ref={mainImage} data-product-detail-image className={styles.image} style={{ "--product-image-position": productImageFocus[activeImageKey] ?? "center" } as CSSProperties}>
          <V3Picture image={v3Image(activeImageKey)} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1312px) 48vw, 600px" eager />
        </div>
        <div role="group" aria-label="Ürün görselleri" className={styles.thumbnails}>{gallery.map((image, index) => <button key={image.key} type="button" aria-label={image.label} aria-pressed={selection.scene === (index === 1)} onClick={() => setSelection({ ...selection, scene: index === 1 })}><V3Picture image={v3Image(image.key)} sizes="64px" decorative /></button>)}</div>
      </div>
      <div className={styles.info} data-product-detail-info>
        {details?.information.some(row => row.label === "Kategori") && <span className={styles.category}>{details.information.find(row => row.label === "Kategori")?.value}</span>}
        <h1 className={styles.title}>{family.name}</h1>
        {family.variants.length > 1 ? <div role="radiogroup" aria-label="Boy" className={styles.sizes}>{family.variants.map(variant => <label key={variant.id} className={styles.size} data-state={variant.id === product.id ? "checked" : "unchecked"}><input className="sr-only" type="radio" name={sizeGroup} value={variant.id} checked={variant.id === product.id} onChange={() => selectSize(variant.weight)} />{variant.weight}</label>)}</div> : <p className={styles.weight}>{product.weight}</p>}
        <p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p>
        <p className={styles.stock} role="status">{product.stock === 0 ? "Mevcut değil" : remaining === 0 ? "Stok sınırına ulaştınız. Ürünün tamamı sepetinizde." : "Stokta mevcut"}</p>
        <div data-product-detail-purchase className={styles.purchase}>
          {product.stock > 0 && <div className={styles.quantityRow}><span>Adet</span><div role="group" aria-label="Adet seçimi" className={styles.quantity}>
            <button type="button" aria-label="Adedi azalt" disabled={quantity <= 1 || remaining === 0} onClick={() => setSelection({ ...selection, quantity: quantity - 1 })}><Minus size={16} aria-hidden="true" /></button>
            <output aria-label="Adet" aria-live="polite">{quantity}</output>
            <button type="button" aria-label="Adedi artır" disabled={quantity >= remaining} onClick={() => setSelection({ ...selection, quantity: quantity + 1 })}><Plus size={16} aria-hidden="true" /></button>
          </div></div>}
          <AddToCart key={product.id} product={product} quantity={quantity} disabled={remaining === 0} />
          <Link href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`} className={styles.quote}>Toptan teklif al<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <p className={styles.description}>{details?.description}</p>
        {details && <table aria-label="Ürün bilgileri" className={styles.facts}><tbody>{details.information.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody></table>}
        <div className={styles.payment}><span>Güvenli Ödeme</span><PaymentLogos tone="dark" /></div>
      </div>
    </article>
    {relatedProducts.length > 0 && <section aria-labelledby="benzer-title" className={styles.related}><header><h2 id="benzer-title">Benzer Ürünler</h2><Link href={`/urunler/${group?.parentId ?? group?.id ?? ""}`}>Kategoriyi keşfedin<ArrowRight size={18} aria-hidden="true" /></Link></header>
      <div className={styles.relatedGrid}>{relatedProducts.map(item => <ProductCard key={item.id} product={item} image={v3Image(item.imageKey)} featured={false} staticPresentation imageSizes="(max-width: 767px) 42vw, 280px" />)}</div>
    </section>}
  </div></main>;
}

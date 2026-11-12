"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type JSX } from "react";
import { m, useReducedMotion } from "motion/react";
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
import { PillButton } from "./ui/PillButton";
import { PillSwitch } from "./ui/PillSwitch";
import { QuantityStepper } from "./ui/QuantityStepper";
import { SectionHeading } from "./ui/SectionHeading";
import { Tag } from "./ui/Tag";
import styles from "./ProductDetail.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const sizeEvent = "afina:product-size-change";
function subscribe(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener(sizeEvent, notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener(sizeEvent, notify); };
}
const selectedSize = () => new URL(window.location.href).searchParams.get("boy") ?? "";

export function ProductDetail({ family, related, initialSize = "" }: { family: ProductFamily; related: readonly ProductVariant[]; initialSize?: string }): JSX.Element {
  const requestedSize = useSyncExternalStore(subscribe, selectedSize, () => initialSize);
  const product = family.variants.find(item => item.weight === requestedSize || item.id === requestedSize) ?? family.variants[0];
  const router = useRouter();
  const cart = useCart();
  const reduced = useReducedMotion();
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
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  return <main className={styles.root}><div className={styles.container}>
    <nav className={styles.breadcrumb} aria-label="İçerik yolu"><ol>
      <li><Link prefetch={false} href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><Link prefetch={false} href="/urunler">Ürünler</Link></li>
      {getGroupTrail(family.groupId).map(item => <li key={item.id}><span aria-hidden="true">/</span><Link prefetch={false} href={`/urunler/${item.id}`}>{item.name}</Link></li>)}
      <li><span aria-hidden="true">/</span><span aria-current="page">{family.name}</span></li>
    </ol></nav>
    <article className={styles.product} data-product-page data-product-id={product.id} data-surface="light" data-reduced-motion={Boolean(reduced)}>
      <div className={styles.info} data-product-detail-info>
        {group && <Tag>{group.name}</Tag>}
        <h1 className={styles.title}>{family.name}</h1>
        <div className={styles.choice}>
          <span>Ambalaj boyu</span>
          {family.variants.length > 1
            ? <PillSwitch label="Boy" value={product.weight} onChange={selectSize} options={family.variants.map(variant => ({ value: variant.weight, label: variant.weight }))} />
            : <p className={styles.weight}>{product.weight}</p>}
        </div>
        <div className={styles.priceRow}>
          <p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p>
          <p className={styles.stock} role="status" data-in-stock={product.stock > 0 && remaining > 0}>{product.stock === 0 ? "Mevcut değil" : remaining === 0 ? "Ürünün tamamı sepetinizde." : "Stokta mevcut"}</p>
        </div>
        <div data-product-detail-purchase className={styles.purchase}>
          <div className={styles.buyRow}>
            {product.stock > 0 && <QuantityStepper label="Adet seçimi" live="polite" quantity={quantity} canDecrease={quantity > 1 && remaining > 0} canIncrease={quantity < remaining}
              onChange={next => setSelection({ ...selection, quantity: next })} />}
            <div className={styles.add}><AddToCart key={product.id} product={product} quantity={quantity} disabled={remaining === 0} /></div>
          </div>
          <PillButton variant="outline" fullWidth href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`}>Teklife ekle</PillButton>
        </div>
      </div>
      <div className={styles.gallery} data-product-detail-gallery>
        <div className={styles.image} data-product-detail-image data-view={activeImage === scene ? "scene" : studio === product.imageKey ? "cutout" : "studio"}>
          <V3Picture image={v3Image(activeImage)} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1312px) 48vw, 600px" eager />
        </div>
        <div role="group" aria-label="Ürün görselleri" className={styles.thumbnails}>{gallery.map((image, index) => <m.button key={image.key} type="button" aria-label={image.label} aria-pressed={selection.scene === (index === 1)} onClick={() => setSelection({ ...selection, scene: index === 1 })}
          whileTap={reduced ? undefined : { scale: .98 }} transition={{ type: "spring", stiffness: 240, damping: 28 }}>
          <V3Picture image={v3Image(image.key)} sizes="64px" decorative />
        </m.button>)}</div>
        <p className={styles.caption}>Ürün görselleri temsilidir.</p>
      </div>
      <div className={styles.support}>
        {details?.description && <p className={styles.description}>{details.description}</p>}
        <div className={styles.sheet}>
          {details && <section className={styles.details} aria-labelledby="bilgi-title"><h2 id="bilgi-title">Ürün bilgileri</h2><dl>{details.information.filter(row => row.label !== "Kargo").map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>}
          <section className={styles.storage} aria-labelledby="saklama-title"><h2 id="saklama-title">Saklama bilgisi</h2><p>Saklama ve son tüketim bilgileri için ürün ambalajını kontrol edin.</p></section>
          <div className={styles.payment}><span>Ödeme seçenekleri</span><span className={styles.marks}><PaymentLogos tone="dark" /></span></div>
        </div>
      </div>
    </article>
    {relatedProducts.length > 0 && <section aria-labelledby="benzer-title" className={styles.related}>
      <header><div id="benzer-title"><SectionHeading title="Benzer Ürünler" /></div><PillButton variant="quiet" href={`/urunler/${group?.parentId ?? group?.id ?? ""}`}>Kategorideki ürünler</PillButton></header>
      <div className={styles.relatedGrid}>{relatedProducts.map(item => <ProductTile key={item.id} product={item} />)}</div>
    </section>}
  </div></main>;
}

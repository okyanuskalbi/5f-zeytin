"use client";

import { useId, useSyncExternalStore, type JSX, type ReactNode } from "react";
import { m as motion } from "motion/react";
import { V3Picture } from "@/components/media/V3Picture";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import type { V3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";
import { AddToCart } from "./AddToCart";
import { catalogCardVariants } from "./CatalogGridMotion";
import { useProductDetail } from "./ProductDetailProvider";
import styles from "./ProductCard.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function ProductCard({ product, image, scene, index = 0, featured = true, quoteAction, imageLoading, staticPresentation = false, imageSizes = "(max-width: 767px) 40vw, (max-width: 1023px) 25vw, 320px" }: {
  product: ProductVariant; image: V3Image; scene?: V3Image; index?: number; featured?: boolean; quoteAction?: ReactNode; imageLoading?: "eager" | "lazy"; imageSizes?: string; staticPresentation?: boolean;
}): JSX.Element {
  const id = useId();
  const reduced = usePrefersReducedMotion();
  const openDetail = useProductDetail();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  return <motion.div className={styles.reveal} data-product-reveal="" data-reduced-motion={reduced} data-static-presentation={staticPresentation || undefined}
    initial={staticPresentation ? undefined : false} variants={staticPresentation && !reduced ? catalogCardVariants : undefined}
    whileTap={reduced ? undefined : { scale: motionTokens.interaction.tapScale }}
    transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
    <article className={styles.card} aria-labelledby={`${id}-name`} data-product-id={product.id} data-category={product.category} data-size={product.weight}>
      {scene && <div data-product-scene="" aria-hidden="true" className={styles.scene}><V3Picture image={scene} sizes="(max-width: 767px) 50vw, 33vw" decorative /></div>}
      {featured && index === 0 && <span className={styles.badge}>KOLEKSİYONDAN</span>}
      <button type="button" disabled={!ready} className={`${styles.image} ${styles.detailTrigger}`} aria-haspopup="dialog"
        aria-label={`${product.name}, ${product.weight} detayını aç`} onClick={event => openDetail?.(product.id, event.currentTarget)}>
        <V3Picture image={image} sizes={imageSizes} loading={imageLoading} />
      </button>
      <h3 id={`${id}-name`} aria-label={`${product.name}, ${product.weight}`}><button type="button" disabled={!ready} className={styles.detailTrigger} aria-haspopup="dialog" aria-label={`${product.name}, ${product.weight}`}
        onClick={event => openDetail?.(product.id, event.currentTarget)}>{product.name}</button></h3>
      <div className={styles.meta}>
        <span id={`${id}-weight`} aria-label="Boy" className={styles.size}>{product.weight}</span>
      </div>
      <div className={styles.buyRow}>
        <p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p>
        <AddToCart product={product} />
      </div>
      {quoteAction}
    </article>
  </motion.div>;
}

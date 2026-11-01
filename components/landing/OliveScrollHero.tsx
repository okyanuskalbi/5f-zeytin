"use client";

import { type CSSProperties, type JSX } from "react";
import * as motion from "motion/react-m";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { V3Picture } from "@/components/media/V3Picture";
import { editorialPoster } from "@/lib/media/cinematic-poster";
import { useEditorialEntrance } from "@/lib/media/use-editorial-entrance";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import { v3Image } from "@/lib/media/v3-assets";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import { AddToCart } from "@/components/catalog/AddToCart";
import type { ProductVariant } from "@/types/catalog";
import styles from "./RenewalLanding.module.css";

/** 21st Editorial Collage Hero (19074), adapted to AFİNA's producer story.
 * The accepted Flow clip is a bright window beside the copy, never behind it.
 * Native page scroll advances it; short screens/data saver retain the poster. */
export function OliveScrollHero({ product }: { product?: ProductVariant }): JSX.Element {
  const story = useEditorialEntrance();
  const reduced = usePrefersReducedMotion();
  const feedback = {
    whileHover: reduced ? undefined : { y: motionTokens.interaction.hoverY },
    whileTap: reduced ? undefined : { scale: motionTokens.interaction.tapScale },
    transition: springs.action,
    style: reduced ? { transform: "none" } : undefined,
  };
  const openDetail = useProductDetail();
  return <>
    <link rel="preload" as="image" type="image/avif" media="(max-width: 767px) and (orientation: portrait)" imageSrcSet={editorialPoster.mobileSrcSet} imageSizes="100vw" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" media="(min-width: 768px), (orientation: landscape)" imageSrcSet={editorialPoster.desktopSrcSet} imageSizes="(min-width: 901px) 54vw, 100vw" fetchPriority="high" />
    <section id="baslangic" data-hero-intro="" className={styles.hero} aria-labelledby="renewal-hero-title">
      <div ref={story} className={`${styles.container} ${styles.heroLayout}`}>
        <div data-hero-copy="" data-editorial-enter="" className={styles.heroCopy}>
          <p className={styles.eyebrow}>AFİNA ZEYTİN · ELLEK, OSMANİYE</p>
          <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<em>Yeri sofrada.</em></h1>
          <p className={styles.heroDescription}>Toprağın sunduğu lezzet, Afina’nın özeniyle. Osmaniye’deki tesisimizden sofranıza ve işletmenize.</p>
          <div className={styles.heroActions}>
            <motion.a {...feedback} href="#urunler" className={styles.darkButton}>Ürünleri Keşfet <ArrowUpRightIcon size={17} aria-hidden="true" /></motion.a>
            <motion.a {...feedback} href="#toptan-iletisim" className={styles.outlineButton}>Kurumsal Teklif Al <ArrowUpRightIcon size={17} aria-hidden="true" /></motion.a>
          </div>
          <a href="#tesisimiz" className={styles.heroSource}>Ellek’te üretiyoruz.<br /><span>Üretim tesisimizi tanıyın <ArrowUpRightIcon size={15} aria-hidden="true" /></span></a>
        </div>
        <figure data-hero-visual="" data-editorial-enter="" className={styles.heroVisual}>
          <div className={styles.heroFilm} style={{ "--frame-height": "100%", "--frame-position": "relative" } as CSSProperties}>
            <ScrollFrameSequence src="/frames/afina-agac-dal/manifest.json" poster={editorialPoster} layout="framed" scrollTarget={story} deferPlayback initialCount={8} label="" mediaClassName={styles.heroMedia}>
              {progress => <motion.div aria-hidden="true" className={styles.heroProgress} style={{ scaleX: progress }} />}
            </ScrollFrameSequence>
          </div>
          {product && <div className={styles.heroProduct}>
            <V3Picture image={v3Image(product.imageKey)} sizes="90px" decorative />
            <div><p>{product.name}<small>{product.weight}</small></p>
              <div className={styles.heroProductActions}>
                <button type="button" aria-haspopup="dialog" onClick={event => openDetail?.(product.id, event.currentTarget)}>Ürüne Bak <ArrowUpRightIcon size={14} aria-hidden="true" /></button>
                <AddToCart product={product} />
              </div>
            </div>
          </div>}
          <figcaption>Zeytinin hikâyesi toprakta başlar.<span>AFİNA ZEYTİN</span></figcaption>
        </figure>
      </div>
      <div className={`${styles.container} ${styles.heroFootnote}`}>
        <p>Sofralık zeytin <span>·</span> Salamura zeytin <span>·</span> Zeytinyağı</p>
        <a href="#kurumsal">Hikâyemizi keşfedin <ArrowDownIcon size={16} aria-hidden="true" /></a>
      </div>
    </section>
  </>;
}

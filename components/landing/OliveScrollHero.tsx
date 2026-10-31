"use client";

import type { CSSProperties, JSX } from "react";
import * as motion from "motion/react-m";
import { useTransform, type MotionValue } from "motion/react";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { heroPoster } from "@/lib/media/hero-poster";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import { AddToCart } from "@/components/catalog/AddToCart";
import type { Product } from "@/types/catalog";
import styles from "./RenewalLanding.module.css";

function HeroContent({ progress, product }: { progress: MotionValue<number>; product?: Product }): JSX.Element {
  const openDetail = useProductDetail();
  const reduced = usePrefersReducedMotion();
  const translate = useTransform(progress, [0, 1], [0, -32]);
  return <div className={styles.heroContent}>
    <motion.div className={styles.heroCopy} style={reduced ? undefined : { y: translate }}>
      <p className={styles.eyebrow}>AFİNA ZEYTİN · OSMANİYE</p>
      <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<em>Yeri sofrada.</em></h1>
      <p className={styles.heroDescription}>Toprağın sunduğu lezzet, Afina’nın özeniyle.<br />Ellek’teki tesisimizden sofranıza ve işletmenize.</p>
      <div className={styles.heroActions}>
        <a href="#urunler" className={styles.lightButton}>Ürünleri Keşfet <ArrowUpRightIcon size={17} aria-hidden="true" /></a>
        <a href="#toptan-iletisim" className={styles.ghostButton}>Kurumsal Teklif Al <ArrowUpRightIcon size={17} aria-hidden="true" /></a>
      </div>
    </motion.div>
    <div className={styles.heroBottom}>
      <a href="#kurumsal" className={styles.discover}>Topraktan sofraya uzanan hikâyemiz <ArrowDownIcon size={17} aria-hidden="true" /></a>
      {product && <div className={styles.heroProduct}>
        <span>{product.name}<small>{product.weight}</small></span>
        <button type="button" aria-haspopup="dialog" onClick={event => openDetail?.(product.id, event.currentTarget)}>Ürüne Bak</button>
        <AddToCart product={product} />
      </div>}
    </div>
    <motion.div aria-hidden="true" className={styles.heroProgress} style={{ scaleX: progress }} />
  </div>;
}

/** 21st Scroll-Triggered Video Hero (9701): sticky media, layered copy and
 * scroll progress. Playback stays in the installed Task 083 canvas engine;
 * no autoplay loops, video seeking, wheel capture or body scroll lock. */
export function OliveScrollHero({ product }: { product?: Product }): JSX.Element {
  return <><link rel="preload" as="image" type="image/avif" media="(max-width: 767px) and (orientation: portrait)" imageSrcSet={heroPoster.mobileSrcSet} imageSizes="100vw" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" media="(min-width: 768px), (orientation: landscape)" imageSrcSet={heroPoster.desktopSrcSet} imageSizes="100vw" fetchPriority="high" />
    <section id="baslangic" data-hero-intro="" className={styles.hero} aria-labelledby="renewal-hero-title"
    style={{ "--frame-height": "100svh" } as CSSProperties}>
    <ScrollFrameSequence src="/frames/hero-zeytin/manifest.json" poster={heroPoster} deferPlayback initialCount={8} scrollLength={220} label="" mediaClassName={styles.heroMedia}>
      {progress => <HeroContent progress={progress} product={product} />}
    </ScrollFrameSequence>
  </section></>;
}

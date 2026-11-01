"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type JSX } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowUpRightIcon } from "lucide-react";
import { CinematicFilm } from "@/components/media/CinematicFilm";
import { V3Picture } from "@/components/media/V3Picture";
import { AddToCart } from "@/components/catalog/AddToCart";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import { cinematicFilmPoster as poster } from "@/lib/media/cinematic-poster";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";
import styles from "./CinematicHero.module.css";

const desktopQuery = "(min-width: 901px) and (min-height: 681px)";
const preferred = ["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-olive-oil-1l"];
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
function useDesktopStage(): boolean {
  const subscribe = useCallback((notify: () => void) => {
    const query = window.matchMedia?.(desktopQuery);
    query?.addEventListener("change", notify);
    return () => query?.removeEventListener("change", notify);
  }, []);
  return useSyncExternalStore(subscribe, () => window.matchMedia?.(desktopQuery).matches ?? false, () => false);
}

/** Scroll Craft object journey + Taste page-is-the-object. The approved Flow
 * plane recedes as the real packaging moves forward into a working selection.
 * Variant/image state is grounded in 21st 1635; all commerce uses project APIs. */
export function OliveScrollHero({ products = [] }: { products?: readonly ProductVariant[] }): JSX.Element {
  const hydrated = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const candidates = preferred.map(id => products.find(product => product.id === id)).filter((product): product is ProductVariant => !!product);
  const choices = candidates.length ? candidates : products.slice(0, 3);
  const [selectedId, setSelectedId] = useState(choices[0]?.id ?? "");
  const selected = choices.find(product => product.id === selectedId) ?? choices[0];
  const scene = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const live = useDesktopStage() && !reduced;
  const openDetail = useProductDetail();
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start start", "end end"] });
  const filmY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const filmX = useTransform(scrollYProgress, [0, 1], ["0vw", "-8vw"]);
  const filmScale = useTransform(scrollYProgress, [0, 1], [1, .82]);
  const objectY = useTransform(scrollYProgress, [0, 1], [80, -8]);
  const objectScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  useMotionValueEvent(scrollYProgress, "change", progress => {
    if (!live || !scene.current) return;
    scene.current.style.setProperty("--p", String(progress));
    scene.current.dataset.beat = progress < .5 ? "origin" : "table";
  });
  const feedback = {
    whileHover: reduced ? undefined : { y: motionTokens.interaction.hoverY },
    whileTap: reduced ? undefined : { scale: motionTokens.interaction.tapScale },
    transition: springs.action,
  };
  return <>
    <link rel="preload" as="image" type="image/avif" media="(max-width: 767px) and (orientation: portrait)" imageSrcSet={poster.mobileSrcSet} imageSizes="100vw" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" media="(min-width: 768px), (orientation: landscape)" imageSrcSet={poster.desktopSrcSet} imageSizes="100vw" fetchPriority="high" />
    <section ref={scene} id="baslangic" data-hero-intro="" data-cinematic-opening="" data-cinematic-scene=""
      data-scene="afina-origin" data-engine="motion" data-composition={live ? "layered" : "static"}
      className={`scene ${live ? "is-live" : "is-rest"} ${styles.hero}`} aria-labelledby="renewal-hero-title">
      <noscript><span className={styles.noJs} /></noscript>
      <div className={`scene-stage ${styles.stage}`}>
        <div data-hero-visual="" className={styles.film}>
          <CinematicFilm controlsPosition="top" mediaStyle={live ? { x: filmX, y: filmY, scale: filmScale } : { transform: "none" }} />
        </div>
        <motion.div data-hero-copy="" data-copy-plane="" className={styles.copy} style={live ? { y: copyY } : { transform: "none" }}>
          <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<span>Yeri sofrada.</span></h1>
          <p>Osmaniye’den zeytin ve zeytinyağı. Sofranız ve işletmeniz için.</p>
          <div className={styles.actions}>
            <motion.a {...feedback} href="#urunler" className={styles.primary}>Ürünleri Keşfet <ArrowUpRightIcon size={18} aria-hidden="true" /></motion.a>
            <motion.a {...feedback} href="#toptan-iletisim" className={styles.secondary}>Kurumsal Teklif Al <ArrowUpRightIcon size={18} aria-hidden="true" /></motion.a>
          </div>
        </motion.div>
        {selected && <>
          <motion.div className={styles.object} data-product-plane="" style={live ? { y: objectY, scale: objectScale } : { transform: "none" }}>
            <button type="button" disabled={!hydrated} aria-haspopup="dialog" aria-label={`${selected.name}, ${selected.weight} detayını aç`}
              onClick={event => openDetail?.(selected.id, event.currentTarget)}>
              <V3Picture image={v3Image(selected.imageKey)} sizes="(max-width: 900px) 190px, 32vw" eager />
            </button>
          </motion.div>
          <aside className={styles.selection} data-ui="" data-hero-product={selected.id} aria-label="Sofranız için ürün seçimi">
            <fieldset>
              <legend>Ürün seçin</legend>
              <div className={styles.options}>{choices.map(product => <button key={product.id} type="button" disabled={!hydrated}
                aria-label={`${product.name}, ${product.weight} seç`} aria-pressed={product.id === selected.id}
                onClick={() => setSelectedId(product.id)}>{product.weight}</button>)}</div>
            </fieldset>
            <div className={styles.productInfo}>
              <h2>{selected.name}</h2>
              <p><span>{selected.weight}</span><strong>{money.format(selected.priceKurus / 100)}</strong></p>
            </div>
            <div className={styles.buy}>
              <button type="button" disabled={!hydrated} aria-haspopup="dialog" onClick={event => openDetail?.(selected.id, event.currentTarget)}>Ürünü incele <ArrowUpRightIcon size={16} aria-hidden="true" /></button>
              <AddToCart key={selected.id} product={selected} />
            </div>
          </aside>
        </>}
      </div>
    </section>
  </>;
}

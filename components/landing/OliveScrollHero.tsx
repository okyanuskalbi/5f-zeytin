"use client";

import { useLayoutEffect, useRef, useState, type JSX } from "react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";
import { CinematicScrub } from "@/components/media/CinematicScrub";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs } from "@/lib/ui-motion";
import styles from "./ScrollingHero.module.css";

/** 21st 32829 media plane adapted to the user's 10K scroll journey. Three
 * resting captions share one persistent action bar, with no input interception. */
export function OliveScrollHero(): JSX.Element {
  const scene = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [mediaReady, setMediaReady] = useState(false);
  const active = mediaReady && !reduced;
  const { scrollYProgress } = useScroll({ target: scene,
    offset: active ? ["start start", "end end"] : ["start start", "end start"] });
  // A one-screen native hero has zero travel with end/end. Never let that
  // degenerate range resolve to the ending; remeasure the committed pin before
  // paint, and change offsets so Motion also rebuilds its scroll subscription.
  useLayoutEffect(() => {
    const element = scene.current;
    if (!active || !element) { scrollYProgress.set(0); return; }
    const range = element.clientHeight - innerHeight;
    scrollYProgress.set(range > 0 ? Math.max(0, Math.min(1, -element.getBoundingClientRect().top / range)) : 0);
  }, [active, scrollYProgress]);
  const firstOpacity = useTransform(scrollYProgress, [0, .28, .32], [1, 1, 0]);
  const secondOpacity = useTransform(scrollYProgress, [.32, .36, .64, .68], [0, 1, 1, 0]);
  const lastOpacity = useTransform(scrollYProgress, [.68, .72, 1], [0, 1, 1]);
  const branchY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const branchOpacity = useTransform(scrollYProgress, [0, .6, 1], [.85, .4, 0]);
  const productY = useTransform(scrollYProgress, [.6, .82, 1], [100, 0, 0]);
  const productRotate = useTransform(scrollYProgress, [.6, .85], [-8, 0]);
  const productOpacity = useTransform(scrollYProgress, [.6, .75, 1], [0, 1, 1]);
  const feedback = { whileHover: reduced ? undefined : { y: -2 }, whileTap: reduced ? undefined : { scale: .98 }, transition: springs.action };
  return <>
    <link rel="preload" as="image" type="image/avif" href="/frames/afina-agac-dal/poster-mobile.avif" media="(max-width: 767px)" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" href="/frames/afina-agac-dal/poster-desktop.avif" media="(min-width: 768px)" fetchPriority="high" />
    <section ref={scene} id="baslangic" data-hero-intro="" data-cinematic-opening="" data-cinematic-scene=""
      data-sc-scene="baslangic" data-sc-device="parallax" data-sc-engine="motion" data-21st-source="32829"
      className={styles.hero} data-hero-mode={active ? "scrub" : "native"} aria-labelledby="renewal-hero-title">
      <div className={styles.stage}>
        <div data-hero-visual="" className={styles.film}>
          <CinematicScrub progress={scrollYProgress} scene={scene} onMode={setMediaReady} />
        </div>
        <div className={styles.copy} data-hero-copy="">
          <motion.div className={styles.opening} style={active ? { opacity: firstOpacity } : undefined}>
            <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<span>Yeri sofrada.</span></h1>
            <p>Osmaniye’den zeytin ve zeytinyağı.</p>
          </motion.div>
          <motion.div className={styles.beat} style={active ? { opacity: secondOpacity } : { opacity: 0 }} aria-hidden="true" data-hero-beat="koken">
            <p className={styles.headline}>Ellek’te<br />başlar.</p>
            <p>Zeytinin seçimi, hazırlanması ve dolumu.<br />Kendi üretim tesisimizde.</p>
          </motion.div>
          <motion.div className={styles.beat} style={active ? { opacity: lastOpacity } : { opacity: 0 }} aria-hidden="true" data-hero-beat="sofra">
            <p className={styles.headline}>Sofranızda<br />devam eder.</p>
            <p>Eviniz ve işletmeniz için AFİNA.</p>
          </motion.div>
        </div>
        <div className={styles.actions}>
          <motion.a {...feedback} href="#urunler" className={styles.primary}>Ürünleri Keşfet <ArrowUpRightIcon size={18} aria-hidden="true" /></motion.a>
          <a href="#teklif" className={styles.secondary}>Kurumsal Teklif Al <ArrowUpRightIcon size={16} aria-hidden="true" /></a>
        </div>
        <motion.picture data-hero-near-plane="" className={styles.branch} style={active ? { y: branchY, opacity: branchOpacity } : undefined}>
          <source type="image/avif" srcSet="/images/hero-katman/on-dal-w1200.avif 1200w, /images/hero-katman/on-dal-w2048.avif 2048w" sizes="60vw" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero-katman/on-dal-w1200.webp" alt="" width={1200} height={675} aria-hidden="true" loading="lazy" fetchPriority="low" decoding="async" />
        </motion.picture>
        <motion.div className={styles.product} aria-hidden="true" data-hero-product=""
          style={active ? { y: productY, rotate: productRotate, opacity: productOpacity } : { opacity: 0 }}>
          <V3Picture image={v3Image("urun-01-kirma-10kg")} sizes="(min-width: 1024px) 32vw, 1px" decorative />
        </motion.div>
        <div className={styles.origin}><span>Ellek · Düziçi · Osmaniye</span><a href="#uretim-yolculugu">Zeytinliğin devamında <span aria-hidden="true">↓</span></a></div>
      </div>
    </section>
  </>;
}

"use client";

import { useRef, type JSX } from "react";
import { m as motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";
import { CinematicFilm } from "@/components/media/CinematicFilm";
import { proLoopMovie, proLoopPoster } from "@/lib/media/pro-loop";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import { useDesktopMotion } from "./ScrollStage";
import styles from "./ScrollingHero.module.css";

/** Retains the accepted 21st 32829 media/control boundary in a new title/film
 * composition. Native reading is the baseline; tall desktops add a short hold
 * before the three-chapter producer story. */
export function OliveScrollHero(): JSX.Element {
  const scene = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const depth = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const branchY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  useMotionValueEvent(scrollYProgress, "change", p => scene.current?.style.setProperty("--sc-p", String(p)));
  const feedback = { whileHover: reduced ? undefined : { y: motionTokens.interaction.hoverY }, whileTap: reduced ? undefined : { scale: .98 }, transition: springs.action };
  const enter = (delay: number) => ({ initial: false as const, animate: reduced ? undefined : { y: [24, 0] }, transition: { ...springs.editorial, delay } });
  return <>
    <link rel="preload" as="image" type="image/avif" href="/videos/afina-zeytinlik-poster.avif" fetchPriority="high" />
    <section ref={scene} id="baslangic" data-hero-intro="" data-cinematic-opening="" data-cinematic-scene=""
      data-sc-scene="baslangic" data-sc-device="parallax" data-sc-engine="motion" data-21st-source="32829"
      className={styles.hero} data-hero-mode={depth ? "sticky" : "native"} aria-labelledby="renewal-hero-title">
      <div className={styles.stage}>
      <div data-hero-copy="" className={styles.copy}>
        <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<span>Yeri sofrada.</span></h1>
        <p>Osmaniye’den zeytin ve zeytinyağı. Sofranız ve işletmeniz için.</p>
        <motion.div {...enter(.36)} className={styles.actions}>
          <motion.a {...feedback} href="#urunler" className={styles.primary}>Ürünleri Keşfet <ArrowUpRightIcon size={18} aria-hidden="true" /></motion.a>
          <motion.a {...feedback} href="#teklif" className={styles.secondary}>Kurumsal Teklif Al <ArrowUpRightIcon size={18} aria-hidden="true" /></motion.a>
        </motion.div>
      </div>
      <div data-hero-visual="" className={styles.film}>
        <CinematicFilm movieSrc={proLoopMovie} poster={proLoopPoster} posterSrc="/videos/afina-zeytinlik-poster.avif" loop
          mediaStyle={depth ? { scale } : { transform: "none" }} />
      </div>
      <motion.picture data-hero-near-plane="" className={styles.branch} style={depth ? { y: branchY } : { transform: "none" }}>
        <source type="image/avif" srcSet="/images/hero-katman/on-dal-w1200.avif 1200w, /images/hero-katman/on-dal-w2048.avif 2048w" sizes="60vw" />
        {/* Approved alpha derivatives and explicit AVIF srcset preserve the supplied cutout. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-katman/on-dal-w1200.webp" alt="" width={1200} height={675} aria-hidden="true" loading="lazy" fetchPriority="low" decoding="async" />
      </motion.picture>
      <div className={styles.origin}><span>Ellek, Osmaniye</span><span>Bir AFİNA Şirketler Topluluğu markası</span></div>
      </div>
    </section>
  </>;
}

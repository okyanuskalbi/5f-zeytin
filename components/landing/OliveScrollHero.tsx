"use client";

import { type JSX } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
import { CinematicFilm } from "@/components/media/CinematicFilm";
import { cinematicFilmPoster as cinematicPoster } from "@/lib/media/cinematic-poster";
import { useEditorialEntrance } from "@/lib/media/use-editorial-entrance";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import styles from "./CinematicHero.module.css";

/** 21st PrismaHero (12200): full-bleed film and asymmetric type, adapted to
 * AFİNA's approved Flow source, original brand and real retail/B2B actions. */
export function OliveScrollHero(): JSX.Element {
  const scene = useEditorialEntrance();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start start", "end start"] });
  const filmY = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const filmScale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);
  const feedback = {
    whileHover: reduced ? undefined : { y: motionTokens.interaction.hoverY },
    whileTap: reduced ? undefined : { scale: motionTokens.interaction.tapScale },
    transition: springs.action,
    style: reduced ? { transform: "none" } : undefined,
  };
  return <>
    <link rel="preload" as="image" type="image/avif" media="(max-width: 767px) and (orientation: portrait)" imageSrcSet={cinematicPoster.mobileSrcSet} imageSizes="100vw" fetchPriority="high" />
    <link rel="preload" as="image" type="image/avif" media="(min-width: 768px), (orientation: landscape)" imageSrcSet={cinematicPoster.desktopSrcSet} imageSizes="100vw" fetchPriority="high" />
    <section id="baslangic" data-hero-intro="" data-cinematic-opening="" className={styles.hero} aria-labelledby="renewal-hero-title">
      <div ref={scene} data-cinematic-scene="" className={styles.scene}>
        <motion.div data-hero-visual="" className={styles.film} style={reduced ? { transform: "none" } : { y: filmY, scale: filmScale }}>
          <CinematicFilm><div aria-hidden="true" className={styles.shade} /></CinematicFilm>
        </motion.div>
        <p className={styles.sceneLabel}><span>Zeytinin içinden</span><span>01 / Ağaçtan dala</span></p>
        <div data-hero-copy="" className={styles.content}>
          <div className={styles.title} data-editorial-enter="">
            <p className={styles.eyebrow}>AFİNA ZEYTİN · ELLEK, OSMANİYE</p>
            <h1 id="renewal-hero-title"><span>Kökü toprakta.</span>{" "}<em>Yeri sofrada.</em></h1>
          </div>
          <div className={styles.invitation} data-editorial-enter="">
            <p>Toprağın sunduğu lezzet, Afina’nın özeniyle. Osmaniye’den sofranıza ve işletmenize.</p>
            <div className={styles.actions}>
              <motion.a {...feedback} href="#urunler" className={styles.primary}>Ürünleri Keşfet <ArrowUpRightIcon size={17} aria-hidden="true" /></motion.a>
              <motion.a {...feedback} href="#toptan-iletisim" className={styles.secondary}>Kurumsal Teklif Al <ArrowUpRightIcon size={17} aria-hidden="true" /></motion.a>
            </div>
          </div>
        </div>
        <a className={styles.explore} href="#kurumsal">Hikâyemizi keşfedin <ArrowDownIcon size={16} aria-hidden="true" /></a>
      </div>
      <div className={styles.caption}>
        <p>Toprakta başlayan bir hikâye.<br /><strong>Her sofraya aynı özen.</strong></p>
        <a href="#tesisimiz"><span>Üretimimizin adresi<br /><strong>Ellek / Düziçi / Osmaniye</strong></span><ArrowUpRightIcon size={22} aria-hidden="true" /></a>
      </div>
    </section>
  </>;
}

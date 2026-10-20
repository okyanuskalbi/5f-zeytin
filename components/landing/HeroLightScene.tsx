"use client";

import { useRef, type JSX } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import { heroPoster } from "@/lib/media/hero-poster";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import styles from "./Hero.module.css";

// Adapted from 21st ishamsu/Smooth Scroll Hero (2061): a stable scroll
// target and a sticky responsive image. AFİNA uses its approved SSR poster,
// real frame sequence and native scrolling, without clip-path or Lenis.
export function HeroLightScene(): JSX.Element {
  const target = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const ground = useTransform(scrollYProgress, [0.35, 0.85], ["#0D110D", "#F6F1E6"]);
  const brightness = useTransform(scrollYProgress, [0.35, 0.85], ["brightness(0.55)", "brightness(1)"]);
  const imageY = useTransform(scrollYProgress, [0.65, 1], ["0%", "-38%"]);
  const imageScale = useTransform(scrollYProgress, [0.65, 1], [1, 0.88]);
  const lineOpacity = useTransform(scrollYProgress, [0.4, 0.52], [0, 1]);
  const lineY = useTransform(scrollYProgress, [0.4, 0.52], [motionTokens.distance.lg, 0]);
  // Keep the readability layer opaque. Switching its ink and ground together
  // avoids the low-contrast midpoint of interpolating two opposing text colors.
  const copyGround = useTransform(scrollYProgress, value => value < 0.65 ? "#0D110D" : "#F6F1E6");
  const ink = useTransform(scrollYProgress, value => value < 0.65 ? "#F6F1E6" : "#243A29");

  return <div ref={target} data-hero-scene="" className={styles.scene}>
    <motion.div data-hero-stage="" className={styles.stage} style={{ backgroundColor: ground }}>
      <motion.div data-hero-media="" className={styles.media}
        style={{ filter: brightness, y: reduced ? 0 : imageY, scale: reduced ? 1 : imageScale }}>
        <ScrollFrameSequence src="/frames/hero-zeytin/manifest.json" poster={heroPoster}
          deferPlayback initialCount={10} scrollLength={100} scrollTarget={target} positionX={1} label="" />
      </motion.div>
      <motion.div className={styles.copy} style={{ backgroundColor: copyGround, color: ink }}>
        <h1 id="hero-title" className={styles.title}>
          <span>Kökü toprakta.</span>{" "}
          <motion.span style={{ opacity: lineOpacity, y: reduced ? 0 : lineY }}>Yeri sofrada.</motion.span>
        </h1>
        <div className={styles.support}>
          <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
          <a className={styles.discover} href="#urunler">Ürünleri keşfet</a>
        </div>
      </motion.div>
    </motion.div>
    <div data-nav-light="" aria-hidden="true" className={styles.lightMarker} />
  </div>;
}

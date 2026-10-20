"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { JSX, ReactNode, RefObject } from "react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import styles from "./FeaturedProduct.module.css";

const mediaTokens = { scale: { from: 1.04, to: 1 }, crossfade: [0.25, 0.7] } as const;

// Adapted from hyperiux's 21st Sticky Content Wrapper (demo 26064).
// Native document scrolling replaces GSAP pin/snap; text and CTA stay in flow.
export function FeaturedMediaMotion({ target, children, scene }: {
  target: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** An approved, distinct scene may be supplied after the visual handoff. */
  scene?: ReactNode;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [mediaTokens.scale.from, mediaTokens.scale.to]);
  const sceneOpacity = useTransform(scrollYProgress, [...mediaTokens.crossfade], [0, 1]);
  return <figure className={styles.media}>
    <div className={styles.viewport}>
      <motion.div data-featured-image="" className={styles.layer} style={{ scale: reduced ? 1 : scale }}>
        {children}
      </motion.div>
      {scene && <motion.div aria-hidden="true" data-featured-scene="" className={styles.layer}
        style={{ opacity: reduced ? 0 : sceneOpacity }}>{scene}</motion.div>}
    </div>
    <figcaption className={styles.caption}>10 kg ambalaj referansı. Temsili görsel.</figcaption>
  </figure>;
}

"use client";

import { useRef, type JSX } from "react";
import * as motion from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { V3Picture } from "@/components/media/V3Picture";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import facility from "@/public/images/tesis-v4-manifest.json";
import styles from "./Story.module.css";

const steps = [
  { title: "Kökü toprakta.", text: "Osmaniye'nin Düziçi ilçesi, Ellek beldesi. Zeytinin hikâyesi burada, toprakta başlar; sofrada tamamlanır.", caption: "Düziçi, Osmaniye", image: v3Image("01-dogal-kirma-yesil-zeytin-10kg-sahne"), ratio: "scene" },
  { title: "Kendi tesisimizde.", text: "Seçim, salamura ve dolum Ellek'teki kendi tesisimizde yapılır. 2021'den bu yana perakende ve toptan alıcılara ulaşıyoruz.", caption: "Tesisimiz · Ellek", image: facility, ratio: "facility" },
  { title: "Yeri sofrada.", text: "Sofralık zeytin, salamura zeytin ve zeytinyağı. Yalın ve özenli bir sunumla, ürünün özüne saygıyla.", caption: "Natürel sızma · 1 L", image: v3Image("04-naturel-sizma-zeytinyagi-1l-sahne"), ratio: "scene" },
] as const;

function StoryRow({ step, index, reduced }: { step: typeof steps[number]; index: number; reduced: boolean }): JSX.Element {
  const row = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: row, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-motionTokens.story.parallax, motionTokens.story.parallax]);
  const enhanced = !reduced && typeof IntersectionObserver !== "undefined";
  const titleId = index === 0 ? "tesisimiz-title" : `tesisimiz-${index + 1}-title`;
  const reveal = (order: number) => ({
    variants: enhanced ? { visible: { y: [motionTokens.story.distance, 0], opacity: [0, 1] } } : undefined,
    transition: { duration: motionTokens.story.duration, delay: order * motionTokens.story.stagger, ease: motionTokens.products.ease },
  });

  return <motion.article ref={row} className={styles.row} data-story-step={index} aria-labelledby={titleId}
    initial={false} whileInView={enhanced ? "visible" : undefined} viewport={{ once: true, amount: .15 }}>
    <motion.div className={styles.visual} data-story-reveal="" {...reveal(0)}>
      {/* Move the entire, naturally proportioned photo; never slide it behind a crop. */}
      <motion.figure className={`${styles.photo} ${styles[step.ratio]}`} style={enhanced ? { y } : undefined}>
        <V3Picture image={step.image} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 96px) / 2), (max-width: 1343px) calc((100vw - 128px) * 7 / 12), 710px" />
        <figcaption>{step.caption}</figcaption>
      </motion.figure>
    </motion.div>
    <motion.div className={styles.copy} data-story-reveal="" {...reveal(1)}>
      <span className={styles.number} data-story-number="">{String(index + 1).padStart(2, "0")}</span>
      <h2 id={titleId}>{step.title}</h2>
      <p>{step.text}</p>
    </motion.div>
  </motion.article>;
}

export function Story(): JSX.Element {
  const reduced = usePrefersReducedMotion();
  return <section id="tesisimiz" tabIndex={-1} aria-labelledby="tesisimiz-title" className={styles.story}>
    <div className={styles.wrap}>
      {steps.map((step, index) => <StoryRow key={step.title} step={step} index={index} reduced={reduced} />)}
    </div>
  </section>;
}

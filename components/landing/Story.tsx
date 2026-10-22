"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { motion } from "motion/react";
import { V3Picture } from "@/components/media/V3Picture";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import facility from "@/public/images/tesis-v4-manifest.json";
import styles from "./Story.module.css";

const steps = [
  { title: "Kökü toprakta.", text: "Osmaniye'nin Düziçi ilçesi, Ellek beldesi. Zeytinin hikâyesi burada, toprakta başlar; sofrada tamamlanır.", caption: "Düziçi, Osmaniye", image: v3Image("01-dogal-kirma-yesil-zeytin-10kg-sahne") },
  { title: "Kendi tesisimizde.", text: "Seçim, salamura ve dolum Ellek'teki kendi tesisimizde yapılır. 2021'den bu yana perakende ve toptan alıcılara ulaşıyoruz.", caption: "Tesisimiz · Ellek", image: facility },
  { title: "Yeri sofrada.", text: "Sofralık zeytin, salamura zeytin ve zeytinyağı. Yalın ve özenli bir sunumla, ürünün özüne saygıyla.", caption: "Natürel sızma · 1 L", image: v3Image("04-naturel-sizma-zeytinyagi-1l-sahne") },
] as const;

export function Story(): JSX.Element {
  const scope = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const enhanced = !reduced && active !== null;

  useEffect(() => {
    const section = scope.current;
    if (!section || reduced || typeof IntersectionObserver === "undefined") return;
    const nodes = [...section.querySelectorAll<HTMLElement>("[data-story-step]")];
    let observer: IntersectionObserver;
    const connect = (): void => {
      observer?.disconnect();
      const height = window.innerHeight;
      const sticky = section.querySelector<HTMLElement>("[data-story-sticky]")!;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const top = mobile ? sticky.offsetHeight + parseFloat(getComputedStyle(sticky).top) + 24 : height * .45;
      const bottom = mobile ? height * .1 : height * .45;
      const center = (top + height - bottom) / 2;
      const bandTop = mobile ? center - height * .05 : top;
      const bandBottom = mobile ? height - center - height * .05 : bottom;
      // IO percentage margins resolve against width; pixels preserve a viewport-height reading band.
      observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - center) - Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - center));
        setActive(nodes.indexOf(visible[0].target as HTMLElement));
      }, { rootMargin: `-${Math.min(bandTop, height * .8)}px 0px -${bandBottom}px 0px`, threshold: 0 });
      nodes.forEach(node => observer.observe(node));
    };
    connect();
    window.addEventListener("resize", connect);
    return () => { observer.disconnect(); window.removeEventListener("resize", connect); };
  }, [reduced]);

  return <section ref={scope} id="tesisimiz" tabIndex={-1} aria-labelledby="tesisimiz-title" className={styles.story} data-story-enhanced={enhanced}>
    <div className={styles.wrap}>
      <div className={styles.sticky} data-story-sticky="">
        <div className={styles.frame}>
          {steps.map((step, index) => <motion.figure key={step.caption} data-active={(active ?? 0) === index}
            aria-hidden={enhanced && active !== index ? true : undefined} initial={false}
            animate={enhanced ? { opacity: active === index ? 1 : 0, scale: active === index ? 1 : motionTokens.story.inactiveScale } : { opacity: 1 }}
            transition={{ opacity: { duration: enhanced ? motionTokens.story.opacity : 0 }, scale: { duration: enhanced ? motionTokens.story.transform : 0 } }}>
            <V3Picture image={step.image} sizes="(max-width: 767px) 100vw, (max-width: 1439px) 45vw, 600px" />
            <figcaption>{step.caption}</figcaption>
          </motion.figure>)}
        </div>
      </div>
      <div className={styles.steps}>
        {steps.map((step, index) => <div key={step.title} className={styles.step} data-story-step={index} data-active={(active ?? 0) === index}>
          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
          <h2 id={index === 0 ? "tesisimiz-title" : undefined}>{step.title}</h2>
          <p>{step.text}</p>
        </div>)}
      </div>
    </div>
  </section>;
}

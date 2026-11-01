"use client";

import { useEffect, useRef, useState } from "react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import facility from "@/lib/media/renewal-assets.json";
import { proLoopPoster } from "@/lib/media/pro-loop";
import { motionTokens } from "@/lib/ui-motion";
import { useDesktopMotion } from "./ScrollStage";
import styles from "./ProductionStory.module.css";

const chapters = [
  { id: "hikaye-toprak", label: "Toprağımız", title: "Her şey toprakta başlar.",
    copy: "Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır. Osmaniye’nin zeytin kültürü, AFİNA’nın hikâyesinin başlangıç noktası.",
    image: { alt: "Osmaniye’nin zeytin kültürünü anlatan zeytinlik ve dallar", outputs: [
      { file: "/videos/afina-zeytinlik-poster.avif", format: "avif", width: 1280, height: 720 },
      { file: proLoopPoster.src, format: "webp", width: 1280, height: 720 },
    ] } },
  { id: "hikaye-uretim", label: "Üretimimiz", title: "Özen, üretimin her yerinde.",
    copy: "Ellek’teki tesisimizde zeytinin seçimi, hazırlanması ve dolumu. Ürünün özüne duyduğumuz saygıyı, yalın ve özenli bir sunumla birleştiriyoruz.", image: facility },
  { id: "hikaye-sofra", label: "Sofranız", title: "Yeri, sizin sofranız.",
    copy: "Sofralık zeytin, salamura zeytin ve zeytinyağı. Evinizden işletmenize, farklı ihtiyaçlar için mevcut ambalaj çeşitleri.",
    image: v3Image("04-naturel-sizma-zeytinyagi-1l-sahne") },
] as const;

/** 21st Scroll 01 (18041): one held photograph follows real reading chapters.
 * Native content is the SSR baseline. Only sufficiently tall desktops enhance
 * it; phones, short screens and reduced-motion keep every figure in flow. */
export function ProductionStory() {
  const section = useRef<HTMLElement>(null);
  const desktop = useDesktopMotion("(min-width: 1024px) and (min-height: 760px)");
  const [active, setActive] = useState(0);
  const enhanced = desktop && typeof IntersectionObserver === "function";
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const index = chapters.findIndex(chapter => chapter.id === entry.target.id);
          if (index >= 0) setActive(index);
        }
      }
    }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
    section.current?.querySelectorAll("[data-story-chapter]").forEach(chapter => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  return <section ref={section} id="uretim-yolculugu" className={styles.section} aria-labelledby="yolculuk-title"
    data-sc-scene="uretim-yolculugu" data-sc-device="reveal" data-sc-engine="framer-motion"
    data-21st-source="18041" data-story-mode={enhanced ? "sticky" : "native"}>
    <header className={styles.header}>
      <h2 id="yolculuk-title">Topraktan<br />sofraya.</h2>
      <div><p>Bir zeytinin yolculuğu.<br />Her adımında AFİNA.</p>
        <nav aria-label="Üretim hikâyesi">{chapters.map((chapter, index) => <a key={chapter.id}
          href={`#${chapter.id}`} aria-current={active === index ? "step" : undefined}
          onClick={() => setActive(index)}>{chapter.label}</a>)}</nav>
      </div>
    </header>
    <div className={styles.body}>
      <div className={styles.visual} aria-hidden="true" data-story-visual="" data-story-active={chapters[active].id}>
        {chapters.map((chapter, index) => <motion.div key={chapter.id} className={styles.plane}
          initial={false} animate={{ opacity: active === index ? 1 : 0 }}
          style={enhanced ? { scale } : { transform: "none" }}
          transition={{ duration: motionTokens.duration.landing }}>
          <V3Picture image={chapter.image} sizes="55vw" decorative />
        </motion.div>)}
        <p className={styles.caption}>{chapters[active].label}</p>
      </div>
      <div className={styles.chapters}>{chapters.map(chapter => <article key={chapter.id} id={chapter.id}
        className={styles.chapter} data-story-chapter="" tabIndex={-1} aria-labelledby={`${chapter.id}-title`}>
        <figure className={styles.nativeFigure}><V3Picture image={chapter.image}
          sizes="(max-width: 767px) calc(100vw - 40px), 80vw" /></figure>
        <div className={styles.chapterCopy}><h3 id={`${chapter.id}-title`}>{chapter.title}</h3><p>{chapter.copy}</p>
          {chapter.id === "hikaye-uretim" && <a href="#tesisimiz">Tesisimizi tanıyın</a>}
          {chapter.id === "hikaye-sofra" && <a href="#urunler">Ürünleri Keşfet</a>}
        </div>
      </article>)}</div>
    </div>
  </section>;
}

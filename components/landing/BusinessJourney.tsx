"use client";

import { useRef } from "react";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { BlurText } from "@/components/animation/react-bits/BlurText";
import { BusinessSegmentChoice, type BusinessSegment } from "./QuoteJourneyProvider";
import { useDesktopMotion } from "./ScrollStage";
import styles from "./ScrollingSections.module.css";

const segments: readonly { id: Exclude<BusinessSegment, "">; title: string; line: string; description: string; accessible: string }[] = [
  { id: "hospitality", title: "Otel & restoran", line: "Her servis, aynı özen.", description: "Kahvaltıdan profesyonel mutfağa. Menünüzü, ürün tercihinizi ve tüketim miktarınızı paylaşın.", accessible: "Otel ve restoran" },
  { id: "retail", title: "Market & bayi", line: "Rafınızda bir yer açın.", description: "Rafınıza ve bölgenize uygun ürün talebi. İhtiyacınız olan ürün ve ambalajı birlikte değerlendirelim.", accessible: "Market ve bayi" },
  { id: "bulk", title: "Toplu tüketim", line: "İhtiyacınız kadar planlayın.", description: "İşletmenize uygun miktar planlaması. Kullanım sıklığınızı ve teslimat şehrinizi talebinize ekleyin.", accessible: "Toplu tüketim" },
];

function BusinessChapter({ item, index }: { item: typeof segments[number]; index: number }) {
  const target = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start 90%", "end 20%"] });
  const lineScale = useTransform(scrollYProgress, [0, .7, 1], [0, 1, 1]);
  const numberY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  return <article ref={target} className={styles.businessChapter} data-business-chapter={item.id}>
    <motion.span aria-hidden="true" className={styles.chapterNumber} style={reduced ? { transform: "none" } : { y: numberY }}>0{index + 1}</motion.span>
    <div className={styles.chapterCopy}>
      <p className={styles.chapterLabel}>{item.title}</p>
      <h3>{item.line}</h3>
      <p>{item.description}</p>
      <BusinessSegmentChoice segment={item.id} className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: {item.accessible}</span><ArrowUpRightIcon aria-hidden="true" size={24} /></BusinessSegmentChoice>
    </div>
    <motion.span aria-hidden="true" className={styles.chapterLine} style={reduced ? { transform: "none" } : { scaleX: lineScale }} />
  </article>;
}

/** The pack remains in view while three actual business uses pass beside it.
 * No changing content is hidden; the choices stay in normal tab/source order. */
export function BusinessJourney() {
  const target = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useDesktopMotion("(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine)");
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const packY = useTransform(scrollYProgress, [0, .5, 1], desktop ? [80, 0, -65] : [12, 0, -12]);
  const packX = useTransform(scrollYProgress, [0, .5, 1], desktop ? [-24, 16, 32] : [0, 0, 0]);
  const packScale = useTransform(scrollYProgress, [0, .5, 1], desktop ? [.88, 1, 1.06] : [.98, 1, 1.02]);
  const bottleY = useTransform(scrollYProgress, [0, 1], desktop ? [36, -32] : [8, -8]);
  const atmosphereY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  return <section ref={target} id="toptan-iletisim" aria-labelledby="toptan-title" className={styles.business}
    data-sc-scene="toptan-iletisim" data-sc-device="kinetic" data-sc-engine="motion" data-21st-source="7262" data-business-mode={desktop ? "held" : "native"}>
    <motion.div aria-hidden="true" className={styles.businessAtmosphere} style={reduced ? { transform: "none" } : { y: atmosphereY }} />
    <div className={`${styles.container} ${styles.businessComposition}`}>
      <div className={styles.businessStage}>
        <div className={styles.businessTitle}>
          <p className={styles.sceneLabel}>Sofradan işletmenize</p>
          <h2 id="toptan-title"><BlurText text="İşletmeniz için AFİNA." /></h2>
          <p>Menünüz, rafınız ve müşterileriniz için.</p>
        </div>
        <div className={styles.businessProducts}>
          <div className={styles.packHalo} aria-hidden="true" />
          <motion.div className={styles.businessTin} style={reduced ? { transform: "none" } : { x: packX, y: packY, scale: packScale }}>
            <V3Picture image={v3Image("urun-01-kirma-10kg")} sizes="(max-width: 767px) 70vw, (max-width: 1023px) 440px, 38vw" />
          </motion.div>
          <motion.div className={styles.businessBottle} style={reduced ? { transform: "none" } : { y: bottleY }}>
            <V3Picture image={v3Image("urun-04-yag-1l")} sizes="(max-width: 767px) 28vw, 16vw" />
          </motion.div>
        </div>
      </div>
      <div className={styles.businessChapters}>
        {segments.map((item, index) => <BusinessChapter key={item.id} item={item} index={index} />)}
      </div>
    </div>
    <div className={`${styles.container} ${styles.businessClosing}`}>
      <p className={styles.businessNote}>Ambalaj, minimum sipariş ve teslimat koşulları teklif aşamasında netleştirilir.</p>
      <a href="#teklif" className={styles.businessQuoteLink}>Talebinizi paylaşın <ArrowUpRightIcon size={22} aria-hidden="true" /></a>
    </div>
  </section>;
}

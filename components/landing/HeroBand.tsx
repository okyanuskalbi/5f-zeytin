"use client";

import { useRef, type JSX } from "react";
import * as motion from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { AddToCart } from "@/components/catalog/AddToCart";
import { V3Picture } from "@/components/media/V3Picture";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { v3Image } from "@/lib/media/v3-assets";
import { motionTokens } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./HeroBand.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function HeroBand({ products }: { products: readonly Product[] }): JSX.Element {
  const scope = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: scope, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-motionTokens.band.parallax, motionTokens.band.parallax]);
  const tin = products.find(product => product.id === "sample-green-olive-10kg");
  const jar = products.find(product => product.id === "sample-green-olive-1kg");
  const reveal = (index: number) => ({
    initial: false as const,
    whileInView: reduced ? undefined : { y: [motionTokens.band.distance, 0], opacity: [0, 1] },
    viewport: { once: true, amount: .15 },
    transition: { duration: motionTokens.band.duration, delay: index * motionTokens.band.stagger, ease: motionTokens.products.ease },
  });

  return <section ref={scope} aria-labelledby="kahraman-title" className={styles.band} data-hero-band="" data-reduced-motion={reduced}>
    <motion.div data-band-photo="" aria-hidden="true" className={styles.photo} style={reduced ? undefined : { y }}>
      <V3Picture image={v3Image("01-dogal-kirma-yesil-zeytin-10kg-sahne")} sizes="100vw" decorative />
    </motion.div>
    <div className={styles.scrim} aria-hidden="true" />
    <div className={styles.wrap}>
      <div className={styles.box}>
        <motion.p {...reveal(0)} data-band-reveal="" className={styles.kicker}>KAHRAMAN ÜRÜN</motion.p>
        <motion.h2 {...reveal(1)} data-band-reveal="" id="kahraman-title">Kışlık kiler için<br />{" "}10 kg teneke.</motion.h2>
        <motion.p {...reveal(2)} data-band-reveal="" className={styles.description}>Aynı zeytin, aynı tesis. Günlük sofra için 1 kg kavanoz da var.</motion.p>
        <motion.div {...reveal(3)} data-band-reveal="" className={styles.buy}>
          <div className={styles.price}><small>10 kg teneke</small><span aria-label="10 kg teneke fiyatı">{tin ? money.format(tin.priceKurus / 100) : "—"}</span></div>
          <div className={styles.actions}>
            {tin ? <AddToCart product={tin} /> : <button type="button" disabled>Ürün şu an mevcut değil</button>}
            {jar ? <AddToCart product={jar} label="1 kg kavanoz" variant="ghost" /> : <button type="button" disabled>1 kg kavanoz mevcut değil</button>}
          </div>
        </motion.div>
      </div>
    </div>
  </section>;
}

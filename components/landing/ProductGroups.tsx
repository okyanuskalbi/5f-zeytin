"use client";

import type { JSX } from "react";
import Link from "next/link";
import { m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import { ArrowRight, Grid2X2 } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { productGroups } from "@/lib/catalog/groups";
import photos from "@/lib/media/classic-photos.json";
import styles from "./ProductGroups.module.css";

const MotionLink = m.create(Link);

/** Category links remain available before JavaScript; product actions stay on the listing. */
export function ProductGroups(): JSX.Element {
  const reduced = usePrefersReducedMotion();
  return <section id="urunler" aria-labelledby="urunler-title" className={styles.section}>
    <span id="kiler" className={styles.anchor} aria-hidden="true" />
    <h2 id="urunler-title" className={styles.heading}>ÜRÜN GRUPLARIMIZ</h2>
    <div className={styles.groups}>
      {productGroups.filter(group => group.id !== "zeytin").map(group => <MotionLink key={group.id} href={`/urunler/${group.id}`} className={styles.group} data-group-photo-link
        initial={false} whileTap={reduced ? undefined : { scale: motionTokens.interaction.tapScale }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
        <V3Picture image={photos.assets[group.photo]} sizes="(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1304px) 24vw, 292px" decorative />
        <span>{group.name}<ArrowRight size={22} aria-hidden="true" /></span>
      </MotionLink>)}
    </div>
    <div className={styles.allActions}>
      <Link href="/urunler" className={styles.allButton}><Grid2X2 size={18} aria-hidden="true" />Tüm ürünleri gör<ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
    <noscript><p>Ürün seçimi ve alışveriş için JavaScript gerekir. Ürün bilgisi için <a href="/hakkimizda#iletisim">bizimle iletişime geçin.</a></p></noscript>
  </section>;
}

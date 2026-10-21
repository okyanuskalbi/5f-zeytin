"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import { VariantChips } from "./VariantChips";
import { RollingPrice } from "./RollingPrice";
import { AddToCart } from "./AddToCart";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import type { ProductFamily } from "@/types/catalog";
import styles from "./Pantry.module.css";

export function KraftTag({ family, selected, onChange, onOpen, nameId, delay = 0 }: {
  family: ProductFamily; selected: number; onChange: (index: number) => void; onOpen?: (opener: HTMLElement) => void; nameId: string; delay?: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const product = family.variants[selected];
  return <motion.div className={styles.tag} data-kraft-tag="" initial={false}
    whileInView={reduced ? undefined : { rotate: [0, 4, -2, 1, 0] }} viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: motionTokens.duration.tag, delay: delay + motionTokens.duration.landing }}>
    <svg className={styles.string} viewBox="0 0 120 48" aria-hidden="true"><path d="M2 2C22 4 38 14 60 38C80 8 93 3 118 2M57 37q3-8 6 0q-3 9-6 0" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="60" cy="38" r="4" /></svg>
    <h3 id={nameId}><button type="button" onClick={event => onOpen?.(event.currentTarget)}>{family.name}</button></h3>
    <VariantChips family={family} selected={selected} onChange={onChange} />
    <RollingPrice kurus={product.priceKurus} />
    <AddToCart key={product.id} product={product} compact />
  </motion.div>;
}

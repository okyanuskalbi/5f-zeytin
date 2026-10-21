"use client";

import type { JSX } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs } from "@/lib/ui-motion";
import styles from "./Pantry.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

// 21st edwinvakayil/Rolling Digits 19158: stable cells from the right,
// immediate accessible value, only changed digits roll; no queued stale prices.
export function RollingPrice({ kurus }: { kurus: number }): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const text = money.format(kurus / 100);
  return <p className={styles.price} aria-label="Fiyat" aria-live="polite" aria-atomic="true">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true" className={styles.digits}>
      {[...text].map((char, index) => <span key={text.length - index} className={styles.digit}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={char} initial={reduced ? false : { y: "100%" }} animate={{ y: 0 }} exit={reduced ? { opacity: 0 } : { y: "-100%" }} transition={reduced ? { duration: 0 } : springs.drawer}>{char}</motion.span>
        </AnimatePresence>
      </span>)}
    </span>
  </p>;
}

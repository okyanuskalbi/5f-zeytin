"use client";

import type { ReactNode, JSX } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";

/** The server sends the finished content. A viewport entrance is optional and
 * runs once; it never owns scroll or gates a heading, photograph or action. */
export function SectionReveal({ children, className }: { children: ReactNode; className?: string }): JSX.Element {
  const reduced = usePrefersReducedMotion();
  return <motion.div className={className} data-section-reveal="" data-reduced-motion={reduced}
    initial={false}
    whileInView={reduced ? undefined : { y: [motionTokens.entrance.distance * 2, 0], opacity: [0.86, 1] }}
    viewport={{ once: true, amount: 0.2 }}
    transition={reduced ? { duration: 0 } : springs.editorial}
    style={reduced ? { transform: "none", opacity: 1 } : undefined}>
    {children}
  </motion.div>;
}

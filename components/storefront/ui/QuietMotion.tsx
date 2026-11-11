"use client";

import { m, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/** The complete server content stays visible; only the two named stories reveal. */
export function QuietMotion({ children, className, entrance = false, overlay = false }: { children: ReactNode; className?: string; entrance?: boolean; overlay?: boolean }) {
  const reduced = useReducedMotion();
  const still = reduced !== false;
  return <m.div className={className} data-overlay-ok={overlay || undefined} initial={false}
    animate={entrance && !still ? { y: [8, 0], opacity: [0.85, 1] } : undefined}
    whileInView={!entrance && !still ? { y: [8, 0], opacity: [0.85, 1] } : undefined}
    viewport={{ once: true, amount: 0.15 }} transition={{ type: 'spring', stiffness: 180, damping: 28 }}>
    {children}
  </m.div>;
}

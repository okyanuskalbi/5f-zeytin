"use client";

import { m, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Server content is always fully visible. `entrance` is the page's single
 * opening sequence (hero); otherwise a small one-time settle as the block
 * enters view, used only by the two sections the customer asked for.
 */
export function QuietMotion({ children, className, entrance = false, overlay = false }: { children: ReactNode; className?: string; entrance?: boolean; overlay?: boolean }) {
  const reduced = useReducedMotion();
  const still = reduced !== false;
  const settle = { y: [12, 0], opacity: [0.8, 1] };
  return <m.div className={className} data-overlay-ok={overlay || undefined} data-in-view={entrance ? undefined : ''} initial={false}
    animate={entrance && !still ? settle : undefined}
    whileInView={!entrance && !still ? settle : undefined}
    viewport={{ once: true, margin: '-80px' }} transition={{ type: 'spring', stiffness: 100, damping: 22 }}>
    {children}
  </m.div>;
}

"use client";

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { m as motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs } from "@/lib/ui-motion";

export function useDesktopMotion(query = "(min-width: 901px) and (min-height: 681px)") {
  const reduced = usePrefersReducedMotion();
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia?.(query);
    media?.addEventListener("change", notify);
    return () => media?.removeEventListener("change", notify);
  }, [query]);
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia?.(query).matches ?? false, () => false);
  return desktop && !reduced;
}

/** Scroll Craft's scene score, driven by the existing Motion runtime. Content
 * is present in SSR; an entrance never gates the document or owns input. */
export function ScrollStage({ id, device, sourceId, className, labelledBy, children }: {
  id: string; device: "parallax" | "reveal" | "flow" | "kinetic";
  sourceId: number; className?: string; labelledBy?: string; children: ReactNode;
}) {
  const target = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", progress => target.current?.style.setProperty("--sc-p", String(progress)));
  const enters = device === "reveal" || device === "flow";
  return <motion.section ref={target} id={id} className={className} aria-labelledby={labelledBy}
    data-sc-scene={id} data-sc-device={device} data-sc-engine="motion" data-21st-source={sourceId}
    initial={false} whileInView={!reduced && enters && typeof IntersectionObserver === "function" ? { y: [32, 0], opacity: [.9, 1] } : undefined}
    viewport={{ once: true, amount: .12 }} transition={springs.editorial}
    style={reduced ? { transform: "none", opacity: 1 } : undefined}>
    {children}
  </motion.section>;
}

/** Adapted from 21st 20023. The caller supplies a clipped overscan photograph;
 * the image alone moves, so copy, links and focus geometry remain stable. */
export function ParallaxPhoto({ children, className }: { children: ReactNode; className?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const active = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  return <motion.div ref={target} data-sc-parallax="" className={className} style={active ? { y } : { transform: "none" }}>{children}</motion.div>;
}

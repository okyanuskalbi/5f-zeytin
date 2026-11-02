"use client";

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import { m as motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { useLightweightMotion } from "@/lib/media/use-lightweight-motion";

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

/** Continuous light movement joins the lower scenes. The section and its
 * interactive content never transform, so typing, focus and anchor geometry
 * stay still while the atmosphere follows the visitor in either direction. */
export function ScrollStage({ id, device, sourceId, className, labelledBy, children }: {
  id: string; device: "parallax" | "reveal" | "flow" | "kinetic";
  sourceId: number; className?: string; labelledBy?: string; children: ReactNode;
}) {
  const target = useRef<HTMLElement>(null);
  const enabled = useLightweightMotion();
  const desktop = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", progress => {
    if (enabled) target.current?.style.setProperty("--sc-p", String(progress));
  });
  const lightY = useTransform(scrollYProgress, [0, 1], desktop ? [80, -80] : [28, -28]);
  const lightScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  return <section ref={target} id={id} className={className} aria-labelledby={labelledBy}
    data-sc-scene={id} data-sc-device={device} data-sc-engine="motion" data-21st-source={sourceId}
    data-sc-continuity="light" data-sc-motion={enabled ? "scroll" : "static"}>
    <motion.div aria-hidden="true" data-sc-backdrop="" style={{ pointerEvents: "none", ...(enabled ? { y: lightY, scale: lightScale } : { transform: "none" }) }} />
    {children}
  </section>;
}

/** Only imagery moves. It is safe to place this inside a stable link or beside
 * a form; every textual/control hit area keeps its natural document position. */
export function ScrollArtwork({ children, className, distance = 48, grow = .08 }: {
  children: ReactNode; className?: string; distance?: number; grow?: number;
}) {
  const target = useRef<HTMLDivElement>(null);
  const enabled = useLightweightMotion();
  const desktop = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], desktop ? [distance, -distance] : [20, -20]);
  const scale = useTransform(scrollYProgress, [0, .6, 1], [1 - grow, 1, 1 + grow / 2]);
  return <motion.div ref={target} className={className} data-scroll-artwork="" initial={false}
    data-artwork-motion={enabled ? "scroll" : "static"}
    style={enabled ? { y, scale } : { transform: "none" }}>{children}</motion.div>;
}

/** Adapted from 21st 20023. The caller supplies a clipped overscan photograph;
 * the image alone moves, so copy, links and focus geometry remain stable. */
export function ParallaxPhoto({ children, className }: { children: ReactNode; className?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const desktop = useDesktopMotion();
  const enabled = useLightweightMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  return <motion.div ref={target} data-sc-parallax="" className={className} style={desktop && enabled ? { y } : { transform: "none" }}>{children}</motion.div>;
}

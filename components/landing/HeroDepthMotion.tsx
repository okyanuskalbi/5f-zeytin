"use client";

import { useEffect, type RefObject } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { motionTokens } from "@/lib/ui-motion";

/** Mounted only while the hero is visible and motion is allowed. No scroll state/render loop. */
export function HeroDepthMotion({ target }: { target: RefObject<HTMLElement | null> }): null {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const tokens = motionTokens.hero;
  // CSS halves travel on mobile without a resize listener or a second scroll subscription.
  const translate = (distance: number): string => `calc(${distance}% * var(--hero-motion-factor))`;
  const scale = (end: number): string => `calc(1 + ${end - 1} * var(--hero-motion-factor))`;
  const plate = useTransform(scrollYProgress, [0, 1], [
    `translateY(${translate(0)}) scale(${scale(1)})`, `translateY(${translate(tokens.plateY)}) scale(${scale(tokens.plateScale)})`,
  ]);
  const products = useTransform(scrollYProgress, [0, 1], ["translateY(0%)", `translateY(${translate(tokens.productsY)})`]);
  const branch = useTransform(scrollYProgress, [0, 1], [
    `translate(${translate(0)}, ${translate(0)}) scale(${scale(1)})`,
    `translate(${translate(tokens.branchX)}, ${translate(tokens.branchY)}) scale(${scale(tokens.branchScale)})`,
  ]);
  const copy = useTransform(scrollYProgress, [0, 1], ["translateY(0%)", `translateY(${translate(tokens.copyY)})`]);
  const opacity = useTransform(scrollYProgress, [0, tokens.copyFadeStart, 1], [1, 1, tokens.copyOpacity]);

  useEffect(() => {
    function bind<T extends string | number>(selector: string, property: "transform" | "opacity", value: MotionValue<T>): () => void {
      const node = target.current?.querySelector<HTMLElement>(selector);
      if (!node) return () => {};
      const update = (latest: T): void => { node.style[property] = String(latest); };
      update(value.get());
      return value.on("change", update);
    }
    const cleanups = [bind('[data-layer="plate"]', "transform", plate), bind('[data-layer="products"]', "transform", products),
      bind('[data-layer="branch"]', "transform", branch), bind("[data-hero-copy]", "transform", copy), bind("[data-hero-copy]", "opacity", opacity)];
    // Retain the last pose offscreen; the reduced-motion CSS overrides it immediately.
    return () => cleanups.forEach(cleanup => cleanup());
  }, [target, plate, products, branch, copy, opacity]);
  return null;
}

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { stagger, useAnimate } from "motion/react";
import { motionTokens, springs } from "@/lib/ui-motion";
import { usePrefersReducedMotion } from "./use-deferred-enhancement";

/** One optional opening gesture. Server HTML is already fully visible; a
 * missing animation API or a changed preference must never gate the content. */
export function useEditorialEntrance(): RefObject<HTMLDivElement | null> {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const entered = useRef(false);

  useEffect(() => {
    if (reduced || entered.current || !scope.current) return;
    entered.current = true;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const bounds = scope.current.getBoundingClientRect();
    if (document.visibilityState !== "visible" || navigator.hardwareConcurrency <= 4 || connection?.saveData
      || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

    const targets = [...scope.current.querySelectorAll<HTMLElement>("[data-editorial-enter]")];
    if (!targets.length) return;
    const restore = (): void => {
      for (const target of targets) {
        target.style.opacity = "1";
        target.style.transform = "none";
      }
    };
    let controls: ReturnType<typeof animate>;
    try {
      controls = animate(targets,
        { opacity: [motionTokens.entrance.opacity, 1], y: [motionTokens.entrance.distance, 0] },
        { ...springs.editorial, delay: stagger(motionTokens.entrance.stagger) });
    } catch { restore(); return; }
    return () => { controls.stop(); restore(); };
  }, [animate, reduced, scope]);

  return scope;
}

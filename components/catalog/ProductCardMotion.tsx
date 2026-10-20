"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { inView, useAnimate, useReducedMotion } from "motion/react";

// Card-local foundation tokens, following the existing HeroMotion convention.
const motionTokens = {
  distance: { md: 16 },
  duration: { instant: 0, slow: 0.6 },
  easing: { smooth: [0.22, 1, 0.36, 1] },
} as const;

function shouldAnimate(prefersReduced: boolean): boolean {
  return !prefersReduced && !(typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4);
}

// Adapted from 21st Scroll Reveal (cnippet-dev/scroll-reveal, demo 18674).
// Use Motion's one-shot inView trigger with imperative, interruptible controls.
export function ProductCardMotion({ children }: { children: ReactNode }): JSX.Element {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const prefersReduced = useReducedMotion();
  const hasEntered = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const target = scope.current;
    const element = target.firstElementChild as HTMLDivElement;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stopObserving: VoidFunction | undefined;
    let animation: ReturnType<typeof animate> | undefined;

    function reset(): void {
      stopObserving?.();
      stopObserving = undefined;
      animation?.stop();
      if (animation && element.isConnected) {
        // stop() commits the current value. Reset Motion's value as well as CSS
        // so a pending render cannot restore a partially translated card.
        animate(element, { y: 0 }, { duration: motionTokens.duration.instant });
      }
      animation = undefined;
      element.style.transform = "none";
    }

    function interrupt(): void {
      // Controls must stay still as soon as a keyboard or pointer user acts.
      hasEntered.current = true;
      reset();
    }

    function start(): void {
      reset();
      if (hasEntered.current || !shouldAnimate(preference.matches)) return;
      try {
        stopObserving = inView(target, () => {
          if (hasEntered.current) return;
          hasEntered.current = true;
          if (target.contains(document.activeElement)) return;
          try {
            animation = animate(element, { y: [motionTokens.distance.md, 0] }, {
              duration: motionTokens.duration.slow,
              ease: motionTokens.easing.smooth,
            });
          } catch {
            reset();
          }
          // No leave callback: inView disconnects this target after first entry.
        }, { amount: 0.1 });
      } catch {
        // Unsupported/failed observer APIs leave the original card usable.
        reset();
      }
    }

    target.addEventListener("focusin", interrupt);
    target.addEventListener("pointerdown", interrupt);
    preference.addEventListener("change", start);
    start();
    return () => {
      target.removeEventListener("focusin", interrupt);
      target.removeEventListener("pointerdown", interrupt);
      preference.removeEventListener("change", start);
      reset();
    };
  }, [animate, prefersReduced, scope]);

  // Stable measurement wrapper; never hide SSR content or intercept native scroll.
  return (
    <div ref={scope} className="h-full min-w-0">
      <div data-product-card-motion="" className="h-full min-w-0 motion-reduce:transform-none [&>article]:h-full">
        {children}
      </div>
    </div>
  );
}

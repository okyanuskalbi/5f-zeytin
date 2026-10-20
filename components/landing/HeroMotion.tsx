"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { scroll, useAnimate, useReducedMotion } from "motion/react";

// Hero-local foundation tokens; keep motion distances and timing in one place.
const motionTokens = {
  distance: { md: 16 },
  duration: { slow: 0.6 },
  easing: { smooth: [0.22, 1, 0.36, 1], linear: [0, 0, 1, 1] },
} as const;

function shouldAnimate(prefersReduced: boolean): boolean {
  return !prefersReduced && !(typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4);
}

interface HeroMotionProps {
  children: ReactNode;
  className?: string;
  effect?: "entrance" | "parallax";
}

// Adapted from 21st Hero Parallax (manuarora700/hero-parallax).
// The stable outer element measures scroll; only its child moves.
export function HeroMotion({ children, className, effect = "entrance" }: HeroMotionProps): JSX.Element {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const prefersReduced = useReducedMotion();
  const hasEntered = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const target = scope.current;
    const element = target.firstElementChild as HTMLDivElement;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: ReturnType<typeof animate> | undefined;
    let stopScroll: VoidFunction | undefined;

    function reset(): void {
      stopScroll?.();
      stopScroll = undefined;
      animation?.stop();
      animation = undefined;
      element.style.transform = "none";
    }

    function start(): void {
      reset();
      if (!shouldAnimate(preference.matches)) return;

      try {
        if (effect === "entrance") {
          if (hasEntered.current) return;
          hasEntered.current = true;
          animation = animate(element, { y: [motionTokens.distance.md, 0] }, {
            duration: motionTokens.duration.slow,
            ease: motionTokens.easing.smooth,
          });
        } else {
          animation = animate(element, { y: [0, -motionTokens.distance.md] }, {
            ease: motionTokens.easing.linear,
          });
          stopScroll = scroll(animation, { target, offset: ["start end", "end start"] });
        }
      } catch {
        // Animation is an enhancement: unsupported browser APIs keep SSR content usable.
        reset();
      }
    }

    start();
    preference.addEventListener("change", start);
    return () => {
      preference.removeEventListener("change", start);
      reset();
    };
  }, [animate, effect, prefersReduced, scope]);

  // No hidden initial state: slow/failed JavaScript and reduced motion remain readable.
  return (
    <div ref={scope}>
      <div data-hero-motion={effect} className={className}>{children}</div>
    </div>
  );
}

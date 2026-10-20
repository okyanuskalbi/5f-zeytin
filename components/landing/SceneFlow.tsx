"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { inView, useAnimate, useReducedMotion } from "motion/react";

// Scene-local foundation tokens, matching HeroMotion and ProductCardMotion.
const motionTokens = {
  distance: { md: 16 },
  duration: { instant: 0, slow: 0.6 },
  easing: { smooth: [0.22, 1, 0.36, 1] },
} as const;

// Adapted from 21st Scroll Reveal Content A (abui, demo 19203) and
// Scroll Reveal (cnippet-dev, demo 18675). Server-rendered scene slots keep
// their natural document order; only the marked text enters once on scroll.
export function SceneFlow({ children }: { children: ReactNode }): JSX.Element {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const prefersReduced = useReducedMotion();
  const entered = useRef(new WeakSet<Element>());

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const root = scope.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scenes = [...root.querySelectorAll<HTMLElement>("[data-scene]")]
      .flatMap((scene) => {
        const layer = scene.querySelector<HTMLElement>("[data-scene-reveal]");
        return layer ? [{ scene, layer }] : [];
      });
    const animations = new Map<HTMLElement, ReturnType<typeof animate>>();
    let observers: VoidFunction[] = [];

    function reset(layer: HTMLElement): void {
      const animation = animations.get(layer);
      animation?.stop();
      if (animation && layer.isConnected) {
        // Reset Motion's value too: stop() retains the intermediate transform.
        animate(layer, { y: 0 }, { duration: motionTokens.duration.instant });
      }
      animations.delete(layer);
      layer.style.transform = "none";
    }

    function stop(): void {
      observers.forEach((disconnect) => disconnect());
      observers = [];
      scenes.forEach(({ layer }) => reset(layer));
    }

    function interrupt(event: Event): void {
      if (!(event.target instanceof Element)) return;
      const scene = event.target.closest("[data-scene]");
      const entry = scenes.find((entry) => entry.scene === scene);
      if (!entry) return;
      entered.current.add(entry.scene);
      reset(entry.layer);
    }

    function start(): void {
      stop();
      if (preference.matches || navigator.hardwareConcurrency <= 4) return;
      try {
        for (const { scene, layer } of scenes) {
          if (entered.current.has(scene)) continue;
          observers.push(inView(scene, () => {
            if (entered.current.has(scene)) return;
            entered.current.add(scene);
            if (scene.contains(document.activeElement)) return;
            try {
              animations.set(layer, animate(layer, { y: [motionTokens.distance.md, 0] }, {
                duration: motionTokens.duration.slow,
                ease: motionTokens.easing.smooth,
              }));
            } catch {
              reset(layer);
            }
          }, { amount: 0.1 }));
        }
      } catch {
        // Observer/API failure preserves the complete static document.
        stop();
      }
    }

    root.addEventListener("focusin", interrupt);
    root.addEventListener("pointerdown", interrupt);
    preference.addEventListener("change", start);
    start();
    return () => {
      root.removeEventListener("focusin", interrupt);
      root.removeEventListener("pointerdown", interrupt);
      preference.removeEventListener("change", start);
      stop();
    };
  }, [animate, children, prefersReduced, scope]);

  // No scroll interception, pinning, hidden SSR state or moving CTA wrappers.
  return (
    <div ref={scope} data-scene-flow="" className="motion-reduce:[&_[data-hero-motion]]:transform-none!">
      {children}
    </div>
  );
}

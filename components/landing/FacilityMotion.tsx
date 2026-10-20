"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { useDeferredEnhancement, usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";

const motionTokens = {
  distance: { md: 16 },
  duration: { instant: 0, slow: 0.6 },
  stagger: 0.08,
  easing: { smooth: [0.22, 1, 0.36, 1] },
} as const;

export function FacilityMotion({ children }: { children: ReactNode }): JSX.Element {
  const scope = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const entered = useRef(false);

  const enhanced = useDeferredEnhancement(scope, !reduce);
  useEffect(() => {
    if (!enhanced) return;
    let disposed = false;
    let cleanup: VoidFunction | undefined;
    void import("motion/react").then(({ animate, inView }) => {
      if (disposed) return;
      cleanup = (() => {
        if (typeof window.matchMedia !== "function") return;
        const root = scope.current!;
        const layers = [...root.querySelectorAll<HTMLElement>("[data-facility-enter]")];
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const animations: ReturnType<typeof animate>[] = [];
        let disconnect: VoidFunction | undefined;
        function reset(): void {
          animations.splice(0).forEach(animation => animation.stop());
          layers.forEach(layer => {
            animate(layer, { y: 0 }, { duration: motionTokens.duration.instant });
            layer.style.transform = "none";
          });
        }
        function stop(): void { disconnect?.(); disconnect = undefined; reset(); }
        function interrupt(): void { entered.current = true; stop(); }
        function start(): void {
          stop();
          if (preference.matches || entered.current || navigator.hardwareConcurrency <= 4) return;
          try {
            disconnect = inView(root, () => {
              if (entered.current || root.contains(document.activeElement)) return;
              entered.current = true;
              try {
                layers.forEach((layer, index) => animations.push(animate(layer, { y: [motionTokens.distance.md, 0] }, {
                  duration: motionTokens.duration.slow, delay: index * motionTokens.stagger, ease: motionTokens.easing.smooth,
                })));
                void Promise.all(animations).then(() => {
                  if (root.isConnected) window.dispatchEvent(new Event("afina:facility-settled"));
                });
              } catch { reset(); }
            }, { amount: 0.1 });
          } catch { reset(); }
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
      })();
    }).catch(() => { /* Optional motion leaves the SSR document available. */ });
    return () => { disposed = true; cleanup?.(); };
  }, [enhanced, scope]);

  // Visible SSR content; observer/motion failure cannot hide copy or actions.
  return <div ref={scope} data-facility-motion="">{children}</div>;
}

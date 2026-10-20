"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener("change", notify);
    return () => media?.removeEventListener("change", notify);
  }, []);
  return useSyncExternalStore(subscribe, () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true, () => true);
}

/** Keep SSR content usable; run optional work only in view, at idle or on input. */
export function useDeferredEnhancement(target: RefObject<HTMLElement | null>, enabled = true): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = target.current;
    if (!element || !enabled || ready || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    let idle: number | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    function cancel(): void {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(fallback);
    }
    function start(): void {
      if (visible && document.visibilityState === "visible") { cancel(); setReady(true); }
    }
    function schedule(): void {
      cancel();
      if (!visible || document.visibilityState !== "visible" || document.readyState !== "complete") return;
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start);
      else fallback = setTimeout(start, 200);
    }
    let observer: IntersectionObserver;
    try { observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }); }
    catch { return; } // Animation APIs are optional; retain the complete static UI.
    observer.observe(element);
    const events = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;
    for (const event of events) window.addEventListener(event, start, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancel(); observer.disconnect();
      for (const event of events) window.removeEventListener(event, start);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [enabled, ready, target]);
  return enabled && ready;
}

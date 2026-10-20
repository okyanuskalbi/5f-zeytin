"use client";

import { useCallback, useEffect, useRef, useState, type JSX, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { inView, useAnimate, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import styles from "./Moments.module.css";

const moments = ["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"] as const;
const motionTokens = {
  distance: { md: 16 },
  duration: { instant: 0, slow: 0.6 },
  stagger: 0.08,
  easing: { smooth: [0.22, 1, 0.36, 1] },
} as const;
const dragThreshold = 8;

// Adapted from 21st appica-dev Carousel / progress demo 34485: named previous /
// next controls and scroll-derived progress. Native scroll-snap replaces Embla
// and its plugins so touch scrolling and the complete SSR list work without JS.
export function Moments(): JSX.Element {
  const rowRef = useRef<HTMLUListElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; left: number } | null>(null);
  const [position, setPosition] = useState({ progress: 0, start: true, end: false });
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduced = useReducedMotion();
  const entered = useRef(false);

  const measure = useCallback((): void => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const left = Math.min(max, Math.max(0, row.scrollLeft));
    setPosition({ progress: max > 0 ? Math.round(left / max * 100) : 100, start: left <= 1, end: max - left <= 1 });
  }, []);

  function go(direction: number | "start" | "end"): void {
    const row = rowRef.current;
    if (!row) return;
    const origin = row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft);
    const offsets = [...row.children].map(child => child.getBoundingClientRect().left - origin + row.scrollLeft);
    const left = direction === "start" ? 0 : direction === "end" ? row.scrollWidth - row.clientWidth
      : direction > 0 ? offsets.find(offset => offset > row.scrollLeft + 2) ?? row.scrollWidth
        : offsets.findLast(offset => offset < row.scrollLeft - 2) ?? 0;
    row.scrollTo({ left, behavior: reduced ? "instant" : "smooth" });
  }

  function keyboard(event: KeyboardEvent<HTMLUListElement>): void {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1, Home: "start", End: "end" } as const;
    if (!(event.key in direction)) return;
    event.preventDefault();
    go(direction[event.key as keyof typeof direction]);
  }

  function pointerDown(event: PointerEvent<HTMLUListElement>): void {
    // Touch and pen retain native horizontal AND vertical scrolling.
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const row = event.currentTarget;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: row.scrollLeft };
    row.focus({ preventScroll: true });
    row.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLUListElement>): void {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const distance = event.clientX - start.x;
    if (!event.currentTarget.hasAttribute("data-dragging") &&
      (Math.abs(distance) < dragThreshold || Math.abs(distance) < Math.abs(event.clientY - start.y))) return;
    event.currentTarget.setAttribute("data-dragging", "");
    event.currentTarget.scrollLeft = start.left - distance;
  }

  function release(event: PointerEvent<HTMLUListElement>): void {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    measure();
  }

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const row = rowRef.current!;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const root = scope.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const layers = [...root.querySelectorAll<HTMLElement>("[data-moment-enter]")];
    const animations: ReturnType<typeof animate>[] = [];
    let disconnect: VoidFunction | undefined;
    function stop(): void {
      disconnect?.();
      disconnect = undefined;
      animations.splice(0).forEach(animation => animation.stop());
      layers.forEach(layer => {
        animate(layer, { y: 0 }, { duration: motionTokens.duration.instant });
        layer.style.transform = "none";
      });
    }
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
          } catch { stop(); }
        }, { amount: 0.1 });
      } catch { stop(); }
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
  }, [animate, reduced, scope]);

  return (
    <section ref={scope} id="topraktan-sofraya" data-scene="moments" data-moments-safe="" aria-labelledby="moments-title" className={styles.section}>
      <div className={styles.heading}>
        <h2 id="moments-title" data-moment-enter="">Topraktan sofraya</h2>
        <div className={styles.controls}>
          <Button size="icon-lg" aria-label="Önceki an" aria-controls="moments-row" disabled={position.start} onClick={() => go(-1)}><ArrowLeft aria-hidden="true" /></Button>
          <Button size="icon-lg" aria-label="Sonraki an" aria-controls="moments-row" disabled={position.end} onClick={() => go(1)}><ArrowRight aria-hidden="true" /></Button>
        </div>
      </div>
      <div role="progressbar" aria-label="Süreç şeridi ilerlemesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={position.progress} className={styles.progress}>
        <span style={{ width: `${position.progress}%` }} />
      </div>
      <p data-moment-enter="" className={styles.intro}>Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.</p>
      <p id="moments-help" className="sr-only">Şeridi kaydırın veya sağ ve sol ok tuşlarını kullanın. Home ile başa, End ile sona gidin.</p>
      <ul ref={rowRef} id="moments-row" aria-label="Süreç anları" aria-describedby="moments-help" tabIndex={0}
        className={styles.row} onScroll={measure} onKeyDown={keyboard} onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
        {moments.map(title => (
          <li key={title} className={styles.moment}>
            <div data-moment-enter="">
              <h3>{title}</h3>
              {/* Atmosphere only: approved grove crops do not depict these stages. */}
              <Image src="/images/hero/zeytinlik-1200.webp" alt="" width={1200} height={675} unoptimized loading="lazy"
                draggable={false} className={styles.photo} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

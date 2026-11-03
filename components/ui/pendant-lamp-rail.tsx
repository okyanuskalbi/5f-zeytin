"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { animate, m as motion, useMotionValue, useMotionValueEvent, useMotionTemplate, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import styles from "./pendant-lamp-rail.module.css";
const subscribeReady = () => () => {};

/** Product adaptation of the user's supplied PendantLampRail (Task165).
 * Source SHA256: 641412e4e7236b4cb4af1583155ff009a9b40cdcc6844641c4b0e1ffd7e198d3.
 * Keeps directional drag intent, controlled selection and warm physical feedback.
 * Cord/lamp art, dimmer, autoplay and demo prices are deliberately not product UI.
 * Existing child detail/cart controls remain the only owners of those actions. */
export interface PendantLampRailProps {
  variant: "product";
  label: string;
  children: ReactNode;
  x: MotionValue<number>;
  scrub: boolean;
  travel: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  viewportClassName?: string;
  trackClassName?: string;
  controlsClassName?: string;
  controlsPlacement?: "before" | "after";
  hint?: string;
  onOffsetChange: (offset: number) => void;
  onFocusCapture?: (event: FocusEvent<HTMLDivElement>) => void;
}

export function railGestureIntent(dx: number, dy: number): "pending" | "horizontal" | "vertical" {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= 6) return "pending";
  return Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
}
export function nearestRailOffset(value: number, offsets: readonly number[]): number {
  return offsets.reduce((nearest, offset) => Math.abs(offset - value) < Math.abs(nearest - value) ? offset : nearest, offsets[0] ?? 0);
}

export function PendantLampRail({ variant, label, children, x, scrub, travel, viewportRef, trackRef,
  viewportClassName, trackClassName, controlsClassName, controlsPlacement = "after", hint = "Dokunun, sürükleyin, keşfedin.", onOffsetChange, onFocusCapture }: PendantLampRailProps) {
  const reduced = usePrefersReducedMotion();
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const drag = useRef({ id: -1, startX: 0, startY: 0, offset: 0, moved: false, vertical: false, lastX: 0, time: 0, velocity: 0 });
  const suppressClick = useRef(false);
  const visible = useRef(true);
  const settle = useRef<AnimationPlaybackControls | null>(null);
  const sway = useRef<AnimationPlaybackControls | null>(null);
  const tilt = useMotionValue(0);
  const rotation = useMotionTemplate`${tilt}deg`;
  const clamp = useCallback((value: number) => Math.max(0, Math.min(travel, value)), [travel]);
  const items = useCallback(() => Array.from(trackRef.current?.querySelectorAll<HTMLElement>("[data-rail-item]") ?? []), [trackRef]);
  const currentOffset = useCallback(() => scrub ? -x.get() : viewportRef.current?.scrollLeft ?? 0, [scrub, x, viewportRef]);
  const offsets = useCallback(() => {
    const width = viewportRef.current?.clientWidth ?? 0;
    return items().map(item => clamp(item.offsetLeft - (width - item.offsetWidth) / 2));
  }, [clamp, items, viewportRef]);
  const highlight = useCallback((index: number) => {
    setActive(index);
    items().forEach((item, i) => item.setAttribute("data-rail-active", String(i === index)));
  }, [items]);
  const followOffset = useCallback((offset: number) => {
    const positions = offsets();
    const nearest = nearestRailOffset(offset, positions);
    highlight(Math.max(0, positions.indexOf(nearest)));
  }, [highlight, offsets]);
  useMotionValueEvent(x, "change", value => { if (scrub && drag.current.id < 0) followOffset(-value); });

  const applyOffset = useCallback((value: number) => {
    const next = clamp(value);
    if (scrub) onOffsetChange(next);
    else if (viewportRef.current) viewportRef.current.scrollLeft = next;
    followOffset(next);
  }, [clamp, followOffset, onOffsetChange, scrub, viewportRef]);
  const stop = useCallback(() => {
    settle.current?.stop(); sway.current?.stop();
    settle.current = null; sway.current = null; tilt.set(0);
    const pointerId = drag.current.id;
    drag.current.id = -1;
    const element = viewportRef.current;
    element?.setAttribute("data-rail-dragging", "false");
    if (pointerId >= 0 && element?.hasPointerCapture?.(pointerId)) element.releasePointerCapture(pointerId);
  }, [tilt, viewportRef]);
  const moveTo = useCallback((offset: number, smooth = true) => {
    settle.current?.stop();
    const target = clamp(offset);
    if (reduced || !smooth || !visible.current) { applyOffset(target); return; }
    // Motion owns one bounded animation; there is no idle custom RAF/simulation.
    settle.current = animate(currentOffset(), target, { duration: .38, ease: [.22, 1, .36, 1], onUpdate: applyOffset });
  }, [applyOffset, clamp, currentOffset, reduced]);
  const restoreTilt = useCallback(() => {
    sway.current?.stop();
    if (reduced || !visible.current) { tilt.set(0); return; }
    sway.current = animate(tilt, 0, { duration: .42, ease: [.22, 1, .36, 1] });
  }, [reduced, tilt]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = () => { setCount(items().length); followOffset(currentOffset()); };
    const onScroll = () => { if (!scrub && drag.current.id < 0) followOffset(element.scrollLeft); };
    measure();
    element.addEventListener("scroll", onScroll, { passive: true });
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined;
    resize?.observe(element);
    if (trackRef.current) resize?.observe(trackRef.current);
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(entries => {
      visible.current = entries.some(entry => entry.isIntersecting);
      if (!visible.current) stop();
    }) : undefined;
    observer?.observe(element);
    const visibility = () => { if (document.visibilityState !== "visible") stop(); };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", stop);
    return () => { stop(); resize?.disconnect(); observer?.disconnect(); element.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", stop); };
  }, [currentOffset, followOffset, items, scrub, stop, trackRef, viewportRef]);
  useEffect(() => { if (reduced) stop(); }, [reduced, stop]);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.isPrimary === false) return;
    // A fresh tap starts a new interaction, including purchase/quote controls.
    // Cancellation of a previous swipe must never consume this real click.
    stop(); suppressClick.current = false;
    const target = event.target as HTMLElement;
    const control = target.closest("button,a,input,select,textarea");
    // Buttons and links retain taps, but a deliberate drag must not activate them.
    if (control?.matches("input,select,textarea")) return;
    drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, offset: currentOffset(), moved: false,
      vertical: false, lastX: event.clientX, time: performance.now(), velocity: 0 };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (state.id !== event.pointerId) {
      if (event.pointerType === "mouse") {
        const item = (event.target as HTMLElement).closest<HTMLElement>("[data-rail-item]");
        if (item) highlight(Math.max(0, items().indexOf(item)));
      }
      return;
    }
    if (state.vertical) return;
    const dx = event.clientX - state.startX, dy = event.clientY - state.startY;
    if (!state.moved) {
      const intent = railGestureIntent(dx, dy);
      if (intent === "vertical") { state.vertical = true; return; }
      if (intent !== "horizontal") return;
      state.moved = true; suppressClick.current = true;
      event.currentTarget.setAttribute("data-rail-dragging", "true");
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    const now = performance.now();
    state.velocity = state.velocity * .6 + ((event.clientX - state.lastX) / Math.max(1, now - state.time)) * .4;
    state.lastX = event.clientX; state.time = now;
    if (!reduced) tilt.set(Math.max(-3.5, Math.min(3.5, -state.velocity * 2)));
    applyOffset(state.offset - dx);
  }
  function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    drag.current = { ...state, id: -1 };
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.setAttribute("data-rail-dragging", "false");
    if (state.moved && !cancelled) {
      const velocity = reduced || performance.now() - state.time > 90 ? 0 : state.velocity;
      moveTo(nearestRailOffset(clamp(currentOffset() - velocity * 130), offsets()));
    }
    if (cancelled) { suppressClick.current = state.moved; stop(); }
    else if (state.moved) restoreTilt();
  }
  function choose(index: number, focus: boolean) {
    const all = items();
    const bounded = Math.max(0, Math.min(all.length - 1, index));
    highlight(bounded);
    moveTo(offsets()[bounded] ?? 0, !focus);
    if (focus) all[bounded]?.querySelector<HTMLElement>('[aria-haspopup="dialog"]')?.focus({ preventScroll: true });
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const target = event.target as HTMLElement;
    if (target !== event.currentTarget && !target.matches('[aria-haspopup="dialog"]')) return;
    event.preventDefault();
    const item = target.closest<HTMLElement>("[data-rail-item]");
    const from = item ? items().indexOf(item) : active;
    choose(event.key === "Home" ? 0 : event.key === "End" ? items().length - 1 : from + (event.key === "ArrowRight" ? 1 : -1), true);
  }

  // Task174: visible directional controls adapted from 21st8297 Product
  // Carousel (ravikatiyar162). Existing SKU/scroll ownership stays in this rail.
  const controls = <div data-rail-controls="" data-21st-controls-source={controlsPlacement === "before" ? "8297" : undefined} className={`${styles.controls} ${controlsClassName ?? ""}`}>
    <p>{hint}</p>
    <div className={styles.navigation} role="group" aria-label="Ürünler arasında gezin">
      <button type="button" aria-label="Önceki ürün" disabled={active <= 0} onClick={() => choose(active - 1, false)}><ArrowLeftIcon size={19} aria-hidden="true" /></button>
      <span aria-live="polite">{String(count ? active + 1 : 0).padStart(2, "0")} <span>/ {String(count).padStart(2, "0")}</span></span>
      <button type="button" aria-label="Sonraki ürün" disabled={!count || active >= count - 1} onClick={() => choose(active + 1, false)}><ArrowRightIcon size={19} aria-hidden="true" /></button>
    </div>
  </div>;
  return <div data-slot="pendant-lamp-rail" data-variant={variant} className={styles.rail}>
    {controlsPlacement === "before" && controls}
    <div ref={viewportRef} role="region" aria-label={label} tabIndex={0} data-gallery-viewport="" data-rail-dragging="false" data-rail-enhanced={ready}
      className={`${styles.viewport} ${viewportClassName ?? ""}`} onPointerDown={pointerDown} onPointerMove={pointerMove}
      onDragStart={event => event.preventDefault()}
      onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)}
      onPointerLeave={() => { if (!drag.current.moved) drag.current.id = -1; }}
      onLostPointerCapture={event => {
        // Touch implicitly captures the child hit target. Transferring capture
        // to this viewport emits a bubbling loss on that child, not a cancel.
        if (event.target === event.currentTarget) finish(event, true);
      }} onKeyDown={keyboard}
      onClickCapture={event => { if (suppressClick.current && event.detail > 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
      <motion.div ref={trackRef} data-gallery-track="" className={trackClassName} onFocusCapture={event => {
        const item = (event.target as HTMLElement).closest<HTMLElement>("[data-rail-item]");
        if (item) highlight(Math.max(0, items().indexOf(item)));
        onFocusCapture?.(event);
      }} style={{ ...(scrub ? { x } : { transform: "none" }), "--rail-tilt": rotation } as import("framer-motion").MotionStyle & { "--rail-tilt": MotionValue<string> }}>
        {children}
      </motion.div>
    </div>
    {controlsPlacement === "after" && controls}
  </div>;
}
export default PendantLampRail;

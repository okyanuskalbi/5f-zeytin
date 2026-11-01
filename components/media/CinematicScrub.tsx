"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { cinematicPoster } from "@/lib/media/cinematic-poster";
import { approachTime, createSeekQueue, progressTime } from "@/lib/media/scrub-seek";
import styles from "./CinematicScrub.module.css";

export const SCRUB_QUERY = "(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const movie = "/videos/afina-hasat-scrub.mp4";

/** Poster-first and src-less SSR. A complete small Blob avoids host Range
 * dependencies; the native decoder seeks only after the previous seek ends. */
export function CinematicScrub({ progress, scene, onMode }: {
  progress: MotionValue<number>; scene: RefObject<HTMLElement | null>;
  onMode: (ready: boolean) => void;
}) {
  const player = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const wake = useRef<(() => void) | null>(null);
  const [painted, setPainted] = useState(false);
  useMotionValueEvent(progress, "change", () => wake.current?.());

  useEffect(() => {
    const candidate = player.current;
    const element = scene.current;
    if (!candidate || !element || !window.matchMedia || typeof IntersectionObserver !== "function") return;
    const video: HTMLVideoElement = candidate;
    const media = window.matchMedia(SCRUB_QUERY);
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const weakDevice = (navigator.hardwareConcurrency || 4) < 4;
    let visible = false, disposed = false, failed = false, loaded = false, hasFrame = false;
    let objectURL: string | undefined, abort: AbortController | undefined;
    let raf: number | undefined, timer: ReturnType<typeof setTimeout> | undefined;
    let seekTimer: ReturnType<typeof setTimeout> | undefined;
    let shown = 0, last = 0;
    const policy = () => media.matches && !connection?.saveData && !weakDevice;
    const active = () => policy() && visible && document.visibilityState === "visible" && loaded && !failed;
    const queue = createSeekQueue(() => video.currentTime, time => {
      video.currentTime = time;
      clearTimeout(seekTimer);
      // A missing seeked event must never leave a busy queue or endless pin.
      seekTimer = setTimeout(fail, 4000);
    });
    function stop(): void {
      if (raf !== undefined) cancelAnimationFrame(raf);
      raf = undefined; last = 0;
    }
    function unload(): void {
      stop(); clearTimeout(timer); clearTimeout(seekTimer);
      abort?.abort(); abort = undefined; loaded = false; hasFrame = false; shown = 0; last = 0;
      queue.reset(); video.pause(); video.removeAttribute("src"); video.preload = "none"; video.load();
      if (objectURL) URL.revokeObjectURL(objectURL);
      objectURL = undefined;
      if (!disposed) { setPainted(false); onMode(false); }
    }
    function fail(): void { failed = true; unload(); }
    function tick(now: number): void {
      raf = undefined;
      if (!active()) { last = 0; return; }
      const target = progressTime(progress.get(), video.duration);
      shown = approachTime(shown, target, last ? now - last : 1000 / 60);
      last = now;
      const settled = Math.abs(shown - target) < 1 / 120;
      if (settled) shown = target;
      queue.request(shown);
      if (!settled) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function start(): void { if (active() && raf === undefined) raf = requestAnimationFrame(tick); }
    function frameReady(): void {
      if (!active() || disposed || hasFrame) return;
      hasFrame = true; setPainted(true); onMode(true);
    }
    function seeked(): void {
      clearTimeout(seekTimer); queue.complete();
      frameReady();
    }
    function canplay(): void {
      if (!policy() || disposed || failed || !video.hasAttribute("src")) return;
      clearTimeout(timer); loaded = true;
      // loadeddata/canplay means the initial decoded frame exists; metadata alone does not.
      frameReady(); start();
    }
    async function load(): Promise<void> {
      if (abort || loaded || failed || !policy() || !visible || document.visibilityState !== "visible" || document.readyState !== "complete") return;
      const controller = new AbortController(); abort = controller;
      timer = setTimeout(fail, 20000);
      try {
        // Yield critical image/font bandwidth. The poster is already the full UI.
        if (poster.current && !poster.current.complete && typeof poster.current.decode === "function") {
          await poster.current.decode().catch(() => {});
        }
        if (controller.signal.aborted) return;
        const response = await fetch(movie, { signal: controller.signal, priority: "low" });
        if (!response.ok || Number(response.headers.get("content-length")) > 8_000_000) throw Error("media");
        const blob = await response.blob();
        if (blob.size > 8_000_000 || !blob.size) throw Error("media size");
        if (controller.signal.aborted || disposed || !policy()) return;
        objectURL = URL.createObjectURL(blob); video.preload = "auto"; video.src = objectURL; video.load();
      } catch { if (!controller.signal.aborted && !disposed) fail(); }
    }
    function update(): void {
      if (!policy()) { failed = false; unload(); return; }
      if (document.visibilityState !== "visible" || !visible) { stop(); return; }
      void load(); frameReady(); start();
    }
    const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); update(); });
    observer.observe(element);
    wake.current = start;
    media.addEventListener("change", update);
    connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("load", update);
    video.addEventListener("canplay", canplay);
    video.addEventListener("seeked", seeked);
    video.addEventListener("error", fail);
    return () => {
      disposed = true; wake.current = null;
      observer.disconnect(); media.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update); window.removeEventListener("load", update);
      video.removeEventListener("canplay", canplay); video.removeEventListener("seeked", seeked); video.removeEventListener("error", fail);
      unload();
    };
  }, [onMode, progress, scene]);

  return <div className={styles.media} data-cinematic-scrub="" data-painted={painted}>
    <picture className={styles.poster}>
      <source media="(max-width: 767px)" type="image/avif" srcSet={cinematicPoster.mobileSrcSet} sizes="100vw" />
      <source media="(max-width: 767px)" type="image/webp" srcSet={cinematicPoster.mobileWebpSrcSet} sizes="100vw" />
      <source type="image/avif" srcSet={cinematicPoster.desktopSrcSet} sizes="100vw" />
      <source type="image/webp" srcSet={cinematicPoster.desktopWebpSrcSet} sizes="100vw" />
      <img ref={poster} src={cinematicPoster.src} width={1280} height={720} alt="" loading="eager" fetchPriority="high" decoding="async" />
    </picture>
    <video ref={player} className={styles.video} width={1280} height={720} preload="none" muted playsInline aria-hidden="true" tabIndex={-1} />
  </div>;
}

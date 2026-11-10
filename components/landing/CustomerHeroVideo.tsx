"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { Pause, Play } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import media from "@/lib/media/customer-home.json";
import styles from "./CustomerHome.module.css";

/** The eager poster paints before any optional video request. */
export function CustomerHeroVideo(): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const userPaused = useRef(false);
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;
    const poster = root.current?.querySelector("img");
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => { timer = setTimeout(() => { if (!cancelled) setReady(true); }, 250); };
    if (poster?.complete) start();
    else poster?.addEventListener("load", start, { once: true });
    return () => { cancelled = true; clearTimeout(timer); poster?.removeEventListener("load", start); };
  }, [reduced]);
  useEffect(() => {
    if (!ready || reduced || failed) return;
    const element = video.current;
    if (!element) return;
    let visible = true;
    const update = () => {
      if (!visible || document.hidden || userPaused.current) element.pause();
      else void element.play().catch(() => setPlaying(false));
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer?.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { element.pause(); observer?.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [ready, reduced, failed]);
  return <><div ref={root} className={styles.heroMedia}>
    <V3Picture image={media.hero.posters} sizes="100vw" eager decorative className={styles.poster} data-hero-photo />
    {ready && !reduced && !failed &&
      <video ref={video} className={styles.heroVideo} autoPlay muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }}>
        <source src="/videos/customer-home/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/customer-home/hero-1280.mp4" type="video/mp4" media="(max-width: 1439px)" />
        <source src="/videos/customer-home/hero-1920.mp4" type="video/mp4" />
      </video>}
    </div>
    {ready && !reduced && !failed &&
      <button className={styles.videoControl} type="button" aria-label={playing ? "Videoyu duraklat" : "Videoyu oynat"} onClick={() => {
        const element = video.current;
        if (!element) return;
        userPaused.current = !element.paused;
        if (element.paused) void element.play().catch(() => setPlaying(false));
        else element.pause();
      }}>{playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{playing ? "Duraklat" : "Oynat"}</button>
    }
  </>;
}

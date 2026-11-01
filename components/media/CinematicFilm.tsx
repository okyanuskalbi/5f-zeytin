"use client";

import { useCallback, useEffect, useReducer, useRef, type JSX, type ReactNode } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { cinematicFilmPoster as cinematicPoster } from "@/lib/media/cinematic-poster";
import { m as motion, type MotionStyle } from "motion/react";
import styles from "./CinematicFilm.module.css";

type FilmState = {
  allowed: boolean; visible: boolean; inView: boolean; attached: boolean;
  hasFrame: boolean; playing: boolean; userPaused: boolean; ended: boolean; blocked: boolean; failed: boolean;
};
type FilmAction =
  | { type: "environment"; allowed?: boolean; visible?: boolean; inView?: boolean }
  | { type: "playing" | "paused" | "pause" | "play" | "ended" | "blocked" | "error" };
const initialState: FilmState = {
  allowed: false, visible: false, inView: false, attached: false,
  hasFrame: false, playing: false, userPaused: false, ended: false, blocked: false, failed: false,
};
const defaultFilmURL = "/videos/afina-agac-dal.mp4";

function filmReducer(state: FilmState, action: FilmAction): FilmState {
  if (action.type === "environment") {
    const next = { ...state, allowed: action.allowed ?? state.allowed, visible: action.visible ?? state.visible, inView: action.inView ?? state.inView };
    next.attached = next.allowed && !next.failed && (state.attached || (next.visible && next.inView));
    if (!next.allowed) { next.hasFrame = false; next.playing = false; }
    if (!next.visible || !next.inView) next.playing = false;
    return next;
  }
  if (action.type === "playing") return { ...state, playing: true, hasFrame: true, blocked: false };
  if (action.type === "paused") return { ...state, playing: false };
  if (action.type === "pause") return { ...state, userPaused: true, playing: false };
  if (action.type === "play") return {
    ...state, userPaused: false, ended: false, blocked: false, failed: false,
    attached: state.allowed && state.visible && state.inView,
  };
  if (action.type === "ended") return { ...state, ended: true, playing: false, hasFrame: true };
  if (action.type === "blocked") return { ...state, blocked: true, playing: false };
  return { ...state, failed: true, attached: false, playing: false, hasFrame: false };
}

/** One accepted, silent Flow film. The responsive poster is the complete SSR
 * experience; its video URL is attached only after the visible scene qualifies. */
export function CinematicFilm({ className = "", children, mediaStyle, controlsPosition = "bottom", movieSrc = defaultFilmURL, poster = cinematicPoster, loop = false, posterSrc = "/frames/afina-agac-dal/poster-desktop.avif" }: {
  className?: string; children?: ReactNode; mediaStyle?: MotionStyle; controlsPosition?: "top" | "bottom";
  movieSrc?: string; poster?: typeof cinematicPoster; loop?: boolean; posterSrc?: string;
}): JSX.Element {
  const filmURL = movieSrc;
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const previouslyAttached = useRef(false);
  const playAttempt = useRef(0);
  const manualStart = useRef(false);
  const [state, dispatch] = useReducer(filmReducer, initialState);
  const requestPlayback = useCallback((player: HTMLVideoElement): void => {
    const attempt = ++playAttempt.current;
    player.muted = true;
    try {
      void Promise.resolve(player.play()).catch(() => { if (attempt === playAttempt.current) dispatch({ type: "blocked" }); });
    } catch { dispatch({ type: "blocked" }); }
  }, []);
  const stopPlayback = useCallback((player: HTMLVideoElement | null): void => {
    playAttempt.current++;
    player?.pause();
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const updatePolicy = (): void => dispatch({ type: "environment",
      allowed: document.readyState === "complete" && !!reduced && !reduced.matches && connection?.saveData !== true,
      visible: document.visibilityState === "visible",
    });
    reduced?.addEventListener("change", updatePolicy);
    connection?.addEventListener("change", updatePolicy);
    document.addEventListener("visibilitychange", updatePolicy);
    window.addEventListener("load", updatePolicy);
    updatePolicy();
    let observer: IntersectionObserver | undefined;
    let firstMeasure: number | undefined;
    const measure = (): void => {
      const rect = element.getBoundingClientRect();
      dispatch({ type: "environment", inView: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth });
    };
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(entries => dispatch({ type: "environment", inView: entries.some(entry => entry.isIntersecting) }), { threshold: 0.01 });
      observer.observe(element);
    } else {
      firstMeasure = requestAnimationFrame(measure);
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("resize", measure);
    }
    return () => {
      observer?.disconnect();
      if (firstMeasure !== undefined) cancelAnimationFrame(firstMeasure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      reduced?.removeEventListener("change", updatePolicy);
      connection?.removeEventListener("change", updatePolicy);
      document.removeEventListener("visibilitychange", updatePolicy);
      window.removeEventListener("load", updatePolicy);
    };
  }, []);

  const runningIntent = state.attached && state.allowed && state.visible && state.inView
    && !state.userPaused && !state.ended && !state.blocked && !state.failed;
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const revoked = previouslyAttached.current && !state.attached;
    previouslyAttached.current = state.attached;
    if (!runningIntent) {
      playAttempt.current++;
      manualStart.current = false;
      player.pause();
      if (revoked) player.load(); // Abort the revoked source and release its decoder.
      return;
    }
    if (manualStart.current) manualStart.current = false;
    else requestPlayback(player);
  }, [requestPlayback, runningIntent, state.attached]);

  useEffect(() => {
    const player = video.current;
    return () => { stopPlayback(player); };
  }, [stopPlayback]);

  function togglePlayback(): void {
    if (!state.allowed || !state.visible || !state.inView) return;
    if (runningIntent) dispatch({ type: "pause" });
    else {
      const player = video.current;
      if (!player) return;
      if (!state.attached) player.src = filmURL;
      if (state.ended) player.currentTime = 0;
      manualStart.current = true;
      dispatch({ type: "play" });
      // Keep the native call in the user gesture, including Safari/iOS.
      requestPlayback(player);
    }
  }
  const label = state.failed ? "Tekrar dene" : state.ended ? "Yeniden oynat" : runningIntent ? "Filmi duraklat" : "Filmi oynat";
  const Icon = state.ended || state.failed ? RotateCcwIcon : runningIntent ? PauseIcon : PlayIcon;
  const showFilm = state.allowed && state.hasFrame && !state.failed;
  return <div ref={container} className={`${styles.film} ${className}`} data-cinematic-film="" data-show-film={showFilm}>
    <motion.div className={styles.visual} data-film-plane="" style={mediaStyle}>
    <picture className={styles.poster}>
      <source type="image/avif" media="(max-width: 767px) and (orientation: portrait)" srcSet={poster.mobileSrcSet} sizes="100vw" />
      <source type="image/webp" media="(max-width: 767px) and (orientation: portrait)" srcSet={poster.mobileWebpSrcSet} sizes="100vw" />
      <source type="image/avif" srcSet={poster.desktopSrcSet} sizes="100vw" />
      <source type="image/webp" srcSet={poster.desktopWebpSrcSet} sizes="100vw" />
      {/* The responsive poster must paint before hydration or media permissions. */}
      <img src={poster.src} width={poster.width} height={poster.height} alt="" loading="eager" fetchPriority="high" decoding="async" />
    </picture>
    <video ref={video} className={styles.video} poster={posterSrc} src={state.attached ? filmURL : undefined}
      width={1280} height={720} muted playsInline loop={loop} autoPlay={runningIntent} preload="metadata" aria-hidden="true" tabIndex={-1}
      onPlaying={() => {
        if (runningIntent) dispatch({ type: "playing" });
        else video.current?.pause();
      }} onPause={() => dispatch({ type: "paused" })} onEnded={() => dispatch({ type: "ended" })} onError={() => dispatch({ type: "error" })} />
    </motion.div>
    {children}
    {state.allowed && <div className={styles.controls} data-cinematic-controls="" data-position={controlsPosition}>
      {state.failed && <p role="status">Film açılamadı. Görsel gösteriliyor.</p>}
      <button type="button" onClick={togglePlayback} disabled={!state.visible || !state.inView} aria-label={label}>
        <Icon size={15} aria-hidden="true" /><span>{label}</span>
      </button>
    </div>}
  </div>;
}

"use client";

import {
  useCallback, useEffect, useRef, useState, useSyncExternalStore,
  type JSX, type ReactNode,
} from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useDeferredEnhancement } from "@/lib/media/use-deferred-enhancement";

import {
  parseFrameManifest, sequenceAssetURL,
  type FrameManifest,
} from "@/lib/media/frames";

const ActiveSequence = dynamic(() => import("./FramePlayback").then((module) => module.ActiveSequence), { ssr: false });

interface ScrollFrameSequenceProps {
  src: string;
  /** Approved responsive poster, available in server HTML before the manifest loads. */
  poster?: { src: string; srcSet?: string; mobileSrcSet?: string; mobileWebpSrcSet?: string; desktopSrcSet?: string; desktopWebpSrcSet?: string; width: number; height: number };
  deferPlayback?: boolean;
  initialCount?: number;
  mediaClassName?: string;
  scrollLength?: number;
  fit?: "cover" | "contain";
  positionX?: number;
  blurFill?: boolean;
  children?: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  /** Describe meaningful media; decorative sequences can use an empty label. */
  label?: string;
}

function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback((notify: () => void) => {
    if (typeof window.matchMedia !== "function") return () => {};
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, [query]);
  return useSyncExternalStore(subscribe, () => typeof window.matchMedia === "function" ? window.matchMedia(query).matches : serverValue, () => serverValue);
}

function useMediaBudget(): boolean {
  const connection = typeof navigator === "undefined" ? undefined
    : (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
  const subscribe = useCallback((notify: () => void) => {
    connection?.addEventListener("change", notify);
    return () => connection?.removeEventListener("change", notify);
  }, [connection]);
  return useSyncExternalStore(subscribe,
    () => connection?.saveData === true || navigator.hardwareConcurrency <= 4,
    () => true);
}

export function ScrollFrameSequence({
  src, poster, deferPlayback = false, initialCount, mediaClassName = "", scrollLength = 300, fit = "cover", positionX = 0.5, blurFill = false, children, label = "Kare dizisi",
}: ScrollFrameSequenceProps): JSX.Element {
  const target = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  // A static server snapshot also avoids prefetching motion frames before preference hydration.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const limited = useMediaBudget();
  const shortViewport = useMediaQuery("(max-height: 55rem)");
  const mobile = useMediaQuery("(max-width: 767px)");
  useEffect(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !target.current?.contains(focused)) return;
    const rect = focused.getBoundingClientRect();
    if (rect.bottom > innerHeight || rect.top < 0) focused.scrollIntoView({ block: "nearest" });
  }, [shortViewport]);
  const [result, setResult] = useState<{ src: string; manifest?: FrameManifest; error?: boolean }>();
  const [posterLoaded, setPosterLoaded] = useState("");
  const [posterFailed, setPosterFailed] = useState("");
  const manifest = result?.src === src ? result.manifest : undefined;
  const posterURL = poster?.src ?? (manifest ? sequenceAssetURL(src, manifest.poster) : undefined);
  const posterKey = `${src}:${posterURL ?? ""}`;
  const failed = (result?.src === src && result.error) || posterFailed === posterKey;
  // An eager server-rendered poster may finish before React attaches onLoad.
  const observePoster = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setPosterLoaded(posterKey);
    else if (image?.complete && image.currentSrc) setPosterFailed(posterKey);
  }, [posterKey]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(src, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Frame manifest unavailable.");
      const manifest = parseFrameManifest(await response.json());
      if (!controller.signal.aborted) setResult({ src, manifest });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ src, error: true });
    });
    return () => controller.abort();
  }, [src]);

  const length = Number.isFinite(scrollLength) ? Math.max(100, scrollLength) : 300;
  const staticMedia = reduced || limited || shortViewport || failed;
  const playbackReady = useDeferredEnhancement(target, deferPlayback && !staticMedia && !!manifest && posterLoaded === posterKey);
  const focusX = Number.isFinite(positionX) ? Math.max(0, Math.min(1, positionX)) : 0.5;
  const height = staticMedia ? 100 : Math.max(100, length * (mobile ? 0.7 : 1));

  return (
    <div ref={target} data-frame-sequence data-status={failed ? "error" : manifest ? "ready" : "loading"}
      className="relative bg-background" style={{ height: staticMedia ? (poster ? "var(--frame-height, 100vh)" : "100vh") : `${height}vh` }}>
      <div className="[position:var(--frame-position,sticky)] top-[var(--frame-top,0px)] h-[var(--frame-height,100vh)] overflow-hidden">
        {posterURL && (
          <div role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={!label || undefined} className={`absolute inset-0 ${mediaClassName}`}>
            {fit === "contain" && blurFill && (
              <div aria-hidden="true" className="absolute -inset-12 bg-cover bg-center blur-2xl"
                style={{ backgroundImage: `url("${posterURL}")` }} />
            )}
            {/* A plain image preserves the manifest URL and the exact poster-only request budget. */}
            <picture>
            {poster?.mobileSrcSet && <source type="image/avif" media="(max-width: 767px) and (orientation: portrait)" srcSet={poster.mobileSrcSet} sizes="100vw" />}
            {poster?.mobileWebpSrcSet && <source type="image/webp" media="(max-width: 767px) and (orientation: portrait)" srcSet={poster.mobileWebpSrcSet} sizes="100vw" />}
            {poster?.desktopSrcSet && <source type="image/avif" srcSet={poster.desktopSrcSet} sizes="100vw" />}
            {poster?.desktopWebpSrcSet && <source type="image/webp" srcSet={poster.desktopWebpSrcSet} sizes="100vw" />}
            <img ref={observePoster} key={`poster:${posterKey}`} src={posterURL} srcSet={poster?.srcSet} sizes={poster?.srcSet ? "100vw" : undefined} alt="" aria-hidden="true"
              width={poster?.width ?? manifest!.widths[0]} height={poster?.height ?? Math.round(manifest!.widths[0] / manifest!.aspect)}
              fetchPriority={poster ? "high" : undefined}
              style={{ objectPosition: `${focusX * 100}% center` }}
              onLoad={() => setPosterLoaded(posterKey)} onError={() => setPosterFailed(posterKey)}
              className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
            </picture>
            {manifest && !staticMedia && posterLoaded === posterKey && (!deferPlayback || playbackReady) && (
              <ActiveSequence key={`frames:${src}`} target={target} manifest={manifest} src={src} fit={fit} positionX={focusX} blurFill={blurFill} progress={progress} initialCount={initialCount} />
            )}
          </div>
        )}
        <div className="relative z-10 h-full">{typeof children === "function" ? children(progress) : children}</div>
        {failed && <p role="status" className="absolute right-4 bottom-4 left-4 z-20 bg-background p-3 text-sm text-foreground">Görsel yüklenemedi. Lütfen yeniden deneyin.</p>}
      </div>
    </div>
  );
}

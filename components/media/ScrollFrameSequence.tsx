"use client";

import {
  useCallback, useEffect, useRef, useState, useSyncExternalStore,
  type JSX, type ReactNode, type RefObject,
} from "react";
import { useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";

import {
  createFrameLoader, frameIndex, parseFrameManifest, selectFrameWidth, sequenceAssetURL,
  type FrameManifest,
} from "@/lib/media/frames";

interface ScrollFrameSequenceProps {
  src: string;
  /** Approved responsive poster, available in server HTML before the manifest loads. */
  poster?: { src: string; srcSet?: string; width: number; height: number };
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

interface ActiveSequenceProps {
  target: RefObject<HTMLDivElement | null>;
  manifest: FrameManifest;
  src: string;
  fit: "cover" | "contain";
  positionX: number;
  blurFill: boolean;
  progress: MotionValue<number>;
}

function ActiveSequence({ target, manifest, src, fit, positionX, blurFill, progress }: ActiveSequenceProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const index = useTransform(scrollYProgress, (value) => frameIndex(value, manifest.count));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const section = target.current!;
    let context: CanvasRenderingContext2D | null;
    try { context = canvas.getContext("2d"); }
    catch { canvas.hidden = true; return; }
    if (!context) { canvas.hidden = true; return; }
    let frames: ReturnType<typeof createFrameLoader> | undefined;
    let selectedWidth = 0;
    let animationFrame: number | undefined;
    let nearby = false;
    let disposed = false;

    function fail(): void {
      disposed = true;
      canvas.hidden = true;
      frames?.dispose();
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    }

    function active(): boolean {
      return !disposed && nearby && document.visibilityState !== "hidden";
    }

    function drawImage(image: HTMLImageElement, cover: boolean, expand = 0): void {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = (cover ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);
      const dw = image.naturalWidth * scale + expand * 2;
      const dh = image.naturalHeight * scale + expand * 2;
      context!.drawImage(image, (width - dw) * positionX, (height - dh) / 2, dw, dh);
    }

    function draw(): void {
      animationFrame = undefined;
      if (!active()) return;
      const nearest = frames?.nearest(index.get());
      if (!nearest) return; // The poster remains visible below the transparent canvas.
      try {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.round(canvas.clientWidth * dpr);
        const height = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        context!.setTransform(dpr, 0, 0, dpr, 0, 0);
        context!.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        if (fit === "contain" && blurFill) {
          context!.save();
          context!.filter = "blur(24px)";
          drawImage(nearest.image, true, 48);
          context!.restore();
        }
        drawImage(nearest.image, fit === "cover");
        canvas.dataset.frame = String(nearest.index);
      } catch { fail(); } // GPU/context errors reveal the SSR poster and stop further work.
    }

    function requestDraw(): void {
      if (active() && animationFrame === undefined) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function preload(): void {
      if (!active()) return;
      if (index.get() > 0) frames?.preloadAround(index.get());
      else frames?.preloadInitial();
    }

    function resize(): void {
      if (!active()) return;
      const width = selectFrameWidth(manifest.widths, window.innerWidth);
      if (selectedWidth !== width) {
        frames?.dispose();
        selectedWidth = width;
        frames = createFrameLoader({ src, width, count: manifest.count, onLoad: requestDraw });
      }
      preload();
      requestDraw();
    }

    function syncActivity(): void {
      frames?.setPaused(!active());
      if (active()) resize();
      else if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    }

    const stopIndex = index.on("change", () => { preload(); requestDraw(); });
    const stopProgress = scrollYProgress.on("change", (value) => progress.set(value));
    progress.set(scrollYProgress.get());
    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      syncActivity();
    });
    observer.observe(section);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    const onVisibility = syncActivity;
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("contextlost", fail);
    resize();

    return () => {
      disposed = true;
      stopIndex();
      stopProgress();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("contextlost", fail);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      frames?.dispose();
      progress.set(0);
    };
  }, [blurFill, fit, positionX, index, manifest, progress, scrollYProgress, src, target]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export function ScrollFrameSequence({
  src, poster, mediaClassName = "", scrollLength = 300, fit = "cover", positionX = 0.5, blurFill = false, children, label = "Kare dizisi",
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={observePoster} key={`poster:${posterKey}`} src={posterURL} srcSet={poster?.srcSet} sizes={poster?.srcSet ? "100vw" : undefined} alt="" aria-hidden="true"
              width={poster?.width ?? manifest!.widths[0]} height={poster?.height ?? Math.round(manifest!.widths[0] / manifest!.aspect)}
              fetchPriority={poster ? "high" : undefined}
              style={{ objectPosition: `${focusX * 100}% center` }}
              onLoad={() => setPosterLoaded(posterKey)} onError={() => setPosterFailed(posterKey)}
              className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
            {manifest && !staticMedia && posterLoaded === posterKey && (
              <ActiveSequence key={`frames:${src}`} target={target} manifest={manifest} src={src} fit={fit} positionX={focusX} blurFill={blurFill} progress={progress} />
            )}
          </div>
        )}
        <div className="relative z-10 h-full">{typeof children === "function" ? children(progress) : children}</div>
        {failed && <p role="status" className="absolute right-4 bottom-4 left-4 z-20 bg-background p-3 text-sm text-foreground">Görsel yüklenemedi. Lütfen yeniden deneyin.</p>}
      </div>
    </div>
  );
}

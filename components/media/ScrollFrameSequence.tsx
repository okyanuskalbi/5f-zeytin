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
  scrollLength?: number;
  fit?: "cover" | "contain";
  blurFill?: boolean;
  children?: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  /** Describe meaningful media; decorative sequences can use an empty label. */
  label?: string;
}

function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

interface ActiveSequenceProps {
  target: RefObject<HTMLDivElement | null>;
  manifest: FrameManifest;
  src: string;
  fit: "cover" | "contain";
  blurFill: boolean;
  progress: MotionValue<number>;
}

function ActiveSequence({ target, manifest, src, fit, blurFill, progress }: ActiveSequenceProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const index = useTransform(scrollYProgress, (value) => frameIndex(value, manifest.count));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const section = target.current!;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frames: ReturnType<typeof createFrameLoader> | undefined;
    let selectedWidth = 0;
    let animationFrame: number | undefined;
    let nearby = false;
    let disposed = false;

    function drawImage(image: HTMLImageElement, cover: boolean, expand = 0): void {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = (cover ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);
      const dw = image.naturalWidth * scale + expand * 2;
      const dh = image.naturalHeight * scale + expand * 2;
      context!.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
    }

    function draw(): void {
      animationFrame = undefined;
      if (disposed || document.visibilityState === "hidden") return;
      const nearest = frames?.nearest(index.get());
      if (!nearest) return; // The poster remains visible below the transparent canvas.
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
    }

    function requestDraw(): void {
      if (!disposed && animationFrame === undefined && document.visibilityState !== "hidden") {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function preload(): void {
      if (nearby && document.visibilityState !== "hidden" && index.get() > 0) frames?.preloadAround(index.get());
    }

    function resize(): void {
      const width = selectFrameWidth(manifest.widths, window.innerWidth);
      if (selectedWidth !== width) {
        frames?.dispose();
        selectedWidth = width;
        frames = createFrameLoader({ src, width, count: manifest.count, onLoad: requestDraw });
        frames.preloadInitial();
        preload();
      }
      requestDraw();
    }

    const stopIndex = index.on("change", () => { preload(); requestDraw(); });
    const stopProgress = scrollYProgress.on("change", (value) => progress.set(value));
    progress.set(scrollYProgress.get());
    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      preload();
    }, { rootMargin: "100% 0px" });
    observer.observe(section);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    const onVisibility = (): void => { preload(); requestDraw(); };
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    return () => {
      disposed = true;
      stopIndex();
      stopProgress();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      frames?.dispose();
      progress.set(0);
    };
  }, [blurFill, fit, index, manifest, progress, scrollYProgress, src, target]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export function ScrollFrameSequence({
  src, scrollLength = 300, fit = "cover", blurFill = false, children, label = "Kare dizisi",
}: ScrollFrameSequenceProps): JSX.Element {
  const target = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  // A static server snapshot also avoids prefetching motion frames before preference hydration.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const mobile = useMediaQuery("(max-width: 767px)");
  const [result, setResult] = useState<{ src: string; manifest?: FrameManifest; error?: boolean }>();
  const [posterLoaded, setPosterLoaded] = useState("");
  const [posterFailed, setPosterFailed] = useState("");
  const manifest = result?.src === src ? result.manifest : undefined;
  const failed = (result?.src === src && result.error) || posterFailed === src;

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
  const height = reduced || failed ? 100 : Math.max(100, length * (mobile ? 0.7 : 1));

  return (
    <div ref={target} data-frame-sequence data-status={failed ? "error" : manifest ? "ready" : "loading"}
      className="relative bg-background" style={{ height: `${height}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {manifest && (
          <div role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={!label || undefined} className="absolute inset-0">
            {fit === "contain" && blurFill && (
              <div aria-hidden="true" className="absolute -inset-12 bg-cover bg-center blur-2xl"
                style={{ backgroundImage: `url("${sequenceAssetURL(src, manifest.poster)}")` }} />
            )}
            {/* A plain image preserves the manifest URL and the exact poster-only request budget. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={`poster:${src}`} src={sequenceAssetURL(src, manifest.poster)} alt="" aria-hidden="true"
              width={manifest.widths[0]} height={Math.round(manifest.widths[0] / manifest.aspect)}
              onLoad={() => setPosterLoaded(src)} onError={() => setPosterFailed(src)}
              className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
            {!reduced && !failed && posterLoaded === src && (
              <ActiveSequence key={`frames:${src}`} target={target} manifest={manifest} src={src} fit={fit} blurFill={blurFill} progress={progress} />
            )}
          </div>
        )}
        <div className="relative z-10 h-full">{typeof children === "function" ? children(progress) : children}</div>
        {failed && <p role="status" className="absolute right-4 bottom-4 left-4 z-20 bg-background p-3 text-sm text-foreground">Görsel yüklenemedi. Lütfen yeniden deneyin.</p>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, type JSX, type RefObject } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { createFrameLoader, frameIndex, selectFrameWidth, type FrameManifest } from "@/lib/media/frames";

interface ActiveSequenceProps {
  target: RefObject<HTMLDivElement | null>;
  manifest: FrameManifest;
  src: string;
  fit: "cover" | "contain";
  positionX: number;
  blurFill: boolean;
  progress: MotionValue<number>;
  initialCount?: number;
}

export function ActiveSequence({ target, manifest, src, fit, positionX, blurFill, progress, initialCount }: ActiveSequenceProps): JSX.Element {
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
        frames = createFrameLoader({ src, width, count: manifest.count, initialCount, onLoad: requestDraw });
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
  }, [blurFill, fit, positionX, index, initialCount, manifest, progress, scrollYProgress, src, target]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}


export interface FrameManifest {
  count: number;
  fps: number;
  widths: number[];
  /** Display width / height, including the source video's pixel aspect ratio. */
  aspect: number;
  poster: string;
}

export function parseFrameManifest(value: unknown): FrameManifest {
  const manifest = value as FrameManifest | null;
  if (!manifest || !Number.isInteger(manifest.count) || manifest.count < 1
    || !Number.isFinite(manifest.fps) || manifest.fps <= 0
    || !Array.isArray(manifest.widths) || !manifest.widths.length
    || manifest.widths.some((width) => !Number.isInteger(width) || width <= 0)
    || new Set(manifest.widths).size !== manifest.widths.length
    || !Number.isFinite(manifest.aspect) || manifest.aspect <= 0
    || typeof manifest.poster !== "string" || !manifest.poster.trim()) {
    throw new Error("Invalid frame manifest.");
  }
  return manifest;
}

/** Indices are zero-based; both scroll endpoints must be reachable. */
export function frameIndex(progress: number, count: number): number {
  if (!Number.isFinite(progress) || count <= 1) return 0;
  return Math.round(Math.max(0, Math.min(1, progress)) * (count - 1));
}

export function selectFrameWidth(widths: number[], viewportWidth: number): number {
  const sorted = [...widths].sort((a, b) => a - b);
  if (viewportWidth < 768) return sorted.includes(960) ? 960 : sorted[0];
  const desired = viewportWidth;
  return sorted.find((width) => width >= desired) ?? sorted[sorted.length - 1];
}

export function sequenceAssetURL(src: string, file: string): string {
  const base = new URL(src, "https://frames.invalid");
  const resolved = new URL(file, base);
  return /^https?:\/\//.test(src) ? resolved.href : `${resolved.pathname}${resolved.search}`;
}

export function frameURL(src: string, width: number, index: number): string {
  return sequenceAssetURL(src, `${width}/frame-${String(index + 1).padStart(4, "0")}.webp`);
}

interface FrameLoaderOptions {
  src: string;
  width: number;
  count: number;
  onLoad: () => void;
}

/** A demand-driven window: no timers, duplicate requests or eager full-sequence download. */
export function createFrameLoader({ src, width, count, onLoad }: FrameLoaderOptions) {
  const images = new Map<number, HTMLImageElement>();
  const loaded = new Map<number, HTMLImageElement>();
  let queue: number[] = [];
  let active = 0;
  let disposed = false;
  let paused = false;
  const concurrency = 6;
  const lookAhead = 15;

  function drain(): void {
    while (!disposed && !paused && active < concurrency && queue.length) {
      const index = queue.shift()!;
      if (images.has(index)) continue;
      const image = new Image();
      images.set(index, image);
      active += 1;
      image.decoding = "async";
      function complete(success: boolean): void {
        if (disposed) return;
        image.onload = null;
        image.onerror = null;
        active -= 1;
        if (success) {
          loaded.set(index, image);
          onLoad();
        }
        drain();
      }
      image.onload = () => complete(true);
      image.onerror = () => complete(false);
      image.src = frameURL(src, width, index);
    }
  }

  function enqueue(indices: number[]): void {
    if (disposed) return;
    queue = [...new Set([...indices, ...queue])].filter((index) => !images.has(index));
    drain();
  }

  return {
    setPaused(value: boolean): void {
      paused = value;
      // Discard obsolete look-ahead work; resuming enqueues the current scroll window.
      if (paused) queue = [];
      else drain();
    },
    preloadInitial(): void {
      enqueue(Array.from({ length: Math.min(lookAhead, count) }, (_, index) => index));
    },
    preloadAround(index: number): void {
      const target = Math.max(0, Math.min(count - 1, index));
      // Requested frame first, then forward buffer and a small reverse buffer.
      enqueue([
        ...Array.from({ length: Math.min(lookAhead, count - target) }, (_, offset) => target + offset),
        ...Array.from({ length: Math.min(3, target) }, (_, offset) => target - offset - 1),
      ]);
    },
    nearest(index: number): { index: number; image: HTMLImageElement } | undefined {
      let nearest: { index: number; image: HTMLImageElement } | undefined;
      for (const [candidate, image] of loaded) {
        if (!nearest || Math.abs(candidate - index) < Math.abs(nearest.index - index)) {
          nearest = { index: candidate, image };
        }
      }
      return nearest;
    },
    dispose(): void {
      disposed = true;
      queue = [];
      for (const image of images.values()) {
        image.onload = null;
        image.onerror = null;
        image.removeAttribute("src");
      }
      images.clear();
      loaded.clear();
    },
  };
}

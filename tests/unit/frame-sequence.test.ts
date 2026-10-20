import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { MotionValue } from "motion/react";

import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";

import {
  createFrameLoader,
  frameIndex,
  frameURL,
  parseFrameManifest,
  selectFrameWidth,
  sequenceAssetURL,
} from "@/lib/media/frames";

const motionState = vi.hoisted(() => ({ progress: null as MotionValue<number> | null }));
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  motionState.progress = actual.motionValue(0);
  return { ...actual, useScroll: () => ({ scrollYProgress: motionState.progress }) };
});

const manifest = { count: 48, fps: 24, widths: [1920, 960], aspect: 16 / 9, poster: "poster.webp" };

class MockImage {
  static requests: MockImage[] = [];
  src = "";
  decoding = "auto";
  naturalWidth = 960;
  naturalHeight = 540;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() { MockImage.requests.push(this); }
  removeAttribute(): void { this.src = ""; }
  load(): void { this.onload?.(); }
  fail(): void { this.onerror?.(); }
}

beforeEach(() => {
  MockImage.requests = [];
  vi.stubGlobal("Image", MockImage);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("frame selection and manifest contract", () => {
  it.each([
    [-1, 120, 0], [0, 120, 0], [0.5, 120, 60], [1, 120, 119],
    [2, 120, 119], [0.8, 1, 0], [NaN, 120, 0], [0.2, 0, 0],
  ])("maps progress %s with %s frames to %s", (progress, count, expected) => {
    expect(frameIndex(progress, count)).toBe(expected);
  });

  it("selects mobile 960 independently of DPR and desktop by viewport width", () => {
    expect(selectFrameWidth(manifest.widths, 390)).toBe(960);
    expect(selectFrameWidth(manifest.widths, 767)).toBe(960);
    expect(selectFrameWidth(manifest.widths, 768)).toBe(960);
    expect(selectFrameWidth(manifest.widths, 1440)).toBe(1920);
    expect(selectFrameWidth(manifest.widths, 2560)).toBe(1920);
    expect(selectFrameWidth([640, 1280], 390)).toBe(640);
  });

  it("resolves zero-based frame indices relative to the manifest", () => {
    expect(frameURL("/media/demo/manifest.json", 960, 0)).toBe("/media/demo/960/frame-0001.webp");
    expect(frameURL("https://cdn.example/scene/manifest.json", 1920, 47)).toBe("https://cdn.example/scene/1920/frame-0048.webp");
    expect(parseFrameManifest(manifest)).toEqual(manifest);
    expect(sequenceAssetURL("/scene/manifest.json?version=1", "poster.webp")).toBe("/scene/poster.webp");
  });

  it.each([
    null, {}, { ...manifest, count: 0 }, { ...manifest, count: 1.5 },
    { ...manifest, fps: 0 }, { ...manifest, widths: [] },
    { ...manifest, widths: [960, 960] }, { ...manifest, widths: [-1] },
    { ...manifest, aspect: 0 }, { ...manifest, poster: "" },
  ])("rejects malformed manifest %j before scheduling requests", (value) => {
    expect(() => parseFrameManifest(value)).toThrow(/manifest/i);
  });
});

describe("sequence lifecycle and fallback content", () => {
  let reduce: boolean;
  let near: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
  let resized: (() => void) | undefined;
  const mediaListeners = new Set<() => void>();
  const context = { drawImage: vi.fn(), setTransform: vi.fn(), clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), filter: "none" };
  const disconnect = vi.fn();
  let visible: DocumentVisibilityState;

  beforeEach(() => {
    reduce = false;
    visible = "visible";
    near = undefined;
    resized = undefined;
    mediaListeners.clear();
    disconnect.mockClear();
    for (const fn of [context.drawImage, context.setTransform, context.clearRect, context.save, context.restore]) fn.mockClear();
    motionState.progress!.set(0);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() { return query.includes("reduced") ? reduce : true; },
      addEventListener: (_: string, callback: () => void) => mediaListeners.add(callback),
      removeEventListener: (_: string, callback: () => void) => mediaListeners.delete(callback),
    }));
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: typeof near) { near = callback; }
      observe(): void {} disconnect = disconnect;
    });
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) { resized = callback; }
      observe(): void {} disconnect = disconnect;
    });
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visible);
    vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(390);
    vi.spyOn(HTMLCanvasElement.prototype, "clientHeight", "get").mockReturnValue(900);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  });

  async function mount(props: Partial<Parameters<typeof ScrollFrameSequence>[0]> = {}) {
    const sequenceProps = { src: "/fixture/manifest.json", children: createElement("a", { href: "#end" }, "Devam"), ...props };
    const view = render(createElement(ScrollFrameSequence, sequenceProps));
    await waitFor(() => expect(view.container.querySelector("[data-frame-sequence]")?.getAttribute("data-status")).toBe("ready"));
    const poster = view.container.querySelector("img")!;
    fireEvent.load(poster);
    return view;
  }

  it("keeps reduced motion poster-only and skips all frame requests", async () => {
    reduce = true;
    const view = await mount({ children: (progress) => createElement("p", null, `İlerleme ${progress.get()}`) });
    expect(screen.getByText("İlerleme 0")).toBeTruthy();
    expect(view.container.querySelector("canvas")).toBeNull();
    expect(MockImage.requests).toHaveLength(0);
    expect((view.container.firstElementChild as HTMLElement).style.height).toBe("100vh");
  });

  it("waits for proximity before extending the initial buffer and cancels on unmount", async () => {
    const view = await mount();
    for (let i = 0; i < 3; i++) act(() => { [...MockImage.requests].forEach((image) => image.onload && image.load()); });
    expect(MockImage.requests).toHaveLength(15);
    act(() => motionState.progress!.set(1));
    await waitFor(() => expect(view.container.querySelector("canvas")?.dataset.frame).toBe("14"));
    expect(MockImage.requests).toHaveLength(15);
    act(() => near?.([{ isIntersecting: true }]));
    expect(MockImage.requests.some((image) => image.src.endsWith("frame-0048.webp"))).toBe(true);
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(mediaListeners.size).toBe(0);
    expect(MockImage.requests.every((image) => !image.onload && !image.onerror)).toBe(true);
  });

  it("uses a blurred cover layer only for contain, redraws on resize and pauses in a hidden tab", async () => {
    const view = await mount({ fit: "contain", blurFill: true });
    act(() => MockImage.requests[0].load());
    await waitFor(() => expect(view.container.querySelector("canvas")?.dataset.frame).toBe("0"));
    expect(context.save).toHaveBeenCalled();
    expect(context.restore).toHaveBeenCalled();
    visible = "hidden";
    context.drawImage.mockClear();
    act(() => resized?.());
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(context.drawImage).not.toHaveBeenCalled();
    visible = "visible";
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await waitFor(() => expect(context.drawImage).toHaveBeenCalled());
  });

  it("switches to one static poster without duplicating media when preference changes", async () => {
    const view = await mount();
    expect(view.container.querySelectorAll("img")).toHaveLength(1);
    act(() => { reduce = true; mediaListeners.forEach((callback) => callback()); });
    expect(view.container.querySelectorAll("img")).toHaveLength(1);
    expect(view.container.querySelector("canvas")).toBeNull();
    expect(screen.getByRole("link", { name: "Devam" })).toBeTruthy();
  });

  it("leaves text usable after manifest, validation or poster errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    const failed = render(createElement(ScrollFrameSequence, { src: "/failed.json" }, "İçerik"));
    await screen.findByRole("status");
    expect(screen.getByText("İçerik")).toBeTruthy();
    failed.unmount();
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ count: 0 }) } as Response);
    const invalid = render(createElement(ScrollFrameSequence, { src: "/invalid.json" }));
    await screen.findByRole("status");
    invalid.unmount();
    const view = await mount();
    fireEvent.error(view.container.querySelector("img")!);
    expect(screen.getByRole("status").textContent).toContain("Görsel yüklenemedi");
    expect(view.container.querySelector("canvas")).toBeNull();
  });

  it("aborts stale manifest requests and ignores late completions", async () => {
    let finish: ((value: Response) => void) | undefined;
    let signal: AbortSignal | undefined;
    vi.mocked(fetch).mockImplementationOnce((_, options) => {
      signal = options?.signal as AbortSignal;
      return new Promise<Response>((resolve) => { finish = resolve; });
    });
    const view = render(createElement(ScrollFrameSequence, { src: "/slow.json" }));
    view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => { finish?.({ ok: true, json: async () => manifest } as Response); });
    expect(MockImage.requests).toHaveLength(0);
  });
});

describe("bounded progressive loading", () => {
  const loaders: ReturnType<typeof createFrameLoader>[] = [];
  function loader(count = 48) {
    const instance = createFrameLoader({ src: "/media/demo/manifest.json", width: 960, count, onLoad: vi.fn() });
    loaders.push(instance);
    return instance;
  }
  function finishPending(): void {
    for (const image of [...MockImage.requests]) if (image.onload) image.load();
  }
  afterEach(() => { loaders.splice(0).forEach((instance) => instance.dispose()); });

  it("requests only the first 15 frames initially, with at most six requests in flight", () => {
    const frames = loader();
    frames.preloadInitial();
    expect(MockImage.requests.map((image) => image.src)).toEqual(
      Array.from({ length: 6 }, (_, i) => `/media/demo/960/frame-${String(i + 1).padStart(4, "0")}.webp`),
    );
    for (let i = 0; i < 3; i++) {
      expect(MockImage.requests.filter((image) => image.onload).length).toBeLessThanOrEqual(6);
      finishPending();
    }
    expect(MockImage.requests).toHaveLength(15);
    frames.preloadInitial();
    expect(MockImage.requests).toHaveLength(15);
  });

  it("prioritizes a jumped-to frame, then preloads ahead without loading the entire sequence", () => {
    const frames = loader();
    frames.preloadInitial();
    frames.preloadAround(30);
    MockImage.requests[0].load();
    expect(MockImage.requests[6].src).toContain("frame-0031.webp");
    for (let i = 0; i < 10; i++) finishPending();
    expect(MockImage.requests.length).toBeLessThan(48);
    expect(new Set(MockImage.requests.map((image) => image.src)).size).toBe(MockImage.requests.length);
    expect(frames.nearest(30)?.index).toBe(30);
  });

  it("draws the nearest loaded frame and keeps draining the queue after an error", () => {
    const frames = loader(4);
    frames.preloadInitial();
    expect(frames.nearest(2)).toBeUndefined();
    MockImage.requests[0].load();
    MockImage.requests[3].load();
    MockImage.requests[2].fail();
    expect(frames.nearest(2)?.index).toBe(3);
    expect(frames.nearest(1)?.index).toBe(0);
    expect(frames.nearest(3)?.image).toBe(MockImage.requests[3]);
  });

  it("cancels queued work and releases images on disposal", () => {
    const frames = loader();
    frames.preloadInitial();
    const staleLoad = MockImage.requests[0].onload;
    frames.dispose();
    staleLoad?.();
    frames.preloadAround(40);
    expect(MockImage.requests).toHaveLength(6);
    expect(MockImage.requests.every((image) => !image.onload && !image.onerror && !image.src)).toBe(true);
    expect(frames.nearest(0)).toBeUndefined();
  });
});

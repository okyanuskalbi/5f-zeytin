import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createFrameLoader,
  frameIndex,
  frameURL,
  parseFrameManifest,
  selectFrameWidth,
} from "@/lib/media/frames";

const manifest = { count: 48, fps: 24, widths: [1920, 960], aspect: 16 / 9, poster: "poster.webp" };

class MockImage {
  static requests: MockImage[] = [];
  src = "";
  decoding = "auto";
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
afterEach(() => vi.unstubAllGlobals());

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

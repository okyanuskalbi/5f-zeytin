import { useRef } from "react";
import { motionValue } from "framer-motion";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CinematicScrub } from "@/components/media/CinematicScrub";

let eligible: boolean, saveData: boolean, visibility: DocumentVisibilityState;
let intersection: IntersectionObserverCallback;
const preferences = new Set<() => void>();
const disconnect = vi.fn(), onMode = vi.fn();
const fetchMovie = vi.fn();
const frames = new Map<number, FrameRequestCallback>();
let counter = 0;
const progress = motionValue(0);

function Harness() {
  const scene = useRef<HTMLElement>(null);
  return <section ref={scene}><CinematicScrub progress={progress} scene={scene} onMode={onMode} /></section>;
}
beforeEach(() => {
  eligible = true; saveData = false; visibility = "visible";
  preferences.clear(); frames.clear(); counter = 0; progress.set(0);
  onMode.mockReset(); disconnect.mockReset(); fetchMovie.mockReset();
  fetchMovie.mockResolvedValue(new Response(new Blob(["accepted film"], { type: "video/mp4" })));
  vi.stubGlobal("fetch", fetchMovie);
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return eligible; },
    addEventListener: (_: string, fn: () => void) => preferences.add(fn),
    removeEventListener: (_: string, fn: () => void) => preferences.delete(fn),
  }));
  Object.defineProperty(navigator, "connection", { configurable: true, value: {
    get saveData() { return saveData; }, addEventListener() {}, removeEventListener() {},
  } });
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:afina-film");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.stubGlobal("IntersectionObserver", class {
    constructor(fn: IntersectionObserverCallback) { intersection = fn; }
    observe() {} disconnect = disconnect;
  });
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { frames.set(++counter, fn); return counter; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => { frames.delete(id); });
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  vi.useRealTimers();
  delete (navigator as Navigator & { connection?: unknown }).connection;
});
async function enter(isIntersecting = true) {
  await act(async () => { intersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver); });
}
function tick(time: number) {
  act(() => { const waiting = [...frames]; frames.clear(); waiting.forEach(([, fn]) => fn(time)); });
}

it.each(["ineligible screen/reduced", "save data", "low hardware"])("never requests the movie under the %s static policy", async policy => {
  if (policy === "ineligible screen/reduced") eligible = false;
  if (policy === "save data") saveData = true;
  if (policy === "low hardware") vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(2);
  const { container } = render(<Harness />);
  await enter();
  expect(fetchMovie).not.toHaveBeenCalled();
  expect(container.querySelector("video")?.hasAttribute("src")).toBe(false);
  expect(container.querySelector("img")?.getAttribute("fetchpriority")).toBe("high");
});

it("waits for a decoded frame, scrubs in both directions, rests and cleans up", async () => {
  const view = render(<Harness />);
  expect(fetchMovie).not.toHaveBeenCalled();
  await enter();
  const video = view.container.querySelector("video")!;
  expect(fetchMovie).toHaveBeenCalledWith("/videos/afina-hasat-scrub.mp4", expect.objectContaining({ priority: "low" }));
  expect(video.src).toBe("blob:afina-film");
  expect(video.preload).toBe("auto");
  fireEvent.loadedMetadata(video);
  expect(onMode).not.toHaveBeenCalledWith(true);
  Object.defineProperty(video, "duration", { value: 8 });
  fireEvent.canPlay(video); tick(16);
  expect(onMode).toHaveBeenCalledWith(true);
  expect(frames.size).toBe(0);
  act(() => progress.set(.8)); tick(32);
  const forward = video.currentTime;
  expect(forward).toBeGreaterThan(0);
  fireEvent.seeked(video);
  act(() => progress.set(0)); tick(48);
  expect(video.currentTime).toBeLessThan(forward);
  fireEvent.seeked(video);
  act(() => { visibility = "hidden"; document.dispatchEvent(new Event("visibilitychange")); });
  expect(frames.size).toBe(0);
  view.unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:afina-film");
  expect(disconnect).toHaveBeenCalledOnce(); expect(preferences.size).toBe(0);
});

it("releases the source and rearms correctly when motion policy flips in both directions", async () => {
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  fireEvent.canPlay(video);
  act(() => { eligible = false; preferences.forEach(fn => fn()); });
  expect(video.hasAttribute("src")).toBe(false);
  expect(video.preload).toBe("none");
  expect(onMode).toHaveBeenLastCalledWith(false);
  fetchMovie.mockResolvedValue(new Response(new Blob(["again"])));
  await act(async () => { eligible = true; preferences.forEach(fn => fn()); });
  expect(video.src).toBe("blob:afina-film");
  fireEvent.canPlay(video); expect(onMode).toHaveBeenLastCalledWith(true);
});

it("keeps the complete poster on failed downloads and media errors", async () => {
  fetchMovie.mockRejectedValue(Error("missing"));
  const { container } = render(<Harness />); await enter();
  expect(container.querySelector("video")?.hasAttribute("src")).toBe(false);
  expect(container.querySelector("[data-painted]")?.getAttribute("data-painted")).toBe("false");
  expect(container.querySelector("picture img")).not.toBeNull();
  expect(onMode).toHaveBeenLastCalledWith(false);
});

it("returns a decoded movie to the native poster after a decoder error", async () => {
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  fireEvent.canPlay(video); expect(onMode).toHaveBeenLastCalledWith(true);
  fireEvent.error(video);
  expect(video.hasAttribute("src")).toBe(false);
  expect(container.querySelector("[data-painted]")?.getAttribute("data-painted")).toBe("false");
  expect(onMode).toHaveBeenLastCalledWith(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:afina-film");
  expect(frames.size).toBe(0);
});

it.each(["offscreen", "hidden"] as const)("aborts an unfinished download when %s, ignores its late result and reloads only on return", async state => {
  let finish!: (response: Response) => void;
  fetchMovie.mockReturnValueOnce(new Promise<Response>(resolve => { finish = resolve; }));
  const { container } = render(<Harness />);
  await enter();
  const signal = fetchMovie.mock.calls[0][1].signal as AbortSignal;
  if (state === "offscreen") await enter(false);
  else act(() => { visibility = "hidden"; document.dispatchEvent(new Event("visibilitychange")); });
  expect(signal.aborted).toBe(true);
  await act(async () => finish(new Response(new Blob(["late film"]))));
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  expect(container.querySelector("video")!.hasAttribute("src")).toBe(false);
  expect(onMode).not.toHaveBeenCalledWith(true);
  expect(frames.size).toBe(0);
  if (state === "offscreen") await enter();
  else await act(async () => { visibility = "visible"; document.dispatchEvent(new Event("visibilitychange")); });
  expect(fetchMovie).toHaveBeenCalledTimes(2);
  fireEvent.canPlay(container.querySelector("video")!);
  expect(onMode).toHaveBeenLastCalledWith(true);
});

it("ignores a late response body after a newer download has already attached", async () => {
  let finish!: (blob: Blob) => void;
  fetchMovie.mockResolvedValueOnce({ ok: true, headers: new Headers(), blob: () => new Promise<Blob>(resolve => { finish = resolve; }) });
  const { container } = render(<Harness />);
  await enter(); await enter(false); await enter();
  expect(fetchMovie).toHaveBeenCalledTimes(2);
  expect(URL.createObjectURL).toHaveBeenCalledOnce();
  await act(async () => finish(new Blob(["obsolete response body"])));
  expect(URL.createObjectURL).toHaveBeenCalledOnce();
  expect(container.querySelector("video")!.src).toBe("blob:afina-film");
  fireEvent.canPlay(container.querySelector("video")!);
  expect(onMode).toHaveBeenLastCalledWith(true);
});

it("drops pending seeks while offscreen and never arms their watchdog from a late seeked event", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  Object.defineProperty(video, "duration", { value: 8 });
  const writes = vi.spyOn(video, "currentTime", "set");
  fireEvent.canPlay(video); tick(16);
  act(() => progress.set(.8)); tick(32); tick(48);
  expect(writes).toHaveBeenCalledTimes(1);
  await enter(false);
  fireEvent.seeked(video);
  expect(writes).toHaveBeenCalledTimes(1);
  act(() => vi.advanceTimersByTime(5000));
  expect(video.hasAttribute("src")).toBe(true);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
});

it("pauses an active seek deadline in a hidden document and safely resumes an unfinished native seek", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  Object.defineProperty(video, "duration", { value: 8 });
  let seeking = false;
  vi.spyOn(video, "seeking", "get").mockImplementation(() => seeking);
  const writes = vi.spyOn(video, "currentTime", "set");
  fireEvent.canPlay(video); tick(16);
  act(() => progress.set(.8)); tick(32); seeking = true;
  act(() => { visibility = "hidden"; document.dispatchEvent(new Event("visibilitychange")); vi.advanceTimersByTime(5000); });
  expect(video.hasAttribute("src")).toBe(true);
  expect(frames.size).toBe(0);
  act(() => { visibility = "visible"; document.dispatchEvent(new Event("visibilitychange")); });
  tick(48);
  expect(writes).toHaveBeenCalledTimes(1);
  seeking = false; fireEvent.seeked(video); tick(64);
  expect(writes).toHaveBeenCalledTimes(2);
});

it("returns to the complete poster if a native seek setter throws", async () => {
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  Object.defineProperty(video, "duration", { value: 8 });
  fireEvent.canPlay(video); tick(16);
  vi.spyOn(video, "currentTime", "set").mockImplementation(() => { throw new DOMException("decoder unavailable", "InvalidStateError"); });
  act(() => progress.set(.8)); tick(32);
  expect(video.hasAttribute("src")).toBe(false);
  expect(container.querySelector("[data-painted]")!.getAttribute("data-painted")).toBe("false");
  expect(container.querySelector("picture img")).not.toBeNull();
  expect(onMode).toHaveBeenLastCalledWith(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:afina-film");
  expect(frames.size).toBe(0);
});

it.each(["download", "seek"] as const)("keeps the poster fallback when an active %s never completes", async operation => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  if (operation === "download") fetchMovie.mockReturnValue(new Promise<Response>(() => {}));
  const { container } = render(<Harness />); await enter();
  const video = container.querySelector("video")!;
  if (operation === "seek") {
    Object.defineProperty(video, "duration", { value: 8 });
    fireEvent.canPlay(video); tick(16);
    act(() => progress.set(.8)); tick(32);
  }
  act(() => vi.advanceTimersByTime(operation === "seek" ? 4001 : 20001));
  expect(video.hasAttribute("src")).toBe(false);
  expect(container.querySelector("[data-painted]")!.getAttribute("data-painted")).toBe("false");
  expect(container.querySelector("picture img")).not.toBeNull();
  expect(frames.size).toBe(0);
  expect((fetchMovie.mock.calls[0][1].signal as AbortSignal).aborted).toBe(true);
});

it.each([
  { width: 320, height: 640, coarse: true, reduced: false, expected: true },
  { width: 390, height: 844, coarse: true, reduced: false, expected: true },
  { width: 390, height: 639, coarse: true, reduced: false, expected: false },
  { width: 319, height: 844, coarse: true, reduced: false, expected: false },
  { width: 844, height: 390, coarse: true, reduced: false, expected: false },
  { width: 390, height: 844, coarse: true, reduced: true, expected: false },
  { width: 390, height: 844, coarse: false, reduced: false, expected: false },
  { width: 1023, height: 1200, coarse: true, reduced: false, expected: true },
  { width: 1024, height: 1200, coarse: true, reduced: false, expected: false },
  { width: 1440, height: 900, coarse: false, reduced: false, expected: true },
  { width: 1440, height: 900, coarse: false, reduced: true, expected: false },
])("evaluates the actual screen policy at $width×$height (reduced=$reduced)", async viewport => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.split(",").some(branch => [...branch.matchAll(/\(([-\w]+)\s*:\s*([^)]*)\)/g)].every(([, feature, value]) => {
      if (feature === "prefers-reduced-motion") return (value === "reduce") === viewport.reduced;
      if (feature === "pointer") return value === (viewport.coarse ? "coarse" : "fine");
      if (feature === "hover") return value === (viewport.coarse ? "none" : "hover");
      if (feature === "orientation") return value === (viewport.height >= viewport.width ? "portrait" : "landscape");
      const dimension = /^(min|max)-(width|height)$/.exec(feature);
      if (!dimension) return false;
      const size = viewport[dimension[2] as "width" | "height"];
      return dimension[1] === "min" ? size >= Number.parseFloat(value) : size <= Number.parseFloat(value);
    })),
    addEventListener() {}, removeEventListener() {},
  }));
  render(<Harness />); await enter();
  expect(fetchMovie.mock.calls.length).toBe(viewport.expected ? 1 : 0);
});

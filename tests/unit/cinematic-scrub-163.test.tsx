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
  delete (navigator as Navigator & { connection?: unknown }).connection;
});
async function enter(isIntersecting = true) {
  await act(async () => { intersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver); });
}
function tick(time: number) {
  act(() => { const waiting = [...frames]; frames.clear(); waiting.forEach(([, fn]) => fn(time)); });
}

it.each(["touch/phone/short/reduced", "save data", "low hardware"])("never requests the movie under the %s static policy", async policy => {
  if (policy === "touch/phone/short/reduced") eligible = false;
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

it("does not insert a tall scene above a visitor who left during the download", async () => {
  let finish!: (response: Response) => void;
  fetchMovie.mockReturnValue(new Promise<Response>(resolve => { finish = resolve; }));
  const { container } = render(<Harness />);
  await enter(); await enter(false);
  await act(async () => finish(new Response(new Blob(["late film"]))));
  fireEvent.canPlay(container.querySelector("video")!);
  expect(onMode).not.toHaveBeenCalledWith(true);
  expect(frames.size).toBe(0);
  await enter();
  expect(onMode).toHaveBeenLastCalledWith(true);
});

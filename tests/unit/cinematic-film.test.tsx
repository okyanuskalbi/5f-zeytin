import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CinematicFilm } from "@/components/media/CinematicFilm";

let reduced: boolean;
let saveData: boolean;
let visibility: DocumentVisibilityState;
let intersection: IntersectionObserverCallback;
const preferenceListeners = new Set<() => void>();
const connectionListeners = new Set<() => void>();
const disconnect = vi.fn();
let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  reduced = false;
  saveData = false;
  visibility = "visible";
  preferenceListeners.clear();
  connectionListeners.clear();
  disconnect.mockClear();
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reduced; },
    addEventListener: (_: string, callback: () => void) => preferenceListeners.add(callback),
    removeEventListener: (_: string, callback: () => void) => preferenceListeners.delete(callback),
  }));
  Object.defineProperty(navigator, "connection", { configurable: true, value: {
    get saveData() { return saveData; },
    addEventListener: (_: string, callback: () => void) => connectionListeners.add(callback),
    removeEventListener: (_: string, callback: () => void) => connectionListeners.delete(callback),
  } });
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersection = callback; }
    observe(): void {}
    disconnect = disconnect;
  });
  play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (navigator as Navigator & { connection?: unknown }).connection; });

function enter(isIntersecting = true): void {
  act(() => intersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
}
function changeVisibility(next: DocumentVisibilityState): void {
  act(() => { visibility = next; document.dispatchEvent(new Event("visibilitychange")); });
}

describe("cinematic film lifecycle", () => {
  it("ships the eager responsive poster in SSR without any movie URL or preload", () => {
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = renderToStaticMarkup(<CinematicFilm />);
    expect(doc.querySelector("img")?.getAttribute("src")).toBe("/frames/afina-agac-dal/poster-desktop.webp");
    expect(doc.querySelector("img")?.getAttribute("loading")).toBe("eager");
    expect(doc.querySelector('picture source[media*="portrait"][type="image/avif"]')?.getAttribute("srcset"))
      .toBe("/frames/afina-agac-dal/poster-desktop.avif 1280w");
    expect(doc.querySelector("video")?.hasAttribute("src")).toBe(false);
    expect(doc.querySelector("source[src],link[as=video]")).toBeNull();
    expect(doc.body.innerHTML).not.toContain("/videos/afina-agac-dal.mp4");
  });

  it("attaches and plays the muted inline film only after the visible hero enters view", async () => {
    const { container } = render(<CinematicFilm />);
    const video = container.querySelector("video")!;
    expect(video.hasAttribute("src")).toBe(false);
    expect(play).not.toHaveBeenCalled();
    enter();
    expect(video.getAttribute("src")).toBe("/videos/afina-agac-dal.mp4");
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.loop).toBe(false);
    expect(video.preload).toBe("metadata");
    expect(play).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("false");
    fireEvent.playing(video);
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("true");
    expect(screen.getByRole("button", { name: "Filmi duraklat" })).toBeTruthy();
  });

  it.each(["reduced motion", "save data"])("keeps %s poster-only and revokes an active source when the preference changes", (preference) => {
    const view = render(<CinematicFilm />);
    const video = view.container.querySelector("video")!;
    enter();
    fireEvent.playing(video);
    act(() => {
      if (preference === "reduced motion") {
        reduced = true;
        preferenceListeners.forEach(callback => callback());
      } else {
        saveData = true;
        connectionListeners.forEach(callback => callback());
      }
    });
    expect(video.hasAttribute("src")).toBe(false);
    expect(view.container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("false");
    expect(pause).toHaveBeenCalled();
    view.unmount();
    const blocked = render(<CinematicFilm />);
    enter();
    expect(blocked.container.querySelector("video")?.hasAttribute("src")).toBe(false);
  });

  it("pauses when offscreen or hidden and never reverses a user's pause on return", () => {
    const { container } = render(<CinematicFilm />);
    const video = container.querySelector("video")!;
    enter();
    fireEvent.playing(video);
    const calls = play.mock.calls.length;
    enter(false);
    expect(pause).toHaveBeenCalled();
    enter();
    expect(play.mock.calls.length).toBe(calls + 1);
    fireEvent.playing(video);
    fireEvent.click(screen.getByRole("button", { name: "Filmi duraklat" }));
    const afterUserPause = play.mock.calls.length;
    changeVisibility("hidden");
    changeVisibility("visible");
    enter(false);
    enter();
    expect(play.mock.calls.length).toBe(afterUserPause);
    expect(screen.getByRole("button", { name: "Filmi oynat" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Filmi oynat" }));
    expect(play.mock.calls.length).toBe(afterUserPause + 1);
  });

  it("does not download while hidden, then holds the final frame until an explicit replay", () => {
    visibility = "hidden";
    const { container } = render(<CinematicFilm />);
    const video = container.querySelector("video")!;
    enter();
    expect(video.hasAttribute("src")).toBe(false);
    changeVisibility("visible");
    fireEvent.playing(video);
    fireEvent.ended(video);
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("true");
    const calls = play.mock.calls.length;
    changeVisibility("hidden");
    changeVisibility("visible");
    enter(false);
    enter();
    expect(play.mock.calls.length).toBe(calls);
    video.currentTime = 7.9;
    fireEvent.click(screen.getByRole("button", { name: "Yeniden oynat" }));
    expect(video.currentTime).toBe(0);
    expect(play.mock.calls.length).toBe(calls + 1);
  });

  it("offers manual playback after autoplay rejection and retains the poster until playing", async () => {
    play.mockRejectedValueOnce(new DOMException("Gesture required", "NotAllowedError"));
    const { container } = render(<CinematicFilm />);
    enter();
    await act(async () => {});
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Filmi oynat" }));
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent.playing(container.querySelector("video")!);
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("true");
  });

  it("keeps manual playback available if both automatic and explicit playback are rejected", async () => {
    play.mockRejectedValue(new DOMException("Playback unavailable", "NotAllowedError"));
    const { container } = render(<CinematicFilm />);
    enter();
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Filmi oynat" }));
    await act(async () => {});
    expect(play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Filmi oynat" })).toBeTruthy();
    expect(container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("false");
  });

  it("restores the poster on media failure and cleans up listeners on unmount", () => {
    const view = render(<CinematicFilm />);
    enter();
    fireEvent.playing(view.container.querySelector("video")!);
    fireEvent.error(view.container.querySelector("video")!);
    expect(view.container.querySelector("[data-cinematic-film]")?.getAttribute("data-show-film")).toBe("false");
    expect(screen.getByRole("status").textContent).toContain("Film açılamadı");
    view.unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(preferenceListeners.size).toBe(0);
    expect(connectionListeners.size).toBe(0);
  });
});

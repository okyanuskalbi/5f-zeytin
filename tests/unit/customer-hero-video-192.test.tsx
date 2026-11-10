import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CustomerHeroVideo } from "@/components/landing/CustomerHeroVideo";
import { CustomerMarquee } from "@/components/landing/CustomerMarquee";

let reduced = false;
beforeEach(() => {
  reduced = false;
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("waits for the poster paint, loads a silent looping video with no preload and respects the pause control", async () => {
  const { container } = render(<CustomerHeroVideo />);
  expect(container.querySelector("video")).toBeNull();
  fireEvent.load(container.querySelector("img")!);
  await act(async () => { vi.advanceTimersByTime(300); });
  const video = container.querySelector("video")!;
  expect(video).not.toBeNull();
  expect(video.preload).toBe("none");
  expect(video.autoplay).toBe(true);
  expect(video.muted).toBe(true);
  expect(video.loop).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.querySelectorAll("source")).toHaveLength(3);
  // Media sits below the hero overlay; controls must escape that stacking layer.
  expect(video.parentElement?.contains(screen.getByRole("button", { name: "Videoyu oynat" }))).toBe(false);
  fireEvent.play(video);
  Object.defineProperty(video, "paused", { configurable: true, value: false });
  fireEvent.click(screen.getByRole("button", { name: "Videoyu duraklat" }));
  expect(video.pause).toHaveBeenCalled();
  fireEvent.error(video);
  expect(container.querySelector("video")).toBeNull();
  expect(container.querySelector("img")).not.toBeNull();
});

it("does not request a video when reduced motion is selected", async () => {
  reduced = true;
  const { container } = render(<CustomerHeroVideo />);
  fireEvent.load(container.querySelector("img")!);
  await act(async () => { vi.advanceTimersByTime(2000); });
  expect(container.querySelector("video, source[type='video/mp4']")).toBeNull();
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});

it("allows the explicitly requested time based strip to be paused and reads its words once", () => {
  const { container } = render(<CustomerMarquee />);
  expect(container.querySelector('[aria-hidden="true"]')?.textContent).toContain("Geleneksel Salamura");
  const button = screen.getByRole("button", { name: "Şeridi duraklat" });
  fireEvent.click(button);
  expect(container.querySelector("section")?.getAttribute("data-paused")).toBe("true");
  expect(screen.getByRole("button", { name: "Şeridi oynat" }).getAttribute("aria-pressed")).toBe("true");
});

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HarvestJourney } from "@/components/landing/HarvestJourney";

vi.mock("@/components/media/CinematicScrub", () => ({ CinematicScrub: () => <div data-poster="" /> }));
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  delete (navigator as Navigator & { connection?: unknown }).connection;
  history.replaceState(null, "", "#");
});

function stableStageGeometry() {
  let smallHeight = 760, position = 0;
  vi.stubGlobal("innerHeight", 844); // Toolbar has retracted beyond 100svh.
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => position);
  const scrollTo = vi.fn((options: ScrollToOptions) => { position = options.top ?? position; });
  vi.stubGlobal("scrollTo", scrollTo);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute("data-harvest-journey")) return smallHeight * 4.8;
    if (this.hasAttribute("data-harvest-stage")) return smallHeight;
    return 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return { top: this.hasAttribute("data-harvest-journey") ? -position : 0, height: this.clientHeight } as DOMRect;
  });
  const observers = new Set<{ notify: () => void; targets: Set<Element> }>();
  vi.stubGlobal("ResizeObserver", class {
    targets = new Set<Element>();
    notify: () => void;
    constructor(callback: ResizeObserverCallback) {
      this.notify = () => callback([], this as unknown as ResizeObserver);
      observers.add(this);
    }
    observe(target: Element) { this.targets.add(target); }
    disconnect() { observers.delete(this); this.targets.clear(); }
  });
  return {
    scrollTo, observers,
    resize(height: number) { act(() => { smallHeight = height; observers.forEach(observer => observer.notify()); }); },
  };
}

function markerTop(height: number, progress: number) {
  const element = document.createElement("span");
  element.style.top = `calc((100% - ${height}px) * ${progress})`;
  return element.style.top;
}

it.each([["tesisimiz", .55], ["uretim-yolculugu", .9]] as const)("aligns initial #%s and scene navigation with a 760px stage inside an 844px viewport", (hash, progress) => {
  history.replaceState(null, "", `#${hash}`);
  phonePolicy();
  const { scrollTo } = stableStageGeometry();
  const { container } = render(<HarvestJourney />);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: (3648 - 760) * progress, behavior: "instant" });
  const marker = container.querySelector<HTMLElement>(`#${hash}`)!;
  expect(marker.style.top).toBe(markerTop(760, progress));
  fireEvent.click(screen.getByRole("link", { name: "Sofra" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: (3648 - 760) * .9, behavior: "instant" });
  expect(screen.getByRole("link", { name: "Sofra" }).getAttribute("aria-current")).toBe("step");
  fireEvent.click(screen.getByRole("link", { name: "Üretim" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: (3648 - 760) * .55, behavior: "instant" });
  expect(screen.getByRole("link", { name: "Üretim" }).getAttribute("aria-current")).toBe("step");
});

it("remeasures the held stage, keeps the current hash aligned and disconnects its observer", () => {
  history.replaceState(null, "", "#uretim-yolculugu");
  const policy = phonePolicy();
  const geometry = stableStageGeometry();
  const { container, unmount } = render(<HarvestJourney />);
  const stage = container.querySelector("[data-harvest-stage]");
  expect([...geometry.observers].some(observer => stage && observer.targets.has(stage))).toBe(true);
  geometry.resize(700);
  expect(geometry.scrollTo).toHaveBeenLastCalledWith({ top: (3360 - 700) * .9, behavior: "instant" });
  expect(container.querySelector<HTMLElement>("#uretim-yolculugu")!.style.top).toBe(markerTop(700, .9));
  unmount();
  expect(geometry.observers.size).toBe(0);
  expect(policy.listeners.size).toBe(0);
});

function phonePolicy({ portrait = true, reduced = false, saveData = false, cores = 8 } = {}) {
  const listeners = new Set<() => void>();
  let eligible = portrait;
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return query.includes("prefers-reduced-motion") ? reduced : query.includes("pointer: coarse") && eligible; },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }));
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(cores);
  const connection = Object.assign(new EventTarget(), { saveData });
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  return {
    rotate() { act(() => { eligible = false; listeners.forEach(fn => fn()); }); },
    save() { act(() => { connection.saveData = true; connection.dispatchEvent(new Event("change")); }); },
    listeners,
  };
}

it("enables the shared three-scene journey on a portrait phone without a fine pointer", () => {
  phonePolicy();
  const { container } = render(<HarvestJourney />);
  const journey = container.querySelector("[data-harvest-journey]")!;
  expect(journey.getAttribute("data-mode")).toBe("cinematic");
  expect(journey.getAttribute("data-motion-device")).toBe("touch");
  expect(container.querySelectorAll('[aria-label="Hasat yolculuğu"] a')).toHaveLength(3);
  expect(container.querySelectorAll("#tesisimiz")).toHaveLength(1);
  expect(container.querySelectorAll("h1")).toHaveLength(1);
});

it.each([{ portrait: false }, { reduced: true }, { saveData: true }, { cores: 2 }])("keeps a complete readable native story for %j", options => {
  phonePolicy(options);
  const { container } = render(<HarvestJourney />);
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("native");
  // Compact pinned typography must not leak into the full native fallback.
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-motion-device")).toBe("desktop");
  expect(container.querySelector("#tesisimiz")?.tagName).toBe("SECTION");
  expect(container.querySelector("#uretim-yolculugu")?.textContent).toContain("Sofranız için keşfedin");
});

it.each(["rotate", "save"] as const)("restores native sections when the mobile %s policy changes", change => {
  const policy = phonePolicy();
  const { container, unmount } = render(<HarvestJourney />);
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("cinematic");
  policy[change]();
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("native");
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-motion-device")).toBe("desktop");
  expect(container.querySelectorAll("#tesisimiz")).toHaveLength(1);
  expect(container.querySelector("#tesisimiz")?.tagName).toBe("SECTION");
  unmount(); expect(policy.listeners.size).toBe(0);
});

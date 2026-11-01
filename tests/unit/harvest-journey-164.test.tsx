import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { HarvestJourney } from "@/components/landing/HarvestJourney";

vi.mock("@/components/media/CinematicScrub", () => ({ CinematicScrub: () => <div data-test-poster="" /> }));
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  history.replaceState(null, "", "#");
  delete (navigator as Navigator & { connection?: unknown }).connection;
});

function journeyPolicy() {
  let reduced = false;
  const listeners = new Map<string, Set<() => void>>();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (!listeners.has(query)) listeners.set(query, new Set());
    return {
      get matches() { return query.includes("prefers-reduced-motion") ? reduced : true; },
      addEventListener: (_: string, notify: () => void) => listeners.get(query)!.add(notify),
      removeEventListener: (_: string, notify: () => void) => listeners.get(query)!.delete(notify),
    };
  });
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);
  const connection = Object.assign(new EventTarget(), { saveData: false });
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  return {
    reduced(next: boolean) { act(() => { reduced = next; listeners.forEach(set => set.forEach(notify => notify())); }); },
    saveData(next: boolean) { act(() => { connection.saveData = next; connection.dispatchEvent(new Event("change")); }); },
    listenerCount: () => [...listeners.values()].reduce((total, set) => total + set.size, 0),
  };
}

function journeyGeometry() {
  let position = 900; // The browser has already followed the native SSR hash.
  vi.stubGlobal("innerHeight", 900);
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => position);
  const scrollTo = vi.fn((options: ScrollToOptions) => { position = options.top ?? position; });
  vi.stubGlobal("scrollTo", scrollTo);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-harvest-journey") ? (this.dataset.mode === "cinematic" ? 5400 : 2700) : 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return { top: this.hasAttribute("data-harvest-journey") ? -position : 0, height: this.clientHeight } as DOMRect;
  });
  const scrollIntoView = vi.fn();
  const getElementById = document.getElementById.bind(document);
  vi.spyOn(document, "getElementById").mockImplementation(id => {
    const element = getElementById(id);
    if (element) element.scrollIntoView = scrollIntoView;
    return element;
  });
  return { scrollTo, scrollIntoView };
}

it("keeps the full origin, real facility and table story readable before JavaScript", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<HarvestJourney />);
  expect(doc.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("native");
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  for (const id of ["baslangic", "kurumsal", "tesisimiz", "uretim-yolculugu"]) expect(doc.getElementById(id)).not.toBeNull();
  expect(doc.querySelector("#tesisimiz address")?.textContent).toContain("Osmaniye");
  expect(doc.querySelector("#uretim-yolculugu img")?.getAttribute("src")).toContain("urun-");
  expect(doc.querySelectorAll('[inert], [hidden]')).toHaveLength(0);
  expect(doc.querySelector('a[href="#urunler"]')).not.toBeNull();
  expect(doc.querySelector('a[href="#teklif"]')).not.toBeNull();
});

it("lets keyboard focus reach the matching scene even after reverse scrolling", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: !query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  const scrollTo = vi.fn(); vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("innerHeight", 900); vi.stubGlobal("scrollY", 0);
  const view = render(<HarvestJourney />);
  const journey = view.container.querySelector<HTMLElement>("[data-harvest-journey]")!;
  Object.defineProperty(journey, "clientHeight", { value: 5400 });
  vi.spyOn(journey, "getBoundingClientRect").mockReturnValue({ top: 0, height: 5400 } as DOMRect);
  expect(journey.dataset.mode).toBe("cinematic");
  fireEvent.focus(screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 4050, behavior: "instant" });
  scrollTo.mockClear();
  fireEvent.pointerDown(screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }));
  fireEvent.focus(screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }));
  expect(scrollTo).not.toHaveBeenCalled();
  fireEvent.focus(screen.getByRole("link", { name: "Ürünleri Keşfet" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
});

it("does not reposition normal document focus in the reduced-motion experience", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  const scrollTo = vi.fn(); vi.stubGlobal("scrollTo", scrollTo);
  render(<HarvestJourney />);
  act(() => screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }).focus());
  expect(scrollTo).not.toHaveBeenCalled();
});

it.each([["tesisimiz", .55], ["kurumsal", .55], ["uretim-yolculugu", .9]] as const)(
  "re-resolves initial #%s against the committed cinematic markers",
  (hash, progress) => {
    history.replaceState(null, "", `#${hash}`);
    journeyPolicy();
    const { scrollTo } = journeyGeometry();
    const { container } = render(<HarvestJourney />);
    expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("cinematic");
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 4500 * progress, behavior: "instant" });
    expect(container.querySelector(`#${hash}`)?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("link", { name: progress === .55 ? "Üretim" : "Sofra" }).getAttribute("aria-current")).toBe("step");
  },
);

it.each(["reduced", "saveData"] as const)("restores native IDs and re-resolves the current hash when %s changes in both directions", preference => {
  history.replaceState(null, "", "#tesisimiz");
  const policy = journeyPolicy();
  const { scrollTo, scrollIntoView } = journeyGeometry();
  const { container, unmount } = render(<HarvestJourney />);
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 2475, behavior: "instant" });
  scrollIntoView.mockClear();
  policy[preference](true);
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("native");
  expect(container.querySelector("#tesisimiz")?.tagName).toBe("SECTION");
  expect(container.querySelectorAll("#tesisimiz")).toHaveLength(1);
  expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "start", behavior: "instant" });
  scrollTo.mockClear();
  policy[preference](false);
  expect(container.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("cinematic");
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 2475, behavior: "instant" });
  expect(container.querySelector("#tesisimiz")?.tagName).toBe("SPAN");
  unmount(); expect(policy.listenerCount()).toBe(0);
});

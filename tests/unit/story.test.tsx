import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { Story } from "@/components/landing/Story";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("keeps all three steps, photos and captions in the JavaScript-free HTML", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Story />);
  const story = doc.querySelector("#tesisimiz")!;
  expect([...story.querySelectorAll("h2")].map(node => node.textContent)).toEqual(["Kökü toprakta.", "Kendi tesisimizde.", "Yeri sofrada."]);
  expect(story.textContent).toContain("Osmaniye'nin Düziçi ilçesi, Ellek beldesi.");
  expect(story.textContent).toContain("2021'den bu yana perakende ve toptan alıcılara ulaşıyoruz.");
  expect([...story.querySelectorAll("figcaption")].map(node => node.textContent)).toEqual(["Düziçi, Osmaniye", "Tesisimiz · Ellek", "Natürel sızma · 1 L"]);
  expect(story.getAttribute("data-story-enhanced")).toBe("false");
  expect(story.querySelectorAll("img")).toHaveLength(3);
  expect(story.querySelector('[hidden], [aria-hidden="true"]')).toBeNull();
  expect(story.querySelector('[style*="opacity:0"], [style*="scale(1.06)"]')).toBeNull();
  const facility = story.querySelectorAll("img")[1];
  expect(facility.getAttribute("src")).toBe("/images/tesis/tesis-osmaniye-v4-1200.webp");
  expect(facility.alt).toBe("Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi");
  expect(facility.alt).not.toMatch(/plaka|\d{2}\s+[A-Z]+\s+\d/);
  for (const image of story.querySelectorAll("img")) {
    expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
  }
});

it("crossfades forward and backward with matching captions and disconnects on unmount", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  let callback: IntersectionObserverCallback;
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(cb: IntersectionObserverCallback) { callback = cb; }
    observe = observe;
    disconnect = disconnect;
  });
  const view = render(<Story />);
  expect(observe).toHaveBeenCalledTimes(3);
  const steps = view.container.querySelectorAll("[data-story-step]");
  for (const index of [0, 1, 2, 1, 0]) {
    act(() => callback([{ target: steps[index], isIntersecting: true, boundingClientRect: { top: 350, height: 100 }, rootBounds: { top: 300, height: 200 } } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(view.container.querySelector("[data-story-enhanced]")?.getAttribute("data-story-enhanced")).toBe("true");
    expect(view.container.querySelector('figure[data-active="true"] figcaption')?.textContent).toBe(["Düziçi, Osmaniye", "Tesisimiz · Ellek", "Natürel sızma · 1 L"][index]);
    expect(view.container.querySelectorAll('[data-story-step][data-active="true"]')).toHaveLength(1);
    expect(screen.getAllByRole("img")).toHaveLength(1);
  }
  view.unmount();
  expect(disconnect).toHaveBeenCalled();
});

it("retains all photos and complete copy without an observer or with reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const observer = vi.fn();
  vi.stubGlobal("IntersectionObserver", observer);
  const view = render(<Story />);
  expect(observer).not.toHaveBeenCalled();
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  expect(view.container.querySelector('[style*="transform"]')).toBeNull();
});

it("retains the static gallery when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", undefined);
  const view = render(<Story />);
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(view.container.querySelector('[data-story-enhanced="false"]')).not.toBeNull();
});

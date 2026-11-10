import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { CategoryNavigation } from "@/components/catalog/CategoryNavigation";
import { FaqDisclosure } from "@/components/landing/FaqDisclosure";
import { readFileSync } from "node:fs";

const motionCalls = vi.hoisted(() => ({ animate: vi.fn(() => ({ stop: vi.fn() })) }));
vi.mock("motion/react", async importOriginal => ({ ...await importOriginal<typeof import("motion/react")>(), animate: motionCalls.animate }));
const route = vi.hoisted(() => ({ pathname: "/urunler" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); motionCalls.animate.mockClear(); route.pathname = "/urunler"; });

it("keeps the moving indicator decorative while selection remains in native links", () => {
  render(<CategoryNavigation />);
  const indicator = document.querySelector('[data-category-indicator]');
  expect(indicator).not.toBeNull();
  expect(indicator?.closest('[aria-hidden="true"]')).not.toBeNull();
  expect(document.querySelectorAll('a[aria-current="page"]')).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Tüm ürünler" }).getAttribute("aria-current")).toBe("page");
});

it("keeps native FAQ behavior and answers available before JavaScript", async () => {
  const markup = renderToStaticMarkup(<FaqDisclosure id="test" question="Soru?" answer="Yanıt." />);
  const doc = new DOMParser().parseFromString(markup, "text/html");
  expect(doc.querySelector("details > summary")?.textContent).toBe("Soru?");
  expect(doc.querySelector("details p")?.textContent).toBe("Yanıt.");
  expect(doc.querySelector("[style]" )).toBeNull();
  render(<FaqDisclosure id="test" question="Soru?" answer="Yanıt." />);
  const summary = screen.getByText("Soru?");
  const details = summary.closest("details")!;
  details.open = true; fireEvent(details, new Event("toggle"));
  expect(summary.getAttribute("aria-expanded")).toBe("true");
  details.open = false; fireEvent(details, new Event("toggle"));
  expect(summary.getAttribute("aria-expanded")).toBe("false");
});

it("limits native FAQ height/opacity transitions to supported non-reduced motion browsers", () => {
  const css = readFileSync("components/landing/Faq.module.css", "utf8");
  expect(css).toContain("@supports (interpolate-size: allow-keywords)");
  expect(css).toContain("prefers-reduced-motion: no-preference");
  expect(css).toContain("::details-content");
  expect(css).toContain("interpolate-size: allow-keywords");
  expect(css).toContain("content-visibility");
});

it("keeps the indicator slide running through the observer's unchanged initial notification", () => {
  vi.stubGlobal("matchMedia", () => ({ matches:false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const selected = this.getAttribute("href") === "/urunler/siyah-zeytin";
    const left = selected ? 166 : 4;
    const width = selected ? 180 : 150;
    return { x:left, y:4, left, right:left + width, top:4, bottom:56, width, height:52, toJSON() {} };
  });
  const view = render(<CategoryNavigation />);
  expect(motionCalls.animate).not.toHaveBeenCalled();
  expect(document.querySelector('[data-indicator-ready]')).not.toBeNull();
  expect(document.querySelector<HTMLElement>('[data-category-indicator]')?.style.opacity).not.toBe("0");
  route.pathname = "/urunler/siyah-zeytin";
  view.rerender(<CategoryNavigation />);
  expect(motionCalls.animate).toHaveBeenCalledTimes(2);
  for (const result of motionCalls.animate.mock.results) expect(result.value.stop).not.toHaveBeenCalled();
});

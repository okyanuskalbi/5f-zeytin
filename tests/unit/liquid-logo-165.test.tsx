import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AfinaLiquidLogo } from "@/components/ui/liquid-glass-logo-reveal";

let reduced = false;
const listeners = new Set<() => void>();
let enter: IntersectionObserverCallback;
const disconnect = vi.fn();
beforeEach(() => {
  reduced = false; listeners.clear(); disconnect.mockReset();
  vi.stubGlobal("matchMedia", () => ({ get matches() { return reduced; }, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) }));
  vi.stubGlobal("IntersectionObserver", class { constructor(fn: IntersectionObserverCallback) { enter = fn; } observe() {} disconnect = disconnect; });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["light", "dark"] as const)("shows the original %s AFİNA artwork before JavaScript, with no empty mask", tone => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<AfinaLiquidLogo tone={tone} />), "text/html");
  const image = doc.querySelector("picture img")!;
  expect(image.getAttribute("alt")).toBe("AFİNA ZEYTİN");
  expect(image.getAttribute("src")).toBe(`/brand/afina-zeytin-yatay${tone === "dark" ? "-dark" : ""}@2x.webp`);
  expect(doc.querySelector("[data-logo-fallback]")?.getAttribute("style") ?? "").not.toContain("opacity:0");
  expect(doc.querySelector("canvas")).toBeNull();
});

it("does no graphics work before visibility, keeps the real mark when WebGL fails and cleans up", () => {
  const view = render(<AfinaLiquidLogo />);
  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  act(() => enter([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  expect(view.container.querySelector("picture img")).not.toBeNull();
  expect(view.container.querySelector("canvas")).toBeNull();
  view.unmount(); expect(listeners.size).toBe(0); expect(disconnect).toHaveBeenCalled();
});

it("keeps a reduced-motion visit native and rearms the optional reveal on a live preference change", () => {
  reduced = true;
  const { container } = render(<AfinaLiquidLogo />);
  act(() => enter([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  act(() => { reduced = false; listeners.forEach(fn => fn()); });
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  expect(container.querySelector("picture img")).not.toBeNull();
});

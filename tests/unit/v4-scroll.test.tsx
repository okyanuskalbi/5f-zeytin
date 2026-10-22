import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MobileBuyBar } from "@/components/landing/MobileBuyBar";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("coalesces scroll bursts into one frame and cancels pending work on unmount", () => {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  const cancel = vi.fn((key: number) => frames.delete(key));
  vi.stubGlobal("cancelAnimationFrame", cancel);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 1200 });
  const hero = document.createElement("section");
  hero.dataset.heroIntro = "";
  const measure = vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ bottom: -200 } as DOMRect);
  document.body.append(hero);
  const view = render(<MobileBuyBar product={{ id: "p", name: "Zeytin", category: "sofralik-zeytin", weight: "10 kg", priceKurus: 100, stock: 1 }} />);
  const initial = measure.mock.calls.length;
  for (let i = 0; i < 20; i++) fireEvent.scroll(window);
  expect(measure).toHaveBeenCalledTimes(initial);
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(16));
  });
  expect(measure).toHaveBeenCalledTimes(initial + 1);
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined();
  fireEvent.scroll(window);
  view.unmount();
  expect(cancel).toHaveBeenCalled();
  hero.remove();
});

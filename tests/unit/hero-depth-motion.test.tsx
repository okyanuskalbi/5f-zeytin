import { act, cleanup, render, waitFor } from "@testing-library/react";
import { createRef, Profiler } from "react";
import { motionValue, type MotionValue } from "motion/react";
import { afterEach, expect, it, vi } from "vitest";
import { HeroDepthMotion } from "@/components/landing/HeroDepthMotion";
import { Hero } from "@/components/landing/Hero";

const scroll = vi.hoisted(() => ({ progress: null as MotionValue<number> | null, connected: 0, useScroll: vi.fn() }));
vi.mock("motion/react", async importOriginal => {
  const { useEffect } = await import("react");
  return { ...await importOriginal<typeof import("motion/react")>(),
    useScroll(options: unknown) {
      scroll.useScroll(options);
      useEffect(() => { scroll.connected++; return () => { scroll.connected--; }; }, []);
      return { scrollYProgress: scroll.progress! };
    },
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.clearAllMocks(); });

it("maps one scroll value to distinct transform-only planes without React scroll renders", async () => {
  scroll.progress = motionValue(0);
  const target = createRef<HTMLElement>();
  const commits = vi.fn();
  render(<section ref={target}>
    <div data-layer="plate" /><div data-layer="products" /><div data-layer="branch" /><div data-hero-copy="" />
    <Profiler id="depth" onRender={commits}><HeroDepthMotion target={target} /></Profiler>
  </section>);
  expect(scroll.useScroll).toHaveBeenCalledWith({ target, offset: ["start start", "end start"] });
  const count = commits.mock.calls.length;
  act(() => scroll.progress!.set(1));
  await waitFor(() => expect(target.current!.querySelector<HTMLElement>('[data-layer="products"]')!.style.transform).toContain("14%"));
  const plate = target.current!.querySelector<HTMLElement>('[data-layer="plate"]')!;
  const branch = target.current!.querySelector<HTMLElement>('[data-layer="branch"]')!;
  const copy = target.current!.querySelector<HTMLElement>("[data-hero-copy]")!;
  expect(plate.style.transform).toContain("6%");
  expect(branch.style.transform).toContain("-22%");
  expect(Number(copy.style.opacity)).toBeCloseTo(0.2);
  expect(commits).toHaveBeenCalledTimes(count);
  act(() => scroll.progress!.set(0.5));
  await waitFor(() => expect(copy.style.opacity).toBe("1"));
});

it("detaches scroll subscriptions when hidden/offscreen and never attaches with reduced motion", () => {
  scroll.progress = motionValue(0);
  let intersection: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersection = callback; }
    observe = vi.fn(); disconnect = disconnect;
  });
  const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", () => media);
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const view = render(<Hero />);
  const enter = (isIntersecting: boolean): void => act(() => intersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
  enter(true);
  expect(scroll.connected).toBe(1);
  visibility.mockReturnValue("hidden");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(scroll.connected).toBe(0);
  visibility.mockReturnValue("visible");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(scroll.connected).toBe(1);
  enter(false);
  expect(scroll.connected).toBe(0);
  view.unmount();
  expect(disconnect).toHaveBeenCalled();
  media.matches = true;
  render(<Hero />);
  enter(true);
  expect(scroll.connected).toBe(0);
});

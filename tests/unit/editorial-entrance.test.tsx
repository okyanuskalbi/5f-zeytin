import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useEditorialEntrance } from "@/lib/media/use-editorial-entrance";

const motion = vi.hoisted(() => ({ reduced: false, stop: vi.fn(), animate: vi.fn() }));
vi.mock("motion/react", () => ({
  useAnimate: () => [useRef<HTMLDivElement>(null), motion.animate],
  stagger: () => () => 0,
}));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => motion.reduced }));

function Journey({ label = "Ürünleri keşfet" }: { label?: string }) {
  const scope = useEditorialEntrance();
  return <div ref={scope}><div data-editorial-enter=""><h1>AFİNA</h1><a href="#urunler">{label}</a></div><figure data-editorial-enter="">Zeytinlik</figure></div>;
}
beforeEach(() => {
  motion.reduced = false;
  motion.stop.mockClear();
  motion.animate.mockReset().mockImplementation(() => ({ stop: motion.stop }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 0, bottom: 600, height: 600 } as DOMRect);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(8);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("delivers visible content and links in server HTML without waiting for Motion", () => {
  const html = renderToStaticMarkup(<Journey />);
  expect(html).toContain('href="#urunler"');
  expect(html).not.toMatch(/opacity:\s*0(?:;|"|\s)/);
  expect(motion.animate).not.toHaveBeenCalled();
});

it("runs one entrance and stops it immediately when the motion preference changes", () => {
  const view = render(<Journey />);
  expect(motion.animate).toHaveBeenCalledTimes(1);
  const targets = view.container.querySelectorAll<HTMLElement>("[data-editorial-enter]");
  for (const target of targets) { target.style.opacity = ".96"; target.style.transform = "translateY(8px)"; }
  motion.reduced = true;
  view.rerender(<Journey label="Koleksiyonu keşfet" />);
  expect(motion.stop).toHaveBeenCalledTimes(1);
  for (const target of targets) { expect(target.style.opacity).toBe("1"); expect(target.style.transform).toBe("none"); }
  expect(screen.getByRole("link", { name: "Koleksiyonu keşfet" })).toBeDefined();
  motion.reduced = false;
  view.rerender(<Journey />);
  expect(motion.animate).toHaveBeenCalledTimes(1);
});

it("leaves reduced-motion and initially off-screen content static", () => {
  motion.reduced = true;
  const reduced = render(<Journey />);
  expect(motion.animate).not.toHaveBeenCalled();
  reduced.unmount();
  motion.reduced = false;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: -800, bottom: -200 } as DOMRect);
  render(<Journey />);
  expect(motion.animate).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "AFİNA" })).toBeDefined();
});

it("does not spend animation work on a limited device", () => {
  vi.spyOn(navigator, "hardwareConcurrency", "get").mockReturnValue(2);
  render(<Journey />);
  expect(motion.animate).not.toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Ürünleri keşfet" })).toBeDefined();
});

it("keeps content usable when optional animation APIs fail and cleans up on unmount", () => {
  motion.animate.mockImplementationOnce(() => { throw new Error("Animation unavailable"); });
  const failed = render(<Journey />);
  expect(screen.getByRole("link", { name: "Ürünleri keşfet" })).toBeDefined();
  failed.unmount();
  motion.animate.mockReturnValue({ stop: motion.stop });
  const running = render(<Journey />);
  act(() => running.unmount());
  expect(motion.stop).toHaveBeenCalledTimes(1);
});

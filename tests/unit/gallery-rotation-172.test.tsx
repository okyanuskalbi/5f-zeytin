import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { MotionValue } from "framer-motion";
import { HorizontalProductGallery } from "@/components/landing/HorizontalProductGallery";
import { getProducts } from "@/lib/catalog/static-products";

const source = vi.hoisted(() => ({
  progress: null as MotionValue<number> | null,
  mode: "touch" as "touch" | "native",
  listeners: new Set<() => void>(),
}));

// Supply the browser's scroll and orientation notifications while keeping the
// real MotionValue derivation, rail subscription and React render lifecycle.
vi.mock("framer-motion", async importOriginal => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  source.progress = actual.motionValue(0);
  return { ...actual, useScroll: () => ({ scrollYProgress: source.progress }) };
});
vi.mock("@/lib/media/use-gallery-motion", async () => {
  const { useSyncExternalStore } = await import("react");
  return { useGalleryMotion: () => useSyncExternalStore(
    notify => { source.listeners.add(notify); return () => { source.listeners.delete(notify); }; },
    () => source.mode,
    () => "native",
  ) };
});

afterEach(() => {
  cleanup();
  source.progress?.set(0);
  source.mode = "touch";
  source.listeners.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("rotates after scroll input without updating the rail from the gallery render", async () => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("innerHeight", 844);
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("matchMedia", (query: string) => ({ media: query, matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(350);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-track") ? 2220 : 350;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-track") ? 2276 : 350;
  });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-item") ? Array.from(this.parentElement!.children).indexOf(this) * 374 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.id === "urunler" && this.dataset.galleryMode === "scrub" ? 2714 : 844;
  });
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const { container } = render(<HorizontalProductGallery products={await getProducts()} />);
  const gallery = screen.getByRole("region", { name: "Ürün galerisi" });
  expect(gallery.closest("section")?.dataset.galleryMode).toBe("scrub");

  // Browsers can deliver orientation before Motion's next scheduled frame.
  // No React render is needed for input to reach the final package.
  act(() => {
    source.progress!.set(1);
    source.mode = "native";
    source.listeners.forEach(notify => notify());
  });

  expect(gallery.closest("section")?.dataset.galleryMode).toBe("native");
  expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(6);
  expect(gallery.scrollLeft).toBe(1870);
  expect(errors.mock.calls.map(call => call.join(" "))).toEqual([]);
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HorizontalProductGallery } from "@/components/landing/HorizontalProductGallery";
import { getProducts } from "@/lib/catalog/static-products";

type Viewport = {
  width: number;
  height: number;
  reduced?: boolean;
  fine?: boolean;
  hover?: boolean;
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Evaluate the actual query, so changing a production breakpoint changes the
 * result. Returning true for every desktop query would hide the 860px bug. */
function matchesMedia(query: string, viewport: Viewport): boolean {
  return query.split(",").some(alternative => {
    const features = [...alternative.matchAll(/\(([-\w]+)(?:\s*:\s*([^)]*))?\)/g)];
    return features.length > 0 && features.every(([, feature, rawValue]) => {
      const value = rawValue?.trim();
      if (feature === "prefers-reduced-motion") return value === "no-preference" ? !viewport.reduced : !!viewport.reduced;
      if (feature === "pointer") return value === (viewport.fine === false ? "coarse" : "fine");
      if (feature === "hover") return value === (viewport.hover === false ? "none" : "hover");
      const dimension = /^(min|max)-(width|height)$/.exec(feature);
      if (!dimension || !value?.endsWith("px")) return false;
      const size = viewport[dimension[2] as "width" | "height"];
      return dimension[1] === "min" ? size >= Number.parseFloat(value) : size <= Number.parseFloat(value);
    });
  });
}

function installViewport(viewport: Viewport) {
  vi.stubGlobal("innerWidth", viewport.width);
  vi.stubGlobal("innerHeight", viewport.height);
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: matchesMedia(query, viewport),
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => true,
  } satisfies MediaQueryList));

  // JSDOM has no layout. Six 360px cards, 64px gaps and centred end insets
  // give a real, positive rail distance instead of accidentally testing travel=0.
  const cardWidth = 360, stride = cardWidth + 64;
  const railWidth = viewport.width - 64;
  const travel = 5 * stride;
  const inset = Math.max(0, (railWidth - cardWidth) / 2);
  const scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-viewport") ? railWidth : viewport.width;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-track") ? railWidth + travel : this.clientWidth;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.id === "urunler" && this.dataset.galleryMode === "scrub" ? viewport.height + travel : viewport.height;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-item") ? cardWidth : this.clientWidth;
  });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    if (!this.hasAttribute("data-gallery-item")) return 0;
    return inset + Array.from(this.parentElement!.children).indexOf(this) * stride;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const left = this.hasAttribute("data-gallery-item") ? 32 + this.offsetLeft : 32;
    const width = this.hasAttribute("data-gallery-item") ? cardWidth : this.clientWidth;
    return { x: left, y: 0, left, right: left + width, top: 0, bottom: this.clientHeight, width, height: this.clientHeight, toJSON() {} };
  });
  return { scrollTo, travel };
}

describe("product gallery viewport policy", () => {
  it.each([
    { width: 1366, height: 768, mode: "scrub" },
    { width: 1440, height: 900, mode: "scrub" },
    { width: 1366, height: 700, mode: "scrub" },
    { width: 1024, height: 680, mode: "scrub" },
    { width: 1366, height: 679, mode: "native" },
    { width: 1366, height: 540, mode: "native" },
    { width: 390, height: 844, mode: "native", fine: false, hover: false },
    { width: 1366, height: 768, mode: "native", reduced: true },
    { width: 1440, height: 900, mode: "native", fine: false, hover: false },
  ] as const)("uses $mode at $width×$height (reduced=$reduced, fine=$fine)", async viewport => {
    const { scrollTo, travel } = installViewport(viewport);
    const products = await getProducts();
    const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
    const { container } = render(<HorizontalProductGallery products={products} />);
    const gallery = screen.getByRole("region", { name: "Ürün galerisi" });
    const section = gallery.closest("section")!;

    expect(section.dataset.galleryMode).toBe(viewport.mode);
    expect(container.querySelectorAll("[data-gallery-item]")).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: /^Teklife ekle:/ })).toHaveLength(6);
    expect(screen.getByText(viewport.mode === "scrub" ? "Kaydırdıkça keşfedin." : "Ürünleri yatay kaydırarak keşfedin.")).toBeTruthy();

    // The real rail keyboard handler reaches the last product through document
    // scroll in scrub mode and through the local scroll area in native mode.
    fireEvent.keyDown(gallery, { key: "End" });
    const last = ordered.at(-1)!;
    expect(document.activeElement).toBe(screen.getByRole("button", { name: `${last.name}, ${last.weight} detayını aç` }));
    if (viewport.mode === "scrub") {
      expect(scrollTo).toHaveBeenLastCalledWith({ top: travel, behavior: "instant" });
      expect(gallery.scrollLeft).toBe(0);
    } else {
      expect(gallery.scrollLeft).toBe(travel);
      expect(scrollTo).not.toHaveBeenCalled();
    }
  });
});

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { HorizontalProductGallery } from "@/components/landing/HorizontalProductGallery";
import { getProducts } from "@/lib/catalog/static-products";

type Viewport = {
  width: number;
  height: number;
  reduced?: boolean;
  fine?: boolean;
  hover?: boolean;
  saveData?: boolean;
  cores?: number;
  stageHeight?: number;
  visualOverflow?: number;
  nativeRailShrink?: number;
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
      if (feature === "orientation") return value === (viewport.height >= viewport.width ? "portrait" : "landscape");
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
  const preferences = { ...viewport };
  const connection = Object.assign(new EventTarget(), { saveData: !!viewport.saveData });
  vi.stubGlobal("navigator", { connection, hardwareConcurrency: viewport.cores ?? 8 });
  const queries = new Map<string, MediaQueryList & { notify: () => void }>();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (queries.has(query)) return queries.get(query)!;
    const listeners = new Set<EventListenerOrEventListenerObject>();
    const media: MediaQueryList & { notify: () => void } = {
      media: query,
      get matches() { return matchesMedia(query, preferences); },
      onchange: null,
      addEventListener: vi.fn<MediaQueryList["addEventListener"]>((_type: string, callback: EventListenerOrEventListenerObject) => { listeners.add(callback); }),
      removeEventListener: vi.fn<MediaQueryList["removeEventListener"]>((_type: string, callback: EventListenerOrEventListenerObject) => { listeners.delete(callback); }),
      addListener() {},
      removeListener() {},
      dispatchEvent: () => true,
      notify() {
        const event = Object.assign(new Event("change"), { media: query, matches: media.matches });
        listeners.forEach(listener => typeof listener === "function" ? listener(event) : listener.handleEvent(event));
      },
    };
    queries.set(query, media);
    return media;
  });

  // JSDOM has no layout. Six 360px cards, 64px gaps and centred end insets
  // give a real, positive rail distance instead of accidentally testing travel=0.
  const cardWidth = Math.min(360, viewport.width - 64), stride = cardWidth + 64;
  const railWidth = viewport.width - 64;
  const travel = 5 * stride;
  const inset = Math.max(0, (railWidth - cardWidth) / 2);
  const scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-viewport") ? railWidth : viewport.width;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-gallery-track") ? railWidth + travel + (viewport.visualOverflow ?? 0) : this.clientWidth;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    const stageHeight = viewport.stageHeight ?? viewport.height;
    return this.id === "urunler" && this.dataset.galleryMode === "scrub"
      ? stageHeight + Number.parseFloat(this.style.getPropertyValue("--gallery-span") || "0") : stageHeight;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute("data-gallery-track")) return railWidth + travel - (this.closest("section")?.dataset.galleryMode === "native" ? viewport.nativeRailShrink ?? 0 : 0);
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
  return { scrollTo, travel, update: (next: Partial<Viewport>) => {
    Object.assign(preferences, next);
    connection.saveData = !!preferences.saveData;
    connection.dispatchEvent(new Event("change"));
    queries.forEach(media => media.notify());
  } };
}

describe("product gallery viewport policy", () => {
  it.each([
    { width: 1366, height: 768, mode: "scrub" },
    { width: 1440, height: 900, mode: "scrub" },
    { width: 1366, height: 700, mode: "scrub" },
    { width: 1024, height: 680, mode: "scrub" },
    { width: 1366, height: 679, mode: "native" },
    { width: 1366, height: 540, mode: "native" },
    { width: 390, height: 844, mode: "scrub", fine: false, hover: false },
    { width: 320, height: 640, mode: "scrub", fine: false, hover: false },
    { width: 768, height: 1024, mode: "scrub", fine: false, hover: false },
    { width: 390, height: 844, stageHeight: 744, mode: "scrub", fine: false, hover: false },
    // Spotlight paint extends beyond the final package; it must not add travel.
    { width: 390, height: 844, visualOverflow: 56, mode: "scrub", fine: false, hover: false },
    { width: 320, height: 639, mode: "native", fine: false, hover: false },
    { width: 319, height: 700, mode: "native", fine: false, hover: false },
    { width: 844, height: 390, mode: "native", fine: false, hover: false },
    { width: 390, height: 844, mode: "native", fine: false, hover: false, reduced: true },
    { width: 390, height: 844, mode: "native", fine: false, hover: false, saveData: true },
    { width: 390, height: 844, mode: "native", fine: false, hover: false, cores: 2 },
    { width: 1366, height: 768, mode: "native", saveData: true },
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
    expect(screen.getByText("Kaydırarak ya da sürükleyerek keşfedin.")).toBeTruthy();

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

  it("switches the same six SKU controls to native when motion or data preferences change", async () => {
    const { update } = installViewport({ width: 390, height: 844, fine: false, hover: false });
    const { container } = render(<HorizontalProductGallery products={await getProducts()} />);
    const section = container.querySelector("#urunler")!;
    const originalItems = [...container.querySelectorAll("[data-gallery-item]")];
    expect(section.getAttribute("data-gallery-mode")).toBe("scrub");
    act(() => update({ saveData: true }));
    expect(section.getAttribute("data-gallery-mode")).toBe("native");
    act(() => update({ saveData: false }));
    expect(section.getAttribute("data-gallery-mode")).toBe("scrub");
    act(() => update({ reduced: true }));
    expect(section.getAttribute("data-gallery-mode")).toBe("native");
    expect([...container.querySelectorAll("[data-gallery-item]")]).toEqual(originalItems);
  });

  it("leaves touch and wheel scrolling to the browser while the phone rail is pinned", async () => {
    const { scrollTo } = installViewport({ width: 390, height: 844, fine: false, hover: false });
    render(<HorizontalProductGallery products={await getProducts()} />);
    const gallery = screen.getByRole("region", { name: "Ürün galerisi" });
    expect(gallery.closest("section")?.dataset.galleryMode).toBe("scrub");
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 100 });
    const touch = new Event("touchmove", { bubbles: true, cancelable: true });
    fireEvent(gallery, wheel);
    fireEvent(gallery, touch);
    expect(wheel.defaultPrevented).toBe(false);
    expect(touch.defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("keeps the focused last package visible through reduced motion and back even when clip clears native scrollLeft", async () => {
    // Native cards are 10px narrower each: the new pin's travel is measured
    // after its first render, so a second geometry commit must preserve focus.
    const { update, travel, scrollTo } = installViewport({ width: 390, height: 844, fine: false, hover: false, nativeRailShrink: 60 });
    render(<HorizontalProductGallery products={await getProducts()} />);
    const gallery = screen.getByRole("region", { name: "Ürün galerisi" });
    fireEvent.keyDown(gallery, { key: "End" });
    const focused = document.activeElement;
    act(() => update({ reduced: true }));
    expect(gallery.closest("section")?.dataset.galleryMode).toBe("native");
    expect(document.activeElement).toBe(focused);
    expect(gallery.scrollLeft).toBe(travel);
    // The browser can clear the native offset as overflow:clip takes effect,
    // before the parent's layout effect restores its new pinned position.
    gallery.scrollLeft = 0;
    scrollTo.mockClear();
    act(() => update({ reduced: false }));
    expect(gallery.closest("section")?.dataset.galleryMode).toBe("scrub");
    expect(document.activeElement).toBe(focused);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: travel, behavior: "instant" });
  });

  it("renders all six real products and the native contact fallback before hydration", async () => {
    installViewport({ width: 390, height: 844, fine: false, hover: false });
    const markup = renderToString(<HorizontalProductGallery products={await getProducts()} />);
    expect(markup).toContain('data-gallery-mode="native"');
    expect(markup.match(/data-gallery-item=/g)).toHaveLength(6);
    expect(markup).toContain('<a href="#iletisim">');
    expect(markup).toContain("sipariş ve toptan talep");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { m } from "motion/react";
import { afterEach, expect, it, vi } from "vitest";
import { CatalogGridMotion, CatalogTransitionContext, catalogCardVariants } from "@/components/catalog/CatalogGridMotion";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => preference.reduced }));
afterEach(() => { preference.reduced = false; });

function grid({ changed = false, pathname = "/urunler", routeKey = "/urunler" } = {}) {
  const markup = renderToStaticMarkup(<CatalogTransitionContext.Provider value={{ changed, pathname }}>
    <CatalogGridMotion className="grid" routeKey={routeKey}>
      <m.div data-product-reveal="" variants={catalogCardVariants}><article>Ürün</article></m.div>
    </CatalogGridMotion>
  </CatalogTransitionContext.Provider>);
  return new DOMParser().parseFromString(markup, "text/html");
}

it("renders the initial product list visible without a new geometry wrapper before JavaScript", () => {
  const doc = grid();
  expect(doc.querySelector('[data-category-transition]')?.getAttribute("data-category-transition")).toBe("static");
  expect(doc.querySelector('.grid > [data-product-reveal] > article')?.textContent).toBe("Ürün");
  const card = doc.querySelector<HTMLElement>('[data-product-reveal]')!;
  expect(card.style.opacity).toBe("1");
  expect(card.style.transform).toBe("none");
});

it("enters cards only after navigation supplies the matching new route", () => {
  const fresh = grid({ changed: true, pathname: "/urunler/kirma-zeytin", routeKey: "/urunler/kirma-zeytin" });
  expect(fresh.querySelector('[data-category-transition]')?.getAttribute("data-category-transition")).toBe("navigation");
  expect(fresh.querySelector<HTMLElement>('[data-product-reveal]')?.style.opacity).toBe("0");
  const stale = grid({ changed: true, pathname: "/urunler/kirma-zeytin" });
  expect(stale.querySelector('[data-category-transition]')?.getAttribute("data-category-transition")).toBe("static");
  expect(stale.querySelector<HTMLElement>('[data-product-reveal]')?.style.opacity).toBe("1");
});

it("shows the reduced-motion final state immediately even after category navigation", () => {
  preference.reduced = true;
  const doc = grid({ changed: true });
  expect(doc.querySelector('[data-category-transition]')?.getAttribute("data-category-transition")).toBe("static");
  expect(doc.querySelector<HTMLElement>('[data-product-reveal]')?.style.opacity).toBe("1");
  expect(doc.querySelector<HTMLElement>('[data-product-reveal]')?.style.transform).toBe("none");
});

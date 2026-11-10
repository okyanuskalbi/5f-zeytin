import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { LazyMotion } from "motion/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MiniCart } from "@/components/cart/MiniCart";

vi.mock("next/navigation", () => ({ usePathname: () => "/siparis-takip" }));
vi.mock("@/components/cart/useCartViewport", () => ({ useCartViewport: () => true }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: true, items: [{ productId: "olive", quantity: 1 }] },
  products: [{ id: "olive", stock: 2, priceKurus: 12550 }], open: false, openCart: vi.fn(),
}) }));

let reportIntersection: IntersectionObserverCallback;
class FooterIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) { reportIntersection = callback; }
  observe() {}
  disconnect() {}
}
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"), media: query,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }));
  vi.stubGlobal("IntersectionObserver", FooterIntersectionObserver);
  document.body.append(document.createElement("footer"));
});
afterEach(() => {
  cleanup(); document.querySelector("footer")?.remove(); vi.unstubAllGlobals();
});

it("removes the reduced-motion bar when the footer enters even before optional Motion features load", async () => {
  const delayedFeatures = vi.fn(() => new Promise<never>(() => {}));
  render(<LazyMotion features={delayedFeatures}><MiniCart /></LazyMotion>);
  expect(screen.getByRole("complementary", { name: "Mini sepet" })).toBeDefined();
  expect(delayedFeatures).toHaveBeenCalledOnce();
  const footer = document.querySelector("footer")!;
  const bounds = footer.getBoundingClientRect();
  const entry: IntersectionObserverEntry = {
    target: footer, isIntersecting: true, boundingClientRect: bounds,
    intersectionRect: bounds, intersectionRatio: 1, rootBounds: null, time: 0,
  };
  act(() => reportIntersection([entry], {} as IntersectionObserver));
  await waitFor(() => expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull());
});

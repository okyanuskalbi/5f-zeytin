import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MiniCart } from "@/components/cart/MiniCart";

vi.mock("next/navigation", () => ({ usePathname: () => "/task189-1-bulunamayan" }));
vi.mock("@/components/cart/useCartViewport", () => ({ useCartViewport: () => true }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: true, items: [{ productId: "olive", quantity: 1 }] },
  products: [{ id: "olive", stock: 2, priceKurus: 12550 }], open: false, openCart: vi.fn(),
}) }));
vi.mock("motion/react", () => ({ AnimatePresence: ({ children }: { children: ReactNode }) => children, useReducedMotion: () => true }));
vi.mock("motion/react-m", () => ({ aside: ({ children, ...props }: ComponentProps<"aside"> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown }) => {
  const { initial, animate, exit, transition, ...html } = props;
  void initial; void animate; void exit; void transition;
  return <aside {...html}>{children}</aside>;
} }));

const observed = new Map<Element, IntersectionObserverCallback>();
let disconnected = 0;
class FooterIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe(target: Element) { observed.set(target, this.callback); }
  unobserve(target: Element) { observed.delete(target); }
  disconnect() { observed.clear(); disconnected++; }
}
beforeEach(() => {
  observed.clear(); disconnected = 0;
  vi.stubGlobal("IntersectionObserver", FooterIntersectionObserver);
});
afterEach(() => {
  cleanup();
  document.querySelectorAll("footer").forEach(footer => footer.remove());
  vi.unstubAllGlobals();
});
function enter(footer: HTMLElement) {
  act(() => observed.get(footer)!([{ target: footer, isIntersecting: true, boundingClientRect: footer.getBoundingClientRect(), intersectionRect: footer.getBoundingClientRect(), intersectionRatio: 1, rootBounds: null, time: 0 } satisfies IntersectionObserverEntry], {} as IntersectionObserver));
}

it("observes a footer inserted after the mini-cart mounts and hides the bar on entry", async () => {
  const view = render(<MiniCart />);
  expect(screen.getByRole("complementary", { name: "Mini sepet" })).toBeDefined();
  const footer = document.createElement("footer");
  document.body.append(footer);
  await waitFor(() => expect(observed.has(footer)).toBe(true));
  enter(footer);
  await waitFor(() => expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull());
  expect(view.container.querySelector("[data-mini-cart-reserve]")).not.toBeNull();
  view.unmount();
  expect(disconnected).toBeGreaterThan(0);
});

it("reconnects to a replacement footer rather than observing a detached previous footer", async () => {
  const previous = document.createElement("footer");
  document.body.append(previous);
  render(<MiniCart />);
  await waitFor(() => expect(observed.has(previous)).toBe(true));
  const replacement = document.createElement("footer");
  previous.replaceWith(replacement);
  await waitFor(() => expect(observed.has(replacement)).toBe(true));
  enter(replacement);
  await waitFor(() => expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull());
});

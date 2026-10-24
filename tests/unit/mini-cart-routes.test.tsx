import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MiniCart } from "@/components/cart/MiniCart";

const state = vi.hoisted(() => ({ pathname: "/urun/test", mobile: true }));
const openCart = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/cart/useCartViewport", () => ({ useCartViewport: () => state.mobile }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: true, items: [{ productId: "olive", quantity: 1 }] },
  products: [{ id: "olive", stock: 2, priceKurus: 12550 }], open: false, openCart,
}) }));
vi.mock("motion/react", () => ({ AnimatePresence: ({ children }: { children: React.ReactNode }) => children, useReducedMotion: () => true }));
vi.mock("motion/react-m", () => ({ aside: ({ children, ...props }: React.ComponentProps<"aside"> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown }) => {
  const { initial, animate, exit, transition, ...html } = props;
  void initial; void animate; void exit; void transition;
  return <aside {...html}>{children}</aside>;
} }));
beforeEach(() => { state.pathname = "/urun/test"; state.mobile = true; });
afterEach(cleanup);

it.each(["/giris", "/kayit", "/hesabim", "/hesabim/siparisler", "/odeme", "/odeme/basarili", "/kvkk", "/iade", "/mesafeli-satis"])("removes both the sticky cart and its reserved space on %s", pathname => {
  state.pathname = pathname;
  const view = render(<MiniCart />);
  expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull();
  expect(view.container.querySelector("[data-mini-cart-reserve]")).toBeNull();
});
it("keeps the cart page's existing hidden behavior", () => {
  state.pathname = "/sepet";
  expect(render(<MiniCart />).container.childElementCount).toBe(0);
});
it("preserves the mobile bar on other routes without prefix collisions", () => {
  state.pathname = "/kayit-hakkinda";
  render(<MiniCart />);
  expect(screen.getByRole("complementary", { name: "Mini sepet" }).textContent).toContain("125,50");
  expect(screen.getByRole("button", { name: "Sepet" })).toBeTruthy();
});
it("keeps the bar hidden on desktop", () => {
  state.mobile = false;
  expect(render(<MiniCart />).container.childElementCount).toBe(0);
});

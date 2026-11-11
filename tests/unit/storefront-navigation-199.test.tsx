import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreMenu } from "@/components/storefront/StoreMenu";

const state = vi.hoisted(() => ({ pathname: "/", count: 0, hydrated: true, openCart: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({ state: { hydrated: state.hydrated, items: [{ productId: "sample", quantity: state.count }] }, products: [], open: false, openCart: state.openCart }) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));
beforeEach(() => { state.pathname = "/"; state.count = 0; state.hydrated = true; });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it.each(["/urunler", "/urunler/zeytinyagi", "/urun/naturel-sizma-zeytinyagi"])("keeps the products destination current at %s", pathname => {
  state.pathname = pathname;
  render(<StoreHeader />);
  const products = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getByRole("link", { name: "Ürünler" });
  expect(products.getAttribute("href")).toBe("/urunler");
  expect(products.getAttribute("aria-current")).toBe("page");
  fireEvent.scroll(window);
  expect(products.getAttribute("aria-current")).toBe("page");
});

it("keeps the cart disabled until hydration and announces its actual count while capping its visual badge", () => {
  state.hydrated = false;
  const view = render(<StoreHeader />);
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" }).hasAttribute("disabled")).toBe(true);
  state.hydrated = true; state.count = 105; view.rerender(<StoreHeader />);
  const cart = screen.getByRole("button", { name: "Sepetim, 105 adet" });
  expect(cart.textContent).toBe("99+");
  expect(cart.querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
  fireEvent.click(cart);
  expect(state.openCart).toHaveBeenCalledWith(cart);
  state.count = 0; view.rerender(<StoreHeader />);
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" }).querySelector("span")).toBeNull();
});

it("keeps phone destinations and categories reachable and closes on selection", () => {
  const close = vi.fn();
  render(<StoreMenu links={[{ label: "Ürünler", href: "/urunler" }]} pathname="/urunler" onClose={close} onRestoreFocus={() => {}} />);
  expect(screen.getByRole("dialog").getAttribute("aria-labelledby")).toBeTruthy();
  const products = within(screen.getByRole("navigation", { name: "Mobil navigasyon" })).getByRole("link", { name: "Ürünler" });
  expect(products.getAttribute("aria-current")).toBe("page");
  expect(within(screen.getByRole("navigation", { name: "Ürün kategorileri" })).getAllByRole("link")).toHaveLength(5);
  expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  fireEvent.click(products);
  expect(close).toHaveBeenCalledOnce();
});

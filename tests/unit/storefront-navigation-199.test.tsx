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

// Task208: `/urunler` pages redirect to the home section; only a product page keeps the products link marked.
it("keeps the products destination current on a product page", () => {
  state.pathname = "/urun/naturel-sizma-zeytinyagi";
  render(<StoreHeader />);
  const products = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getByRole("link", { name: "Ürünler" });
  expect(products.getAttribute("href")).toBe("/#urunler");
  expect(products.getAttribute("aria-current")).toBe("true");
  fireEvent.scroll(window);
  expect(products.getAttribute("aria-current")).toBe("true");
});

it.each(["/sepet", "/kvkk", "/hesabim"])("marks no section at %s", pathname => {
  state.pathname = pathname;
  render(<StoreHeader />);
  for (const link of within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link")) expect(link.hasAttribute("aria-current")).toBe(false);
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

// Task208: the drawer lists the five sections, reports the chosen one and closes; no category row.
it("keeps phone destinations reachable, reports the chosen section and closes on selection", () => {
  const close = vi.fn();
  const section = vi.fn();
  render(<StoreMenu current="urunler" onClose={close} onSection={section} onRestoreFocus={() => {}} />);
  expect(screen.getByRole("dialog").getAttribute("aria-labelledby")).toBeTruthy();
  const links = within(screen.getByRole("navigation", { name: "Mobil navigasyon" })).getAllByRole("link");
  expect(links.map(link => link.getAttribute("href"))).toEqual(["/#urunler", "/#hikayemiz", "/#toptan-bayilik", "/#blog", "/#iletisim"]);
  const products = links[0];
  expect(products.getAttribute("aria-current")).toBe("true");
  expect(links.slice(1).every(link => !link.hasAttribute("aria-current"))).toBe(true);
  expect(screen.queryByRole("navigation", { name: "Ürün kategorileri" })).toBeNull();
  expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  fireEvent.click(products);
  expect(section).toHaveBeenCalledWith("urunler");
  expect(close).toHaveBeenCalledOnce();
});

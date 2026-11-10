import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { siteContact } from "@/lib/site/contact";
import { createCartStore } from "@/lib/cart/store";

const state = vi.hoisted(() => ({ pathname: "/", cart: null as ReturnType<typeof import("@/components/cart/CartProvider").useCart> }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => state.cart }));

beforeEach(() => {
  state.pathname = "/";
  state.cart = null;
  window.history.replaceState(null, "", "/");
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  const hero = document.createElement("section");
  hero.setAttribute("data-hero-intro", "");
  vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ bottom: 900 } as DOMRect);
  document.body.append(hero);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} disconnect(): void {} });
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  Object.assign(siteContact, { phone: "", whatsapp: "", email: "" });
  document.querySelector("[data-hero-intro]")?.remove();
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("keeps corporate section destinations and the cart control", () => {
  render(<Navbar />);
  for (const [name, href] of [["Hakkımızda", "/hakkimizda"], ["Ürünler", "/urunler"], ["Toptan Satış", "/toptan-satis"], ["Bayilik", "/bayilik"], ["Blog", "/blog"], ["İletişim", "/hakkimizda#iletisim"]]) {
    expect(screen.getByRole("link", { name }).getAttribute("href")).toBe(href);
  }
  const cart = screen.getByRole("button", { name: "Sepetim, 0 adet" });
  expect(cart.textContent).toBe("");
  expect(cart.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  expect(cart.querySelector('[data-slot="count-badge"]')).toBeNull();
});

it("keeps the exact cart quantity accessible and opens the drawer from its icon when the visual badge is capped", () => {
  const openCart = vi.fn();
  state.cart = {
    store: createCartStore({ products: [], storage: null }),
    state: { items: [{ productId: "first", quantity: 99 }, { productId: "second", quantity: 6 }], hydrated: true, storageError: false },
    products: [], open: false, openCart, addItem: vi.fn(), checkoutHref: null,
  };
  render(<Navbar />);
  const cart = screen.getByRole("button", { name: "Sepetim, 105 adet" });
  expect(cart.textContent).toBe("99+");
  expect(cart.querySelector('[data-slot="count-badge"]')?.getAttribute("aria-hidden")).toBe("true");
  fireEvent.click(cart);
  expect(openCart).toHaveBeenCalledWith(cart);
});

it("keeps the landing navigation on solid light before and after every scroll threshold", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("solid");
  for (const scrollY of [40, 41, 450, 0]) {
    window.scrollY = scrollY;
    fireEvent.scroll(window);
    expect(header.getAttribute("data-tone")).toBe("solid");
  }
});

it("retains the solid light surface on a restored landing load and pageshow", () => {
  window.scrollY = 240;
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("solid");
  window.scrollY = 0;
  fireEvent(window, new Event("pageshow"));
  expect(header.getAttribute("data-tone")).toBe("solid");
});

it("keeps interior routes on the solid light surface while scrolling", () => {
  state.pathname = "/kvkk";
  window.history.replaceState(null, "", state.pathname);
  render(<Navbar />);
  window.scrollY = 240;
  fireEvent.scroll(window);
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
});

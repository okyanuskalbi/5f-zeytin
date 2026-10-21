import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/landing/Hero";
import { CartProvider } from "@/components/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import { getProducts } from "@/lib/catalog/static-products";

vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); });

it("adds the catalog's 10 kg variant without opening the drawer and announces success", async () => {
  const products = await getProducts();
  const product = { ...products.find(item => item.weight === "10 kg")!, priceKurus: 198765 };
  render(<CartProvider products={[product]}><Hero product={product} /></CartProvider>);
  const button = screen.getByRole("button", { name: /Sepete ekle.*10 kg · ₺1.987,65/ });
  fireEvent.click(button);
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: product.id, quantity: 1 }]);
  expect(screen.getByRole("status").textContent).toContain("10 kg sepete eklendi");
  expect(screen.getByRole("button", { name: /Eklendi/ })).toBeDefined();
});

it("keeps stock errors honest and leaves the saved quantity unchanged", async () => {
  const products = await getProducts();
  const product = { ...products.find(item => item.weight === "10 kg")!, stock: 1 };
  render(<CartProvider products={[product]}><Hero product={product} /></CartProvider>);
  const button = screen.getByRole("button", { name: /Sepete ekle/ });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(screen.getByRole("alert").textContent).toContain("Stok sınırına ulaştınız");
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: product.id, quantity: 1 }]);
});

it("keeps the pantry link available when the hero variant is unavailable", () => {
  render(<Hero />);
  expect(screen.getByRole("button", { name: "Ürün şu an mevcut değil" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("link", { name: "Ürünleri gör" }).getAttribute("href")).toBe("#kiler");
});

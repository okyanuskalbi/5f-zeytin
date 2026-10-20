import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HeroIntro } from "@/components/landing/HeroIntro";
import { CartProvider } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";

vi.mock("@/components/media/ScrollFrameSequence", () => ({ ScrollFrameSequence: () => <div /> }));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));

const products: readonly Product[] = [
  { id: "olive-small", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 10000, stock: 2 },
  { id: "olive-large", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "5 kg", priceKurus: 45000, stock: 3 },
  { id: "oil", name: "Zeytinyağı", category: "zeytinyagi", weight: "500 ml", priceKurus: 35000, stock: 0 },
];

afterEach(() => { cleanup(); localStorage.clear(); });

it("selects a real size, adds its exact SKU and reports cumulative stock errors", () => {
  render(<CartProvider products={products}><HeroIntro products={products} /></CartProvider>);
  const size = within(screen.getByRole("radiogroup", { name: "Boy" }));
  fireEvent.click(size.getByRole("radio", { name: "5 kg" }));
  const label = screen.getByTestId("hero-product");
  expect(label.textContent).toContain("5 KG");
  expect(label.textContent).toContain("450,00 ₺");
  const add = screen.getByRole("button", { name: "Sepete ekle" });
  fireEvent.click(add);
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "olive-large", quantity: 1 }]);
  fireEvent.click(add);
  fireEvent.click(add);
  fireEvent.click(add);
  expect(screen.getByRole("alert").textContent).toContain("eklenemedi");
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)[0].quantity).toBe(3);
});

it("keeps product and size choices consistent, including unavailable products", () => {
  render(<CartProvider products={products}><HeroIntro products={products} /></CartProvider>);
  fireEvent.click(screen.getByRole("radio", { name: "Zeytinyağı" }));
  expect(screen.getByTestId("hero-product").textContent).toContain("500 ML");
  expect(screen.getByTestId("hero-product").textContent).toContain("350,00 ₺");
  expect(screen.getByRole("button", { name: "Tükendi" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getAllByRole("radio").filter((node) => node.getAttribute("aria-checked") === "true")).toHaveLength(2);
});

it("supports keyboard arrows, Home and End with one tab stop per group", () => {
  render(<CartProvider products={products}><HeroIntro products={products} /></CartProvider>);
  const group = within(screen.getByRole("radiogroup", { name: "Ürün" }));
  const olive = group.getByRole("radio", { name: "Sofralık Zeytin" });
  fireEvent.keyDown(olive, { key: "ArrowRight" });
  expect(document.activeElement).toBe(group.getByRole("radio", { name: "Zeytinyağı" }));
  fireEvent.keyDown(document.activeElement!, { key: "Home" });
  expect(document.activeElement).toBe(olive);
  fireEvent.keyDown(olive, { key: "End" });
  expect(document.activeElement).toBe(group.getByRole("radio", { name: "Zeytinyağı" }));
  expect(group.getAllByRole("radio").filter((node) => node.tabIndex === 0)).toHaveLength(1);
});

it("keeps the headline and catalogue destination when no products are available", () => {
  render(<HeroIntro products={[]} />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Kökü toprakta.");
  expect(screen.getByRole("link", { name: "Ürünleri keşfet" }).getAttribute("href")).toBe("#urunler");
  expect(screen.queryByRole("radiogroup")).toBeNull();
  expect(screen.queryByRole("button", { name: "Sepete ekle" })).toBeNull();
});

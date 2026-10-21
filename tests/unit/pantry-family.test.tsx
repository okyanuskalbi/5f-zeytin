import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PantryFamily } from "@/components/landing/PantryFamily";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { v3Image } from "@/lib/media/v3-assets";

vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); });

it("updates the selected size, price and stored variant without opening the drawer", async () => {
  const [family] = await getProductFamilies();
  const products = await getProducts();
  render(<CartProvider products={products}><PantryFamily family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} /></CartProvider>);
  expect(screen.getByLabelText("Fiyat").textContent).toContain("₺220,00");
  fireEvent.click(screen.getByRole("radio", { name: "10 kg" }));
  expect(screen.getByLabelText("Fiyat").textContent).toContain("₺2.200,00");
  expect(screen.getByRole("img").getAttribute("alt")).toContain("10 kg teneke");
  fireEvent.click(screen.getByRole("button", { name: "Ekle" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Eklendi ✓" })).toBeDefined());
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "sample-green-olive-10kg", quantity: 1 }]);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("disables sold out stock with one variant", async () => {
  const family = (await getProductFamilies())[1];
  render(<CartProvider products={await getProducts()}><PantryFamily family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} /></CartProvider>);
  const button = screen.getByRole("button", { name: "Tükendi" }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(button);
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart") ?? "[]")).toEqual([]);
});

it("preserves the cart and explains stock limits on a rejected add", async () => {
  const [family] = await getProductFamilies();
  localStorage.setItem("afina-zeytin:cart", JSON.stringify([{ productId: family.variants[0].id, quantity: family.variants[0].stock }]));
  render(<CartProvider products={await getProducts()}><PantryFamily family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Ekle" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Stok"));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)[0].quantity).toBe(12);
});

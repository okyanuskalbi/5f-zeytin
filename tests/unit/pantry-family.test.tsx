import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PantryFamily } from "@/components/landing/PantryFamily";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { v3Image } from "@/lib/media/v3-assets";

vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); });

it("changes image and price with size and stores the selected variant ID", async () => {
  const [family] = await getProductFamilies();
  const products = await getProducts();
  render(<CartProvider products={products}><PantryFamily family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} /></CartProvider>);
  expect(screen.getByText("₺220,00")).toBeDefined();
  fireEvent.change(screen.getByLabelText("Boy"), { target: { value: "1" } });
  expect(screen.getByText("₺2.200,00")).toBeDefined();
  expect(screen.getByRole("img").getAttribute("alt")).toContain("10 kg teneke");
  fireEvent.change(screen.getByLabelText("Adet"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "sample-green-olive-10kg", quantity: 2 }]);
  fireEvent.change(screen.getByLabelText("Adet"), { target: { value: "6" } });
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(screen.getByRole("alert").textContent).toContain("sepete eklenemedi");
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "sample-green-olive-10kg", quantity: 2 }]);
});

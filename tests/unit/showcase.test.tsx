import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product } from "@/types/catalog";

vi.mock("@/lib/catalog/static-products", () => ({ getProducts: vi.fn() }));
vi.mock("@/components/media/ScrollFrameSequence", () => ({ ScrollFrameSequence: () => <div /> }));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));

const products: readonly Product[] = [
  { id: "olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 2 },
  { id: "oil", name: "Zeytinyağı", category: "zeytinyagi", weight: "500 ml", priceKurus: 35000, stock: 0 },
];
afterEach(() => { cleanup(); localStorage.clear(); vi.mocked(getProducts).mockReset(); });

it("presents product slips with the existing quantity, stock and shared cart behavior", async () => {
  vi.mocked(getProducts).mockResolvedValue(products);
  render(<CartProvider products={products}>{await Home()}</CartProvider>);
  const row = within(screen.getByRole("region", { name: "Ürün fişleri" }));
  const olive = within(row.getByRole("article", { name: "Sofralık Zeytin" }));
  expect(olive.getByText("· · · · ·").getAttribute("aria-hidden")).toBe("true");
  expect(olive.getByText("125,50 ₺")).toBeDefined();
  fireEvent.click(olive.getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(olive.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "olive", quantity: 2 }]);
  fireEvent.click(olive.getByRole("button", { name: "Sepete ekle" }));
  expect(olive.getByRole("alert").textContent).toContain("eklenemedi");
  const soldOut = within(row.getByRole("article", { name: "Zeytinyağı" }));
  expect(soldOut.getByText("Tükendi")).toBeDefined();
  for (const button of soldOut.getAllByRole("button")) expect(button.hasAttribute("disabled")).toBe(true);
});

it("keeps the poster, official product scope and at most six slips without inventing images", async () => {
  vi.mocked(getProducts).mockResolvedValue(Array.from({ length: 7 }, (_, index) => ({ ...products[0], id: String(index), name: `Ürün ${index + 1}` })));
  render(await Home());
  const showcase = within(screen.getByRole("region", { name: "Ürünlerimiz" }));
  expect(showcase.getAllByRole("article")).toHaveLength(6);
  expect(showcase.queryByText("Ürün 7")).toBeNull();
  expect(showcase.getByText(/Sofralık zeytin, salamura zeytin ve zeytinyağı/)).toBeDefined();
  expect(showcase.getByText(/perakende ve toptan/)).toBeDefined();
  const row = showcase.getByRole("region", { name: "Ürün fişleri" });
  expect(row.querySelector("img")).toBeNull();
});

it("retains a readable empty catalog destination", async () => {
  vi.mocked(getProducts).mockResolvedValue([]);
  render(await Home());
  const showcase = within(screen.getByRole("region", { name: "Ürünlerimiz" }));
  expect(showcase.getByRole("status").textContent).toContain("Görüntülenecek ürün bulunmuyor.");
  expect(showcase.queryByRole("article")).toBeNull();
});

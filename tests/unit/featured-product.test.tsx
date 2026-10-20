import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FeaturedProduct } from "@/components/landing/FeaturedProduct";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product } from "@/types/catalog";

vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
const products: Product[] = [1, 5, 10].map(size => ({ id: `olive-${size}`, name: "Doğal Kırma Yeşil Zeytin",
  category: "sofralik-zeytin", weight: `${size} kg`, priceKurus: size * 22000, stock: size === 5 ? 0 : 2 }));
afterEach(() => { cleanup(); localStorage.clear(); });
function mount(items = products) {
  render(<CartProvider products={items}><FeaturedProduct products={items} /></CartProvider>);
  return within(screen.getByRole("region", { name: "Doğal Kırma Yeşil Zeytin" }));
}

it("offers 1/5/10 kg from the catalog, defaults to 10 kg and updates its displayed price and weight", () => {
  const section = mount();
  expect(section.getByRole("radio", { name: "10 kg" }).hasAttribute("checked")).toBe(true);
  expect(section.getByRole("status", { name: "Seçilen boy ve fiyat" }).textContent).toContain("10 kg · 2.200,00 ₺");
  fireEvent.click(section.getByRole("radio", { name: "1 kg" }));
  expect(section.getByRole("status", { name: "Seçilen boy ve fiyat" }).textContent).toContain("1 kg · 220,00 ₺");
});

it("adds the selected SKU and quantity to the shared cart and reports cumulative stock failure", () => {
  const section = mount();
  fireEvent.click(section.getByRole("radio", { name: "1 kg" }));
  fireEvent.click(section.getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(section.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "olive-1", quantity: 2 }]);
  fireEvent.click(section.getByRole("button", { name: "Sepete ekle" }));
  expect(section.getByRole("alert").textContent).toContain("eklenemedi");
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart")!)).toEqual([{ productId: "olive-1", quantity: 2 }]);
});

it("resets quantity on size changes, keeps sold-out sizes readable and prevents invalid quantities", () => {
  const section = mount();
  fireEvent.change(section.getByRole("spinbutton"), { target: { value: "1.5" } });
  fireEvent.click(section.getByRole("button", { name: "Sepete ekle" }));
  expect(section.getByRole("alert").textContent).toContain("tam sayı");
  fireEvent.click(section.getByRole("radio", { name: "5 kg" }));
  expect((section.getByRole("spinbutton") as HTMLInputElement).value).toBe("1");
  expect(section.getByRole("button", { name: "Tükendi" }).hasAttribute("disabled")).toBe(true);
  expect(section.getByRole("radio", { name: "5 kg" }).hasAttribute("disabled")).toBe(false);
});

it("never substitutes unrelated products or invents missing sizes, and preserves the wholesale destination", () => {
  const section = mount([products[0], { ...products[2], name: "Başka ürün" }]);
  expect(section.getAllByRole("radio")).toHaveLength(1);
  expect(section.getByRole("link", { name: "Toptan alım için teklif isteyin" }).getAttribute("href")).toBe("#toptan");
  cleanup();
  render(<FeaturedProduct products={[]} />);
  expect(screen.getByRole("status").textContent).toContain("Görüntülenecek ürün bulunmuyor");
  expect(screen.queryByRole("button", { name: "Sepete ekle" })).toBeNull();
});

it("keeps the temporary catalog at six products including three explicitly sample variants", async () => {
  const catalog = await getProducts();
  expect(catalog).toHaveLength(6);
  expect(catalog.filter(p => p.name === products[0].name).map(p => p.weight)).toEqual(["1 kg", "5 kg", "10 kg"]);
  expect(catalog.every(p => p.id.startsWith("sample-"))).toBe(true);
});

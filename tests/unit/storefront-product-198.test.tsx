import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { ProductTile } from "@/components/storefront/ProductTile";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.unstubAllGlobals(); });

it("retains the selected size, real SKU, quantity and quotation target together", async () => {
  const family = (await getProductFamilies())[2];
  const products = await getProducts();
  history.replaceState({ retained: true }, "", "/urun/naturel-sizma-zeytinyagi?boy=5%20L&kaynak=test");
  render(<CartProvider products={products}><ProductDetail family={family} related={[]} /></CartProvider>);
  expect(screen.getByLabelText("Fiyat").textContent).toContain("1.750");
  fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(screen.getByRole("radio", { name: "1 L" }));
  expect(screen.getByLabelText("Adet").textContent).toBe("1");
  expect(history.state).toEqual({ retained: true });
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("test");
  expect(screen.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toBe("/toptan-satis?teklif=sample-olive-oil-1l");
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart") ?? "null")).toEqual([{ productId: "sample-olive-oil-1l", quantity: 1 }]);
});

it("switches real studio and scene images without changing product or price", async () => {
  const family = (await getProductFamilies())[0];
  const { container } = render(<ProductDetail family={family} related={[]} />);
  const before = container.querySelector("[data-product-detail-image] img")?.getAttribute("src");
  fireEvent.click(screen.getByRole("button", { name: "Sofra görseli" }));
  expect(container.querySelector("[data-product-detail-image] img")?.getAttribute("src")).not.toBe(before);
  expect(screen.getByRole("button", { name: "Sofra görseli" }).getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector("[data-product-id]")?.getAttribute("data-product-id")).toBe(family.variants[0].id);
  expect(screen.getByText("Saklama bilgisi")).toBeTruthy();
});

it("keeps unavailable products visible but prevents buying and retains quotation", async () => {
  const family = (await getProductFamilies())[1];
  render(<ProductDetail family={family} related={[]} />);
  expect(screen.getByRole("button", { name: "Mevcut değil" }).hasAttribute("disabled")).toBe(true);
  expect(screen.queryByRole("group", { name: "Adet seçimi" })).toBeNull();
  expect(screen.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toContain(family.variants[0].id);
});

it("limits related products to four unique SKUs excluding the selected product", async () => {
  const family = (await getProductFamilies())[0];
  const products = await getProducts();
  const { container } = render(<ProductDetail family={family} related={[...products, ...products]} />);
  const ids = [...container.querySelectorAll('section[aria-labelledby="benzer-title"] [data-product-id]')].map(node => node.getAttribute("data-product-id"));
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(4);
  expect(ids).not.toContain(family.variants[0].id);
});

it("product tiles provide separate detail, buy and quotation actions with their full names", async () => {
  const product = (await getProducts())[0];
  render(<ProductTile product={product} />);
  const tile = within(screen.getByRole("article"));
  expect(tile.getByRole("heading", { name: product.name })).toBeTruthy();
  expect(tile.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toBe(`/toptan-satis?teklif=${product.id}`);
  expect(tile.getByRole("button", { name: "Sepete ekle" })).toBeTruthy();
  expect(tile.getByText("Stokta mevcut")).toBeTruthy();
});

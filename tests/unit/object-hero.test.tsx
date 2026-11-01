import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { OliveScrollHero } from "@/components/landing/OliveScrollHero";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product, ProductVariant } from "@/types/catalog";

const boundary = vi.hoisted(() => ({ detail: vi.fn(), add: vi.fn() }));
vi.mock("@/components/media/CinematicFilm", () => ({
  CinematicFilm: ({ children }: { children?: ReactNode }) => <div data-test-film="">{children}</div>,
}));
vi.mock("@/components/catalog/ProductDetailProvider", () => ({ useProductDetail: () => boundary.detail }));
vi.mock("@/components/catalog/AddToCart", () => ({
  AddToCart: ({ product }: { product: Product }) => <button type="button" data-add-sku={product.id} data-add-stock={product.stock}
    disabled={product.stock === 0} onClick={() => boundary.add(product.id, 1)}>Sepete ekle</button>,
}));

let products: readonly ProductVariant[];
beforeAll(async () => { products = await getProducts(); });
beforeEach(() => {
  boundary.detail.mockClear(); boundary.add.mockClear();
  vi.stubGlobal("matchMedia", (query: string) => ({ media: query, matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class { observe(): void {} disconnect(): void {} });
  vi.stubGlobal("ResizeObserver", class { observe(): void {} unobserve(): void {} disconnect(): void {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("renders the actual default SKU and purchase data in the server opening", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<OliveScrollHero products={products} />);
  const selected = doc.querySelector('[data-hero-product="sample-green-olive-10kg"]');
  expect(selected).not.toBeNull();
  expect(selected?.textContent).toContain("Doğal Kırma Yeşil Zeytin");
  expect(selected?.textContent).toContain("10 kg");
  expect(selected?.textContent).toMatch(/2[.\s]?200/);
  expect(selected?.querySelector("[data-add-sku]")?.getAttribute("data-add-sku")).toBe("sample-green-olive-10kg");
  expect(selected?.querySelector("[data-add-stock]")?.getAttribute("data-add-stock")).toBe("6");
  expect(doc.querySelector('button[aria-label="Doğal Kırma Yeşil Zeytin, 10 kg seç"]')?.getAttribute("aria-pressed")).toBe("true");
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  expect(doc.querySelector('a[href="#urunler"]')).not.toBeNull();
});

it("changes image, price, detail and cart SKU together while preserving selector focus", () => {
  const view = render(<OliveScrollHero products={products} />);
  const firstImage = view.container.querySelector("[data-product-plane] img")?.getAttribute("src");
  expect(firstImage).toBeTruthy();
  const choice = screen.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin, 1 kg seç" });
  choice.focus();
  fireEvent.click(choice);
  expect(document.activeElement).toBe(choice);
  expect(choice.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "Doğal Kırma Yeşil Zeytin, 10 kg seç" }).getAttribute("aria-pressed")).toBe("false");
  const selected = view.container.querySelector('[data-hero-product="sample-green-olive-1kg"]');
  expect(selected?.textContent).toContain("1 kg");
  expect(selected?.textContent).toMatch(/220/);
  expect(selected?.textContent).not.toMatch(/2[.]200/);
  expect(view.container.querySelector("[data-product-plane] img")?.getAttribute("src")).not.toBe(firstImage);
  const detail = screen.getByRole("button", { name: "Ürünü incele" });
  fireEvent.click(detail);
  expect(boundary.detail).toHaveBeenCalledWith("sample-green-olive-1kg", detail);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(boundary.add).toHaveBeenCalledExactlyOnceWith("sample-green-olive-1kg", 1);
});

it("uses the selected oil variant's supplied price and stock instead of the previous package", () => {
  const soldOut = products.map(product => product.id === "sample-olive-oil-1l" ? { ...product, priceKurus: 77700, stock: 0 } : product);
  const view = render(<OliveScrollHero products={soldOut} />);
  fireEvent.click(screen.getByRole("button", { name: "Natürel Sızma Zeytinyağı, 1 L seç" }));
  const selected = view.container.querySelector('[data-hero-product="sample-olive-oil-1l"]');
  expect(selected?.textContent).toContain("Natürel Sızma Zeytinyağı");
  expect(selected?.textContent).toContain("1 L");
  expect(selected?.textContent).toMatch(/777/);
  const add = screen.getByRole("button", { name: "Sepete ekle" }) as HTMLButtonElement;
  expect(add.getAttribute("data-add-sku")).toBe("sample-olive-oil-1l");
  expect(add.getAttribute("data-add-stock")).toBe("0");
  expect(add.disabled).toBe(true);
  fireEvent.click(add);
  expect(boundary.add).not.toHaveBeenCalled();
  const detail = screen.getByRole("button", { name: "Ürünü incele" });
  fireEvent.click(detail);
  expect(boundary.detail).toHaveBeenCalledWith("sample-olive-oil-1l", detail);
});

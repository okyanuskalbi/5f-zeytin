import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Layout from "@/app/urunler/layout";
import Page, { dynamic, metadata, revalidate } from "@/app/urunler/page";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

const { readFamilies } = vi.hoisted(() => ({ readFamilies: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/urunler" }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: readFamilies }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(async () => {
  readFamilies.mockResolvedValue([...(await getProductFamilies())].reverse());
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); history.replaceState(null, "", "/"); });

it("serves the full static catalogue with breadcrumb, unchanged cards and quote links before JavaScript", async () => {
  const products = await getProducts();
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Layout>{await Page()}</Layout>), "text/html");
  expect(dynamic).toBe("force-static");
  expect(revalidate).toBe(300);
  expect(doc.querySelector("h1")?.textContent).toBe("Tüm ürünler");
  expect(doc.body.textContent).toContain("Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.");
  expect(doc.querySelector('nav[aria-label] a[href="/"]')?.textContent).toBe("Ana Sayfa");
  expect(doc.querySelector('nav [aria-current="page"]')?.textContent).toBe("Ürünler");
  const cards = [...doc.querySelectorAll("[data-product-id]")];
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  expect(cards.map(card => card.getAttribute("data-product-id"))).toEqual(ordered.map(product => product.id));
  for (const product of products) {
    const card = doc.querySelector(`[data-product-id="${product.id}"]`)!;
    expect(card.closest("[data-static-presentation]")).not.toBeNull();
    const quote = card.querySelector(`a[href="/toptan-satis?teklif=${product.id}"]`);
    expect(quote?.textContent).toContain("Teklife ekle");
    expect(quote?.getAttribute("aria-label")).toBe(`Teklife ekle: ${product.name}, ${product.weight}`);
  }
  expect(doc.querySelector('[role="dialog"]')).toBeNull();
  expect(doc.querySelector("button")?.textContent).not.toBe("Kapat");
});

it("keeps unapproved prices out of search indexing and supplies only a breadcrumb schema", async () => {
  expect(metadata.title).toBe("Ürünler | AFİNA ZEYTİN");
  expect(metadata.alternates?.canonical).toBe("/urunler");
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.openGraph).toMatchObject({ url: "/urunler", title: "Ürünler | AFİNA ZEYTİN" });
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Layout>{await Page()}</Layout>), "text/html");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  expect(schemas).toEqual([expect.objectContaining({ "@type": "BreadcrumbList", itemListElement: [
    expect.objectContaining({ position: 1, name: "Ana Sayfa", item: "https://afinazeytin.com/" }),
    expect.objectContaining({ position: 2, name: "Ürünler", item: "https://afinazeytin.com/urunler" }),
  ] })]);
});

it("announces an empty catalogue without a second scrolling dialog", async () => {
  readFamilies.mockResolvedValue([]);
  render(<Layout>{await Page()}</Layout>);
  expect(screen.getByRole("status").textContent).toBe("Görüntülenecek ürün bulunmuyor.");
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("links each detail to its product page while preserving its explicit quote action", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><Layout>{await Page()}</Layout></CartProvider>);
  expect(screen.getAllByRole("link", { name: /^Teklife ekle:/ })).toHaveLength(products.length);
  const card = document.querySelector('[data-product-id="sample-olive-oil-1l"]')!;
  expect(within(card as HTMLElement).getAllByRole("link").filter(link => link.getAttribute("href")?.startsWith("/urun/")).length).toBeGreaterThan(0);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("sorts the visible sizes through a shareable query while preserving other parameters", async () => {
  history.replaceState(null, "", "/urunler?kaynak=yerel");
  render(<Layout>{await Page()}</Layout>);
  const ids = () => [...document.querySelectorAll('[data-product-id]')].map(card => card.getAttribute("data-product-id"));
  fireEvent.change(screen.getByRole("combobox", { name: "Sıralama" }), { target: { value: "fiyat-artan" } });
  expect(location.search).toBe("?kaynak=yerel&sirala=fiyat-artan");
  expect(ids()).toEqual(["sample-green-olive-1kg", "sample-black-olive-1kg", "sample-olive-oil-1l", "sample-brined-green-olive-5kg", "sample-olive-oil-5l", "sample-green-olive-10kg"]);
  fireEvent.change(screen.getByRole("combobox", { name: "Sıralama" }), { target: { value: "fiyat-azalan" } });
  expect(ids()[0]).toBe("sample-green-olive-10kg");
});

it("selects a direct price query and follows browser history back to the recommended order", async () => {
  history.replaceState(null, "", "/urunler?sirala=fiyat-azalan");
  render(<Layout>{await Page()}</Layout>);
  expect((screen.getByRole("combobox", { name: "Sıralama" }) as HTMLSelectElement).value).toBe("fiyat-azalan");
  expect(document.querySelectorAll('[data-product-id]')[1]?.getAttribute("data-product-id")).toBe("sample-olive-oil-5l");
  history.replaceState(null, "", "/urunler?sirala=bilinmeyen");
  fireEvent(window, new PopStateEvent("popstate"));
  expect((screen.getByRole("combobox", { name: "Sıralama" }) as HTMLSelectElement).value).toBe("onerilen");
  expect(document.querySelectorAll('[data-product-id]')[1]?.getAttribute("data-product-id")).toBe("sample-green-olive-1kg");
});

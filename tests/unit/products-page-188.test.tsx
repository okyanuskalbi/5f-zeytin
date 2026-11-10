import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Page, { dynamic, metadata, revalidate } from "@/app/urunler/page";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

const { readFamilies } = vi.hoisted(() => ({ readFamilies: vi.fn() }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: readFamilies }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(async () => {
  readFamilies.mockResolvedValue([...(await getProductFamilies())].reverse());
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); history.replaceState(null, "", "/"); });

it("serves the full static catalogue with breadcrumb, unchanged cards and quote links before JavaScript", async () => {
  const products = await getProducts();
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
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
    const quote = card.querySelector(`a[href="/?teklif=${product.id}#toptan"]`);
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
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  expect(schemas).toEqual([expect.objectContaining({ "@type": "BreadcrumbList", itemListElement: [
    expect.objectContaining({ position: 1, name: "Ana Sayfa", item: "https://afinazeytin.com/" }),
    expect.objectContaining({ position: 2, name: "Ürünler", item: "https://afinazeytin.com/urunler" }),
  ] })]);
});

it("announces an empty catalogue without a second scrolling dialog", async () => {
  readFamilies.mockResolvedValue([]);
  render(await Page());
  expect(screen.getByRole("status").textContent).toBe("Görüntülenecek ürün bulunmuyor.");
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("opens the existing product detail from the page and disables its in-memory quote action", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await Page()}</CartProvider>);
  expect(screen.getAllByRole("link", { name: /^Teklife ekle:/ })).toHaveLength(products.length);
  fireEvent.click(screen.getByRole("button", { name: "Natürel Sızma Zeytinyağı, 1 L detayını aç" }));
  const dialog = await screen.findByRole("dialog", { name: "Natürel Sızma Zeytinyağı" });
  expect(within(dialog).queryByRole("button", { name: /^Teklife ekle/ })).toBeNull();
});

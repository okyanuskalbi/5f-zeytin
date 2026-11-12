import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Page, { dynamic, metadata, revalidate } from "@/app/page";
import { CartProvider } from "@/components/cart/CartProvider";
import { productHref } from "@/lib/catalog/product-pages";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

// Task208: the `/urunler` page became the "#urunler" section of the home page. Sorting, the page's own
// breadcrumb schema and the per-card quotation link were removed with it.
const { readFamilies } = vi.hoisted(() => ({ readFamilies: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: readFamilies }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(async () => {
  readFamilies.mockResolvedValue([...(await getProductFamilies())].reverse());
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); history.replaceState(null, "", "/"); });

const section = (doc: ParentNode) => doc.querySelector<HTMLElement>("#urunler")!;

it("serves the full static catalogue in the products section with unchanged cards before JavaScript", async () => {
  const products = await getProducts();
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
  expect(dynamic).toBe("force-static");
  expect(revalidate).toBe(300);
  const shelf = section(doc);
  expect(shelf.querySelector("h2")?.textContent).toBe("Sofranıza AFİNA");
  expect(doc.getElementById(shelf.getAttribute("aria-labelledby")!)).toBe(shelf.querySelector("h2"));
  const cards = [...shelf.querySelectorAll("[data-product-id]")];
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  expect(cards.map(card => card.getAttribute("data-product-id"))).toEqual(ordered.map(product => product.id));
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(products.length);
  for (const product of products) {
    const card = shelf.querySelector(`[data-product-id="${product.id}"]`)!;
    expect(card.getAttribute("data-size")).toBe(product.weight);
    expect(card.querySelector('a[href*="teklif="]')).toBeNull();
    expect(card.querySelectorAll("[data-pill]")).toHaveLength(1);
  }
  expect(doc.querySelector('[role="dialog"]')).toBeNull();
  expect(shelf.querySelector('select, [role="combobox"]')).toBeNull();
});

it("keeps the home page canonical and adds no product, offer or price schema for the unapproved prices", async () => {
  expect(metadata.alternates?.canonical).toBe("/");
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  const types = schemas.flatMap(schema => schema["@graph"] ? schema["@graph"].map((node: { "@type": string }) => node["@type"]) : [schema["@type"]]);
  expect(types).not.toEqual(expect.arrayContaining(["Product"]));
  expect(JSON.stringify(schemas)).not.toMatch(/"(?:Offer|AggregateOffer|price|priceCurrency)"/);
  expect(JSON.stringify(schemas)).not.toMatch(/afinazeytin\.com\/urunler/);
});

it("announces an empty catalogue without a second scrolling dialog", async () => {
  readFamilies.mockResolvedValue([]);
  render(await Page());
  const notice = section(document).querySelector('[role="status"]');
  expect(notice?.textContent?.trim()).toMatch(/ürün bulunmuyor\.$/);
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("links each card to its product page and leaves quoting to the wholesale form", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await Page()}</CartProvider>);
  expect(screen.queryAllByRole("link", { name: "Teklife ekle" })).toHaveLength(0);
  for (const product of products) {
    const card = section(document).querySelector<HTMLElement>(`[data-product-id="${product.id}"]`)!;
    const links = within(card).getAllByRole("link").map(link => link.getAttribute("href"));
    expect(links).toEqual([productHref(product), productHref(product)]);
  }
  expect(document.querySelector('#toptan [name="productId"]')).not.toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
});

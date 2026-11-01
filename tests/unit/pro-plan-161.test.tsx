import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product } from "@/types/catalog";

vi.mock("@/lib/catalog/read", async () => {
  const { getProductFamilies } = await import("@/lib/catalog/static-products");
  return { readProductFamilies: vi.fn(getProductFamilies) };
});
vi.mock("@/components/media/CinematicFilm", () => ({
  CinematicFilm: ({ children }: { children?: ReactNode }) => <div data-test-film="">{children}</div>,
}));
vi.mock("@/components/catalog/ProductDetailProvider", () => ({
  ProductDetailProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useProductDetail: () => undefined,
}));
vi.mock("@/components/catalog/AddToCart", () => ({
  AddToCart: ({ product }: { product: Product }) => <button type="button" data-add-sku={product.id}
    disabled={product.stock === 0}>Sepete ekle</button>,
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ media: query, matches: false, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { vi.unstubAllGlobals(); });

async function serverDocument(): Promise<Document> {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  return doc;
}

it("serves seven ordered, named sections with their actual 21st sources before JavaScript", async () => {
  const doc = await serverDocument();
  const contract = [
    ["baslangic", "32829"], ["urunler", "24623"], ["tesisimiz", "20023"],
    ["uretim-yolculugu", "1197"], ["toptan-iletisim", "7262"], ["teklif", "35258"], ["iletisim", "31986"],
  ];
  const sections = [...doc.querySelectorAll("main section[data-sc-scene]")];
  expect(sections.map(section => section.id)).toEqual(contract.map(([id]) => id));
  for (const [id, source] of contract) {
    const section = doc.getElementById(id);
    expect(section?.getAttribute("data-21st-source"), id).toBe(source);
    expect(section?.getAttribute("data-sc-device"), id).toBeTruthy();
    const label = section?.getAttribute("aria-labelledby");
    expect(label, id).toBeTruthy();
    expect(label && doc.getElementById(label)?.textContent?.trim(), id).toBeTruthy();
  }
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  const hero = doc.getElementById("baslangic");
  expect(hero?.querySelector('a[href="#urunler"]')?.textContent).toContain("Ürünleri Keşfet");
  expect(hero?.querySelector('a[href="#teklif"]')?.textContent).toContain("Kurumsal Teklif");
});

it("keeps all six supplied SKU identities, prices and quote actions in the server gallery", async () => {
  const [doc, products] = await Promise.all([serverDocument(), getProducts()]);
  const gallery = doc.getElementById("urunler");
  expect(gallery?.querySelectorAll("[data-product-id]")).toHaveLength(products.length);
  const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  for (const product of products) {
    const card = gallery?.querySelector(`[data-product-id="${product.id}"]`);
    expect(card?.textContent, product.id).toContain(product.name);
    expect(card?.textContent, product.id).toContain(product.weight);
    expect(card?.querySelector('[aria-label="Fiyat"]')?.textContent?.replace(/\s/g, ""), product.id)
      .toBe(money.format(product.priceKurus / 100).replace(/\s/g, ""));
    expect([...card!.querySelectorAll("button,a")].some(control => control.textContent?.trim() === "Teklife ekle"), product.id).toBe(true);
    expect(card?.querySelector("[data-add-sku]")?.getAttribute("data-add-sku"), product.id).toBe(product.id);
  }
  // A scripted form must never leak personal data through a default GET.
  expect(doc.getElementById("teklif")?.querySelector("form")?.getAttribute("method")).toBe("post");
});

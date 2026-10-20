import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types/catalog";
import { getProducts } from "@/lib/catalog/static-products";
import Home from "@/app/page";

vi.mock("@/lib/catalog/static-products", () => ({ getProducts: vi.fn() }));

beforeEach(() => vi.mocked(getProducts).mockReset());

describe("landing scene catalog boundaries", () => {
  it("renders an empty catalog status on the server while retaining the product destination", async () => {
    vi.mocked(getProducts).mockResolvedValue([]);
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Görüntülenecek ürün bulunmuyor.");
    expect(html).not.toContain("<article");
    for (const id of ["hikayemiz", "urunler", "toptan-iletisim"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('href="#urunler"');
    expect(html).toContain("Ürünleri keşfet");
  });

  it("renders only the first six supplied products without mutating the catalog", async () => {
    const products: readonly Product[] = Object.freeze(Array.from({ length: 7 }, (_, index) => Object.freeze({
      id: `boundary-${index}`, name: `Sınır ürünü ${index + 1}`, category: "sofralik-zeytin" as const,
      weight: "500 g", priceKurus: 12550, stock: 3,
    })));
    vi.mocked(getProducts).mockResolvedValue(products);
    const html = renderToStaticMarkup(await Home());

    expect(html.match(/<article /g)).toHaveLength(6);
    for (let index = 1; index <= 6; index++) expect(html).toContain(`Sınır ürünü ${index}`);
    expect(html).not.toContain("Sınır ürünü 7");
    expect(products).toHaveLength(7);
    expect(products[6].id).toBe("boundary-6");
  });
});

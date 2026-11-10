import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));

it("serves the customer's ordered light storefront with honest product grids and working destination links", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
    "hero", "categories", "products", "story", "featured", "banners", "harvest", "marquee", "business", "blog", "trust",
  ]);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector('#baslangic a[href="/urunler"]')?.textContent).toContain("Ürünleri İnceleyin");
  expect(doc.querySelector('#baslangic a[href="/toptan-satis"]')).not.toBeNull();
  expect(doc.querySelectorAll('[data-home-section="products"] [data-product-id]')).toHaveLength(4);
  expect(doc.querySelectorAll('[data-home-section="featured"] [data-product-id]')).toHaveLength(4);
  const products = [...doc.querySelectorAll('[data-home-section="products"] [data-product-id]')].map(item => item.getAttribute("data-product-id"));
  const featured = [...doc.querySelectorAll('[data-home-section="featured"] [data-product-id]')].map(item => item.getAttribute("data-product-id"));
  expect(featured).not.toEqual(products);
  expect(doc.querySelectorAll('[data-home-section="blog"] a[href^="/blog/"]')).toHaveLength(3);
  expect(doc.querySelector('[data-home-section="harvest"]')?.textContent).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
  expect(doc.querySelectorAll('[data-home-section="harvest"] li')).toHaveLength(4);
  expect(doc.querySelector("main")?.textContent).not.toMatch(/Ayvalık|Köklü|Doğallığın En Güzel Halleri|kişi inceliyor|İndirimdeki|aynı gün kargo|Müşteri Yorumları|500.000/);
  expect(doc.querySelector('[data-home-section="business"] img')).toBeNull();
  expect(doc.querySelector('#toptan form')).not.toBeNull();
});

it("makes the hero poster the eager server image and keeps autoplay video out of the first paint", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  const poster = doc.querySelector<HTMLImageElement>('#baslangic [data-hero-photo] img')!;
  expect(poster.getAttribute("src")).toContain("hero-poster");
  expect(poster.getAttribute("loading")).toBe("eager");
  expect(poster.getAttribute("fetchPriority")).toBe("high");
  expect(doc.querySelector("#baslangic video")).toBeNull();
  expect(doc.querySelectorAll('[data-home-section="marquee"] [aria-hidden="true"]')).toHaveLength(1);
});

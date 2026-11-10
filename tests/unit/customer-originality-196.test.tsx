import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

async function renderHome(): Promise<Document> {
  return new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
}

it("keeps the brief content and order without the reference site's wording", async () => {
  const doc = await renderHome();
  expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
    "hero", "categories", "products", "story", "featured", "banners", "harvest", "marquee", "business", "blog", "trust",
  ]);
  const text = doc.querySelector("main")?.textContent ?? "";
  for (const phrase of ["TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Sizden Gelen", "Rehberi", "Daha Fazlasını Keşfet", "En Beğenilen"]) {
    expect(text).not.toContain(phrase);
  }
  expect(text).toContain("Bereketin Hasat Vakti");
  expect(text).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
  expect(text).toContain("Zeytin Defteri");
  for (const phrase of ["Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız", "Hikayemizi Keşfet"]) {
    expect(text).toContain(phrase);
  }
});

it("uses the AFİNA index, mosaic, harvest ledger and signature instead of reference compositions", async () => {
  const doc = await renderHome();
  expect(doc.querySelector('[data-home-section="categories"]')?.getAttribute("data-category-layout")).toBe("index");
  expect(doc.querySelector('[data-home-section="products"]')?.getAttribute("data-product-layout")).toBe("asymmetric");
  expect(doc.querySelector('[data-home-section="featured"]')?.getAttribute("data-product-layout")).toBe("asymmetric");
  expect(doc.querySelector('[data-home-section="story"] [data-story-values]')).not.toBeNull();
  expect(doc.querySelector('[data-home-section="banners"]')?.getAttribute("data-banner-layout")).toBe("mosaic");
  expect(doc.querySelector('[data-home-section="banners"] a[data-banner-lead]')?.textContent).toContain("Tesisimiz");
  expect(doc.querySelector('[data-home-section="banners"]')?.textContent).not.toContain("Keşfedin");
  expect(doc.querySelectorAll('[data-home-section="banners"] [data-banner-number]')).toHaveLength(0);
  expect(doc.querySelector('[data-home-section="harvest"] [data-harvest-ledger]')).not.toBeNull();
  expect(doc.querySelector('[data-home-section="harvest"] ol')).toBeNull();
  expect(doc.querySelectorAll('[data-home-section="harvest"] [data-harvest-ledger] li')).toHaveLength(4);
  expect(doc.querySelector('[data-home-section="trust"]')?.getAttribute("data-signature")).toBe("dal-ve-etiket");
});

it("keeps reference wording out of the public text resource", async () => {
  const { GET } = await import("@/app/llms.txt/route");
  const text = await (await GET()).text();
  for (const phrase of ["TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Sizden Gelen", "Rehberi", "Daha Fazlasını Keşfet", "En Beğenilen"]) {
    expect(text).not.toContain(phrase);
  }
  expect(text).toContain("Zeytin Defteri");
});

import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams(window.location.search), usePathname: () => "/" }));

async function renderHome(): Promise<Document> {
  return new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
}

// Task208: six sections; "Hikayemizi Keşfet" led to the retired about page and is gone with it.
it("keeps the brief content and order without the reference site's wording", async () => {
  const doc = await renderHome();
  expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
    "hero", "products", "story", "business", "blog", "contact",
  ]);
  const text = doc.querySelector("main")?.textContent ?? "";
  for (const phrase of ["TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Sizden Gelen", "Rehberi", "Daha Fazlasını Keşfet", "En Beğenilen"]) {
    expect(text).not.toContain(phrase);
  }
  expect(text).toContain("Bereketin Hasat Vakti");
  expect(text).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
  expect(text).toContain("Zeytin Defteri");
  for (const phrase of ["Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız"]) {
    expect(text).toContain(phrase);
  }
});

// Task208: portals, the two shelves and the linked triptych merged into category pills, one grid and three captioned photographs.
it("uses AFİNA's own category pills, one product grid and captioned facility photographs without reference numbering", async () => {
  const doc = await renderHome();
  expect(doc.querySelector('[data-home-section="categories"], [data-home-section="featured"], [data-home-section="banners"]')).toBeNull();
  const products = doc.querySelector('[data-home-section="products"]')!;
  expect(products.querySelector('[role="radiogroup"]')?.getAttribute("aria-label")).toBe("Ürün kategorisi");
  expect(products.querySelectorAll("[data-product-grid]")).toHaveLength(1);
  const story = doc.querySelector('[data-home-section="story"]')!;
  expect(story.querySelector("[data-story-values]")).not.toBeNull();
  const facility = story.querySelector("[data-home-facility]")!;
  expect([...facility.querySelectorAll("figure figcaption")].map(caption => caption.textContent)).toEqual(["Tesisimiz", "Her Tanede Aynı Özen", "Ellek zeytinlikleri"]);
  expect(facility.querySelectorAll("a")).toHaveLength(0);
  expect(facility.textContent).not.toContain("Keşfedin");
  expect(facility.querySelectorAll("[data-banner-number]")).toHaveLength(0);
  expect(story.querySelector("[data-harvest-ledger]")).not.toBeNull();
  expect(story.querySelector("ol")).toBeNull();
  expect(story.querySelectorAll("[data-harvest-ledger] li")).toHaveLength(3);
  expect(doc.querySelector('[data-home-section="trust"], [data-home-section="marquee"]')).toBeNull();
});

it("keeps reference wording out of the public text resource", async () => {
  const { GET } = await import("@/app/llms.txt/route");
  const text = await (await GET()).text();
  for (const phrase of ["TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Sizden Gelen", "Rehberi", "Daha Fazlasını Keşfet", "En Beğenilen"]) {
    expect(text).not.toContain(phrase);
  }
  expect(text).toContain("Zeytin Defteri");
});

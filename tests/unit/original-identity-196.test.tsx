import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import Blog from "@/app/blog/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
const parse = (markup: string) => new DOMParser().parseFromString(markup, "text/html");

it("uses AFİNA's own headings rather than the reference site's recognisable wording", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  doc.querySelectorAll("script, style").forEach(node => node.remove());
  const visibleCopy = doc.querySelector("main")!.textContent ?? "";
  for (const wording of ["TOPRAKTAN SOFRAYA", "TARLADAN SOFRAYA", "Doğallığın", "Sizden Gelen", "Daha Fazlasını Keşfet", "En Beğenilen"]) {
    expect(visibleCopy.toLocaleLowerCase("tr-TR"), wording).not.toContain(wording.toLocaleLowerCase("tr-TR"));
  }
  expect(doc.querySelector('[data-home-section="banners"]')!.textContent).not.toMatch(/Keşfedin|\b0[123]\b/u);
  expect(doc.querySelector('[data-home-section="blog"] h2')!.textContent).toBe("Zeytin Defteri");
  expect(doc.querySelector('[data-home-section="blog"]')!.textContent).not.toMatch(/rehberi/iu);
});

it("keeps the customer's exact category, harvest and destination wording while changing the design", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const categories = [...doc.querySelectorAll("[data-home-category]")];
  expect(categories.map(category => category.querySelector("h2")!.textContent)).toEqual(["Zeytinyağı", "Zeytin", "Tesisimiz", "Bayilik"]);
  expect(categories.map(category => category.querySelector("span")!.textContent)).toEqual(["Ürünleri İnceleyin", "Ürünleri İnceleyin", "Hakkında Bilgi Alın", "Hakkında Bilgi Alın"]);
  const harvest = doc.querySelector('[data-home-section="harvest"]')!;
  expect(harvest.querySelector("h2")!.textContent).toBe("Bereketin Hasat Vakti");
  expect(harvest.textContent).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
  expect([...harvest.querySelectorAll("li h3")].map(title => title.textContent)).toEqual(["Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız"]);
  expect(harvest.querySelector('a[href="/hakkimizda"]')!.textContent).toBe("Hikayemizi Keşfet");
  const marquee = doc.querySelector('[data-home-section="marquee"]')!;
  for (const word of ["Zeytin", "Zeytinyağı", "Geleneksel Salamura", "%100 Doğal", "Katkısız"]) expect(marquee.textContent).toContain(word);
  const business = doc.querySelector('[data-home-section="business"]')!;
  expect([...business.querySelectorAll("h2")].map(title => title.textContent)).toEqual(["Toptan Satış", "Bayilik Başvurusu"]);
  expect(business.querySelector("img, picture, video")).toBeNull();
  expect(business.querySelector('a[href="/toptan-satis"]')).not.toBeNull();
  expect(business.querySelector('a[href="/bayilik"]')).not.toBeNull();
});

it("carries the AFİNA blog identity into the separate article index", () => {
  const doc = parse(renderToStaticMarkup(<Blog />));
  expect(doc.querySelector("h1")!.textContent).toBe("Zeytin Defteri");
});

import { cleanup, render, screen, within } from "@testing-library/react";
import { getProducts } from "@/lib/catalog/static-products";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { verifiedFaqs } from "@/lib/site/faqs";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

async function serverDocument(): Promise<Document> {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  return doc;
}

// Task208: the home is the whole site; six sections in reading order.
it("serves the classic home in reading order with one descriptive H1 before JavaScript", async () => {
  const doc = await serverDocument();
  const sectionIds = ["baslangic", "urunler", "hikayemiz", "toptan-bayilik", "blog", "iletisim"];
  expect([...doc.querySelectorAll("section[data-landing-section]")].map(section => section.id)).toEqual(sectionIds);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  for (const id of sectionIds) expect(doc.getElementById(id)?.textContent?.trim(), id).toBeTruthy();
  const hero = doc.getElementById("baslangic")!;
  expect(hero.querySelector('a[href="/#urunler"]')?.textContent).toContain("Ürünleri İnceleyin");
  expect(hero.querySelectorAll("a")).toHaveLength(1);
  expect(hero.querySelector('a[href*="toptan"]')).toBeNull();
});

// Task208: the facility photograph sits in the story section.
it("serves the customer poster before hydration without retired cinematic scenes", async () => {
  const doc = await serverDocument();
  expect(doc.querySelector("video, canvas, [data-harvest-journey], [data-gallery-layout], [data-story-mode], [data-sc-scene]")).toBeNull();
  expect(doc.querySelector("#baslangic img")).not.toBeNull();
  expect(doc.querySelector("#hikayemiz [data-home-facility] img")?.getAttribute("src")).toMatch(/customer-home\/fabrika-/);
});

// Task208: each claim once. "kendi tesisinde" stays as the value label, "%100 Doğal" as the seal.
it("uses the corrected origin and business copy without unsupported claims", async () => {
  const doc = await serverDocument();
  const text = doc.querySelector("main, body")?.textContent ?? "";
  for (const copy of [
    "AFİNA ZEYTİN, Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri hazırlayıp sofralara ulaştırır.",
    "Geleneksel Üretim",
    "%100 Doğal ve Katkısız",
    "Kendi Tesisimizde",
    "Otel, restoran, market ve toplu tüketim için koli bazında teklif.",
  ]) expect(text).toContain(copy);
  expect(text.match(/kendi tesisi/gi)).toHaveLength(1);
  expect(text).not.toMatch(/Ege|Türkiye geneli|uluslararası|standart|organik|®/i);
  expect([...doc.querySelectorAll('[data-home-section="business"] [role="radio"]')].map(pill => pill.textContent)).toEqual(["Toptan Satış", "Bayilik"]);
});

// Task208: quote, questions and contact anchors live on the home page again, each once.
it("keeps local anchors unique and serves the quote, question and contact destinations on the page itself", async () => {
  const doc = await serverDocument();
  const ids = [...doc.querySelectorAll("[id]")].map(node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const [id, section] of [["toptan", "toptan-bayilik"], ["teklif", "toptan-bayilik"], ["sik-sorulanlar", "iletisim"]]) {
    expect(doc.getElementById(id)?.closest("section[data-landing-section]")?.id, id).toBe(section);
  }
  for (const href of ["/hakkimizda", "/toptan-satis", "/urunler", "/bayilik", "/blog"]) expect(doc.querySelector(`a[href="${href}"]`), href).toBeNull();
});

// Task208: FAQ, FAQPage schema and the quote form moved from the retired pages to the home page.
it("preserves all five answers and FAQPage and serves the quote form, all on the home page", async () => {
  const home = await serverDocument();
  const faq = home.getElementById("sik-sorulanlar")!;
  expect(faq.closest("section[data-landing-section]")?.id).toBe("iletisim");
  expect(faq.querySelectorAll("details")).toHaveLength(5);
  for (const { question, answer } of verifiedFaqs) { expect(faq.textContent).toContain(question); expect(faq.textContent).toContain(answer); }
  const schemas = [...home.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  const schema = schemas.find(item => item["@type"] === "FAQPage");
  expect(schema["@id"]).toBe("https://afinazeytin.com/#sik-sorulanlar");
  expect(schema.mainEntity).toEqual(verifiedFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })));
  expect(home.querySelector("#toptan form")?.getAttribute("method")).toBe("post");
  expect(home.querySelectorAll("form")).toHaveLength(1);
});

// Task208: categories are pills that filter the one grid in place; they are not links or new SKUs.
it("offers each category as a pill over the same products without treating it as a new SKU", async () => {
  const { container } = render(await Home());
  const group = within(screen.getByRole("radiogroup", { name: "Ürün kategorisi" }));
  expect(group.getAllByRole("radio").map(pill => pill.textContent)).toEqual(["Tümü", "Zeytinyağı", "Zeytin", "Siyah", "Yeşil", "Kırma"]);
  expect(group.getByRole("radio", { name: "Tümü" }).getAttribute("aria-checked")).toBe("true");
  expect(container.querySelectorAll("article[data-product-id]")).toHaveLength((await getProducts()).length);
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(screen.queryByRole("link", { name: /^Tüm Ürünler$/i })).toBeNull();
});

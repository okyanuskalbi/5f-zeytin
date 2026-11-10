import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { verifiedFaqs } from "@/lib/site/faqs";

const { openProduct } = vi.hoisted(() => ({ openProduct: vi.fn() }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/catalog/ProductDetailProvider", () => ({
  ProductDetailProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useProductDetail: () => openProduct,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

async function serverDocument(): Promise<Document> {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  return doc;
}

it("serves the classic home in reading order with one descriptive H1 before JavaScript", async () => {
  const doc = await serverDocument();
  const sectionIds = ["baslangic", "urunler", "hakkimizda", "tesisimiz", "toptan", "iletisim"];
  const sections = [...doc.querySelectorAll("main section[id]")].filter(section => sectionIds.includes(section.id));
  expect(sections.map(section => section.id)).toEqual(sectionIds);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Doğal, Lezzetli, Güvenilir Zeytin");
  for (const id of sectionIds) expect(doc.getElementById(id)?.textContent?.trim(), id).toBeTruthy();
  const hero = doc.getElementById("baslangic")!;
  expect(hero.querySelector('a[href="/urunler"]')?.textContent).toContain("Ürünleri İnceleyin");
  expect(hero.querySelector('a[href="/toptan-satis"]')?.textContent).toContain("Toptan Teklif Al");
});

it("renders still photographs without the retired film, pinned scene or horizontal product rail", async () => {
  const doc = await serverDocument();
  expect(doc.querySelector("video, canvas, [data-harvest-journey], [data-gallery-layout], [data-story-mode], [data-sc-scene]")).toBeNull();
  expect(doc.querySelector("#baslangic img")).not.toBeNull();
  expect(doc.querySelector("#tesisimiz img")?.getAttribute("src")).toMatch(/customer-home\/fabrika-/);
});

it("uses the corrected origin and business copy without unsupported claims", async () => {
  const doc = await serverDocument();
  const text = doc.querySelector("main")?.textContent ?? "";
  for (const copy of [
    "KENDİ ÜRETİMİMİZ",
    "Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisimizde hazırlayıp sofranıza ulaştırıyoruz.",
    "AFİNA ZEYTİN, Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır.",
    "Geleneksel Üretim",
    "%100 Doğal",
    "Kendi Tesisimizde",
    "Otel, restoran, market ve toplu tüketim için koli bazında teklif.",
    "AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.",
  ]) expect(text).toContain(copy);
  expect(text).not.toMatch(/Ege|Türkiye geneli|uluslararası|standart|organik|®/i);
  expect(doc.querySelector('[data-home-section="business"] a[href="/bayilik"]')?.textContent).toContain("Bayilik Başvurusu");
});

it("keeps old deep links inside their matching new sections without duplicate IDs", async () => {
  const doc = await serverDocument();
  for (const [legacy, section] of [["kurumsal", "hakkimizda"], ["teklif", "toptan"], ["toptan-iletisim", "toptan"], ["uretim-yolculugu", "tesisimiz"]]) {
    expect(doc.getElementById(legacy)?.closest("section")?.id, legacy).toBe(section);
    expect(doc.querySelectorAll(`[id="${legacy}"]`), legacy).toHaveLength(1);
  }
});

it("preserves all five answers and their FAQPage data, and the existing private quote form", async () => {
  const doc = await serverDocument();
  const faq = doc.getElementById("sik-sorulanlar")!;
  expect(faq.querySelectorAll("details")).toHaveLength(5);
  for (const { question, answer } of verifiedFaqs) {
    expect(faq.textContent).toContain(question);
    expect(faq.textContent).toContain(answer);
  }
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  const schema = schemas.find(item => item["@type"] === "FAQPage");
  expect(schema.mainEntity).toEqual(verifiedFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })));
  expect(doc.querySelector("#toptan form")?.getAttribute("method")).toBe("post");
});

it("links each category to its product group without treating it as a new SKU", async () => {
  const { container } = render(await Home());
  const group = within(container.querySelector<HTMLElement>("[data-home-categories]")!);
  for (const [label, slug] of [["Zeytin", "zeytin"], ["Zeytinyağı", "zeytinyagi"]]) {
    expect(group.getByRole("link", { name: new RegExp(`^${label} Ürünleri İnceleyin$`) }).getAttribute("href")).toBe(`/urunler/${slug}`);
  }
  expect(openProduct).not.toHaveBeenCalled();
  expect(screen.getAllByRole("link", { name: /^Tüm Ürünler$/i })[0].getAttribute("href")).toBe("/urunler");
  expect(screen.queryByRole("dialog", { name: "Tüm ürünler" })).toBeNull();
});

import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { corporateContact } from "@/lib/site/corporate-contact";
import { verifiedFaqs } from "@/lib/site/faqs";
import { seller } from "@/lib/site/seller";

// Task208: the about page is the #hikayemiz and #iletisim sections of the home page; `/hakkimizda` redirects to `/#hikayemiz`.
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));

async function documentForHome(): Promise<Document> {
  return new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
}

it("Task208: tells the story in one home section with its own heading, the supplied factory photograph and a facility entry in the schema", async () => {
  const doc = await documentForHome();
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  const story = doc.getElementById("hikayemiz")!;
  expect(story.querySelector("h2")?.textContent).toBe("Nesillerin Emeği, Toprağın Bereketi");
  expect(story.getAttribute("aria-labelledby")).toBe(story.querySelector("h2")?.id);
  const factory = story.querySelector("[data-home-facility] img")!;
  expect(factory.getAttribute("src")).toContain("/images/customer-home/fabrika-");
  // Below the first screen: never competes with the hero poster.
  expect(factory.getAttribute("loading")).toBe("lazy");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
  const graph = schemas.flatMap(schema => schema["@graph"] ?? []);
  expect(graph.find((item: { "@type": string }) => item["@type"] === "Place")).toMatchObject({ url: "https://afinazeytin.com/#hikayemiz" });
  expect(schemas.some(schema => schema["@type"] === "BreadcrumbList")).toBe(false);
});

it("Task208: preserves the approved locality, harvest steps and values without invented company claims", async () => {
  const doc = await documentForHome();
  const story = doc.getElementById("hikayemiz")!;
  expect(doc.querySelector("main")?.textContent ?? doc.body.textContent).toContain("AFİNA Şirketler Topluluğu");
  for (const place of ["Osmaniye", "Düziçi", "Ellek"]) expect(story.textContent).toContain(place);
  expect(story.textContent).toContain("Ayıklamadan paketlemeye uzanan üretim sürecini takip ediyoruz.");
  expect([...story.querySelectorAll("[data-story-values] strong")].map(item => item.textContent)).toEqual(["Geleneksel Üretim", "%100 Doğal ve Katkısız", "Kendi Tesisimizde"]);
  expect([...story.querySelectorAll("[data-harvest-ledger] [data-step-label]")].map(item => item.textContent)).toEqual(["Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme"]);
  expect([...story.querySelectorAll("[data-home-facility] figcaption")].map(item => item.textContent)).toEqual(["Tesisimiz", "Her Tanede Aynı Özen", "Ellek zeytinlikleri"]);
  // The one seal names the claim for assistive technology; the words beside it are visual only.
  expect(story.querySelector("[data-stamp]")?.getAttribute("aria-label")).toBe("%100 Doğal ve Katkısız");
  expect(story.querySelector("[data-story-values] strong[aria-hidden]")?.textContent).toBe("%100 Doğal ve Katkısız");
  expect(story.textContent).not.toMatch(/\b(?:19|20)\d{2}\b|ödül|sertifika|kapasite|ton\b|kurulduk|kuruldu/iu);
});

it("Task208: keeps all five FAQ answers, their schema and the official contact information in the last home section", async () => {
  const doc = await documentForHome();
  const faq = doc.getElementById("sik-sorulanlar")!;
  expect(faq.closest("#iletisim")).not.toBeNull();
  expect(faq.querySelectorAll("details")).toHaveLength(5);
  for (const item of verifiedFaqs) { expect(faq.textContent).toContain(item.question); expect(faq.textContent).toContain(item.answer); }
  const schema = JSON.parse(faq.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("FAQPage");
  expect(schema["@id"]).toBe("https://afinazeytin.com/#sik-sorulanlar");
  expect(schema.mainEntity).toEqual(verifiedFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })));
  const contact = doc.getElementById("iletisim")!;
  expect(contact.querySelectorAll("address")).toHaveLength(1);
  expect(contact.querySelector("address")?.textContent).toBe(seller.address);
  // The published corporate channels, once on the page.
  expect([...doc.querySelectorAll('main a[href^="tel:"]')].map(link => link.getAttribute("href"))).toEqual([`tel:${corporateContact.phone}`]);
  expect([...doc.querySelectorAll('main a[href^="mailto:"]')].map(link => link.getAttribute("href"))).toEqual([`mailto:${corporateContact.email}`]);
  expect(contact.querySelector('a[href^="tel:"]')?.textContent).toBe(corporateContact.displayPhone);
  const route = [...contact.querySelectorAll("a[data-pill]")].find(link => link.textContent === "Yol tarifi")!;
  expect(route.getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps\//);
  expect(route.getAttribute("target")).toBe("_blank");
  expect(route.getAttribute("rel")).toBe("noopener noreferrer");
  // No second way back to the products and no repeated order links here: they live in the menu and the footer.
  for (const href of ["/urunler", "/#urunler", "/siparis-takip", "/iade", "/mesafeli-satis"]) expect(contact.querySelector(`a[href="${href}"]`)).toBeNull();
});

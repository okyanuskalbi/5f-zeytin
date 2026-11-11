import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Page, { metadata } from "@/app/hakkimizda/page";
import { verifiedFaqs } from "@/lib/site/faqs";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";

function documentForAbout(): Document {
  return new DOMParser().parseFromString(renderToStaticMarkup(<Page />), "text/html");
}

it("serves an indexable about page with one H1, breadcrumbs and the supplied factory photograph", () => {
  const doc = documentForAbout();
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Hakkımızda");
  expect(metadata).toMatchObject({ title: "Hakkımızda | AFİNA ZEYTİN", alternates: { canonical: "/hakkimizda" }, robots: { index: true, follow: true } });
  expect(doc.querySelector('[data-about-story] img')?.getAttribute("src")).toContain("/images/customer-home/fabrika-");
  expect(doc.querySelector('[data-about-story] img')?.getAttribute("loading")).toBe("eager");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
  expect(schemas.find(schema => schema["@type"] === "BreadcrumbList").itemListElement.at(-1)).toMatchObject({ name: "Hakkımızda", item: "https://afinazeytin.com/hakkimizda" });
});

it("preserves the approved locality, production stages and values without invented company claims", () => {
  const doc = documentForAbout();
  expect(doc.body.textContent).toContain("AFİNA Şirketler Topluluğu");
  expect(doc.body.textContent).toContain("Osmaniye");
  expect(doc.body.textContent).toContain("Düziçi");
  expect(doc.body.textContent).toContain("Ellek");
  expect(doc.querySelector('[data-about-facility]')?.textContent).toContain("Modern Üretim Tesisimiz");
  for (const process of ["Ayıklama", "Salamura", "Paketleme", "Depolama"]) expect(doc.querySelector('[data-about-facility]')?.textContent).toContain(process);
  expect([...doc.querySelectorAll('[data-about-values] strong')].map(item => item.textContent)).toEqual(["Geleneksel Üretim", "Ellek zeytini", "Kendi Tesisimizde"]);
  expect(doc.querySelector('[data-about-story]')?.textContent).not.toMatch(/\b(?:19|20)\d{2}\b|ödül|sertifika|kapasite|ton\b|kurulduk|kuruldu/iu);
});

it("moves all five existing FAQ answers and their schema with the existing official contact information", () => {
  const doc = documentForAbout();
  const faq = doc.getElementById("sik-sorulanlar")!;
  expect(faq.querySelectorAll("details")).toHaveLength(5);
  for (const item of verifiedFaqs) { expect(faq.textContent).toContain(item.question); expect(faq.textContent).toContain(item.answer); }
  const schema = JSON.parse(faq.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("FAQPage");
  expect(schema["@id"]).toBe("https://afinazeytin.com/hakkimizda#sik-sorulanlar");
  expect(schema.mainEntity).toEqual(verifiedFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })));
  const contact = doc.getElementById("iletisim")!;
  expect(contact.querySelector("address")?.textContent).toBe(seller.address);
  expect(contact.querySelector('a[href="/urunler"]')).not.toBeNull();
  expect(contact.querySelector('a[href="https://afina.com.tr/#iletisim"]')).not.toBeNull();
  expect(Boolean(contact.querySelector('a[href^="tel:"]'))).toBe(Boolean(siteContact.phone));
  expect(Boolean(contact.querySelector('a[href^="mailto:"]'))).toBe(Boolean(siteContact.email));
});

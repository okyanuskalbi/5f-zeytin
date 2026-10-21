import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { verifiedFaqs } from "@/components/landing/Faq";
import { siteContact } from "@/lib/site/contact";

afterEach(() => { Object.assign(siteContact, { phone: "", whatsapp: "", email: "" }); });

it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelectorAll("[data-faq]")).toHaveLength(3);
  for (const faq of verifiedFaqs) expect(faq.answer).toMatch(/\.$/);
  expect(doc.querySelector('[data-faq="Z05"]')).toBeNull();
  expect(doc.querySelector("#toptan, #toptan-iletisim")).toBeNull();
  expect(doc.body.textContent).not.toMatch(/Toptan alım için bize yazın|İletişim bilgileri yakında/);
});

it.each([
  { phone: "", whatsapp: "", email: "" },
  { phone: " \t ", whatsapp: " \n ", email: " " },
  { phone: "", whatsapp: " + ( ) - ", email: "" },
])("omits the footer wholesale link for unavailable contact channels: %j", contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.querySelector('a[href="/#toptan-iletisim"]')).toBeNull();
  expect(doc.body.textContent).not.toContain("Toptan Satış İçin İletişime Geçin");
  expect(doc.querySelector('a[href="/#urunler"]')).not.toBeNull();
  expect(doc.querySelector('a[href="/#tesisimiz"]')).not.toBeNull();
});

it.each([
  { phone: "+90 555 010 00 00", whatsapp: "", email: "" },
  { phone: "", whatsapp: "+90 555 010 00 00", email: "" },
  { phone: "", whatsapp: "", email: " contact@example.com " },
])("restores the wholesale row and footer link together for a configured channel: %j", async contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelector("#toptan-iletisim h3")?.textContent).toBe("Toptan alım için bize yazın");
  expect(doc.querySelectorAll("#toptan a")).toHaveLength(1);
  expect(doc.querySelector('a[href="/#toptan-iletisim"]')?.textContent).toBe("Toptan Satış İçin İletişime Geçin");
});
it("retains seller identity, community and legal destinations", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.body.textContent).toContain("VKN 0091520061");
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(doc.body.textContent).toContain("Önizleme: fiyatlar ve görseller temsilidir.");
});

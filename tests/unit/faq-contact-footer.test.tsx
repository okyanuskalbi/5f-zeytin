import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { verifiedFaqs } from "@/components/landing/Faq";

it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelectorAll("[data-faq]")).toHaveLength(3);
  for (const faq of verifiedFaqs) expect(faq.answer).toMatch(/\.$/);
  expect(doc.querySelector('[data-faq="Z05"]')).toBeNull();
  const contact = doc.querySelector("#toptan-iletisim")!;
  expect(contact.getAttribute("tabindex")).toBe("-1");
  expect(contact.querySelector("form, input, textarea")).toBeNull();
  expect(contact.textContent).toContain("Toptan zeytin ve zeytinyağı için bize yazın.");
  expect(contact.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
});
it("retains seller identity, community and legal destinations", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.body.textContent).toContain("VKN 0091520061");
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(doc.body.textContent).toContain("Önizleme: fiyatlar ve görseller temsilidir.");
});

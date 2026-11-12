import { renderToStaticMarkup } from "react-dom/server";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";
import { verifiedFaqs } from "@/lib/site/faqs";
import { siteContact } from "@/lib/site/contact";
import { corporateContact } from "@/lib/site/corporate-contact";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("server-only", () => ({}));

afterEach(() => { cleanup(); Object.assign(siteContact, { phone: "", whatsapp: "", email: "" }); });

// Task208: the quote form, the questions and the contact channels are sections of the home page.
it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelectorAll("#sik-sorulanlar details")).toHaveLength(5);
  for (const faq of verifiedFaqs) expect(faq.answer).toMatch(/\.$/);
  expect(doc.querySelector('[data-faq="Z05"]')).toBeNull();
  expect(doc.querySelector("#toptan form")).not.toBeNull();
  expect(doc.querySelector("#sik-sorulanlar h2")?.textContent).toBe("Sık sorulanlar");
  expect(doc.querySelectorAll("#sik-sorulanlar details > summary")).toHaveLength(5);
  const quote = doc.querySelector("#toptan")!;
  expect(quote.querySelector('form[aria-label="Kurumsal teklif talebi"]')).not.toBeNull();
  expect(quote.querySelector('button[type="submit"]')?.textContent).toBe("Talep özetini hazırla");
  expect(quote.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  expect(quote.querySelector('input[name="kvkk"][required]')).not.toBeNull();
  expect(quote.querySelector('a[href="/kvkk"]')).not.toBeNull();
  expect(quote.textContent).toContain("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
  // Task208: the corporate channels are stated once, in the contact section, not again under the form.
  expect(quote.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
  const contact = doc.querySelector("#iletisim")!;
  expect(contact.querySelectorAll(`a[href="mailto:${corporateContact.email}"]`)).toHaveLength(1);
  expect(contact.querySelectorAll(`a[href="tel:${corporateContact.phone}"]`)).toHaveLength(1);
  expect(doc.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]')).toHaveLength(2);
  expect(doc.querySelector('a[href*="wa.me"]')).toBeNull();
  expect(doc.body.textContent).not.toMatch(/Talebiniz gönderildi|Bilgileriniz gönderilmez\./);
  expect(doc.body.textContent).not.toMatch(/Toptan alım için bize yazın|İletişim bilgileri yakında/);
});

// Task208: the contact section always shows the official corporate channels; the footer links to it instead of repeating them.
it.each([
  { phone: "+90 555 010 00 00", whatsapp: "", email: "" },
  { phone: "", whatsapp: "+90 555 010 00 00", email: "" },
  { phone: "", whatsapp: "", email: " contact@example.com " },
])("keeps the official channels in the contact section whatever the optional customer-service details are: %j", async contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelector("#toptan form")).not.toBeNull();
  expect(doc.querySelector('#iletisim a[href^="tel:"]')?.getAttribute("href")).toBe(`tel:${corporateContact.phone}`);
  expect(doc.querySelector('#iletisim a[href^="mailto:"]')?.getAttribute("href")).toBe(`mailto:${corporateContact.email}`);
  expect(doc.querySelector('#iletisim a[data-pill][target="_blank"]')?.textContent).toBe("Yol tarifi");
  expect(doc.querySelector('#toptan form[aria-label="Kurumsal teklif talebi"] a[href="/kvkk"]')).not.toBeNull();
  expect(doc.querySelector('footer nav a[href="/?sekme=toptan#toptan-bayilik"]')?.textContent).toBe("Toptan Satış");
  expect(doc.querySelector('footer nav a[href="/#iletisim"]')?.textContent).toBe("İletişim");
  expect(doc.querySelector('footer a[href^="mailto:"], footer a[href^="tel:"], footer a[href*="wa.me"]')).toBeNull();
});

it("keeps the quote form and FAQ once across the home page and the footer", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelectorAll("#toptan, #sik-sorulanlar")).toHaveLength(2);
  expect(doc.querySelectorAll("#iletisim")).toHaveLength(1);
});

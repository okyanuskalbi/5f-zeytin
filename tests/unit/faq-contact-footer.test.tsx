import { renderToStaticMarkup } from "react-dom/server";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import WholesalePage from "@/app/toptan-satis/page";
import AboutPage from "@/app/hakkimizda/page";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";
import { verifiedFaqs } from "@/lib/site/faqs";
import { siteContact } from "@/lib/site/contact";
import { corporateContact } from "@/lib/site/corporate-contact";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("server-only", () => ({}));

afterEach(() => { cleanup(); Object.assign(siteContact, { phone: "", whatsapp: "", email: "" }); });

it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await WholesalePage()}{await AboutPage()}</>);
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
  expect(quote.querySelector(`a[href="mailto:${corporateContact.email}"]`)).not.toBeNull();
  expect(quote.querySelector(`a[href="tel:${corporateContact.phone}"]`)).not.toBeNull();
  expect(quote.textContent).toContain(corporateContact.name);
  expect(doc.querySelector('a[href*="wa.me"]')).toBeNull();
  expect(doc.body.textContent).not.toMatch(/Talebiniz gönderildi|Bilgileriniz gönderilmez\./);
  expect(doc.body.textContent).not.toMatch(/Toptan alım için bize yazın|İletişim bilgileri yakında/);
});

it.each([
  { phone: "+90 555 010 00 00", whatsapp: "", email: "" },
  { phone: "", whatsapp: "+90 555 010 00 00", email: "" },
  { phone: "", whatsapp: "", email: " contact@example.com " },
])("preserves configured contact content with the official footer channels: %j", async contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}{await WholesalePage()}{await AboutPage()}<Footer /></>);
  expect(doc.querySelector("#toptan form")).not.toBeNull();
  if (contact.phone) expect(doc.querySelector('#iletisim a[href^="tel:"]')).not.toBeNull();
  if (contact.email) expect(doc.querySelector('#iletisim a[href^="mailto:"]')).not.toBeNull();
  expect(doc.querySelector('#toptan form[aria-label="Kurumsal teklif talebi"] a[href="/kvkk"]')).not.toBeNull();
  expect(doc.querySelector('footer nav a[href="/toptan-satis"]')?.textContent).toBe("Toptan Satış");
  expect(doc.querySelector('footer a[href^="mailto:"]')?.getAttribute("href")).toBe(`mailto:${corporateContact.email}`);
  expect(doc.querySelector('footer a[href^="tel:"]')?.getAttribute("href")).toBe(`tel:${corporateContact.phone}`);
  expect(doc.querySelector('footer a[href*="wa.me"]')).toBeNull();
});

it("keeps the relocated quote form and FAQ once across their pages and the footer", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}{await WholesalePage()}{await AboutPage()}<Footer /></>);
  expect(doc.querySelectorAll("#toptan, #sik-sorulanlar")).toHaveLength(2);
});

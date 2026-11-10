import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WholesaleFaq } from "@/components/landing/WholesaleFaq";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { verifiedFaqs } from "@/components/landing/Faq";
import { siteContact } from "@/lib/site/contact";
import { corporateContact } from "@/lib/site/corporate-contact";

vi.mock("server-only", () => ({}));

afterEach(() => { cleanup(); Object.assign(siteContact, { phone: "", whatsapp: "", email: "" }); });

it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelectorAll("[data-faq]")).toHaveLength(5);
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
])("restores the wholesale row and footer link together for a configured channel: %j", async contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelector("#toptan form")).not.toBeNull();
  if (contact.phone) expect(doc.querySelector('#iletisim a[href^="tel:"]')).not.toBeNull();
  if (contact.email) expect(doc.querySelector('#iletisim a[href^="mailto:"]')).not.toBeNull();
  expect(doc.querySelector('#toptan form[aria-label="Kurumsal teklif talebi"] a[href="/kvkk"]')).not.toBeNull();
  expect(doc.querySelector('footer a[href="/toptan-satis"]')?.textContent).toBe("Toptan Satış");
  if (contact.phone) expect(doc.querySelector('footer a[href^="tel:"]')).not.toBeNull();
  if (contact.email) expect(doc.querySelector('footer a[href^="mailto:"]')?.getAttribute("href")).toBe(`mailto:${contact.email.trim()}`);
  if (contact.whatsapp) expect(doc.querySelector('footer a[href^="https://wa.me/"]')?.getAttribute("href")).toBe("https://wa.me/905550100000");
});
it("opens the existing wholesale form in a labelled dialog and restores its trigger", async () => {
  render(<WholesaleFaq />);
  const trigger = screen.getByRole("button", { name: "Toptan teklif isteyin" });
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Toptan teklif isteyin" });
  expect(dialog.querySelector("form")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Talebi gönder" }).hasAttribute("disabled")).toBe(true);
  expect(dialog.textContent).toContain("Bilgileriniz gönderilmez.");
  fireEvent.click(screen.getByRole("button", { name: "Kapat" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("keeps the quote form and FAQ once across the full page and footer", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelectorAll("#toptan, #sik-sorulanlar")).toHaveLength(2);
});

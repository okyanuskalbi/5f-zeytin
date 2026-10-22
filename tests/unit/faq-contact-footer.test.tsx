import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { WholesaleFaq } from "@/components/landing/WholesaleFaq";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { verifiedFaqs } from "@/components/landing/Faq";
import { siteContact } from "@/lib/site/contact";

afterEach(() => { cleanup(); Object.assign(siteContact, { phone: "", whatsapp: "", email: "" }); });

it("uses full factual sentences and removes unanswered wholesale questions", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelectorAll("[data-faq]")).toHaveLength(3);
  for (const faq of verifiedFaqs) expect(faq.answer).toMatch(/\.$/);
  expect(doc.querySelector('[data-faq="Z05"]')).toBeNull();
  expect(doc.querySelector("#toptan")).toBeNull();
  expect(doc.querySelector("#toptan-iletisim h2")?.textContent).toBe("Market, restoran, otel, bayi.");
  expect(doc.querySelector("#sik-sorulanlar h2")?.textContent).toBe("Sık sorulanlar");
  expect(doc.querySelectorAll("#sik-sorulanlar details > summary")).toHaveLength(3);
  expect(doc.querySelector("#toptan-iletisim button")?.textContent).toBe("Toptan teklif isteyin");
  expect(doc.querySelector('a[href^="tel:"], a[href*="wa.me"], a[href^="mailto:"]')).toBeNull();
  expect(doc.body.textContent).not.toMatch(/Toptan alım için bize yazın|İletişim bilgileri yakında/);
});

it.each([
  { phone: "", whatsapp: "", email: "" },
  { phone: " \t ", whatsapp: " \n ", email: " " },
  { phone: "", whatsapp: " + ( ) - ", email: "" },
])("keeps the footer form destination without contact channels: %j", contact => {
  Object.assign(siteContact, contact);
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.querySelector('a[href="/#toptan-iletisim"]')).not.toBeNull();
  expect(doc.body.textContent).toContain("Toptan Satış İçin İletişime Geçin");
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
  expect(doc.querySelector("#toptan-iletisim h2")?.textContent).toBe("Market, restoran, otel, bayi.");
  expect(doc.querySelectorAll("#toptan-iletisim a")).toHaveLength(1);
  expect(doc.querySelector('footer a[href="/#toptan-iletisim"]')?.textContent).toBe("Toptan Satış İçin İletişime Geçin");
});
it("retains seller identity, community and legal destinations", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.body.textContent).toContain("VKN 0091520061");
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(doc.body.textContent).toContain("Önizleme: fiyatlar ve görseller temsilidir.");
});

it("groups brand, shopping, help and contact before the payment and legal rows", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  const footer = doc.querySelector("footer")!;
  expect([...footer.querySelectorAll("h2")].map(heading => heading.textContent)).toEqual([
    "AFİNA ZEYTİN", "Alışveriş", "Yardım", "İletişim",
  ]);
  for (const [label, href] of [
    ["Ürünler", "/#kiler"], ["Kışlık kiler", "/#urunler"], ["Sepetim", "/sepet"],
    ["Sipariş takibi", "/siparis-takip"], ["Hesabım", "/hesabim"],
    ["Sık sorulan sorular", "/#sik-sorulanlar"], ["Tesisimiz", "/#tesisimiz"],
  ]) {
    expect([...footer.querySelectorAll("a")].find(link => link.textContent === label)?.getAttribute("href")).toBe(href);
  }
  const contact = footer.querySelector('[aria-labelledby="footer-contact-title"]')!;
  expect(contact.querySelector("address")?.textContent).toBe("Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye");
  expect(contact.querySelectorAll("address span")).toHaveLength(2);
  expect(contact.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
  expect(footer.textContent).toContain("© 2026 AFİNA ZEYTİN");
});

it("names only the supported payment brands and serves safe local vector logos", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect(payment).not.toBeNull();
  expect(payment.textContent).toContain("Güvenli Ödeme");
  expect([...payment.querySelectorAll("img")].map(image => image.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  for (const image of payment.querySelectorAll("img")) {
    expect(image.getAttribute("src")).toBe(`/images/payment/${image.alt.toLowerCase()}.svg`);
    expect(image.getAttribute("aria-hidden")).not.toBe("true");
    const svg = new DOMParser().parseFromString(readFileSync(`public${image.getAttribute("src")}`, "utf8"), "image/svg+xml");
    expect(svg.documentElement.localName).toBe("svg");
    expect(svg.documentElement.getAttribute("viewBox")).toBeTruthy();
    expect(svg.querySelector("parsererror, script, foreignObject, image, use")).toBeNull();
    expect([...svg.querySelectorAll("*")].flatMap(node => [...node.attributes]).filter(attribute => !attribute.name.startsWith("xmlns")).some(attribute => /^on/i.test(attribute.name) || /^(?:https?:|data:|javascript:)/i.test(attribute.value))).toBe(false);
  }
  expect(doc.querySelector('img[alt*="American Express"], img[alt*="Apple Pay"]')).toBeNull();
});

it("keeps the community identity with the brand and opens its destination safely", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  const brand = doc.querySelector('[aria-labelledby="footer-brand-title"]')!;
  expect(brand).not.toBeNull();
  expect(brand.textContent).toContain("Bir AFİNA Şirketler Topluluğu markası");
  const community = brand.querySelector('a[href="https://afina.com.tr"]')!;
  expect(community.getAttribute("target")).toBe("_blank");
  expect(community.getAttribute("rel")).toBe("noopener");
  expect(doc.querySelectorAll('a[href="https://afina.com.tr"]')).toHaveLength(1);
  expect(community.querySelector("img")?.alt).toBe("AFİNA Şirketler Topluluğu");
});

it("shows only approved phone and email channels when configured", () => {
  Object.assign(siteContact, { phone: " +90 555 010 00 00 ", email: " contact@example.com " });
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  const contact = doc.querySelector('[aria-labelledby="footer-contact-title"]')!;
  expect(contact.querySelector('a[href="tel:+905550100000"]')?.textContent).toBe("+90 555 010 00 00");
  expect(contact.querySelector('a[href="mailto:contact@example.com"]')?.textContent).toBe("contact@example.com");
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

it("keeps exactly one preview note across the full page and footer", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.body.textContent?.match(/temsili/gi)).toHaveLength(1);
  expect(doc.querySelectorAll("#toptan-iletisim, #sik-sorulanlar")).toHaveLength(2);
});

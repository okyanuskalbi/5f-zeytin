import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";

vi.mock("next/font/local", () => ({ default: () => ({ variable: "font-hero" }) }));

const questions = [
  "Afina Zeytin hangi ürün alanlarında çalışıyor?",
  "Toptan zeytin veya zeytinyağı talebi iletilebilir mi?",
  "Afina Zeytin perakende müşterilere de ulaşıyor mu?",
  "Afina Zeytin'in üretim tesisi hangi şehirde?",
];

async function landing(): Promise<Document> {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  return doc;
}

it("renders only the four source-confirmed common questions as open reading text in SSR", async () => {
  const doc = await landing();
  const faq = doc.querySelector("#sik-sorulanlar");
  expect(faq).not.toBeNull();
  expect([...faq!.querySelectorAll("h3")].map(node => node.textContent)).toEqual(questions);
  expect(faq!.querySelector("details, button, input")).toBeNull();
  const official = readFileSync("docs/referans/icerik.md", "utf8");
  for (const answer of faq!.querySelectorAll("[data-faq-answer]")) {
    expect(official).toContain(answer.textContent);
  }
  const plan = readFileSync("docs/tasks/087-aeo-geo.md", "utf8");
  const unconfirmed = plan.split("## Kullanıcıdan teyit")[1].split("Bu tablo")[0];
  for (const line of unconfirmed.split("\n").filter(line => /^\| Z\d+ /.test(line))) {
    expect(doc.body.textContent).not.toContain(line.split("|")[2].trim());
  }
});

it("keeps the wholesale destination focusable, address public and unconfirmed channels/media absent", async () => {
  const doc = await landing();
  const contact = doc.querySelector("#toptan-iletisim")!;
  expect(contact.getAttribute("tabindex")).toBe("-1");
  expect(contact.querySelector("address")?.textContent).toBe("Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye");
  expect(contact.querySelector('a[href^="tel:"], a[href^="mailto:"], img, video, canvas')).toBeNull();
  expect(contact.textContent).not.toMatch(/teyit|hazırlanıyor|gönderildi/i);
  // 081 exposes the form; 082 delivery remains unavailable.
  const cta = contact.querySelector('a[href="#toptan-iletisim"]')!;
  expect(cta.textContent).toBe("Toptan Satış İçin İletişime Geçin");
  expect(contact.querySelectorAll("input, textarea")).toHaveLength(4);
  expect(contact.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  expect(contact.querySelector('[role="status"]')?.textContent).toContain("Toptan talep gönderimi henüz kullanıma açık değil.");
});

it("prints the seller imprint and legal destinations without v1 ornaments", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Footer />);
  expect(doc.querySelector("footer")?.textContent).toContain("Kökü toprakta. Yeri sofrada.");
  expect(doc.body.textContent).toContain("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ. · Düziçi VD · VKN 0091520061");
  expect(doc.querySelector("[data-footer-scallop], [data-footer-stamp]")).toBeNull();
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) {
    expect(doc.querySelector(`footer a[href="${href}"]`)).not.toBeNull();
  }
  expect(doc.querySelector('a[href="https://afina.com.tr"] img')?.getAttribute("src")).toBe("/brand/afina-topluluk-dark.svg");
  expect(doc.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
});

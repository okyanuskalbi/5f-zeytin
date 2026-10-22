import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import Home from "@/app/page";
import { Faq, verifiedFaqs } from "@/components/landing/Faq";
import { Story } from "@/components/landing/Story";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { WholesaleContact } from "@/components/landing/WholesaleContact";
import { Footer } from "@/components/site/Footer";
import { siteContact } from "@/lib/site/contact";
import manifest from "@/public/images/v3/manifest.json";

afterEach(cleanup);

it("shows the four trust facts without a draft delivery label", () => {
  render(<TrustStrip />);
  const strip = screen.getByRole("region", { name: "Alışveriş bilgileri" });
  expect(strip.textContent).toContain("Kargo 2–4 iş günü");
  expect(strip.textContent).toContain("PayTR ile güvenli ödeme");
  expect(strip.textContent).toContain("Kendi tesisimizde dolum");
  expect(strip.textContent).not.toMatch(/Örnek süre/);
  expect(strip.textContent).toContain("Toptan alım için teklif");
  expect(strip.querySelectorAll("li")).toHaveLength(4);
  expect(strip.querySelectorAll("svg")).toHaveLength(0);
});

it("omits the whole wholesale row and footer destination when contact details are empty", () => {
  expect(Object.values(siteContact).every(value => value === "")).toBe(true);
  render(<><Story /><WholesaleContact preserveAnchor /><Footer /></>);
  expect(document.querySelector("#toptan")).toBeNull();
  expect(document.querySelector("#toptan-iletisim")?.textContent).toBe("");
  expect(screen.queryByText("Toptan alım için bize yazın")).toBeNull();
  expect(screen.queryByText("İletişim bilgileri yakında")).toBeNull();
  expect(screen.getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" }).getAttribute("href")).toBe("/#toptan-iletisim");
});

it("omits wholesale markup when all contact values contain only whitespace", () => {
  render(<WholesaleContact contact={{ phone: " ", whatsapp: " ", email: " " }} />);
  expect(screen.queryAllByRole("link")).toHaveLength(0);
  expect(document.querySelector("#toptan, #toptan-iletisim")).toBeNull();
  expect(screen.queryByRole("heading", { name: "Toptan alım için bize yazın" })).toBeNull();
});

it.each([
  ["phone", "+90 555 010 00 00", "Telefon edin", "tel:+905550100000"],
  ["whatsapp", "+90 555 010 00 00", "WhatsApp’tan yazın", "https://wa.me/905550100000"],
  ["email", " contact@example.com ", "E-posta gönderin", "mailto:contact@example.com"],
])("renders only the configured %s contact channel", (channel, value, label, href) => {
  render(<WholesaleContact contact={{ phone: "", whatsapp: "", email: "", [channel]: value }} />);
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getByRole("link", { name: label }).getAttribute("href")).toBe(href);
  expect(screen.getByRole("region", { name: "Toptan alım için bize yazın" }).id).toBe("toptan");
  expect(document.querySelector("#toptan-iletisim")?.getAttribute("tabindex")).toBe("-1");
  expect(screen.queryByText("İletişim bilgileri yakında")).toBeNull();
});

it("keeps at most six verified answers as standalone complete sentences", () => {
  expect(verifiedFaqs.length).toBeGreaterThan(0);
  expect(verifiedFaqs.length).toBeLessThanOrEqual(6);
  for (const { answer } of verifiedFaqs) {
    expect(answer).toMatch(/^\p{Lu}/u);
    expect(answer).toMatch(/\.$/);
    expect(answer.trim().split(/\s+/).length).toBeGreaterThanOrEqual(6);
  }
});

it("keeps native FAQ disclosures usable with synchronized expanded state", () => {
  render(<Faq />);
  for (const { question, answer } of verifiedFaqs) {
    const summary = screen.getByText(question, { selector: "summary" });
    const details = summary.closest("details")!;
    expect(summary.getAttribute("aria-expanded")).toBe("false");
    const content = document.getElementById(summary.getAttribute("aria-controls")!);
    expect(content?.textContent).toBe(answer);
    details.open = true;
    fireEvent(details, new Event("toggle"));
    expect(summary.getAttribute("aria-expanded")).toBe("true");
    details.open = false;
    fireEvent(details, new Event("toggle"));
    expect(summary.getAttribute("aria-expanded")).toBe("false");
  }
});

it("keeps FAQ answers in the server HTML for native JavaScript-free disclosure", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Faq />);
  expect(doc.querySelectorAll("details > summary")).toHaveLength(verifiedFaqs.length);
  for (const { answer } of verifiedFaqs) expect(doc.body.textContent).toContain(answer);
  // Native details owns expansion until hydration; no stale ARIA override without JS.
  expect(doc.querySelector("summary[aria-expanded]")).toBeNull();
});

it("publishes one preview note and business schema without address, tax IDs or sample Product data", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.body.textContent?.match(/Önizleme: fiyatlar ve görseller temsilidir\./g)).toHaveLength(1);
  expect(doc.body.textContent).not.toMatch(/henüz kullanıma açık değil|Gerçek satış kataloğu/);
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  expect(scripts).toHaveLength(2);
  expect(JSON.parse(scripts[1].textContent!)["@type"]).toBe("FAQPage");
  const schema = JSON.parse(scripts[0].textContent!);
  expect(schema["@context"]).toBe("https://schema.org");
  expect(schema["@graph"].map((item: Record<string, unknown>) => item["@type"])).toEqual(["Organization", "LocalBusiness"]);
  expect(schema["@graph"][1].parentOrganization["@id"]).toBe(schema["@graph"][0]["@id"]);
  expect(JSON.stringify(schema)).not.toMatch(/"(?:address|taxID|vatID|Product|Offer|price|telephone|email)"|0091520061|Şehit Ali/);
});

it("uses only the pinned blurred facility source and unmodified optimized derivatives", () => {
  const asset = manifest.assets["tesis-osmaniye"];
  const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  expect(asset.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(sha(readFileSync(asset.source))).toBe(asset.sourceSha256);
  expect(asset.crop).toBeNull();
  for (const output of asset.outputs) expect(sha(readFileSync(`public${output.file}`))).toBe(output.sha256);
});

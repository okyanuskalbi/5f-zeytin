import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import AboutPage from "@/app/hakkimizda/page";
import { StoreFaq } from "@/components/storefront/content/StoreFaq";
import { verifiedFaqs } from "@/lib/site/faqs";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";
import manifest from "@/public/images/v3/manifest.json";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("server-only", () => ({}));

afterEach(cleanup);

it("keeps at most six verified answers as standalone complete sentences", () => {
  expect(verifiedFaqs.length).toBeGreaterThan(0);
  expect(verifiedFaqs.length).toBeLessThanOrEqual(6);
  for (const { answer } of verifiedFaqs) {
    expect(answer).toMatch(/^\p{Lu}/u);
    expect(answer).toMatch(/\.$/);
    expect(answer.trim().split(/\s+/).length).toBeGreaterThanOrEqual(6);
  }
});

it("keeps FAQ answers in the server HTML for native JavaScript-free disclosure", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<StoreFaq canonicalPath="/hakkimizda" />);
  expect(doc.querySelectorAll("details > summary")).toHaveLength(verifiedFaqs.length);
  for (const { answer } of verifiedFaqs) expect(doc.body.textContent).toContain(answer);
  // Native details owns expansion until hydration; no stale ARIA override without JS.
  expect(doc.querySelector("summary[aria-expanded]")).toBeNull();
});

it("publishes a connected entity graph with only the public district address", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}{await AboutPage()}<Footer /></>);
  expect(doc.body.textContent).not.toMatch(/henüz kullanıma açık değil|Gerçek satış kataloğu/);
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  expect(scripts).toHaveLength(3);
  const schemas = scripts.map(script => JSON.parse(script.textContent!));
  expect(schemas.filter(schema => schema["@type"] === "FAQPage")).toHaveLength(1);
  const schema = schemas.find(schema => schema["@graph"]);
  expect(schema["@context"]).toBe("https://schema.org");
  const [organization, place, webpage, website] = schema["@graph"];
  expect(schema["@graph"].map((item: Record<string, unknown>) => item["@type"])).toEqual(["Organization", "Place", "WebPage", "WebSite"]);
  expect(organization.sameAs).toBeUndefined();
  expect(organization.memberOf.url).toBe("https://afina.com.tr");
  expect(webpage.isPartOf).toEqual({ "@id": "https://afinazeytin.com/#website" });
  expect(organization.location).toEqual({ "@id": "https://afinazeytin.com/#tesis" });
  expect(place["@id"]).toBe(organization.location["@id"]);
  expect(place.address).toEqual({ "@type": "PostalAddress", addressLocality: "Düziçi", addressRegion: "Osmaniye", addressCountry: "TR" });
  expect(place).not.toHaveProperty("parentOrganization");
  expect(website).toMatchObject({ "@id": "https://afinazeytin.com/#website", url: "https://afinazeytin.com", inLanguage: "tr-TR", publisher: { "@id": organization["@id"] } });
  expect(JSON.stringify(schema)).not.toMatch(/"(?:LocalBusiness|streetAddress|postalCode|taxID|vatID|Product|Offer|price|telephone|email)"|0091520061|Şehit Ali/);
});

it("uses only the pinned blurred facility source and unmodified optimized derivatives", () => {
  const asset = manifest.assets["tesis-osmaniye"];
  const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  expect(asset.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(sha(readFileSync(asset.source))).toBe(asset.sourceSha256);
  expect(asset.crop).toBeNull();
  for (const output of asset.outputs) expect(sha(readFileSync(`public${output.file}`))).toBe(output.sha256);
});

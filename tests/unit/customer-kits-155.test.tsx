import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { StoreFaq } from "@/components/storefront/content/StoreFaq";
import { verifiedFaqs } from "@/lib/site/faqs";
import { GET } from "@/app/llms.txt/route";
import sitemap from "@/app/sitemap";

it("keeps at least five verified short answers equal in visible HTML, schema and machine discovery", async () => {
  expect(verifiedFaqs).toHaveLength(5);
  const html = renderToStaticMarkup(<StoreFaq canonicalPath="/hakkimizda" />);
  const text = await (await GET()).text();
  const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const schema = JSON.parse(match![1]);
  expect(schema.mainEntity).toHaveLength(5);
  for (const faq of verifiedFaqs) {
    expect(html).toContain(faq.question);
    expect(text).toContain(faq.question);
    expect(text).toContain(faq.answer);
    expect(
      schema.mainEntity.find(
        (entry: { name: string }) => entry.name === faq.question,
      ).acceptedAnswer.text,
    ).toBe(faq.answer);
  }
  expect(text).toContain("https://afinazeytin.com/hakkimizda#tesisimiz");
  expect(text).toContain("https://afinazeytin.com/toptan-satis");
  expect(text).not.toMatch(
    /\/hesabim|\/admin|\/api\/|organik|₺|aggregateRating/,
  );
});
it("describes the real visible facility image and keeps the group distinct from the brand identity", () => {
  const html = renderToStaticMarkup(<BusinessJsonLd />);
  const graph = JSON.parse(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1])[
    "@graph"
  ];
  const org = graph.find(
    (node: { "@type": string }) => node["@type"] === "Organization",
  );
  expect(org.sameAs).toBeUndefined();
  expect(org.memberOf.url).toBe("https://afina.com.tr");
  const page = graph.find(
    (node: { "@type": string }) => node["@type"] === "WebPage",
  );
  expect(page.primaryImageOfPage.contentUrl).toContain(
    "/images/renewal/tesis-musteri-1672.webp",
  );
  const ids = graph.map((node: { "@id": string }) => node["@id"]);
  expect(new Set(ids).size).toBe(ids.length);
  expect(html).not.toMatch(/AggregateRating|Product|Offer|taxID|foundingDate/);
});
it("uses the actual content update date rather than a new lastmod at every build", () => {
  expect(sitemap()[0].lastModified).toBe("2026-11-01");
});

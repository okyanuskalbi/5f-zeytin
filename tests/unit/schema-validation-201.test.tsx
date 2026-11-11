import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { validateHtmlJsonLd, validateJsonLd } from "@/lib/site/schema-validation";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { StoreFaq } from "@/components/storefront/content/StoreFaq";
import Article from "@/app/blog/[slug]/page";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));

describe("local JSON-LD contract", () => {
  it("validates the real organization, website, FAQ and navigation graph", () => {
    const html = renderToStaticMarkup(<><BusinessJsonLd /><StoreFaq canonicalPath="/hakkimizda" /><PageBreadcrumbJsonLd name="Sepetim" path="/sepet" /></>);
    expect(validateHtmlJsonLd(html)).toEqual({ count: 3, errors: [] });
  });
  it.each(blogPosts)("parses all actual article nodes for $slug", async post => {
    const html = renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: post.slug }) }));
    expect(validateHtmlJsonLd(html)).toEqual({ count: 3, errors: [] });
  });
  it.each(["{", "null", "[]", '{"@context":"https://schema.org","@graph":[]}', '{"@context":"https://schema.org","@type":"BlogPosting"}', '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}', '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{}]}'])("rejects malformed or incomplete schema %s", value => {
    expect(validateJsonLd(value).length).toBeGreaterThan(0);
  });
  it("rejects commercial schema nested anywhere, including graph and multi-type nodes", () => {
    const result = validateJsonLd(JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Test", url: "https://example.test", mainEntity: { "@type": ["Thing", "Product"], offers: { "@type": "Offer" } } }));
    expect(result.filter(error => error.includes("commercial schema"))).toHaveLength(2);
  });
  it("catches invalid URLs, dates, authors, answers and breadcrumb positions", () => {
    const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 0, name: "Test", item: "javascript:alert(1)" }, { "@type": "ListItem", position: 2, name: "Test", item: "/relative" }] };
    expect(validateJsonLd(JSON.stringify(breadcrumb))).toHaveLength(2);
    expect(validateJsonLd(JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Question?", acceptedAnswer: { "@type": "Answer", text: "" } }] }))).toHaveLength(1);
  });
  it("escapes closing script text without losing the underlying data", () => {
    const name = '</script><script>alert("test")</script>';
    const html = renderToStaticMarkup(<PageBreadcrumbJsonLd name={name} path="/test" />);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).not.toContain(name);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const parsed = JSON.parse(doc.querySelector("script")!.textContent!);
    expect(parsed.itemListElement[1].name).toBe(name);
    expect(validateHtmlJsonLd(html).errors).toEqual([]);
  });
});

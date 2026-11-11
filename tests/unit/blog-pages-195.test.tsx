import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Blog, { metadata } from "@/app/blog/page";
import Article, { dynamic, dynamicParams, generateMetadata, generateStaticParams, revalidate } from "@/app/blog/[slug]/page";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { readFileSync } from "node:fs";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

it("serves all four shared articles with dates and ordinary working links in an indexable list", () => {
  const doc = parse(renderToStaticMarkup(<Blog />));
  expect(doc.querySelector("h1")?.textContent).toBe("Zeytin Defteri");
  expect(doc.querySelectorAll("[data-blog-card]")).toHaveLength(4);
  for (const post of blogPosts) {
    const card = doc.querySelector(`[data-blog-card="${post.slug}"]`)!;
    expect(card.querySelector("h2")?.textContent).toBe(post.title);
    expect(card.querySelector("time")?.getAttribute("datetime")).toBe(post.date);
    expect(card.querySelector("img")?.getAttribute("src")).toContain("/images/klasik/");
    expect(card.querySelector(`a[href="/blog/${post.slug}"]`)?.textContent).toContain("Yazıyı oku");
  }
  expect(metadata.alternates).toEqual({ canonical: "/blog" });
  expect(metadata.robots).toEqual({ index: true, follow: true });
});

it.each(blogPosts.map(post => post.slug))("renders %s with its full editorial sections, related products and exact schema", async slug => {
  const post = blogPosts.find(item => item.slug === slug)!;
  const doc = parse(renderToStaticMarkup(await Article(params(slug))));
  expect(doc.querySelector("h1")?.textContent).toBe(post.title);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("article > header time")?.getAttribute("datetime")).toBe(post.updated);
  expect(doc.body.textContent).toContain(`${post.readingMinutes} dakika okuma`);
  const body = doc.querySelector("[data-blog-content]")!;
  expect(body.querySelectorAll("h2").length).toBeGreaterThanOrEqual(3);
  expect(body.querySelectorAll("p").length).toBeGreaterThanOrEqual(5);
  expect(body.querySelector('a[href^="/urunler/"]')).not.toBeNull();
  const related = doc.querySelector('[aria-labelledby="related-products-title"]')!;
  expect(related.querySelectorAll("[data-product-id]").length).toBeGreaterThanOrEqual(2);
  expect(related.querySelectorAll("[data-product-id]").length).toBeLessThanOrEqual(3);
  expect(doc.querySelectorAll("[data-other-article]")).toHaveLength(3);
  expect(doc.querySelector(`[data-other-article="${slug}"]`)).toBeNull();
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  const schema = schemas.find(item => item["@type"] === "BlogPosting");
  expect(schema).toMatchObject({ headline: post.title, datePublished: post.date, author: { "@type": "Organization", name: "AFİNA ZEYTİN" } });
  expect(schemas.find(item => item["@type"] === "BreadcrumbList").itemListElement.map((item: {name:string}) => item.name)).toEqual(["Ana Sayfa", "Blog", post.title]);
  expect(JSON.stringify(schemas)).not.toMatch(/"(?:Product|Offer)"/);
  const meta = await generateMetadata(params(slug));
  expect(meta.alternates).toEqual({ canonical: `/blog/${slug}` });
  expect(meta.robots).toEqual({ index: true, follow: true });
});

it("builds a finite static article set, rejects unknown articles, and limits the reading measure", async () => {
  expect(dynamic).toBe("force-static");
  expect(dynamicParams).toBe(false);
  expect(revalidate).toBe(300);
  expect(generateStaticParams()).toEqual(blogPosts.map(post => ({ slug: post.slug })));
  await expect(Article(params("olmayan-yazi"))).rejects.toThrow("NEXT_NOT_FOUND");
  await expect(generateMetadata(params("olmayan-yazi"))).rejects.toThrow("NEXT_NOT_FOUND");
  expect(readFileSync("components/storefront/content/Blog.module.css", "utf8")).toMatch(/max-width:\s*(?:6\d|7[0-5])ch/);
});

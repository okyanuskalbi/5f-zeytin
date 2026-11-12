import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import Article, { dynamic, dynamicParams, generateMetadata, generateStaticParams, revalidate } from "@/app/blog/[slug]/page";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { readFileSync } from "node:fs";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); }, useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

// Task208: the list page became the home page's #blog section (three cards, each to its article); `/blog` redirects to `/#blog`.
it("serves three article cards with ordinary working links, reading time and approved photographs on the home page", async () => {
  const blog = parse(renderToStaticMarkup(await Home())).querySelector("#blog")!;
  expect(blog.querySelector("h2")?.textContent).toBe("Zeytin Defteri");
  const cards = [...blog.querySelectorAll("a")];
  expect(cards).toHaveLength(3);
  blogPosts.slice(0, 3).forEach((post, index) => {
    const card = cards[index];
    expect(card.getAttribute("href")).toBe(`/blog/${post.slug}`);
    expect(card.querySelector("h3")?.textContent).toBe(post.title);
    expect(card.textContent).toContain(`${post.readingMinutes} dk okuma`);
    expect(card.querySelector("img")?.getAttribute("src")).toContain("/images/editorial/");
  });
  expect(blog.querySelector('a[href="/blog"], a[href="/#blog"]')).toBeNull();
});

it("keeps every article reachable from the other articles, with dates and the read cue", async () => {
  for (const post of blogPosts) {
    const doc = parse(renderToStaticMarkup(await Article(params(post.slug))));
    for (const other of blogPosts.filter(item => item.slug !== post.slug)) {
      const card = doc.querySelector(`[data-blog-card="${other.slug}"]`)!;
      expect(card.querySelector("time")?.getAttribute("datetime")).toBe(other.date);
      expect(card.querySelector(`a[href="/blog/${other.slug}"]`)?.textContent).toContain("Yazıyı oku");
    }
  }
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
  // Task208: the category link opens the matching pill of the home page's product section.
  expect(body.querySelector(`a[href="${post.categoryHref}"]`)).not.toBeNull();
  expect(post.categoryHref).toMatch(/^\/\?kategori=[a-z-]+#urunler$/);
  expect(body.querySelector('a[href^="/urunler"]')).toBeNull();
  const related = doc.querySelector('[aria-labelledby="related-products-title"]')!;
  expect(related.querySelectorAll("[data-product-id]").length).toBeGreaterThanOrEqual(2);
  expect(related.querySelectorAll("[data-product-id]").length).toBeLessThanOrEqual(3);
  expect(doc.querySelectorAll("[data-other-article]")).toHaveLength(3);
  expect(doc.querySelector(`[data-other-article="${slug}"]`)).toBeNull();
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!));
  const schema = schemas.find(item => item["@type"] === "BlogPosting");
  expect(schema).toMatchObject({ headline: post.title, datePublished: post.date, author: { "@type": "Organization", name: "AFİNA ZEYTİN" } });
  expect(schemas.find(item => item["@type"] === "BreadcrumbList").itemListElement.map((item: {name:string}) => item.name)).toEqual(["Ana Sayfa", "Blog", post.title]);
  expect(schemas.find(item => item["@type"] === "BreadcrumbList").itemListElement[1].item).toBe("https://afinazeytin.com/#blog");
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/#blog"]')?.textContent).toBe("Blog");
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

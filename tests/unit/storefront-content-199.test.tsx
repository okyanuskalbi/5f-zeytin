import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import About from "@/app/hakkimizda/page";
import Legal from "@/app/kvkk/page";
import NotFound from "@/app/not-found";
import Article from "@/app/blog/[slug]/page";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
const doc = (node: React.ReactNode) => new DOMParser().parseFromString(renderToStaticMarkup(node), "text/html");
it("has exactly one pausable about strip with the five customer phrases", () => {
  const page = doc(<About />);
  expect(page.querySelectorAll("[data-about-strip]")).toHaveLength(1);
  const strip = page.querySelector("[data-about-strip]")!;
  expect(strip.querySelector('button[aria-pressed]')).not.toBeNull();
  for (const text of ["Zeytin", "Zeytinyağı", "Geleneksel Salamura", "%100 Doğal", "Katkısız"]) expect(strip.textContent).toContain(text);
});
it("gives draft legal documents a working table of contents without inventing terms", () => {
  const page = doc(<Legal />);
  const links = page.querySelectorAll('nav[aria-label="İçindekiler"] a');
  expect(links).toHaveLength(3);
  for (const link of links) expect(page.querySelector(link.getAttribute("href")!)).not.toBeNull();
  expect(page.body.textContent).toContain("Onaylı metin henüz eklenmedi.");
});
it("offers both home and products from 404", () => {
  const page = doc(<NotFound />);
  expect(page.querySelector('main a[href="/"]')).not.toBeNull();
  expect(page.querySelector('main a[href="/urunler"]')).not.toBeNull();
});
it.each(blogPosts.map(post => post.slug))("gives %s a direct answer, question headings, author and three FAQs", async slug => {
  const page = doc(await Article({ params: Promise.resolve({ slug }) }));
  expect(page.querySelector("[data-article-answer]")!.textContent!.trim().split(/\s+/).length).toBeGreaterThanOrEqual(40);
  expect(page.querySelector("[data-article-answer]")!.textContent!.trim().split(/\s+/).length).toBeLessThanOrEqual(60);
  expect(page.querySelector("[data-article-author]")?.textContent).toBe("AFİNA ZEYTİN");
  for (const heading of page.querySelectorAll("[data-blog-content] section > h2")) expect(heading.textContent).toMatch(/\?$/);
  expect(page.querySelectorAll("[data-article-faq] details")).toHaveLength(3);
  expect(page.body.textContent).not.toMatch(/[—–·]/);
});

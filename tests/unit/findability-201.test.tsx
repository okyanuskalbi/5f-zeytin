import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import Article, { generateMetadata as articleMetadata } from "@/app/blog/[slug]/page";
import { blogCover } from "@/lib/blog/cover";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { generateMetadata as productMetadata } from "@/app/urun/[slug]/page";
import { metadata as cartMetadata } from "@/app/sepet/page";
import { GET as discovery } from "@/app/llms.txt/route";
import { GET as fullDiscovery } from "@/app/llms-full.txt/route";
import { outletCounts, createDealershipDraft } from "@/lib/dealership/application";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

it.each(blogPosts)("keeps visible answers and schema identical for $slug", async post => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: post.slug }) })), "text/html");
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
  const faq = schemas.find(schema => schema["@type"] === "FAQPage");
  expect(faq).toBeDefined();
  expect(faq.mainEntity).toEqual([...doc.querySelectorAll("[data-article-faq] details")].map(node => ({
    "@type": "Question", name: node.querySelector("summary")!.textContent,
    acceptedAnswer: { "@type": "Answer", text: node.querySelector("p")!.textContent },
  })));
  const meta = await articleMetadata({ params: Promise.resolve({ slug: post.slug }) });
  // The share image is the cover's widest WebP rendition, in the metadata and in the article schema alike.
  const share = blogCover(post).outputs.findLast(output => output.format === "webp")!;
  expect(share.width).toBeGreaterThanOrEqual(1200);
  expect(meta.openGraph).toMatchObject({ images: [expect.objectContaining({ url: share.file, width: share.width, height: share.height })] });
  expect(schemas.find(schema => schema["@type"] === "BlogPosting").image).toMatch(new RegExp(`${share.file.replaceAll(".", "\\.")}$`));
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")!.textContent).toMatch(/\?$/);
  expect(doc.querySelector("[data-article-answer]")!.textContent!.split(/\s+/).length).toBeLessThanOrEqual(60);
  for (const heading of doc.querySelectorAll("h2")) expect(heading.textContent).toMatch(/\?$/);
  expect(doc.querySelector("[data-blog-content] ol li")).not.toBeNull();
  expect(doc.querySelector("[data-article-author]")!.textContent).toBe("AFİNA ZEYTİN");
});

it("uses route-specific social metadata without weakening noindex", async () => {
  for (const meta of [cartMetadata, await productMetadata({ params: Promise.resolve({ slug: "naturel-sizma-zeytinyagi" }), searchParams: Promise.resolve({ boy: "5 L" }) })]) {
    expect(meta.description).toBeTruthy();
    expect(meta.openGraph).toMatchObject({ title: meta.title, description: meta.description, url: meta.alternates!.canonical });
    expect(meta.twitter).toMatchObject({ title: meta.title, description: meta.description, card: "summary_large_image" });
    expect(meta.openGraph).toHaveProperty("images");
    expect(meta.robots).toMatchObject({ index: false });
  }
});

it("discovery points at the current catalogue and describes provisional pricing honestly", async () => {
  for (const get of [discovery, fullDiscovery]) {
    const body = await (await get()).text();
    // Task208: the catalogue is the #urunler section of the home page; the retired address is not advertised.
    expect(body).toContain("](https://afinazeytin.com/#urunler)");
    expect(body).not.toContain("afinazeytin.com/urunler");
    expect(body).toMatch(/Fiyat ve stok.*temsili/);
    expect(body).not.toMatch(/güncel bilgi esas/);
  }
});

it("fixes copy at its source, preserves submitted option values and user-authored punctuation", () => {
  expect(outletCounts).toContain("2\u20135");
  const draft = createDealershipDraft({ companyName: "Firma — Yerel", contactName: "Test Kullanıcı", phone: "+905321234567", email: "test@example.test", city: "Osmaniye", district: "Düziçi", businessType: "Market", outletCount: "2\u20135", message: "Kullanıcı – açıklaması", consent: true });
  expect(draft.body).toContain("Satış noktası sayısı: 2-5");
  expect(draft.body).toContain("Kullanıcı – açıklaması");
  for (const path of ["components/account/SignIn.tsx", "components/account/Register.tsx", "components/account/FormControls.tsx", "components/dealership/DealershipFormClient.tsx", "components/ui/customer-phone-field.tsx"]) {
    expect(readFileSync(path, "utf8")).not.toMatch(/replace(?:All)?\([^\n]*(?:—|–)/);
  }
});

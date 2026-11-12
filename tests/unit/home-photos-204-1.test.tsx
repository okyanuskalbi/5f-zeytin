import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import Blog from "@/app/blog/page";
import Article from "@/app/blog/[slug]/page";
import { blogCover } from "@/lib/blog/cover";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({ state: { hydrated: true, items: [] }, products: [], open: false, openCart: vi.fn(), store: { addItem: vi.fn() } }) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));

const parse = (html: string): Document => new DOMParser().parseFromString(html, "text/html");
/** "/images/editorial/hikaye-ana-800.webp" → "hikaye-ana": one name per photograph, whatever the rendition. */
const photo = (image: Element | null | undefined): string => (image?.getAttribute("src") ?? "").replace(/-\d+\.(avif|webp)$/, "").split("/").slice(-2).join("/");
const covers = {
  "salamura-zeytin-nasil-hazirlanir": "editorial/blog-salamura",
  "kirma-zeytin-nedir-nasil-saklanir": "editorial/blog-kirma",
  "naturel-sizma-zeytinyagi-nasil-saklanmali": "editorial/zeytinyagi-yatay",
  "sofralik-zeytin-secerken-nelere-dikkat-edilmeli": "editorial/blog-sofra",
} as const;

it("places the approved photographs where the correction asks for them", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const story = doc.querySelectorAll('[data-home-section="story"] img');
  expect([...story].map(photo)).toEqual(["editorial/hikaye-ana", "editorial/hikaye-dal"]);
  expect(story[0].getAttribute("alt")).toMatch(/eller/iu);
  expect(story[1].getAttribute("alt")).toBe("");
  expect(photo(doc.querySelector('[data-home-category="zeytinyagi"] img'))).toBe("editorial/zeytinyagi-dikey");
  expect(photo(doc.querySelector('[data-home-category="zeytin"] img'))).toBe("editorial/zeytin-kase");
  expect(photo(doc.querySelector('[data-home-section="banners"] a[href="/urunler/zeytinyagi"] img'))).toBe("editorial/zeytinyagi-dikey");
  // The customer's own photographs stay where they were.
  expect(photo(doc.querySelector('[data-home-category="hakkimizda"] img'))).toBe("customer-home/fabrika");
  expect(photo(doc.querySelector('[data-home-section="banners"] a[href="/urunler/zeytin"] img'))).toBe("customer-home/her-tanede-ayni-ozen-el");
  expect(photo(doc.querySelector('[data-home-section="harvest"] img'))).toBe("customer-home/bereketin-hasat-vakti");
  for (const [slug, cover] of Object.entries(covers)) expect(photo(doc.querySelector(`[data-home-section="blog"] a[href="/blog/${slug}"] img`)), slug).toBe(cover);
});

it("never shows one photograph more than twice on the home page", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const uses = new Map<string, number>();
  for (const image of doc.querySelectorAll("img")) uses.set(photo(image), (uses.get(photo(image)) ?? 0) + 1);
  expect([...uses].filter(([, count]) => count > 2)).toEqual([]);
  expect(uses.get("editorial/zeytinyagi-dikey")).toBe(2);
  expect(uses.get("customer-home/fabrika")).toBe(2);
});

it("asks for a rendition as wide as the cropped picture, not as the frame around it", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  // A 16:9 cover fills a square frame at 1.78 times its width: a narrower hint would blur it.
  const thumbnail = doc.querySelector('[data-home-section="blog"] a[href="/blog/naturel-sizma-zeytinyagi-nasil-saklanmali"] img')!;
  const desktop = Number(thumbnail.getAttribute("sizes")!.split(",").at(-1)!.trim().replace("px", ""));
  expect(desktop).toBeGreaterThanOrEqual(Math.ceil(160 * 16 / 9));
});

it("uses the same cover on the blog list, the article and its share image", async () => {
  const list = parse(renderToStaticMarkup(<Blog />));
  for (const post of blogPosts) {
    expect(photo(list.querySelector(`[data-blog-card="${post.slug}"] img`)), post.slug).toBe(covers[post.slug as keyof typeof covers]);
    const article = parse(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: post.slug }) })));
    const cover = article.querySelector("article > picture img")!;
    expect(photo(cover), post.slug).toBe(covers[post.slug as keyof typeof covers]);
    expect(cover.getAttribute("alt")).toBe(blogCover(post).alt);
    const schema = [...article.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!)).find(item => item["@type"] === "BlogPosting");
    expect(schema.image).toContain(`/images/${covers[post.slug as keyof typeof covers]}-`);
  }
});

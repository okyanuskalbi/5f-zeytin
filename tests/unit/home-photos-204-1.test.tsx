import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import Article from "@/app/blog/[slug]/page";
import { blogCover } from "@/lib/blog/cover";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search), notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
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

const HOME_POSTS = blogPosts.slice(0, 3);

// Task208: the portals and the linked banners are gone; the story keeps its two photographs and the facility row the customer's three.
it("places the approved photographs where the landing page shows them", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const story = doc.querySelectorAll('[data-home-section="story"] > div > div:not([data-home-facility]) img');
  expect([...story].map(photo)).toEqual(["editorial/hikaye-ana", "editorial/hikaye-dal"]);
  expect(story[0].getAttribute("alt")).toMatch(/eller/iu);
  expect(story[1].getAttribute("alt")).toBe("");
  // The customer's own photographs, in order, as captioned figures.
  expect([...doc.querySelectorAll("[data-home-facility] figure")].map(figure => [figure.querySelector("figcaption")?.textContent, photo(figure.querySelector("img"))])).toEqual([
    ["Tesisimiz", "customer-home/fabrika"], ["Her Tanede Aynı Özen", "customer-home/her-tanede-ayni-ozen-el"], ["Ellek zeytinlikleri", "customer-home/bereketin-hasat-vakti"],
  ]);
  for (const post of HOME_POSTS) expect(photo(doc.querySelector(`[data-home-section="blog"] a[href="/blog/${post.slug}"] img`)), post.slug).toBe(covers[post.slug as keyof typeof covers]);
  expect(doc.querySelector("[data-home-category], [data-home-section=\"banners\"]")).toBeNull();
});

// Task208: stricter than before: every photograph appears once (the sections that repeated them merged).
it("never shows one photograph more than once on the home page", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const uses = new Map<string, number>();
  for (const image of doc.querySelectorAll("img")) uses.set(photo(image), (uses.get(photo(image)) ?? 0) + 1);
  expect([...uses].filter(([, count]) => count > 1)).toEqual([]);
  expect(uses.get("customer-home/fabrika")).toBe(1);
});

// Task208: desktop cards are 16:10 at up to 410 px wide; the phone row is a 112 px square cropped from a 16:9 cover.
it("asks for a rendition as wide as the cropped picture, not as the frame around it", async () => {
  const doc = parse(renderToStaticMarkup(await Home()));
  const sizes = doc.querySelector('[data-home-section="blog"] a[href="/blog/naturel-sizma-zeytinyagi-nasil-saklanmali"] img')!.getAttribute("sizes")!.split(",").map(part => part.trim());
  expect(Number(sizes.at(-1)!.replace("px", ""))).toBeGreaterThanOrEqual(410);
  const phone = sizes.find(part => part.startsWith("(max-width: 767px)"))!;
  expect(Number(phone.split(" ").at(-1)!.replace("px", ""))).toBeGreaterThanOrEqual(Math.ceil(112 * 16 / 9));
});

// Task208: the list page is retired; the home cards (checked above) and each article's "other articles" cards share the cover.
it("uses the same cover on the article, its share image and the cards that link to it", async () => {
  for (const post of blogPosts) {
    const other = blogPosts.find(item => item.slug !== post.slug)!;
    const elsewhere = parse(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: other.slug }) })));
    expect(photo(elsewhere.querySelector(`[data-blog-card="${post.slug}"] img`)), post.slug).toBe(covers[post.slug as keyof typeof covers]);
    const article = parse(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: post.slug }) })));
    const cover = article.querySelector("article > picture img")!;
    expect(photo(cover), post.slug).toBe(covers[post.slug as keyof typeof covers]);
    expect(cover.getAttribute("alt")).toBe(blogCover(post).alt);
    const schema = [...article.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent!)).find(item => item["@type"] === "BlogPosting");
    expect(schema.image).toContain(`/images/${covers[post.slug as keyof typeof covers]}-`);
  }
});

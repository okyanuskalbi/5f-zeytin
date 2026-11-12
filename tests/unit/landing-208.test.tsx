import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { MotionProvider } from "@/components/site/MotionProvider";
import { BusinessTabs } from "@/components/storefront/home/BusinessTabs";
import { ProductShowcase } from "@/components/storefront/home/ProductShowcase";
import { ProductTile } from "@/components/storefront/ProductTile";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { verifiedFaqs } from "@/lib/site/faqs";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => navigation.pathname, useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({ state: { hydrated: true, items: [] }, products: [], open: false, openCart: vi.fn(), store: { addItem: vi.fn() } }) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));

const SECTION_IDS = ["baslangic", "urunler", "hikayemiz", "toptan-bayilik", "blog", "iletisim"];
const SLOGAN = /Kökü toprakta/g;
const css = (path: string) => readFileSync(path, "utf8");

beforeEach(() => {
  navigation.pathname = "/";
  window.history.replaceState(null, "", "/");
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function homeMarkup(): Promise<string> { return renderToStaticMarkup(await Home()); }
async function homeDocument(): Promise<Document> { return new DOMParser().parseFromString(await homeMarkup(), "text/html"); }

describe("Task208 landing structure", () => {
  it("carries the six sections in order, each with its id", async () => {
    const page = await homeDocument();
    expect([...page.querySelectorAll("[data-landing-section]")].map(section => section.id)).toEqual(SECTION_IDS);
    expect(page.querySelectorAll("h1")).toHaveLength(1);
  });

  it("gives the hero one action that leads to the products", async () => {
    const hero = (await homeDocument()).querySelector("#baslangic")!;
    const pills = hero.querySelectorAll("a[data-pill]");
    expect(pills).toHaveLength(1);
    expect(pills[0].textContent).toBe("Ürünleri İnceleyin");
    expect(pills[0].getAttribute("href")).toBe("/#urunler");
  });

  it("shows every product once, under six category pills, with only the buy action", async () => {
    const page = await homeDocument();
    const section = page.querySelector("#urunler")!;
    expect([...section.querySelectorAll('[role="radio"]')].map(pill => pill.textContent)).toEqual(["Tümü", "Zeytinyağı", "Zeytin", "Siyah", "Yeşil", "Kırma"]);
    const ids = [...page.querySelectorAll("article[data-product-id]")].map(card => card.getAttribute("data-product-id"));
    expect(ids).toHaveLength((await getProducts()).length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(section.querySelectorAll("article[data-product-id]")).toHaveLength(ids.length);
    expect(section.textContent).not.toContain("Teklife ekle");
    expect(page.querySelector('[data-tone="dark"]')).toBeNull();
  });

  it("tells the story once: one seal, three icon values, no link out of the section", async () => {
    const page = await homeDocument();
    const story = page.querySelector("#hikayemiz")!;
    expect(page.querySelectorAll("[data-stamp]")).toHaveLength(1);
    expect(story.querySelector("[data-stamp]")).not.toBeNull();
    expect(story.querySelectorAll("[data-story-values] > li")).toHaveLength(3);
    expect(story.querySelectorAll("a")).toHaveLength(0);
    expect(story.textContent?.match(/%100 Doğal/g)).toHaveLength(1);
  });

  it("links three articles and no separate list page", async () => {
    const blog = (await homeDocument()).querySelector("#blog")!;
    const links = [...blog.querySelectorAll("a")].map(link => link.getAttribute("href"));
    expect(links).toEqual(blogPosts.slice(0, 3).map(post => `/blog/${post.slug}`));
    expect(blog.textContent).toContain("dk okuma");
  });

  it("answers the questions and gives the address in the last section, with the FAQ schema on the home page", async () => {
    const page = await homeDocument();
    const contact = page.querySelector("#iletisim")!;
    expect(contact.querySelectorAll("details")).toHaveLength(verifiedFaqs.length);
    const route = [...contact.querySelectorAll("a[data-pill]")].find(link => link.textContent === "Yol tarifi")!;
    expect(route.getAttribute("data-variant")).toBe("quiet");
    expect(contact.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(contact.querySelector('a[href^="mailto:"]')).not.toBeNull();
    for (const path of ["/siparis-takip", "/iade", "/mesafeli-satis"]) expect(contact.querySelector(`a[href="${path}"]`)).toBeNull();
    const schemas = [...page.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? "{}"));
    expect(schemas.find(schema => schema["@type"] === "FAQPage")?.["@id"]).toBe("https://afinazeytin.com/#sik-sorulanlar");
  });

  it("reveals only the sections below the first screen", async () => {
    const page = await homeDocument();
    expect([...page.querySelectorAll("[data-landing-section][data-reveal]")].map(section => section.id)).toEqual(SECTION_IDS.slice(2));
  });
});

describe("Task208 repetition rules", () => {
  it("says the slogan once on the page and once in the footer", async () => {
    expect((await homeMarkup()).match(SLOGAN)).toHaveLength(1);
    expect(renderToStaticMarkup(<StoreFooter />).match(SLOGAN)).toHaveLength(1);
  });

  it("allows one primary or gold action per section besides the product cards", async () => {
    for (const section of (await homeDocument()).querySelectorAll("[data-landing-section]")) {
      const actions = [...section.querySelectorAll('[data-variant="primary"], [data-variant="gold"]')].filter(action => !action.closest("article[data-product-id]"));
      expect(actions.length, section.id).toBeLessThanOrEqual(1);
    }
  });

  it("never offers two pills to the same destination and uses no long dash", async () => {
    const markup = await homeMarkup();
    const page = new DOMParser().parseFromString(markup, "text/html");
    const targets = [...page.querySelectorAll("a[data-pill]")].map(link => link.getAttribute("href"));
    expect(new Set(targets).size).toBe(targets.length);
    expect(page.body.textContent).not.toMatch(/[—–]/);
    expect(page.querySelectorAll("[data-olive-branch]").length).toBeLessThanOrEqual(1);
  });

  it("states the address and each claim once", async () => {
    const text = (await homeDocument()).querySelector("main")!.textContent ?? "";
    expect(text.match(/Ellek Beldesi, Düziçi/g)).toHaveLength(1);
    expect(text.match(/Kendi Tesisimizde/gi) ?? []).toHaveLength(1);
    expect(renderToStaticMarkup(<StoreFooter />)).not.toContain("Ellek Beldesi");
  });
});

describe("Task208 product pills", () => {
  async function showcase() {
    const families = await getProductFamilies();
    const items = families.flatMap(family => family.variants.map(product => ({ id: product.id, groups: [family.groupId], tile: <ProductTile product={product} /> })));
    return { families, view: render(<ProductShowcase items={items} />) };
  }

  it("filters the cards in place when a category pill is chosen", async () => {
    const { families } = await showcase();
    const oil = families.filter(family => family.groupId === "zeytinyagi").flatMap(family => family.variants);
    fireEvent.click(screen.getByRole("radio", { name: "Zeytinyağı" }));
    expect(screen.getByRole("radio", { name: "Zeytinyağı" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getAllByRole("article").map(card => card.getAttribute("data-product-id"))).toEqual(oil.map(product => product.id));
    expect(window.location.search).toBe("?kategori=zeytinyagi");
    fireEvent.click(screen.getByRole("radio", { name: "Tümü" }));
    expect(window.location.search).toBe("");
  });

  it("opens with the category named in the address", async () => {
    window.history.replaceState(null, "", "/?kategori=kirma-zeytin#urunler");
    const { families } = await showcase();
    const cracked = families.filter(family => family.groupId === "kirma-zeytin").flatMap(family => family.variants.map(product => product.id));
    expect(screen.getByRole("radio", { name: "Kırma" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getAllByRole("article").map(card => card.getAttribute("data-product-id")).sort()).toEqual([...cracked].sort());
  });

  it("ignores an unknown category and keeps every product", async () => {
    window.history.replaceState(null, "", "/?kategori=bilinmeyen");
    const { families } = await showcase();
    expect(screen.getByRole("radio", { name: "Tümü" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getAllByRole("article")).toHaveLength(families.flatMap(family => family.variants).length);
  });
});

describe("Task208 wholesale and dealership pills", () => {
  const tabs = () => render(<BusinessTabs wholesale={<p>Teklif formu</p>} dealership={<p>Bayilik formu</p>} />);

  it("opens on wholesale and switches without leaving the page", () => {
    tabs();
    const group = screen.getByRole("radiogroup", { name: "Toptan satış ya da bayilik" });
    expect(within(group).getAllByRole("radio").map(pill => pill.textContent)).toEqual(["Toptan Satış", "Bayilik"]);
    expect(screen.getByText("Teklif formu").closest("[hidden]")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Bayilik" }));
    expect(screen.getByText("Bayilik formu").closest("[hidden]")).toBeNull();
    expect(screen.getByText("Teklif formu").closest("[hidden]")).not.toBeNull();
    expect(window.location.search).toBe("?sekme=bayilik");
  });

  it("opens the dealership pill from the address", () => {
    window.history.replaceState(null, "", "/?sekme=bayilik#toptan-bayilik");
    tabs();
    expect(screen.getByRole("radio", { name: "Bayilik" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Bayilik formu").closest("[hidden]")).toBeNull();
  });

  it("keeps the quote form, its product picker and the KVKK consent on the home page", async () => {
    const section = (await homeDocument()).querySelector("#toptan-bayilik")!;
    expect(section.querySelector('form[aria-label="Kurumsal teklif talebi"]')).not.toBeNull();
    expect(section.querySelector('[name="productId"]')).not.toBeNull();
    expect(section.querySelector('input[name="kvkk"]')).not.toBeNull();
  });
});

describe("Task208 menu and footer", () => {
  const header = () => render(<MotionProvider><StoreHeader /></MotionProvider>);

  it("points every menu link at a section of the home page, on any page", () => {
    navigation.pathname = "/sepet";
    header();
    const links = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link");
    expect(links.map(link => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Ürünler", "/#urunler"], ["Hikâyemiz", "/#hikayemiz"], ["Toptan & Bayilik", "/#toptan-bayilik"], ["Blog", "/#blog"], ["İletişim", "/#iletisim"],
    ]);
  });

  it("marks the products link on a product page and the blog link on an article", () => {
    navigation.pathname = "/urun/dogal-kirma-yesil-zeytin";
    header();
    expect(screen.getByRole("link", { name: "Ürünler" }).hasAttribute("aria-current")).toBe(true);
    cleanup();
    navigation.pathname = "/blog/salamura-zeytin-nasil-hazirlanir";
    header();
    expect(screen.getByRole("link", { name: "Blog" }).hasAttribute("aria-current")).toBe(true);
    expect(screen.getByRole("link", { name: "Ürünler" }).hasAttribute("aria-current")).toBe(false);
  });

  it("keeps one fragment in the address when the router appends a second one", () => {
    window.history.replaceState(null, "", "/?kategori=zeytin#urunler#urunler");
    header();
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe("/?kategori=zeytin#urunler");
  });

  it("opens the same links in the phone drawer, without a second products button", async () => {
    header();
    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const drawer = await screen.findByRole("dialog");
    const links = within(within(drawer).getByRole("navigation", { name: "Mobil navigasyon" })).getAllByRole("link");
    expect(links.map(link => link.getAttribute("href"))).toEqual(["/#urunler", "/#hikayemiz", "/#toptan-bayilik", "/#blog", "/#iletisim"]);
    expect(drawer.querySelector("[data-pill]")).toBeNull();
    expect(drawer.textContent).not.toMatch(SLOGAN);
  });

  it("groups the footer into three plain link columns without a button or an address", () => {
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getAllByRole("heading", { level: 2 }).map(heading => heading.textContent)).toEqual(["Ürünler", "Kurumsal", "Yardım"]);
    expect(footer.querySelector("[data-pill]")).toBeNull();
    expect(footer.querySelector("address")).toBeNull();
    const hrefs = [...footer.querySelectorAll("[data-footer-links] a")].map(link => link.getAttribute("href"));
    expect(hrefs).toContain("/?kategori=zeytinyagi#urunler");
    expect(hrefs).toContain("/?sekme=bayilik#toptan-bayilik");
    expect(hrefs).toContain("/#iletisim");
    for (const href of hrefs) expect(href).not.toMatch(/^\/(urunler|hakkimizda|toptan-satis|bayilik|blog)(\/|$)/);
  });
});

describe("Task208 link shapes and spacing", () => {
  it("draws a standalone link as a quiet pill with a ring coin, never underlined", () => {
    render(<PillButton variant="quiet" href="/sepet">Sepeti görüntüle</PillButton>);
    expect(screen.getByRole("link", { name: "Sepeti görüntüle" }).querySelector("[data-coin]")).not.toBeNull();
    const pill = css("components/storefront/ui/PillButton.module.css");
    const quiet = pill.slice(pill.indexOf('.pill[data-variant="quiet"]'));
    expect(quiet.slice(0, quiet.indexOf("}"))).toMatch(/border-color: var\(--sf-line\)/);
    expect(quiet.slice(0, quiet.indexOf("}"))).toMatch(/background: var\(--sf-paper\)/);
    expect(pill).not.toMatch(/text-decoration: underline/);
  });

  it("keeps links inside a sentence underlined", () => {
    expect(css("components/storefront/quote/QuoteComposer.module.css")).toMatch(/\.consent a \{[^}]*text-decoration: underline/);
    expect(css("components/dealership/DealershipForm.module.css")).toMatch(/\.consent a, \.fallback a \{[^}]*text-decoration: underline/);
  });

  it("removes the underline from breadcrumb, account and tracking links that stand alone", () => {
    expect(css("components/storefront/ui/ui.module.css")).not.toMatch(/\.path a \{[^}]*text-decoration: underline/);
    expect(css("components/orders/Tracking.module.css")).not.toMatch(/\.link \{[^}]*text-decoration: underline/);
    expect(css("components/storefront/account/AccountSurface.module.css")).not.toMatch(/\.back[^{]*\{[^}]*text-decoration: underline/);
  });

  it("lets a waiting section fade in without holding a transform on its wrapper", () => {
    const home = css("components/storefront/StoreHome.module.css");
    expect(home).toMatch(/\[data-reveal="pending"\] > \.container \{ opacity: 0; \}/);
    expect(home).toMatch(/\[data-reveal="shown"\] > \.container \{ animation: section-arrive 280ms ease-out; \}/);
    expect(home).toMatch(/@keyframes section-arrive \{ from \{ opacity: 0; transform: translateY\(8px\); \}/);
  });

  it("tightens the section rhythm to 60, 48 and 40 px and scrolls smoothly only when motion is welcome", () => {
    const globals = css("app/globals.css");
    expect(globals).toMatch(/--sf-section-y: 60px/);
    expect(globals).toMatch(/--sf-section-y: 48px/);
    expect(globals).toMatch(/--sf-section-y: 40px/);
    expect(globals).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html \{ scroll-behavior: smooth; \}/);
    const home = css("components/storefront/StoreHome.module.css");
    expect(home).toMatch(/padding-block: var\(--sf-section-y\)/);
    expect(home).not.toMatch(/padding-block: 96px/);
  });
});

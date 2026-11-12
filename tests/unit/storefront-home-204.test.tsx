import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { MotionProvider } from "@/components/site/MotionProvider";
import { ProductTile } from "@/components/storefront/ProductTile";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

const cart = vi.hoisted(() => ({ addItem: vi.fn(), openCart: vi.fn(), quantity: 2 }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: true, items: cart.quantity ? [{ quantity: cart.quantity }] : [] },
  products: [], open: false, openCart: cart.openCart, store: { addItem: cart.addItem },
}) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));

beforeEach(() => {
  cart.quantity = 2;
  // Assigned, not stubbed: Radix restores focus after unmount and still asks for the breakpoint.
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers(); });

async function renderHome(): Promise<Document> {
  return new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
}

describe("Task204 product card", () => {
  // Task208: the card keeps one action; quoting moved to the wholesale form's product picker.
  it("offers one primary pill to buy, no quote link and a Tag for the size", async () => {
    const product = (await getProducts()).find(item => item.stock > 0)!;
    render(<ProductTile product={product} />);
    const card = screen.getByRole("article");
    const buy = within(card).getByRole("button", { name: "Sepete ekle" });
    expect(buy.hasAttribute("data-pill")).toBe(true);
    expect(buy.getAttribute("data-variant")).toBe("primary");
    expect(buy.querySelector("[data-coin]")).not.toBeNull();
    expect(card.querySelectorAll("[data-pill]")).toHaveLength(1);
    expect(within(card).queryByRole("link", { name: "Teklife ekle" })).toBeNull();
    expect(card.querySelector('a[href*="teklif="]')).toBeNull();
    expect(card.querySelector("[data-tag]")?.textContent).toBe(product.weight);
    expect(within(card).getByLabelText("Fiyat").textContent).toContain("₺");
  });

  it("confirms an addition with the same cart call, then returns to its first label", async () => {
    vi.useFakeTimers();
    const product = (await getProducts()).find(item => item.stock > 0)!;
    render(<ProductTile product={product} />);
    fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
    expect(cart.addItem).toHaveBeenCalledWith(product.id, 1);
    const added = screen.getByRole("button", { name: "Eklendi" });
    expect(added.querySelector("[data-coin]")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toContain("sepete eklendi");
    await vi.advanceTimersByTimeAsync(1700);
    expect(screen.getByRole("button", { name: "Sepete ekle" })).toBeTruthy();
  });

  it("keeps a sold-out product readable, disabled and without a coin", async () => {
    const product = (await getProducts()).find(item => item.stock === 0)!;
    render(<ProductTile product={product} />);
    const unavailable = screen.getByRole("button", { name: "Mevcut değil" });
    expect((unavailable as HTMLButtonElement).disabled).toBe(true);
    expect(unavailable.hasAttribute("data-pill")).toBe(true);
    expect(unavailable.querySelector("[data-coin]")).toBeNull();
    // Task208: no quote link on the card; the product page stays reachable from its name.
    expect(screen.queryByRole("link", { name: "Teklife ekle" })).toBeNull();
    expect(screen.getByRole("link", { name: product.name }).getAttribute("href")).toContain("/urun/");
  });
});

describe("Task204 navigation and footer", () => {
  // Task208: the five destinations are sections of the home page.
  it("keeps five section destinations, the account and a cart pill with its count badge", () => {
    render(<MotionProvider><StoreHeader /></MotionProvider>);
    const links = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link");
    expect(links.map(link => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Ürünler", "/#urunler"], ["Hikâyemiz", "/#hikayemiz"], ["Toptan & Bayilik", "/#toptan-bayilik"], ["Blog", "/#blog"], ["İletişim", "/#iletisim"],
    ]);
    expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
    const pill = screen.getByRole("button", { name: "Sepetim, 2 adet" });
    expect(pill.hasAttribute("data-cart-pill")).toBe(true);
    expect(pill.querySelector("[data-cart-count]")?.textContent).toBe("2");
    fireEvent.click(pill);
    expect(cart.openCart).toHaveBeenCalledWith(pill);
  });

  // Task208: the drawer repeats the menu only; a second "Ürünleri İnceleyin" button would duplicate the Ürünler link.
  it("keeps the phone drawer to the section links and the account, without a pill", async () => {
    render(<MotionProvider><StoreHeader /></MotionProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = await screen.findByRole("dialog", { name: "Site menüsü" });
    expect(within(within(dialog).getByRole("navigation", { name: "Mobil navigasyon" })).getAllByRole("link").map(link => link.getAttribute("href"))).toEqual([
      "/#urunler", "/#hikayemiz", "/#toptan-bayilik", "/#blog", "/#iletisim",
    ]);
    expect(within(dialog).getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
    expect(within(dialog).queryByRole("link", { name: "Ürünleri İnceleyin" })).toBeNull();
    expect(dialog.querySelectorAll("[data-pill]")).toHaveLength(0);
  });

  // Task208: the footer has no button (the quote form is a section of the page); payment marks stay.
  it("keeps the four payment marks and one olive branch in a footer without a button", () => {
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).queryByRole("link", { name: "Teklif İste" })).toBeNull();
    expect(footer.querySelectorAll("[data-pill]")).toHaveLength(0);
    expect(within(footer).getByRole("link", { name: "Toptan Satış" }).getAttribute("href")).toBe("/?sekme=toptan#toptan-bayilik");
    expect([...footer.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
    expect(footer.querySelectorAll("[data-olive-branch]")).toHaveLength(1);
  });
});

describe("Task204 home page", () => {
  // Task208: six sections on one page.
  it("keeps the landing order with a single h1 and a single gold action over the video", async () => {
    const doc = await renderHome();
    expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
      "hero", "products", "story", "business", "blog", "contact",
    ]);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
    const hero = doc.querySelector('[data-home-section="hero"]')!;
    const actions = hero.querySelectorAll("[data-pill]");
    expect(actions).toHaveLength(1);
    expect(actions[0].getAttribute("data-variant")).toBe("gold");
    expect(actions[0].getAttribute("href")).toBe("/#urunler");
    expect(actions[0].textContent).toBe("Ürünleri İnceleyin");
    expect(hero.querySelector("[data-eyebrow], [data-stamp], [data-tag]")).toBeNull();
    // One poster file: the preload hint and the picture must ask for the same rendition.
    expect(doc.querySelector('head link[rel="preload"][as="image"]')?.getAttribute("imagesizes")).toBe(hero.querySelector("[data-hero-photo] img")?.getAttribute("sizes"));
  });

  // Task208: no dark band on the page (only the footer is green); products appear once, without a list-page button.
  it("keeps the whole page light and shows the products in one section", async () => {
    const doc = await renderHome();
    expect(doc.querySelectorAll('[data-home-section][data-tone="dark"], [data-section-heading][data-tone="dark"]')).toHaveLength(0);
    expect(doc.querySelector('[data-home-section="featured"]')).toBeNull();
    const products = doc.querySelector('[data-home-section="products"]')!;
    expect(products.querySelectorAll("a[data-pill]")).toHaveLength(0);
    expect(doc.querySelectorAll("article[data-product-id]")).toHaveLength(products.querySelectorAll("article[data-product-id]").length);
    expect(doc.querySelector('a[href="/urunler"]')).toBeNull();
  });

  // Task208: the one seal sits in the story's three values; the harvest keeps its three steps.
  it("seals only the customer's natural claim, inside the story", async () => {
    const doc = await renderHome();
    const stamps = doc.querySelectorAll("[data-stamp]");
    expect(stamps).toHaveLength(1);
    expect(stamps[0].closest("[data-home-section]")?.getAttribute("data-home-section")).toBe("story");
    expect(stamps[0].getAttribute("aria-label")).toBe("%100 Doğal ve Katkısız");
    expect(stamps[0].closest("li")?.textContent).toContain("%100 Doğal ve Katkısız");
    expect([...doc.querySelectorAll('[data-home-section="story"] [data-harvest-ledger] li [data-step-label]')].map(item => item.textContent)).toEqual([
      "Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme",
    ]);
  });

  // Task208: the customer's sentences stay; links that only led to the retired pages are gone.
  it("carries the customer's words exactly, each once", async () => {
    const doc = await renderHome();
    expect(doc.querySelector('[data-home-section="categories"]')).toBeNull();
    const story = doc.querySelector('[data-home-section="story"]')!;
    expect(story.querySelector("h2")?.textContent).toBe("Nesillerin Emeği, Toprağın Bereketi");
    expect(story.querySelector("h3")?.textContent).toBe("Bereketin Hasat Vakti");
    expect(story.textContent).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
    expect([...doc.querySelectorAll("[data-story-values] li strong")].map(item => item.textContent)).toEqual(["Geleneksel Üretim", "%100 Doğal ve Katkısız", "Kendi Tesisimizde"]);
    expect(story.querySelectorAll("a")).toHaveLength(0);
    const business = doc.querySelector('[data-home-section="business"]')!;
    expect([...business.querySelectorAll('[role="radio"]')].map(pill => pill.textContent)).toEqual(["Toptan Satış", "Bayilik"]);
    expect(business.textContent).toContain("Otel, restoran, market ve toplu tüketim için koli bazında teklif.");
    expect(business.querySelectorAll("a[data-pill]")).toHaveLength(0);
    expect(business.querySelectorAll('[data-pill][data-variant="primary"]')).toHaveLength(1);
    expect(doc.querySelector('[data-home-section="blog"] a[href="/blog"]')).toBeNull();
    expect(doc.querySelectorAll('[data-home-section="blog"] a[href^="/blog/"]')).toHaveLength(3);
  });

  // Task208: QuietMotion is gone; the only arrival is SectionReveal on the sections below the first screen.
  it("uses the leaf eyebrow at most every other section, never a long dash, and one arrival only below the first screen", async () => {
    const doc = await renderHome();
    const sections = [...doc.querySelectorAll("[data-home-section]")];
    const withEyebrow = sections.map(section => section.querySelector("[data-eyebrow]") !== null);
    expect(withEyebrow.filter(Boolean).length).toBeLessThanOrEqual(Math.ceil(sections.length / 2));
    withEyebrow.forEach((has, index) => { if (has) expect(withEyebrow[index + 1] ?? false).toBe(false); });
    expect(doc.querySelector("main")?.textContent).not.toMatch(/[—–]/);
    expect([...doc.querySelectorAll("main img")].map(image => image.getAttribute("alt") ?? "").join(" ")).not.toMatch(/[—–]/);
    expect(doc.querySelectorAll("[data-olive-branch]").length).toBeLessThanOrEqual(1);
    const home = readFileSync("components/storefront/StoreHome.tsx", "utf8");
    expect(home).not.toMatch(/useScroll|useTransform|whileInView|position:\s*sticky|backdrop-filter/);
    expect(readFileSync("components/storefront/StoreHome.module.css", "utf8")).not.toMatch(/backdrop-filter|filter:\s*blur|position:\s*sticky|scroll-snap-type:\s*y/);
    expect(doc.querySelectorAll("[data-in-view]")).toHaveLength(0);
    expect([...doc.querySelectorAll("[data-reveal]")].map(node => node.getAttribute("data-home-section"))).toEqual(["story", "business", "blog", "contact"]);
    const reveal = readFileSync("components/storefront/home/SectionReveal.tsx", "utf8");
    expect(reveal).toMatch(/prefers-reduced-motion: reduce/);
    expect(reveal).not.toMatch(/addEventListener\("scroll"|useScroll|scrollY/);
  });
});

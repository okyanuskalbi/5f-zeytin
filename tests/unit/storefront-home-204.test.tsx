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
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/" }));
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
  it("offers a primary pill to buy, a quiet pill to quote and a Tag for the size", async () => {
    const product = (await getProducts()).find(item => item.stock > 0)!;
    render(<ProductTile product={product} />);
    const card = screen.getByRole("article");
    const buy = within(card).getByRole("button", { name: "Sepete ekle" });
    expect(buy.hasAttribute("data-pill")).toBe(true);
    expect(buy.getAttribute("data-variant")).toBe("primary");
    expect(buy.querySelector("[data-coin]")).not.toBeNull();
    const quote = within(card).getByRole("link", { name: "Teklife ekle" });
    expect(quote.getAttribute("data-variant")).toBe("quiet");
    expect(quote.getAttribute("href")).toBe(`/toptan-satis?teklif=${product.id}`);
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
    expect(screen.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toContain(product.id);
  });
});

describe("Task204 navigation and footer", () => {
  it("keeps five destinations, the account and a cart pill with its count badge", () => {
    render(<MotionProvider><StoreHeader /></MotionProvider>);
    const links = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link");
    expect(links.map(link => link.textContent)).toEqual(["Ürünler", "Hakkımızda", "Toptan Satış", "Bayilik", "Blog"]);
    expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
    const pill = screen.getByRole("button", { name: "Sepetim, 2 adet" });
    expect(pill.hasAttribute("data-cart-pill")).toBe(true);
    expect(pill.querySelector("[data-cart-count]")?.textContent).toBe("2");
    fireEvent.click(pill);
    expect(cart.openCart).toHaveBeenCalledWith(pill);
  });

  it("ends the phone drawer with one gold pill to the products", async () => {
    render(<MotionProvider><StoreHeader /></MotionProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const dialog = await screen.findByRole("dialog", { name: "Site menüsü" });
    const action = within(dialog).getByRole("link", { name: "Ürünleri İnceleyin" });
    expect(action.getAttribute("data-variant")).toBe("gold");
    expect(action.getAttribute("href")).toBe("/urunler");
    expect(dialog.querySelectorAll('[data-pill][data-variant="gold"], [data-pill][data-variant="primary"]')).toHaveLength(1);
  });

  it("offers a gold quotation pill and the four payment marks in the footer", () => {
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    const quote = within(footer).getByRole("link", { name: "Teklif İste" });
    expect(quote.getAttribute("data-variant")).toBe("gold");
    expect(quote.getAttribute("href")).toBe("/toptan-satis");
    expect([...footer.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
    expect(footer.querySelectorAll("[data-olive-branch]")).toHaveLength(1);
  });
});

describe("Task204 home page", () => {
  it("keeps the brief's order with a single h1 and a single gold action over the video", async () => {
    const doc = await renderHome();
    expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
      "hero", "categories", "products", "story", "featured", "banners", "harvest", "business", "blog",
    ]);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
    const hero = doc.querySelector('[data-home-section="hero"]')!;
    const actions = hero.querySelectorAll("[data-pill]");
    expect(actions).toHaveLength(1);
    expect(actions[0].getAttribute("data-variant")).toBe("gold");
    expect(actions[0].getAttribute("href")).toBe("/urunler");
    expect(actions[0].textContent).toBe("Ürünleri İnceleyin");
    expect(hero.querySelector("[data-eyebrow], [data-stamp], [data-tag]")).toBeNull();
    // One poster file: the preload hint and the picture must ask for the same rendition.
    expect(doc.querySelector('head link[rel="preload"][as="image"]')?.getAttribute("imagesizes")).toBe(hero.querySelector("[data-hero-photo] img")?.getAttribute("sizes"));
  });

  it("gives featured products the one dark band and keeps the page light elsewhere", async () => {
    const doc = await renderHome();
    expect(doc.querySelector('[data-home-section="featured"]')?.getAttribute("data-tone")).toBe("dark");
    const dark = [...doc.querySelectorAll('[data-home-section][data-tone="dark"]')];
    expect(dark.length).toBeGreaterThanOrEqual(1);
    expect(dark.length).toBeLessThanOrEqual(2);
    const all = doc.querySelector('[data-home-section="featured"] a[href="/urunler"][data-pill]');
    expect(all?.getAttribute("data-variant")).toBe("gold");
    expect(all?.textContent).toBe("Tüm Ürünler");
    expect(doc.querySelector('[data-home-section="products"] a[href="/urunler"][data-pill]')?.getAttribute("data-variant")).toBe("outline");
  });

  it("seals only the customer's harvest claim", async () => {
    const doc = await renderHome();
    const stamps = doc.querySelectorAll("[data-stamp]");
    expect(stamps).toHaveLength(1);
    expect(stamps[0].closest("[data-home-section]")?.getAttribute("data-home-section")).toBe("harvest");
    expect(stamps[0].getAttribute("aria-label")).toBe("%100 Doğal ve Katkısız");
    expect(stamps[0].closest("li")?.textContent).toContain("%100 Doğal ve Katkısız");
    expect([...doc.querySelectorAll('[data-home-section="harvest"] li [data-step-label]')].map(item => item.textContent)).toEqual([
      "Elle Hasat", "Doğal Dinlendirme", "Özenli Paketleme", "%100 Doğal ve Katkısız",
    ]);
  });

  it("carries the customer's words exactly and every action to its page", async () => {
    const doc = await renderHome();
    expect([...doc.querySelectorAll('[data-home-section="categories"] a')].map(link => [link.querySelector("h2")?.textContent, link.querySelector("[data-card-action]")?.textContent, link.getAttribute("href")])).toEqual([
      ["Zeytinyağı", "Ürünleri İnceleyin", "/urunler/zeytinyagi"], ["Zeytin", "Ürünleri İnceleyin", "/urunler/zeytin"],
      ["Tesisimiz", "Hakkında Bilgi Alın", "/hakkimizda"], ["Bayilik", "Hakkında Bilgi Alın", "/bayilik"],
    ]);
    const harvest = doc.querySelector('[data-home-section="harvest"]')!;
    expect(harvest.querySelector("h2")?.textContent).toBe("Bereketin Hasat Vakti");
    expect(harvest.textContent).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
    const discover = harvest.querySelector("a[data-pill]")!;
    expect([discover.textContent, discover.getAttribute("href"), discover.getAttribute("data-variant")]).toEqual(["Hikayemizi Keşfet", "/hakkimizda", "primary"]);
    expect([...doc.querySelectorAll('[data-home-section="business"] a[data-pill]')].map(link => [link.textContent, link.getAttribute("href"), link.getAttribute("data-variant")])).toEqual([
      ["Teklif İste", "/toptan-satis", "primary"], ["Bayilik Başvurusu", "/bayilik", "outline"],
    ]);
    expect(doc.querySelector('[data-home-section="story"] h2')?.textContent).toBe("Nesillerin Emeği, Toprağın Bereketi");
    expect([...doc.querySelectorAll("[data-story-values] li")].map(item => item.textContent)).toEqual(["Geleneksel Üretim", "%100 Doğal", "Kendi Tesisimizde"]);
    expect(doc.querySelector('[data-home-section="blog"] a[href="/blog"]')?.getAttribute("data-variant")).toBe("quiet");
  });

  it("uses the leaf eyebrow at most every other section, never a long dash, and in-view motion only where the customer asked", async () => {
    const doc = await renderHome();
    const sections = [...doc.querySelectorAll("[data-home-section]")];
    const withEyebrow = sections.map(section => section.querySelector("[data-eyebrow]") !== null);
    expect(withEyebrow.filter(Boolean).length).toBeLessThanOrEqual(Math.ceil(sections.length / 2));
    withEyebrow.forEach((has, index) => { if (has) expect(withEyebrow[index + 1] ?? false).toBe(false); });
    expect(doc.querySelector("main")?.textContent).not.toMatch(/[—–]/);
    expect([...doc.querySelectorAll("main img")].map(image => image.getAttribute("alt") ?? "").join(" ")).not.toMatch(/[—–]/);
    expect(doc.querySelectorAll("[data-olive-branch]").length).toBeLessThanOrEqual(2);
    const home = readFileSync("components/storefront/StoreHome.tsx", "utf8");
    expect(home).not.toMatch(/useScroll|useTransform|position:\s*sticky|backdrop-filter/);
    expect(readFileSync("components/storefront/StoreHome.module.css", "utf8")).not.toMatch(/backdrop-filter|filter:\s*blur|position:\s*sticky|scroll-snap-type:\s*y/);
    expect([...doc.querySelectorAll("[data-in-view]")].map(node => node.closest("[data-home-section]")?.getAttribute("data-home-section"))).toEqual(["story", "banners"]);
  });
});

import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutUnavailable } from "@/components/checkout/CheckoutUnavailable";
import { CatalogShell } from "@/components/storefront/catalog/CatalogShell";
import { ProductListing } from "@/components/storefront/catalog/ProductListing";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { createCartStore } from "@/lib/cart/store";
import { productGroups, productsForGroup } from "@/lib/catalog/groups";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

const route = vi.hoisted(() => ({ pathname: "/urunler", replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: route.replace, refresh: vi.fn() }), usePathname: () => route.pathname }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));

const PAYMENT_SENTENCE = "Online ödeme yakında açılıyor. Şimdilik ürünleriniz için teklif isteyebilirsiniz.";
const css = (path: string): string => readFileSync(path, "utf8");
/** The declarations of one rule, e.g. rule(sheet, ".summary"). */
function rule(sheet: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[},\\s])${escaped}\\s*\\{([^}]*)\\}`, "m").exec(sheet);
  if (!match) throw new Error(`No rule for ${selector}`);
  return match[1];
}

beforeEach(() => {
  route.pathname = "/urunler";
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.clearAllMocks(); });

async function mountProduct(index: number, search = ""): Promise<HTMLElement> {
  const families = await getProductFamilies();
  const products = await getProducts();
  history.replaceState(null, "", `/urun/test${search}`);
  render(<CartProvider products={products}><ProductDetail family={families[index]} related={products} /></CartProvider>);
  // Related products are articles too: the page itself is the one that carries the marker.
  return document.querySelector<HTMLElement>("article[data-product-page]")!;
}

describe("Task205 product page", () => {
  it("names the category in a Tag above a single h1", async () => {
    const families = await getProductFamilies();
    const family = families.find(item => item.variants.length > 1 && item.groupId === "zeytinyagi")!;
    const page = await mountProduct(families.indexOf(family));
    const info = page.querySelector("[data-product-detail-info]")!;
    const tag = info.querySelector("[data-tag]")!;
    expect(tag.textContent).toBe("Zeytinyağı");
    const heading = within(page).getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(family.name);
    expect(tag.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it("offers the sizes as a pill switch: one radiogroup, aria-checked, arrow keys", async () => {
    const families = await getProductFamilies();
    const page = await mountProduct(families.findIndex(item => item.groupId === "zeytinyagi"));
    const group = within(page).getByRole("radiogroup", { name: "Boy" });
    expect(group.hasAttribute("data-pill-switch")).toBe(true);
    const [first, second] = within(group).getAllByRole("radio");
    expect([first.getAttribute("aria-checked"), second.getAttribute("aria-checked")]).toEqual(["true", "false"]);
    expect([first.tabIndex, second.tabIndex]).toEqual([0, -1]);
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(second);
    expect(new URL(location.href).searchParams.get("boy")).toBe(second.textContent);
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(first.getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(second.getAttribute("aria-checked")).toBe("true");
  });

  it("buys with one primary pill, quotes with an outline pill and counts in a pill stepper", async () => {
    const families = await getProductFamilies();
    const family = families.find(item => item.variants[0].stock > 0)!;
    const page = await mountProduct(families.indexOf(family));
    const purchase = page.querySelector("[data-product-detail-purchase]")!;
    const buy = within(page).getByRole("button", { name: "Sepete ekle" });
    expect([buy.hasAttribute("data-pill"), buy.getAttribute("data-variant")]).toEqual([true, "primary"]);
    const quote = within(page).getByRole("link", { name: "Teklife ekle" });
    expect([quote.hasAttribute("data-pill"), quote.getAttribute("data-variant")]).toEqual([true, "outline"]);
    expect(quote.getAttribute("href")).toBe(`/toptan-satis?teklif=${family.variants[0].id}`);
    expect(purchase.querySelectorAll('[data-pill][data-variant="primary"], [data-pill][data-variant="gold"]')).toHaveLength(1);
    const stepper = within(page).getByRole("group", { name: "Adet seçimi" });
    expect(stepper.hasAttribute("data-stepper")).toBe(true);
    fireEvent.click(within(stepper).getByRole("button", { name: "Adedi artır" }));
    expect(within(stepper).getByLabelText("Adet").textContent).toBe("2");
    expect((within(stepper).getByRole("button", { name: "Adedi azalt" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("keeps a sold-out product readable: disabled pill without a coin, quotation still offered", async () => {
    const families = await getProductFamilies();
    const page = await mountProduct(families.findIndex(item => item.variants.every(variant => variant.stock === 0)));
    const unavailable = within(page).getByRole("button", { name: "Mevcut değil" }) as HTMLButtonElement;
    expect(unavailable.disabled).toBe(true);
    expect(unavailable.querySelector("[data-coin]")).toBeNull();
    expect(within(page).queryByRole("group", { name: "Adet seçimi" })).toBeNull();
    expect(within(page).getByRole("link", { name: "Teklife ekle" }).getAttribute("data-variant")).toBe("outline");
  });

  it("shows up to four related products with the home page card", async () => {
    await mountProduct(0);
    const related = screen.getByRole("region", { name: "Benzer Ürünler" });
    const cards = related.querySelectorAll("article[data-product-id]");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(4);
    for (const card of cards) {
      expect(card.querySelector('[data-pill][data-variant="quiet"]')?.textContent).toBe("Teklife ekle");
      expect(card.querySelector("[data-tile-stage]")).not.toBeNull();
    }
    expect(within(related).getByRole("link", { name: "Kategorideki ürünler" }).getAttribute("data-variant")).toBe("quiet");
  });

  it("stands the product on the sage stage and keeps table corners in the corner table", () => {
    const sheet = css("components/storefront/ProductDetail.module.css");
    expect(rule(sheet, ".image")).toMatch(/background:\s*var\(--sf-sage\)/);
    expect(rule(sheet, ".image")).toMatch(/border-radius:\s*var\(--sf-radius-card\)/);
    expect(rule(sheet, ".thumbnails button")).toMatch(/border-radius:\s*var\(--sf-radius-field\)/);
    expect(rule(sheet, ".title")).toMatch(/font-size:\s*clamp\(\s*(3[4-9]|4[0-4])px,[^)]*5[0-6]px\s*\)/);
    expect(rule(sheet, ".price")).toMatch(/font-size:\s*28px/);
  });
});

describe("Task205 catalogue", () => {
  it.each([["/urunler", "Tüm ürünler"], ...productGroups.map(group => [`/urunler/${group.id}`, group.name])])("opens %s with a photographed heading band and one current category pill", (path, name) => {
    route.pathname = path;
    render(<CatalogShell><div /></CatalogShell>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(name);
    expect(heading.closest("[data-section-heading]")).not.toBeNull();
    const band = heading.closest("[data-catalog-banner]")!;
    expect(band.querySelector("picture img")?.getAttribute("alt")).toBe("");
    const navigation = screen.getByRole("navigation", { name: "Ürün grupları" });
    const current = navigation.querySelectorAll('a[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toBe(name);
    expect(within(navigation).getAllByRole("link")).toHaveLength(6);
  });

  it("gives every category its own photograph", () => {
    const photos = ["/urunler", ...productGroups.map(group => `/urunler/${group.id}`)].map(path => {
      route.pathname = path;
      const html = renderToStaticMarkup(<CatalogShell><div /></CatalogShell>);
      return /data-catalog-banner[\s\S]*?<img[^>]*src="([^"]+?)-\d+\.webp"/.exec(html)?.[1];
    });
    expect(photos.every(Boolean)).toBe(true);
    expect(new Set(photos).size).toBe(photos.length);
  });

  it("lists the products as home page cards under a labelled sort control", async () => {
    const products = productsForGroup(await getProductFamilies());
    render(<ProductListing products={products} />);
    const grid = document.querySelector("[data-catalog-grid]")!;
    expect(grid.querySelectorAll("article[data-product-id]")).toHaveLength(products.length);
    expect(grid.querySelector('article [data-pill][data-variant="primary"]')?.textContent).toContain("Sepete ekle");
    expect((screen.getByLabelText("Sıralama") as HTMLSelectElement).value).toBe("onerilen");
    expect(screen.getByText(`${products.length} ürün`)).toBeTruthy();
  });

  it("explains an empty category and leads back with an outline pill", () => {
    render(<ProductListing products={[]} category routeKey="/urunler/siyah-zeytin" />);
    expect(screen.getByRole("status").textContent).toBe("Bu grupta şu an ürün bulunmuyor.");
    const back = screen.getByRole("link", { name: "Tüm Ürünler" });
    expect([back.getAttribute("data-variant"), back.getAttribute("href")]).toEqual(["outline", "/urunler"]);
  });

  it("lays the grid out 3 / 2 / 2 compact and rounds the sort field to 12 px", () => {
    const sheet = css("components/storefront/catalog/Catalog.module.css");
    expect(rule(sheet, ".productGrid")).toMatch(/grid-template-columns:\s*repeat\(3,/);
    expect(sheet).toMatch(/@media\s*\(max-width:\s*1199px\)\s*\{[^@]*\.productGrid\s*\{[^}]*repeat\(2,/);
    // Phones keep two columns with the compact pill (44 px, 28 px coin): PillButton size "md".
    expect(sheet).toMatch(/@media\s*\(max-width:\s*599px\)\s*\{[^@]*--pill-h:\s*44px;[^@]*--pill-coin:\s*28px/);
    expect(rule(sheet, ".sortLabel select")).toMatch(/border-radius:\s*var\(--sf-radius-field\)/);
    const chips = css("components/storefront/catalog/CategoryNavigation.module.css");
    expect(rule(chips, ".link")).toMatch(/border-radius:\s*var\(--sf-radius-pill\)/);
    expect(rule(chips, '.link[aria-current="page"]')).toMatch(/color:\s*var\(--sf-ivory\)/);
    expect(rule(chips, ".indicator")).toMatch(/background:\s*var\(--sf-green\)/);
  });
});

const olive = { id: "olive", familyId: "olive", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin" as const, weight: "1 kg", priceKurus: 22000, stock: 99, imageKey: "urun-02-kirma-1kg", galleryKeys: [] };
const cartProducts = [olive, { ...olive, id: "oil", name: "Natürel Sızma Zeytinyağı", weight: "1 L", priceKurus: 35000 }];

function mountCartPage(quantity = 2, checkoutHref: string | null = null): void {
  const store = createCartStore({ products: cartProducts, storage: null });
  if (quantity) store.addItem("olive", quantity);
  render(<CartSummary store={store} products={cartProducts} onRefresh={() => {}} checkoutHref={checkoutHref} />);
}
function mountDrawer(quantity = 2): void {
  const store = createCartStore({ products: cartProducts, storage: null });
  if (quantity) store.addItem("olive", quantity);
  function Fixture() {
    const [open, setOpen] = useState(true);
    return <CartDrawer store={store} products={cartProducts} open={open} onOpenChange={setOpen} />;
  }
  render(<Fixture />);
}

describe("Task205 cart", () => {
  it("summarises on paper, not on a dark box, with the total as the one large figure", () => {
    mountCartPage();
    const summary = screen.getByRole("complementary", { name: "Sepet özeti" });
    expect(summary.hasAttribute("data-surface")).toBe(false);
    expect(document.querySelector('main [data-surface="dark"]')).toBeNull();
    expect(summary.querySelector("[data-cart-total]")?.textContent).toContain("440,00 ₺");
    const sheet = css("components/cart/CartExperience.module.css");
    expect(rule(sheet, ".summary")).toMatch(/background:\s*var\(--sf-paper\)/);
    expect(rule(sheet, ".summary")).toMatch(/border-radius:\s*var\(--sf-radius-card\)/);
    expect(rule(sheet, ".total dd")).toMatch(/font-family:\s*var\(--font-display/);
    expect(rule(sheet, ".total dd")).toMatch(/font-size:\s*28px/);
    expect(sheet).not.toMatch(/background:\s*var\(--sf-green\)[^}]*\}[^{]*\.summary|\.summary\s*\{[^}]*background:\s*var\(--sf-green\)/);
  });

  it("keeps the closed checkout as a disabled pill with its sentence and an outline quotation", () => {
    mountCartPage();
    const summary = screen.getByRole("complementary", { name: "Sepet özeti" });
    const pay = within(summary).getByRole("button", { name: "Ödemeye geç" }) as HTMLButtonElement;
    expect([pay.hasAttribute("data-pill"), pay.disabled, pay.querySelector("[data-coin]")]).toEqual([true, true, null]);
    expect(document.getElementById(pay.getAttribute("aria-describedby")!)?.textContent).toBe(PAYMENT_SENTENCE);
    const quote = within(summary).getByRole("link", { name: "Teklif İste" });
    expect([quote.getAttribute("data-variant"), quote.getAttribute("href")]).toEqual(["outline", "/toptan-satis"]);
    expect(screen.queryByRole("link", { name: "Ödemeye geç" })).toBeNull();
  });

  it("opens the checkout with a primary pill once a destination is approved", () => {
    mountCartPage(2, "/odeme");
    const pay = within(screen.getByRole("complementary", { name: "Sepet özeti" })).getByRole("link", { name: "Ödemeye geç" });
    expect([pay.getAttribute("data-variant"), pay.getAttribute("href")]).toEqual(["primary", "/odeme"]);
  });

  it("returns to the shop quietly and edits lines with 44 px pill controls", () => {
    mountCartPage();
    const back = screen.getByRole("link", { name: "Alışverişe devam et" });
    expect([back.getAttribute("data-variant"), back.getAttribute("href")]).toEqual(["quiet", "/urunler"]);
    const line = screen.getByRole("group", { name: "Doğal Kırma Yeşil Zeytin" });
    expect(line.querySelector("[data-stepper]")).not.toBeNull();
    expect(line.querySelector("[data-tag]")?.textContent).toBe("1 kg");
    for (const name of ["Adedi azalt", "Adedi artır", "Sepetten sil"]) expect(within(line).getByRole("button", { name })).toBeTruthy();
    const sheet = css("components/storefront/ui/ui.module.css");
    expect(rule(sheet, ".stepper button")).toMatch(/width:\s*44px;[^}]*height:\s*44px/);
    expect(rule(css("components/cart/CartExperience.module.css"), ".remove")).toMatch(/width:\s*44px;[^}]*height:\s*44px/);
  });

  it("keeps 6 products and 99 pieces inside the summary", () => {
    const many = Array.from({ length: 6 }, (_, index) => ({ ...olive, id: `p${index}`, name: `Doğal Kırma Yeşil Zeytin ${index + 1}`, priceKurus: 220000 }));
    const store = createCartStore({ products: many, storage: null });
    for (const product of many) store.addItem(product.id, product.id === "p0" ? 99 : 1);
    render(<CartSummary store={store} products={many} onRefresh={() => {}} />);
    const summary = screen.getByRole("complementary", { name: "Sepet özeti" });
    expect(within(summary).getByText("Ara toplam (tahmini), 104 adet")).toBeTruthy();
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("228.800,00 ₺");
    const sheet = css("components/cart/CartExperience.module.css");
    expect(rule(sheet, ".totals > div")).toMatch(/flex-wrap:\s*wrap/);
    expect(rule(sheet, ".amount")).toMatch(/font-variant-numeric:\s*tabular-nums/);
  });

  it("invites an empty cart back to the products with a primary pill", () => {
    mountCartPage(0);
    expect(screen.getByRole("heading", { name: "Sepetiniz boş" })).toBeTruthy();
    const browse = screen.getByRole("link", { name: "Ürünleri İnceleyin" });
    expect([browse.getAttribute("data-variant"), browse.getAttribute("href")]).toEqual(["primary", "/urunler"]);
  });

  it("gives the drawer a paper footer with the same closed checkout and a link to the cart", () => {
    mountDrawer();
    const dialog = screen.getByRole("dialog", { name: "Sepetim (2)" });
    expect(dialog.querySelector('[data-surface="dark"]')).toBeNull();
    const pay = within(dialog).getByRole("button", { name: "Ödemeye geç" }) as HTMLButtonElement;
    expect([pay.hasAttribute("data-pill"), pay.disabled]).toEqual([true, true]);
    expect(within(dialog).getByText(PAYMENT_SENTENCE)).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: "Teklif İste" }).getAttribute("data-variant")).toBe("outline");
    const view = within(dialog).getByRole("link", { name: "Sepeti görüntüle" });
    expect([view.getAttribute("data-variant"), view.getAttribute("href")]).toEqual(["quiet", "/sepet"]);
    expect(dialog.querySelector("[data-cart-total]")?.textContent).toContain("440,00 ₺");
    const sheet = css("components/cart/CartExperience.module.css");
    expect(rule(sheet, ".drawerFooter")).toMatch(/background:\s*var\(--sf-paper\)/);
  });
});

describe("Task205 checkout while payment is closed", () => {
  it("heads the page with SectionHeading as h1 and explains on a paper panel", () => {
    render(<CheckoutUnavailable />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Ödeme");
    expect(heading.closest("[data-section-heading]")).not.toBeNull();
    const panel = document.querySelector("[data-checkout-panel]")!;
    expect(panel.textContent).toContain("Ödeme hazırlıkları sürüyor.");
    expect(panel.textContent).toContain(PAYMENT_SENTENCE);
    expect(rule(css("components/checkout/Checkout.module.css"), ".panel")).toMatch(/background:\s*var\(--sf-paper\)/);
    expect(rule(css("components/checkout/Checkout.module.css"), ".panel")).toMatch(/border-radius:\s*var\(--sf-radius-card\)/);
  });

  it("shows the payment marks in a paper pill and returns to the cart with an outline pill", () => {
    render(<CheckoutUnavailable />);
    const marks = screen.getByRole("group", { name: "Ödeme seçenekleri" });
    expect(marks.hasAttribute("data-payment-pill")).toBe(true);
    expect([...marks.querySelectorAll("img")].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
    const back = screen.getByRole("link", { name: "Sepetime dön" });
    expect([back.getAttribute("data-variant"), back.getAttribute("href")]).toEqual(["outline", "/sepet"]);
    const quote = screen.getByRole("link", { name: "Teklif İste" });
    expect([quote.getAttribute("data-variant"), quote.getAttribute("href")]).toEqual(["primary", "/toptan-satis"]);
    expect(document.querySelectorAll('[data-pill][data-variant="primary"], [data-pill][data-variant="gold"]')).toHaveLength(1);
    expect(rule(css("components/checkout/Checkout.module.css"), ".marks")).toMatch(/border-radius:\s*var\(--sf-radius-pill\)/);
  });
});

describe("Task205 category indicator", () => {
  it("covers the current pill even when the animation features have not loaded yet", async () => {
    const { CategoryNavigation } = await import("@/components/storefront/catalog/CategoryNavigation");
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const current = this.getAttribute("aria-current") === "page";
      const left = current ? 177 : 0;
      const width = current ? 154 : 150;
      return { x: left, y: 0, left, right: left + width, top: 0, bottom: 48, width, height: 48, toJSON() {} } as DOMRect;
    });
    route.pathname = "/urunler/zeytinyagi";
    // No MotionProvider here: nothing but the component itself may place the indicator.
    render(<CategoryNavigation />);
    const indicator = document.querySelector<HTMLElement>("[data-category-indicator]")!;
    expect(document.querySelector("[data-indicator-ready]")).not.toBeNull();
    expect(indicator.style.width).toBe("154px");
    expect(indicator.style.transform).toContain("177px");
    vi.restoreAllMocks();
  });
});

describe("Task205 corner table", () => {
  it("keeps raw pixel radii out of the cart, checkout and catalogue styles", () => {
    const sheets = ["components/cart/CartExperience.module.css", "components/checkout/Checkout.module.css", "components/catalog/AddToCart.module.css",
      "components/storefront/ProductDetail.module.css", "components/storefront/catalog/Catalog.module.css", "components/storefront/catalog/CategoryNavigation.module.css",
      "components/storefront/cart/PaymentUnavailable.module.css", "components/storefront/ui/ui.module.css"];
    const raw = sheets.flatMap(file => css(file).split("\n").filter(line => /border(-[a-z]+)*-radius:\s*[0-9]/.test(line)).map(line => `${file}: ${line.trim().slice(0, 80)}`));
    expect(raw).toEqual([]);
    const tokens = sheets.flatMap(file => css(file).match(/var\(--sf-radius-[a-z-]+/g) ?? []);
    expect(tokens.length).toBeGreaterThan(20);
    expect(tokens.filter(token => !/pill|card|field|round/.test(token))).toEqual([]);
  });
});

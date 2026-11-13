import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutUnavailable } from "@/components/checkout/CheckoutUnavailable";
import { ProductShowcase } from "@/components/storefront/home/ProductShowcase";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { ProductTile } from "@/components/storefront/ProductTile";
import { createCartStore } from "@/lib/cart/store";
import { productGroups, productsForGroup, type ProductGroupId } from "@/lib/catalog/groups";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

const route = vi.hoisted(() => ({ pathname: "/", replace: vi.fn() }));
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
  route.pathname = "/";
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

  // Task208: the quotation leads to the wholesale pill of the home page.
  it("buys with one primary pill, quotes with an outline pill and counts in a pill stepper", async () => {
    const families = await getProductFamilies();
    const family = families.find(item => item.variants[0].stock > 0)!;
    const page = await mountProduct(families.indexOf(family));
    const purchase = page.querySelector("[data-product-detail-purchase]")!;
    const buy = within(page).getByRole("button", { name: "Sepete ekle" });
    expect([buy.hasAttribute("data-pill"), buy.getAttribute("data-variant")]).toEqual([true, "primary"]);
    const quote = within(page).getByRole("link", { name: "Teklife ekle" });
    expect([quote.hasAttribute("data-pill"), quote.getAttribute("data-variant")]).toEqual([true, "outline"]);
    expect(quote.getAttribute("href")).toBe(`/?sekme=toptan&teklif=${family.variants[0].id}#toptan-bayilik`);
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

  // Task208: the card carries the buy action only; the category link opens that pill on the home page.
  it("shows up to four related products with the home page card", async () => {
    await mountProduct(0);
    const related = screen.getByRole("region", { name: "Benzer Ürünler" });
    const cards = related.querySelectorAll("article[data-product-id]");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(4);
    for (const card of cards) {
      expect(card.querySelectorAll("[data-pill]")).toHaveLength(1);
      expect(card.textContent).not.toContain("Teklife ekle");
      expect(card.querySelector("[data-tile-stage]")).not.toBeNull();
    }
    const category = within(related).getByRole("link", { name: "Kategorideki ürünler" });
    expect(category.getAttribute("data-variant")).toBe("quiet");
    expect(category.getAttribute("href")).toMatch(/^\/\?kategori=(zeytinyagi|zeytin)#urunler$/);
    expect(category.querySelector("[data-coin]")).not.toBeNull();
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

// Task208: the catalogue pages became the "#urunler" section of the home page (ProductShowcase):
// category links are pills in one radiogroup, the choice lives in `?kategori=`, sorting and the photo band are gone.
describe("Task205 catalogue", () => {
  async function mountShowcase(search = "", without?: string) {
    const families = (await getProductFamilies()).filter(family => family.groupId !== without);
    const items = families.flatMap(family => family.variants.map(product => ({ product, group: family.groupId })))
      .sort((a, b) => a.product.imageKey.localeCompare(b.product.imageKey))
      .map(({ product, group }) => ({ id: product.id, groups: [group], tile: <ProductTile product={product} /> }));
    history.replaceState(null, "", `/${search}`);
    render(<ProductShowcase items={items} />);
    return families;
  }
  const shownIds = () => screen.queryAllByRole("article").map(card => card.getAttribute("data-product-id"));
  const pillLabels: Record<string, string> = { zeytinyagi: "Zeytinyağı", zeytin: "Zeytin", "siyah-zeytin": "Siyah", "yesil-zeytin": "Yeşil", "kirma-zeytin": "Kırma" };

  it.each<[string, string, string | undefined]>([["", "Tümü", undefined], ...productGroups.map((group): [string, string, string] => [`?kategori=${group.id}`, pillLabels[group.id], group.id])])("opens %s with one checked category pill and exactly that group's products", async (search, name, groupId) => {
    const families = await mountShowcase(search);
    const pills = within(screen.getByRole("radiogroup", { name: "Ürün kategorisi" })).getAllByRole("radio");
    expect(pills).toHaveLength(6);
    const checked = pills.filter(pill => pill.getAttribute("aria-checked") === "true");
    expect(checked.map(pill => pill.textContent)).toEqual([name]);
    expect(shownIds()).toEqual(productsForGroup(families, groupId as ProductGroupId | undefined).map(product => product.id));
  });

  it("lists the products as home page cards without a sort control", async () => {
    const products = productsForGroup(await mountShowcase());
    const grid = document.querySelector("[data-product-grid]")!;
    expect(grid.querySelectorAll("article[data-product-id]")).toHaveLength(products.length);
    for (const card of grid.querySelectorAll("article")) {
      expect(card.querySelector('[data-pill][data-variant="primary"]')?.textContent).toMatch(/Sepete ekle|Mevcut değil/);
      expect(card.querySelectorAll("[data-pill]")).toHaveLength(1);
    }
    expect(screen.queryByLabelText("Sıralama")).toBeNull();
  });

  it("explains an empty category and leads back through the first pill", async () => {
    const families = await mountShowcase("?kategori=siyah-zeytin", "siyah-zeytin");
    const notice = () => document.querySelector('[data-product-grid] + [role="status"]');
    expect(notice()?.textContent).toBe("Bu grupta şu an ürün bulunmuyor.");
    expect(shownIds()).toEqual([]);
    fireEvent.click(screen.getByRole("radio", { name: "Tümü" }));
    expect(notice()).toBeNull();
    expect(shownIds()).toHaveLength(families.flatMap(family => family.variants).length);
    expect(location.search).toBe("");
  });

  it("lays the grid out 3 / 2 / 2 compact and draws the category pills on the pill radius", () => {
    const sheet = css("components/storefront/StoreHome.module.css");
    expect(rule(sheet, ".productGrid")).toMatch(/grid-template-columns:\s*repeat\(3,/);
    expect(sheet).toMatch(/@media\s*\(max-width:\s*1099px\)\s*\{[^@]*\.productGrid\s*\{[^}]*repeat\(2,/);
    // Phones keep the compact pill (44 px, 28 px coin).
    expect(sheet).toMatch(/@media\s*\(max-width:\s*520px\)\s*\{[^@]*--pill-h:\s*44px;[^@]*--pill-coin:\s*28px/);
    // Task209: a phone shows the cards on a sideways shelf; the narrowest and shortest phones lay each card out as a row.
    expect(sheet).toMatch(/@media\s*\(max-width:\s*767px\)\s*\{[^@]*\.productGrid\s*\{[^}]*scroll-snap-type:\s*x mandatory/);
    expect(sheet).toMatch(/@media\s*\(max-width:\s*359px\)[^{]*\{[^@]*\.productCell > article\s*\{[^}]*flex-direction:\s*row/);
    const pills = css("components/storefront/ui/ui.module.css");
    expect(rule(pills, ".switch")).toMatch(/border-radius:\s*var\(--sf-radius-pill\)/);
    expect(rule(pills, ".switch :is(button, a)")).toMatch(/height:\s*44px/);
    expect(rule(pills, '.switch :is(button[aria-checked="true"], [aria-current="page"])')).toMatch(/background:\s*var\(--sf-green\);\s*color:\s*var\(--sf-ivory\)/);
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

  // Task208: "Teklif İste" opens the wholesale pill of the home page.
  it("keeps the closed checkout as a disabled pill with its sentence and an outline quotation", () => {
    mountCartPage();
    const summary = screen.getByRole("complementary", { name: "Sepet özeti" });
    const pay = within(summary).getByRole("button", { name: "Ödemeye geç" }) as HTMLButtonElement;
    expect([pay.hasAttribute("data-pill"), pay.disabled, pay.querySelector("[data-coin]")]).toEqual([true, true, null]);
    expect(document.getElementById(pay.getAttribute("aria-describedby")!)?.textContent).toBe(PAYMENT_SENTENCE);
    const quote = within(summary).getByRole("link", { name: "Teklif İste" });
    expect([quote.getAttribute("data-variant"), quote.getAttribute("href")]).toEqual(["outline", "/?sekme=toptan#toptan-bayilik"]);
    expect(screen.queryByRole("link", { name: "Ödemeye geç" })).toBeNull();
  });

  it("opens the checkout with a primary pill once a destination is approved", () => {
    mountCartPage(2, "/odeme");
    const pay = within(screen.getByRole("complementary", { name: "Sepet özeti" })).getByRole("link", { name: "Ödemeye geç" });
    expect([pay.getAttribute("data-variant"), pay.getAttribute("href")]).toEqual(["primary", "/odeme"]);
  });

  // Task208: the shop is the "#urunler" section; the quiet link is a paper pill with a ring coin.
  it("returns to the shop quietly and edits lines with 44 px pill controls", () => {
    mountCartPage();
    const back = screen.getByRole("link", { name: "Alışverişe devam et" });
    expect([back.getAttribute("data-variant"), back.getAttribute("href")]).toEqual(["quiet", "/#urunler"]);
    expect(back.querySelector("[data-coin]")).not.toBeNull();
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

  // Task208: products live at "/#urunler".
  it("invites an empty cart back to the products with a primary pill", () => {
    mountCartPage(0);
    expect(screen.getByRole("heading", { name: "Sepetiniz boş" })).toBeTruthy();
    const browse = screen.getByRole("link", { name: "Ürünleri İnceleyin" });
    expect([browse.getAttribute("data-variant"), browse.getAttribute("href")]).toEqual(["primary", "/#urunler"]);
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
    // Task208: the wholesale pill of the home page.
    expect([quote.getAttribute("data-variant"), quote.getAttribute("href")]).toEqual(["primary", "/?sekme=toptan#toptan-bayilik"]);
    expect(document.querySelectorAll('[data-pill][data-variant="primary"], [data-pill][data-variant="gold"]')).toHaveLength(1);
    expect(rule(css("components/checkout/Checkout.module.css"), ".marks")).toMatch(/border-radius:\s*var\(--sf-radius-pill\)/);
  });
});

describe("Task205 corner table", () => {
  // Task208: the catalogue sheets were removed with their pages; the product card sheet takes their place.
  it("keeps raw pixel radii out of the cart, checkout and catalogue styles", () => {
    const sheets = ["components/cart/CartExperience.module.css", "components/checkout/Checkout.module.css", "components/catalog/AddToCart.module.css",
      "components/storefront/ProductDetail.module.css", "components/storefront/ProductTile.module.css",
      "components/storefront/cart/PaymentUnavailable.module.css", "components/storefront/ui/ui.module.css"];
    const raw = sheets.flatMap(file => css(file).split("\n").filter(line => /border(-[a-z]+)*-radius:\s*[0-9]/.test(line)).map(line => `${file}: ${line.trim().slice(0, 80)}`));
    expect(raw).toEqual([]);
    const tokens = sheets.flatMap(file => css(file).match(/var\(--sf-radius-[a-z-]+/g) ?? []);
    expect(tokens.length).toBeGreaterThan(20);
    expect(tokens.filter(token => !/pill|card|field|round/.test(token))).toEqual([]);
  });
});

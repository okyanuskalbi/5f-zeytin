import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProductPage } from "@/components/catalog/ProductPage";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Hero } from "@/components/landing/Hero";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { getProductDetails } from "@/lib/catalog/product-details";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { productHref } from "@/lib/catalog/product-pages";
import { v3Image } from "@/lib/media/v3-assets";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import type { ProductVariant } from "@/types/catalog";

const animation = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn() }));
vi.mock("motion/react-mini", () => ({ useAnimate: () => [useRef(null), animation.animate] }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
let reduced = true;
beforeEach(() => {
  reduced = true;
  animation.animate.mockReset().mockImplementation(() => Object.assign(Promise.resolve(), animation));
  animation.stop.mockClear();
  vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: reduced }));
});
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const copy = [
  ["sample-green-olive-10kg", "Ellek, Düziçi'nde toplanan yeşil zeytinler geleneksel usulle kırılarak hazırlanır ve kendi tesisimizde tenekeye doldurulur. 3 L yuvarlak teneke, kışlık kiler ve kalabalık sofralar için.", "3 L", "teneke", "Sofralık zeytin"],
  ["sample-green-olive-1kg", "Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur.", "1 kg", "cam kavanoz", "Sofralık zeytin"],
  ["sample-black-olive-1kg", "Salamurada bekletilerek hazırlanan siyah zeytin, kahvaltı sofraları için 1 kg cam kavanozda. Kendi tesisimizde doldurulur.", "1 kg", "cam kavanoz", "Salamura zeytin"],
  ["sample-olive-oil-1l", "Natürel sızma zeytinyağı, sofra ve salata kullanımı için 1 litrelik cam şişede. Kendi tesisimizde doldurulur.", "1 L", "cam şişe", "Zeytinyağı"],
  ["sample-olive-oil-5l", "Natürel sızma zeytinyağı, mutfakta düzenli kullanım için 5 litrelik tenekede. Kendi tesisimizde doldurulur.", "5 L", "teneke", "Zeytinyağı"],
  ["sample-brined-green-olive-5kg", "Salamurada hazırlanan yeşil zeytin, kiler stoğu için 3 L yuvarlak tenekede. Kendi tesisimizde doldurulur.", "3 L", "teneke", "Salamura zeytin"],
] as const;

it.each(copy)("preserves the approved draft copy and six facts for %s", async (id, description, weight, packaging, category) => {
  const product = (await getProducts()).find(item => item.id === id)!;
  expect(getProductDetails(product)).toEqual({ description, information: [
    { label: "Net miktar", value: weight }, { label: "Ambalaj", value: packaging },
    { label: "Kategori", value: category }, { label: "Üretim yeri", value: "Ellek, Düziçi / Osmaniye" },
    { label: "Dolum", value: "Afina Zeytin tesisi" }, { label: "Kargo", value: "2-4 iş günü" },
  ] });
});

function Count() {
  const cart = useCart();
  return <output aria-label="Sepetteki adet">{cart?.state.items.reduce((sum, item) => sum + item.quantity, 0)}</output>;
}
async function mount(id = "sample-green-olive-10kg", products?: readonly ProductVariant[]) {
  const catalog = products ?? await getProducts();
  const product = catalog.find(item => item.id === id)!;
  const sourceFamily = (await getProductFamilies()).find(item => item.id === product.familyId)!;
  const family = { ...sourceFamily, variants: catalog.filter(item => item.familyId === product.familyId) };
  history.replaceState(history.state, "", productHref(product));
  const view = render(<CartProvider products={catalog}><Count /><ProductPage family={family} related={[]} /></CartProvider>);
  const page = document.querySelector<HTMLElement>("[data-product-page]")!;
  return { ...view, catalog, product, page };
}

it.each([
  [undefined, undefined, "Sofralık zeytin"], [null, true, "Sofralık zeytin"],
  ["Kahvaltılık", true, "Kahvaltılık"], ["Kahvaltılık", false, null],
] as const)("keeps package-only card metadata and the configured product page category (%s, %s)", async (categoryLabel, showCategoryLabel, detailLabel) => {
  const catalog = (await getProducts()).map(product => ({ ...product, categoryLabel, showCategoryLabel }));
  const { page, product } = await mount("sample-green-olive-10kg", catalog);
  const { container } = render(<ProductCard product={product} image={v3Image(product.imageKey)} staticPresentation />);
  const meta = container.querySelector('[aria-label="Boy"]')!.parentElement!;
  expect([...meta.querySelectorAll("span")].map(node => node.textContent)).toEqual([product.weight]);
  const table = within(page).getByRole("table", { name: "Ürün bilgileri" });
  const category = within(table).queryByRole("rowheader", { name: "Kategori" });
  if (detailLabel) expect(category?.closest("tr")?.textContent).toBe(`Kategori${detailLabel}`);
  else expect(category).toBeNull();
  expect(table.querySelectorAll("tr")).toHaveLength(detailLabel ? 6 : 5);
});

it.each(["name", "image"] as const)("navigates from the card %s to a readable standalone page without a modal", async kind => {
  const { page, product } = await mount();
  const { container } = render(<ProductCard product={product} image={v3Image(product.imageKey)} staticPresentation />);
  const link = kind === "name" ? container.querySelector("h3 a")! : container.querySelector("a:has(img)")!;
  expect(link.getAttribute("href")).toBe(productHref(product));
  expect(link.hasAttribute("aria-haspopup")).toBe(false);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(page.getAttribute("data-surface")).toBe("light");
  expect(within(page).getByRole("heading", { level: 1 }).textContent).toBe("Doğal Kırma Yeşil Zeytin");
  expect(within(page).getByText(copy[0][1])).toBeDefined();
  expect(within(page).getByRole("table", { name: "Ürün bilgileri" }).querySelectorAll("tr")).toHaveLength(6);
});

it("adds from a product card without opening a detail or cart drawer", async () => {
  const catalog = await getProducts(); const product = catalog[0];
  render(<CartProvider products={catalog}><Count /><ProductCard product={product} image={v3Image(product.imageKey)} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("1");
});

it("links the retained hero's currently selected size to its product page", async () => {
  const catalog = await getProducts();
  render(<CartProvider products={catalog}><Hero products={catalog} /></CartProvider>);
  const hero = document.querySelector<HTMLElement>("[data-hero-card]")!;
  fireEvent.click(within(hero).getByRole("radio", { name: "1 kg" }));
  expect(within(hero).getByRole("heading").querySelector("a")?.getAttribute("href")).toBe("/urun/dogal-kirma-yesil-zeytin?boy=1%20kg");
});

it.each([375, 390, 767, 768, 1440])("keeps one purchase action in a normal page at %ipx", async width => {
  vi.stubGlobal("innerWidth", width);
  const { page } = await mount();
  expect(within(page).getAllByRole("button", { name: "Sepete ekle" })).toHaveLength(1);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
});

it.each([
  ["sample-green-olive-1kg", "3 L", "sample-green-olive-10kg"],
  ["sample-olive-oil-1l", "5 L", "sample-olive-oil-5l"],
] as const)("selects a size only within %s and adds its exact quantity", async (id, size, nextId) => {
  const { catalog, page } = await mount(id);
  expect(within(page).getAllByRole("radio")).toHaveLength(2);
  fireEvent.click(within(page).getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(within(page).getByRole("radio", { name: size }));
  const selected = catalog.find(item => item.id === nextId)!;
  expect(within(page).getByLabelText("Fiyat").textContent).toBe(new Intl.NumberFormat("tr-TR", { style:"currency", currency:"TRY", minimumFractionDigits:0, maximumFractionDigits:2 }).format(selected.priceKurus / 100));
  expect(within(page).getByLabelText("Adet").textContent).toBe("1");
  fireEvent.click(within(page).getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(within(page).getByRole("button", { name: "Sepete ekle" }));
  expect(within(page).getByRole("button", { name: "Eklendi ✓" })).toBeDefined();
  expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("2");
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: nextId, quantity:2 }]);
  expect(new URL(location.href).searchParams.get("boy")).toBe(size);
});

it("honors remaining stock including the cart and refuses another purchase when full", async () => {
  const catalog = (await getProducts()).map(product => ({ ...product, stock:3 }));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId:catalog[0].id, quantity:1 }]));
  const { page } = await mount(catalog[0].id, catalog);
  const increase = within(page).getByRole("button", { name:"Adedi artır" });
  expect(within(page).getByRole("button", { name:"Adedi azalt" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(increase); expect(increase.hasAttribute("disabled")).toBe(true); fireEvent.click(increase);
  expect(within(page).getByLabelText("Adet").textContent).toBe("2");
  fireEvent.click(within(page).getByRole("button", { name:"Sepete ekle" }));
  expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("3");
  expect(within(page).getByRole("button", { name:"Eklendi ✓" }).hasAttribute("disabled")).toBe(true);
});

it("shows unavailable stock with a disabled CTA and no quantity selector", async () => {
  const { page } = await mount("sample-black-olive-1kg");
  expect(within(page).getByRole("button", { name:"Mevcut değil" }).hasAttribute("disabled")).toBe(true);
  expect(within(page).queryByLabelText("Adet")).toBeNull();
  expect(within(page).queryByRole("radiogroup")).toBeNull();
});

it("eagerly loads the page studio image, switches its gallery and retains dark payment artwork", async () => {
  const { page } = await mount();
  const main = page.querySelector<HTMLImageElement>("[data-product-detail-image] img")!;
  expect(main.getAttribute("src")).toContain("studyo"); expect(main.getAttribute("loading")).toBe("eager");
  fireEvent.click(within(page).getByRole("button", { name:"Sofra görseli" }));
  expect(main.getAttribute("src")).toContain("sahne");
  expect(within(page).getByRole("button", { name:"Sofra görseli" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(within(page).getByRole("button", { name:"Stüdyo görseli" })); expect(main.getAttribute("src")).toContain("studyo");
  expect(within(page).getByText("Güvenli Ödeme")).toBeDefined();
  for (const brand of ["Visa","Mastercard","Troy"]) expect(within(page).getByRole("img", { name:brand }).getAttribute("src")).toBe(`/images/payment/${brand.toLowerCase()}${brand === "Mastercard" ? "" : "-dark"}.svg`);
});

it("reads a direct size and preserves history state and unrelated parameters when selecting another", async () => {
  const { page } = await mount("sample-olive-oil-5l");
  history.replaceState({ preserved:true }, "", `${location.pathname}?boy=5%20L&utm_source=test`);
  expect(within(page).getByText(copy[4][1])).toBeDefined();
  fireEvent.click(within(page).getByRole("radio", { name:"1 L" }));
  expect(new URL(location.href).searchParams.get("utm_source")).toBe("test"); expect(history.state).toEqual({ preserved:true });
  expect(location.hash).toBe("");
});

it("falls back safely for an unknown size and follows browser history without loading modal code", async () => {
  const { page } = await mount("sample-olive-oil-1l");
  act(() => { history.replaceState(null, "", `${location.pathname}?boy=unknown`); window.dispatchEvent(new PopStateEvent("popstate")); });
  expect(within(page).getByRole("radio", { name:"1 L" }).getAttribute("checked")).not.toBeNull();
  act(() => { history.replaceState(null, "", `${location.pathname}?boy=5%20L`); window.dispatchEvent(new PopStateEvent("popstate")); });
  expect(within(page).getByText(copy[4][1])).toBeDefined(); expect(screen.queryByRole("dialog")).toBeNull();
});

it("preserves selection and quantity across viewport changes and skips gallery motion when reduced", async () => {
  const { page } = await mount(); fireEvent.click(within(page).getByRole("button", { name:"Adedi artır" }));
  act(() => { vi.stubGlobal("innerWidth",390); window.dispatchEvent(new Event("resize")); });
  expect(within(page).getByLabelText("Adet").textContent).toBe("2"); expect(animation.animate).not.toHaveBeenCalled();
});

it("retains keyboard focus on the selected size while resetting image and quantity", async () => {
  const { page } = await mount(); fireEvent.click(within(page).getByRole("button", { name:"Sofra görseli" }));
  fireEvent.click(within(page).getByRole("button", { name:"Adedi artır" }));
  const size = within(page).getByRole("radio", { name:"1 kg" }); size.focus(); fireEvent.click(size);
  expect(document.activeElement).toBe(size); expect(within(page).getByLabelText("Adet").textContent).toBe("1");
  expect(page.querySelector("[data-product-detail-image] img")?.getAttribute("src")).toContain("studyo");
});

it("keeps Escape as ordinary page behavior without a modal trap or close action", async () => {
  const { page } = await mount(); const size=within(page).getByRole("radio",{name:"1 kg"});size.focus();fireEvent.keyDown(size,{key:"Escape"});
  expect(document.activeElement).toBe(size); expect(screen.queryByRole("dialog")).toBeNull(); expect(screen.queryByRole("button",{name:"Kapat"})).toBeNull();
});

it("offers a normal catalogue link instead of a modal backdrop", async () => {
  const { container } = await mount();
  expect(container.querySelector('[data-slot$="-overlay"]')).toBeNull();
  expect(screen.getByRole("link", { name:"Ürünler" }).getAttribute("href")).toBe("/urunler");
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
});

it("keeps mobile purchasing in the page without a second sticky purchase bar", async () => {
  vi.stubGlobal("innerWidth",390); const {page}=await mount();
  expect(page.querySelectorAll("[data-product-detail-purchase]")).toHaveLength(1);
  expect(document.querySelector("[data-mobile-buy-bar]")).toBeNull();
});

it("shows only package size below each product name (181)", async () => {
  const product=(await getProducts())[0];const {container}=render(<ProductCard product={product} image={v3Image(product.imageKey)} />);
  expect(container.querySelector('[aria-label="Boy"]')?.parentElement?.textContent).toBe(product.weight);
});

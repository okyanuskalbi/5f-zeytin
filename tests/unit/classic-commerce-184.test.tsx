import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QuoteQuerySelection } from "@/components/storefront/quote/QuoteQuerySelection";
import { ProductTile as ProductCard } from "@/components/storefront/ProductTile";
import { ProductDetail as ProductPage } from "@/components/storefront/ProductDetail";
import { productHref } from "@/lib/catalog/product-pages";
import { CategoryNavigation } from "@/components/storefront/catalog/CategoryNavigation";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/storefront/quote/QuoteJourneyProvider";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("motion/react-mini", () => ({ useAnimate: () => [useRef(null), vi.fn(() => ({ stop() {} }))] }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduced"), addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => {
  cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.unstubAllGlobals();
});

function CurrentChoices() {
  const quote = useQuoteJourney();
  const cart = useCart();
  return <><output aria-label="Seçilen teklif ürünleri">{JSON.stringify(quote.quantities)}</output>
    <output aria-label="Sepetteki ürünler">{JSON.stringify(cart?.state.items)}</output></>;
}
async function mount(familyId?: string) {
  const families = await getProductFamilies();
  const products = families.flatMap(family => family.variants);
  const family = families.find(item => item.id === familyId);
  render(<CartProvider products={products}><QuoteJourneyProvider>
    {family ? <ProductPage family={family} related={[]} /> : <><CategoryNavigation />{products.map(product => <ProductCard key={product.id} product={product} />)}</>}
    <QuoteQuerySelection products={products} /><CurrentChoices /><section id="toptan" tabIndex={-1}><label>Firma adı<input name="firma" /></label></section>
  </QuoteJourneyProvider></CartProvider>);
  return products;
}

it.each([
  ["Siyah Zeytin", "Salamura Siyah Zeytin", "sample-black-olive-1kg"],
  ["Yeşil Zeytin", "Salamura Yeşil Zeytin", "sample-brined-green-olive-5kg"],
  ["Kırma Zeytin", "Doğal Kırma Yeşil Zeytin", "sample-green-olive-1kg"],
  ["Zeytinyağı", "Natürel Sızma Zeytinyağı", "sample-olive-oil-1l"],
])("links %s to its real product page and keeps the keyboard trigger usable", async (_label, title, id) => {
  const products = await mount();
  const product = products.find(product => product.id === id)!;
  const trigger = screen.getByRole("link", { name: `${product.name}, ${product.weight} detayını aç` });
  act(() => trigger.focus());
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("href")).toBe(productHref(product));
  expect(within(trigger.closest("article")!).getByRole("heading").textContent).toBe(title);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
});

it("adds the chosen family's real product to the existing cart from its page", async () => {
  await mount("naturel-sizma");
  const product = document.querySelector<HTMLElement>("[data-product-page]")!;
  const add = within(product).getByRole("button", { name: "Sepete ekle" });
  await waitFor(() => expect(add.hasAttribute("disabled")).toBe(false));
  fireEvent.click(add);
  expect(JSON.parse(screen.getByLabelText("Sepetteki ürünler").textContent!)).toEqual([
    expect.objectContaining({ productId: "sample-olive-oil-1l", quantity: 1 }),
  ]);
});

it("hands the actual family product to the dedicated wholesale quote URL without a dialog", async () => {
  await mount("salamura-yesil");
  const quote = screen.getByRole("link", { name: "Teklife ekle" });
  expect(quote.getAttribute("href")).toBe("/toptan-satis?teklif=sample-brined-green-olive-5kg");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
});

it("hands off a catalogue quote URL without opening nested dialogs", async () => {
  history.replaceState(null, "", "/?teklif=sample-olive-oil-1l#toptan");
  await mount();
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  expect(JSON.parse(screen.getByLabelText("Seçilen teklif ürünleri").textContent!)).toEqual({ "sample-olive-oil-1l": "1" });
  expect(location.hash).toBe("#toptan");
  expect(new URL(location.href).searchParams.has("teklif")).toBe(false);
  expect(screen.getByRole("link", { name: "Tüm ürünler" }).getAttribute("href")).toBe("/urunler");
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" })));
});

it("quotes the newly selected page size and preserves unrelated query parameters", async () => {
  history.replaceState(null, "", "/urun/naturel-sizma-zeytinyagi?kaynak=klasik&boy=1%20L");
  await mount("naturel-sizma");
  fireEvent.click(screen.getByRole("radio", { name: "5 L" }));
  expect(new URL(location.href).searchParams.get("boy")).toBe("5 L");
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("klasik");
  expect(screen.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toBe("/toptan-satis?teklif=sample-olive-oil-5l");
  expect(screen.queryByRole("dialog")).toBeNull();
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/urunler" }));

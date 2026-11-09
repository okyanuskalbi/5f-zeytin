import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProductGroups } from "@/components/landing/ProductGroups";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";

vi.mock("motion/react-mini", () => ({ useAnimate: () => [useRef(null), vi.fn()] }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(() => {
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
async function mount() {
  const products = await getProducts();
  render(<CartProvider products={products}><QuoteJourneyProvider><ProductDetailProvider products={products} quoteEnabled>
    <ProductGroups products={products} /><CurrentChoices /><section id="toptan" tabIndex={-1}><label>Firma adı<input name="firma" /></label></section>
  </ProductDetailProvider></QuoteJourneyProvider></CartProvider>);
  return products;
}

it.each([
  ["Siyah Zeytin", "Salamura Siyah Zeytin", "sample-black-olive-1kg"],
  ["Yeşil Zeytin", "Salamura Yeşil Zeytin", "sample-brined-green-olive-5kg"],
  ["Kırma Zeytin", "Doğal Kırma Yeşil Zeytin", "sample-green-olive-1kg"],
  ["Zeytinyağı", "Natürel Sızma Zeytinyağı", "sample-olive-oil-1l"],
])("opens %s in its existing family detail and restores the category trigger on Escape", async (label, title, id) => {
  await mount();
  const trigger = screen.getByRole("button", { name: label });
  act(() => trigger.focus()); fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("heading").textContent).toBe(title);
  expect(new URL(location.href).searchParams.get("urun")).toBe(id);
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("adds the chosen family's real product to the existing cart from its detail", async () => {
  await mount();
  fireEvent.click(screen.getByRole("button", { name: "Zeytinyağı" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(screen.getByLabelText("Sepetteki ürünler").textContent!)).toEqual([
    expect.objectContaining({ productId: "sample-olive-oil-1l", quantity: 1 }),
  ]);
});

it("hands the actual family product to the existing quote and returns focus to the new section", async () => {
  await mount();
  fireEvent.click(screen.getByRole("button", { name: "Yeşil Zeytin" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: /^Teklife ekle/ }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(JSON.parse(screen.getByLabelText("Seçilen teklif ürünleri").textContent!)).toEqual({ "sample-brined-green-olive-5kg": "1" });
  expect(location.hash).toBe("#toptan");
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" })));
});

it("closes both the shop and its product detail when handing the chosen product to the quote", async () => {
  await mount();
  fireEvent.click(screen.getByRole("button", { name: "Tüm ürünleri gör" }));
  const shop = screen.getByRole("dialog", { name: "Tüm ürünler" });
  fireEvent.click(within(shop).getByRole("button", { name: "Natürel Sızma Zeytinyağı, 1 L detayını aç" }));
  const detail = await screen.findByRole("dialog", { name: "Natürel Sızma Zeytinyağı" });
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
  fireEvent.click(within(detail).getByRole("button", { name: "Teklife ekle" }));
  await waitFor(() => expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0));
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  expect(JSON.parse(screen.getByLabelText("Seçilen teklif ürünleri").textContent!)).toEqual({ "sample-olive-oil-1l": "1" });
  expect(location.hash).toBe("#toptan");
  expect(new URL(location.href).searchParams.has("magaza")).toBe(false);
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" })));
});

it("quotes the newly selected size from a shop deep link and clears only the completed panel parameters", async () => {
  history.replaceState(null, "", "/?magaza=ac&kaynak=klasik");
  await mount();
  const shop = await screen.findByRole("dialog", { name: "Tüm ürünler" });
  fireEvent.click(within(shop).getByRole("button", { name: "Natürel Sızma Zeytinyağı, 1 L detayını aç" }));
  const detail = await screen.findByRole("dialog", { name: "Natürel Sızma Zeytinyağı" });
  fireEvent.click(within(detail).getByRole("radio", { name: "5 L" }));
  expect(new URL(location.href).searchParams.get("urun")).toBe("sample-olive-oil-5l");
  fireEvent.click(within(detail).getByRole("button", { name: "Teklife ekle" }));
  await waitFor(() => expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0));
  expect(JSON.parse(screen.getByLabelText("Seçilen teklif ürünleri").textContent!)).toEqual({ "sample-olive-oil-5l": "1" });
  const destination = new URL(location.href);
  expect(destination.hash).toBe("#toptan");
  expect([...destination.searchParams.entries()]).toEqual([["kaynak", "klasik"]]);
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" })));
});

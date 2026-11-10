import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { NavbarMenu } from "@/components/site/NavbarMenu";
import { QuoteQuerySelection } from "@/components/landing/QuoteQuerySelection";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";
import { getProducts } from "@/lib/catalog/static-products";

const scrollToQuote = vi.fn();
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} onClick={event => { props.onClick?.(event); event.preventDefault(); }} /> }));
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); route.pathname = "/"; scrollToQuote.mockClear(); vi.restoreAllMocks(); });


it("marks Online Mağaza as the current page while preserving the desktop product-section anchor", () => {
  route.pathname = "/urunler";
  history.replaceState(null, "", "/urunler");
  render(<Navbar />);
  const shop = screen.getByRole("link", { name: "Online Mağaza" });
  expect(shop.getAttribute("href")).toBe("/urunler");
  expect(shop.getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("link", { name: "Ürünler" }).getAttribute("href")).toBe("/#urunler");
});

it("closes the mobile menu when its ordinary shop link is selected", () => {
  const close = vi.fn();
  render(<NavbarMenu links={[{ label: "Ana Sayfa", href: "/" }]} onClose={close} onRestoreFocus={() => {}} />);
  const shop = screen.getByRole("link", { name: "Online Mağaza" });
  expect(shop.getAttribute("href")).toBe("/urunler");
  fireEvent.click(shop);
  expect(close).toHaveBeenCalledOnce();
});

function Selection() {
  const { quantities } = useQuoteJourney();
  return <output aria-label="Teklif seçimi">{JSON.stringify(quantities)}</output>;
}
async function mountQuote() {
  const products = await getProducts();
  render(<QuoteJourneyProvider><QuoteQuerySelection products={products} /><Selection />
    <section id="toptan" ref={node => { if (node) node.scrollIntoView = scrollToQuote; }}><label>Firma adı<input /></label></section></QuoteJourneyProvider>);
}

it("selects a known query product once, removes only the completed parameter and focuses the quote", async () => {
  history.replaceState({ keep: true }, "", "/?kaynak=urunler&teklif=sample-olive-oil-1l#onceki");
  await mountQuote();
  await waitFor(() => expect(JSON.parse(screen.getByLabelText("Teklif seçimi").textContent!)).toEqual({ "sample-olive-oil-1l": "1" }));
  expect(new URL(location.href).searchParams.has("teklif")).toBe(false);
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("urunler");
  expect(location.hash).toBe("#toptan");
  expect(scrollToQuote).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" }));
});

it.each(["bilinmeyen", "", "__proto__"])("ignores an unknown or empty product query (%s) without selecting or stealing focus", async id => {
  history.replaceState(null, "", `/?teklif=${id}#baslangic`);
  await mountQuote();
  expect(JSON.parse(screen.getByLabelText("Teklif seçimi").textContent!)).toEqual({});
  expect(location.hash).toBe("#baslangic");
  expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "Firma adı" }));
});

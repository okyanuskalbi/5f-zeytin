import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { QuoteQuerySelection } from "@/components/storefront/quote/QuoteQuerySelection";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/storefront/quote/QuoteJourneyProvider";
import { getProducts } from "@/lib/catalog/static-products";

const scrollToQuote = vi.fn();
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} onClick={event => { props.onClick?.(event); event.preventDefault(); }} /> }));
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); route.pathname = "/"; scrollToQuote.mockClear(); vi.restoreAllMocks(); });


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
  history.replaceState({ keep: true }, "", "/toptan-satis?kaynak=urunler&teklif=sample-olive-oil-1l#onceki");
  await mountQuote();
  await waitFor(() => expect(JSON.parse(screen.getByLabelText("Teklif seçimi").textContent!)).toEqual({ "sample-olive-oil-1l": "1" }));
  expect(new URL(location.href).searchParams.has("teklif")).toBe(false);
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("urunler");
  expect(location.hash).toBe("#toptan");
  // Native focus reveals the first field without forcing the entire form to the top.
  expect(scrollToQuote).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Firma adı" }));
});

it.each(["bilinmeyen", "", "__proto__"])("ignores an unknown or empty product query (%s) without selecting or stealing focus", async id => {
  history.replaceState(null, "", `/toptan-satis?teklif=${id}#baslangic`);
  await mountQuote();
  expect(JSON.parse(screen.getByLabelText("Teklif seçimi").textContent!)).toEqual({});
  expect(location.hash).toBe("#baslangic");
  expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "Firma adı" }));
});

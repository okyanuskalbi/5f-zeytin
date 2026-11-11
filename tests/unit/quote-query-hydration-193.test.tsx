import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { QuoteQuerySelection } from "@/components/storefront/quote/QuoteQuerySelection";
import { getProducts } from "@/lib/catalog/static-products";

const chooseProduct = vi.hoisted(() => vi.fn());
vi.mock("@/components/storefront/quote/QuoteJourneyProvider", () => ({ useQuoteJourney: () => ({ chooseProduct }) }));
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); vi.clearAllMocks(); });

function LoadingQuote({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  return <>{children}<section id="toptan" ref={node => { if (node) node.scrollIntoView = vi.fn(); }}>
    <fieldset disabled={!ready}><label>Firma adı<input /></label></fieldset>
  </section><button onClick={() => setReady(previous => !previous)}>Hazır olmayı değiştir</button><label>Diğer alan<input /></label></>;
}

it("waits until the quote fieldset is usable before focusing its first field, then releases the observer", async () => {
  history.replaceState({ keep: true }, "", "/toptan-satis?teklif=sample-olive-oil-1l&kaynak=test");
  render(<LoadingQuote><QuoteQuerySelection products={await getProducts()} /></LoadingQuote>);
  const field = screen.getByRole("textbox", { name: "Firma adı" });
  expect(field.matches(":disabled")).toBe(true);
  expect(document.activeElement).not.toBe(field);
  expect(chooseProduct).toHaveBeenCalledExactlyOnceWith("sample-olive-oil-1l");
  expect(new URL(location.href).searchParams.has("teklif")).toBe(false);
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("test");
  expect(history.state).toEqual({ keep: true });
  fireEvent.click(screen.getByRole("button", { name: "Hazır olmayı değiştir" }));
  await waitFor(() => expect(document.activeElement).toBe(field));
  const other = screen.getByRole("textbox", { name: "Diğer alan" });
  other.focus();
  fireEvent.click(screen.getByRole("button", { name: "Hazır olmayı değiştir" }));
  fireEvent.click(screen.getByRole("button", { name: "Hazır olmayı değiştir" }));
  await Promise.resolve();
  expect(document.activeElement).toBe(other);
  expect(chooseProduct).toHaveBeenCalledOnce();
});

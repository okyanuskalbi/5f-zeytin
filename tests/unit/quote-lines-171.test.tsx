import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";
import { HorizontalProductGallery } from "@/components/landing/HorizontalProductGallery";
import { getProducts } from "@/lib/catalog/static-products";
import { buildQuoteMailto, corporateContact, type QuoteEmailDraft } from "@/lib/site/corporate-contact";
import { QUOTE_QUANTITY_MAX, validateQuoteQuantity } from "@/lib/site/quote-lines";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function Choices() {
  const journey = useQuoteJourney();
  return <>
    <button onClick={() => journey.chooseProduct("one")}>Birinci ürün</button>
    <button onClick={() => journey.chooseProduct("two")}>İkinci ürün</button>
    <button onClick={() => journey.chooseProduct("")}>Boş seçim</button>
    <button onClick={() => journey.chooseProduct("toString")}>Prototype adı</button>
    <button onClick={() => journey.setQuantities({ two: "13" })}>Yalnız ikinci kalsın</button>
    <button onClick={() => journey.setQuantities({})}>Tümünü temizle</button>
    <button onClick={() => journey.chooseSegment("hospitality")}>Otel seç</button>
    <label>İlk ürün miktarı<input value={journey.quantities?.one ?? ""} onChange={event => journey.setQuantities({ ...journey.quantities, one: event.target.value })} /></label>
    <output aria-label="Seçili miktarlar">{JSON.stringify(journey.quantities)}</output>
    <output aria-label="Uyumluluk ürünü">{journey.productId}</output>
    <output aria-label="İşletme türü">{journey.segment}</output>
  </>;
}

function quantities() { return JSON.parse(screen.getByLabelText("Seçili miktarlar").textContent!); }

it("adds gallery choices once and preserves every edited quantity, including temporarily empty input", () => {
  render(<QuoteJourneyProvider><Choices /></QuoteJourneyProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Birinci ürün" }));
  expect(quantities()).toEqual({ one: "1" });
  fireEvent.change(screen.getByLabelText("İlk ürün miktarı"), { target: { value: "24" } });
  fireEvent.click(screen.getByRole("button", { name: "İkinci ürün" }));
  expect(quantities()).toEqual({ one: "24", two: "1" });
  expect(screen.getByLabelText("Uyumluluk ürünü").textContent).toBe("two");
  fireEvent.click(screen.getByRole("button", { name: "Birinci ürün" }));
  expect(quantities()).toEqual({ one: "24", two: "1" });
  expect(screen.getByLabelText("Uyumluluk ürünü").textContent).toBe("one");
  fireEvent.change(screen.getByLabelText("İlk ürün miktarı"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Birinci ürün" }));
  fireEvent.click(screen.getByRole("button", { name: "Boş seçim" }));
  expect(quantities()).toEqual({ one: "", two: "1" });
});

it("removes selections explicitly, derives a remaining legacy product and preserves the business segment", () => {
  render(<QuoteJourneyProvider><Choices /></QuoteJourneyProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Otel seç" }));
  fireEvent.click(screen.getByRole("button", { name: "Birinci ürün" }));
  fireEvent.click(screen.getByRole("button", { name: "İkinci ürün" }));
  fireEvent.click(screen.getByRole("button", { name: "Birinci ürün" }));
  fireEvent.click(screen.getByRole("button", { name: "Yalnız ikinci kalsın" }));
  expect(quantities()).toEqual({ two: "13" });
  expect(screen.getByLabelText("Uyumluluk ürünü").textContent).toBe("two");
  fireEvent.click(screen.getByRole("button", { name: "Tümünü temizle" }));
  expect(quantities()).toEqual({});
  expect(screen.getByLabelText("Uyumluluk ürünü").textContent).toBe("");
  expect(screen.getByLabelText("İşletme türü").textContent).toBe("hospitality");
});

it("treats selected IDs as own keys rather than inherited object members", () => {
  render(<QuoteJourneyProvider><Choices /></QuoteJourneyProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Prototype adı" }));
  expect(quantities()).toEqual({ toString: "1" });
  expect(Object.hasOwn(quantities(), "toString")).toBe(true);
});

it("keeps every chosen gallery product visually selected after another product is added", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  render(<QuoteJourneyProvider><HorizontalProductGallery products={await getProducts()} /></QuoteJourneyProvider>);
  const buttons = screen.getAllByRole("button", { name: /^Teklife ekle:/ });
  fireEvent.click(buttons[0]);
  fireEvent.click(buttons[1]);
  expect(buttons[0].getAttribute("data-selected")).toBe("true");
  expect(buttons[1].getAttribute("data-selected")).toBe("true");
  expect(buttons[2].getAttribute("data-selected")).toBe("false");
});

const draft: QuoteEmailDraft = {
  name: "AFİNA deneme firması", business: "Market & bayi", product: "Legacy ürün", quantity: "10 kg",
  city: "Osmaniye", district: "Düziçi", phone: "+90 555 123 45 67",
};

it("writes each selected name and integer amount on its own structural email line", () => {
  const href = buildQuoteMailto({ ...draft, items: [
    { product: "Doğal Kırma Yeşil Zeytin · 1 kg", quantity: 12 },
    { product: "Natürel Sızma Zeytinyağı · 5 L", quantity: 99999 },
  ] });
  const body = new URL(href).searchParams.get("body")!;
  expect(body.split("\n")).toContain("Ürün: Doğal Kırma Yeşil Zeytin · 1 kg · Miktar: 12 adet");
  expect(body.split("\n")).toContain("Ürün: Natürel Sızma Zeytinyağı · 5 L · Miktar: 99999 adet");
  expect(body).not.toContain("Legacy ürün");
  expect(body).not.toContain("10 kg");
});

it("contains injected delimiters and line breaks inside item names without adding recipients or headers", () => {
  const uri = new URL(buildQuoteMailto({ ...draft, items: [
    { product: "Zeytin\r\nBcc: stranger@example.test & ?bcc=other@example.test", quantity: 2 },
    { product: "Yağ\nSubject: injected", quantity: 3 },
  ] }));
  expect(uri.pathname).toBe(corporateContact.email);
  expect([...uri.searchParams.keys()]).toEqual(["subject", "body"]);
  expect(uri.searchParams.get("subject")).toBe("AFİNA ZEYTİN · Kurumsal teklif talebi");
  const body = uri.searchParams.get("body")!;
  expect(body.split("\n")).toContain("Ürün: Zeytin Bcc: stranger@example.test & ?bcc=other@example.test · Miktar: 2 adet");
  expect(body.split("\n")).toContain("Ürün: Yağ Subject: injected · Miktar: 3 adet");
  expect(body).not.toMatch(/\n(?:Bcc|Subject):/);
});

it.each([[], [{ product: "", quantity: 1 }], [{ product: " \r\n ", quantity: 1 }],
  ...[0, -1, .5, NaN, Infinity, 100000, Number.MAX_SAFE_INTEGER, "2", null].map(quantity => [{ product: "Zeytin", quantity }]),
].map(items => ({ items })))("rejects empty or unsafe item data rather than falling back to legacy fields: $items", ({ items }) => {
  expect(() => buildQuoteMailto({ ...draft, items } as QuoteEmailDraft)).toThrow();
});

it.each(["", " ", "0", "-1", "1.5", "NaN", "Infinity", "1e3", "100000", "9007199254740992"])("rejects incomplete or invalid count input %j", value => {
  expect(validateQuoteQuantity(value)).toBeNull();
});

it("accepts integer boundaries and returns a bounded number for the email draft", () => {
  expect(QUOTE_QUANTITY_MAX).toBe(99999);
  expect(validateQuoteQuantity("1")).toBe(1);
  expect(validateQuoteQuantity("24")).toBe(24);
  expect(validateQuoteQuantity(String(QUOTE_QUANTITY_MAX))).toBe(QUOTE_QUANTITY_MAX);
});

it("preserves the legacy single-product mailto body when items are absent", () => {
  const uri = new URL(buildQuoteMailto(draft));
  expect(uri.searchParams.get("body")!.split("\n")).toEqual(expect.arrayContaining(["Ürün: Legacy ürün", "Miktar: 10 kg"]));
  expect(uri.pathname).toBe(corporateContact.email);
});

it.each([null, {}, [null], [undefined], Array(1), [{ quantity: 2 }], [{ product: 42, quantity: 2 }]])("rejects malformed or sparse item collections: %j", items => {
  expect(() => buildQuoteMailto({ ...draft, items } as QuoteEmailDraft)).toThrow();
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuoteComposer } from "@/components/storefront/quote/QuoteComposer";
import { BusinessSegmentChoice, QuoteJourneyProvider, useQuoteJourney } from "@/components/storefront/quote/QuoteJourneyProvider";
import { buildQuoteMailto, corporateContact } from "@/lib/site/corporate-contact";
import { getProducts } from "@/lib/catalog/static-products";
import type { ProductVariant } from "@/types/catalog";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function Handoff() {
  const journey = useQuoteJourney();
  return <>
    <button onClick={() => journey.chooseProduct("sample-green-olive-1kg")}>Galeriden kavanozu seç</button>
    <button onClick={() => journey.chooseProduct("sample-olive-oil-1l")}>Galeriden yağı seç</button>
    <BusinessSegmentChoice segment="hospitality">Otel ve restoran seç</BusinessSegmentChoice>
    <BusinessSegmentChoice segment="retail">Market ve bayi seç</BusinessSegmentChoice>
  </>;
}

function Page({ products }: { products: readonly ProductVariant[] }) {
  return <QuoteJourneyProvider><Handoff /><QuoteComposer products={products} /></QuoteJourneyProvider>;
}

async function fillDetails() {
  fireEvent.focus(screen.getByLabelText("Telefon"));
  await waitFor(() => expect((screen.getByLabelText("Telefon") as HTMLInputElement).readOnly).toBe(false));
  for (const [label, value] of [
    ["Adınız veya firma adı", "Ellek & Ortakları"],
    ["Şehir", "Osmaniye"], ["İlçe", "Düziçi"], ["Telefon", "+90 555 123 45 67"],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function prepare() {
  fireEvent.click(screen.getByRole("button", { name: "Galeriden kavanozu seç" }));
  fireEvent.click(screen.getByRole("button", { name: "Otel ve restoran seç" }));
  await fillDetails();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  return screen.findByRole("link", { name: "E-postayla gönder" });
}

it("validates incomplete input and consent without producing a misleading delivery or draft", async () => {
  render(<Page products={await getProducts()} />);
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  await waitFor(() => expect(screen.getByLabelText("Adınız veya firma adı").getAttribute("aria-invalid")).toBe("true"));
  expect(screen.getByLabelText("Telefon").getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByRole("alert").textContent).toContain("kontrol");
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Galeriden kavanozu seç" }));
  fireEvent.click(screen.getByRole("button", { name: "Otel ve restoran seç" }));
  await fillDetails();
  fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "+90 555 123 45 67" } });
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  await waitFor(() => expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true"));
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
  expect(screen.queryByText("Talebiniz gönderildi.")).toBeNull();
});

it("carries the actual gallery SKU and segment into a truthful encoded corporate email draft", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ items: [] }));
  render(<Page products={await getProducts()} />);
  const anchor = await prepare();
  expect(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }).textContent).toContain("1 ürün");
  expect((screen.getByLabelText("İşletme türü") as HTMLSelectElement).value).toBe("hospitality");
  const uri = new URL(anchor.getAttribute("href")!);
  expect(uri.protocol).toBe("mailto:");
  expect(uri.pathname).toBe("info@afina.com.tr");
  expect(uri.searchParams.get("body")).toContain("Doğal Kırma Yeşil Zeytin · 1 kg");
  expect(uri.searchParams.get("body")).toContain("Otel & restoran");
  expect(uri.searchParams.get("body")).toContain("Ellek & Ortakları");
  expect(uri.searchParams.get("body")).toContain("Şehir: Osmaniye");
  expect(uri.searchParams.get("body")).toContain("İlçe: Düziçi");
  expect(screen.getByRole("region", { name: "Talep özeti" }).textContent).toContain("e-posta uygulamanızda");
  expect(screen.getByRole("link", { name: /Şirketler Topluluğu.*arayın/ }).getAttribute("href")).toBe("tel:+903288827708");
  expect(screen.queryByRole("link", { name: /WhatsApp/i })).toBeNull();
  expect(screen.queryByText("Talebiniz gönderildi.")).toBeNull();
  // Address lookup GETs may finish during deferred field loading; preparing a
  // mail draft must never POST a form or send an email through the server.
  expect(fetch.mock.calls.filter(([request, options]) =>
    (options?.method ?? (request instanceof Request ? request.method : "GET")).toUpperCase() === "POST")).toEqual([]);
});

it("uses the Bazgold country control and clears the district after a city edit", async () => {
  render(<Page products={await getProducts()} />);
  expect((screen.getByRole("combobox", { name: "İlçe" }) as HTMLInputElement).disabled).toBe(true);
  fireEvent.focus(screen.getByLabelText("Telefon"));
  expect(await screen.findByRole("button", { name: "Telefon ülke kodu: +90 · Türkiye" })).toBeTruthy();
  fireEvent.change(screen.getByRole("combobox", { name: "Şehir" }), { target: { value: "Osmaniye" } });
  fireEvent.change(screen.getByRole("combobox", { name: "İlçe" }), { target: { value: "Düziçi" } });
  fireEvent.change(screen.getByRole("combobox", { name: "Şehir" }), { target: { value: "İstanbul" } });
  expect((screen.getByRole("combobox", { name: "İlçe" }) as HTMLInputElement).value).toBe("");
  fireEvent.change(screen.getByLabelText("Telefon"), { target: { value: "+44 7400 123456" } });
  expect(screen.getByRole("button", { name: /Telefon ülke kodu: \+44/ })).toBeTruthy();
});

it("keeps header metadata fixed and encodes raw delimiters/control characters inside the email body", () => {
  const href = buildQuoteMailto({
    name: "Emre\r\nBcc: stranger@example.test & ?bcc=other@example.test",
    business: "Market & bayi", product: "AFİNA · 1 L", quantity: "10 & 20?\r\nSubject: injected",
    city: "Düziçi", phone: "+90 555 123 45 67",
  });
  const uri = new URL(href);
  expect(uri.pathname).toBe(corporateContact.email);
  expect([...uri.searchParams.keys()]).toEqual(["subject", "body"]);
  expect(uri.searchParams.get("subject")).toBe("AFİNA ZEYTİN · Kurumsal teklif talebi");
  expect(uri.searchParams.get("subject")).not.toMatch(/[\r\n]/);
  expect(uri.searchParams.get("body")).toContain("Emre Bcc: stranger@example.test & ?bcc=other@example.test");
  expect(href).not.toContain("\r");
  expect(href).not.toContain("\n");
});

it("disables segment actions in SSR and stores a hydrated choice before navigating to the quote", async () => {
  const markup = renderToStaticMarkup(<QuoteJourneyProvider><BusinessSegmentChoice segment="retail">Market ve bayi seç</BusinessSegmentChoice></QuoteJourneyProvider>);
  expect(markup).toContain('disabled=""');
  render(<Page products={await getProducts()} />);
  const retail = screen.getByRole("button", { name: "Market ve bayi seç" }) as HTMLButtonElement;
  expect(retail.disabled).toBe(false);
  fireEvent.click(retail);
  expect((screen.getByLabelText("İşletme türü") as HTMLSelectElement).value).toBe("retail");
  expect(window.location.hash).toBe("#teklif");
  fireEvent.change(screen.getByLabelText("İşletme türü"), { target: { value: "bulk" } });
  expect(retail.getAttribute("aria-pressed")).toBe("false");
  fireEvent.change(screen.getByLabelText("İşletme türü"), { target: { value: "retail" } });
  expect(retail.getAttribute("aria-pressed")).toBe("true");
});

it("keeps all selected SKUs and typed quantities in the draft and invalidates it after any edit", async () => {
  const products = await getProducts();
  render(<Page products={products} />);
  await prepare();
  fireEvent.click(screen.getByRole("button", { name: "Galeriden yağı seç" }));
  await waitFor(() => expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  const olive = await screen.findByRole("textbox", { name: "Adet · Doğal Kırma Yeşil Zeytin · 1 kg" });
  const oil = screen.getByRole("textbox", { name: "Adet · Natürel Sızma Zeytinyağı · 1 L" });
  fireEvent.change(olive, { target: { value: "24" } });
  fireEvent.change(oil, { target: { value: "12" } });
  fireEvent.click(screen.getByRole("button", { name: "Tamam" }));
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  const anchor = await screen.findByRole("link", { name: "E-postayla gönder" });
  const body = new URL(anchor.getAttribute("href")!).searchParams.get("body")!;
  expect(body).toContain("Doğal Kırma Yeşil Zeytin · 1 kg · Miktar: 24 adet");
  expect(body).toContain("Natürel Sızma Zeytinyağı · 1 L · Miktar: 12 adet");
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Adet · Natürel Sızma Zeytinyağı · 1 L" }), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Kapat" }));
  await waitFor(() => expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }).getAttribute("aria-invalid")).toBe("true"));
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
});

it("blocks missing catalogue items and refreshes stock instead of sending a stale snapshot", async () => {
  const products = await getProducts();
  const view = render(<Page products={products} />);
  await prepare();
  const oil = { ...products.find(product => product.id === "sample-olive-oil-1l")!, stock: 0, priceKurus: 45600 };
  view.rerender(<Page products={[oil]} />);
  await waitFor(() => expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }).getAttribute("aria-invalid")).toBe("true"));
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  fireEvent.click(await screen.findByRole("button", { name: "Seçimi temizle" }));
  fireEvent.click(screen.getByRole("button", { name: "Tümünü seç" }));
  fireEvent.click(screen.getByRole("button", { name: "Tamam" }));
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  const region = await screen.findByRole("region", { name: "Talep özeti" });
  expect(region.textContent).toContain("Mevcut değil");
  const body = new URL(screen.getByRole("link", { name: "E-postayla gönder" }).getAttribute("href")!).searchParams.get("body");
  expect(body).toContain("Natürel Sızma Zeytinyağı · 1 L");
  expect(body).not.toContain("Doğal Kırma");
});

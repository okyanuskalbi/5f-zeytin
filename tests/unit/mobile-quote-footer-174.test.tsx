import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { QuoteProductPicker } from "@/components/ui/quote-product-picker";
import { PhoneCountrySearch } from "@/components/ui/phone-country-search";
import { Footerdemo } from "@/components/ui/footer-section";
import { getProducts } from "@/lib/catalog/static-products";
import { countryPhoneOptions } from "@/lib/contact/customer-phone";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("keeps the picker above the visual keyboard and releases viewport listeners when closed", async () => {
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0 });
  const removed = vi.spyOn(viewport, "removeEventListener");
  vi.stubGlobal("visualViewport", viewport);
  vi.stubGlobal("innerHeight", 844);
  render(<QuoteProductPicker products={await getProducts()} quantities={{}} onChange={() => {}} />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Ürünleri seçin" });
  await waitFor(() => expect(dialog.style.getPropertyValue("--quote-picker-viewport-height")).toBe("844px"));
  act(() => { viewport.height = 500; viewport.offsetTop = 40; viewport.dispatchEvent(new Event("resize")); });
  await waitFor(() => expect(dialog.style.getPropertyValue("--quote-picker-viewport-height")).toBe("500px"));
  expect(dialog.style.getPropertyValue("--quote-picker-viewport-bottom")).toBe("304px");
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(removed.mock.calls.map(([event]) => event)).toEqual(expect.arrayContaining(["resize", "scroll"]));
  expect(document.activeElement).toBe(trigger);
});

it("offers a short mobile country prefix without losing its full accessible name or native form value", () => {
  const changed = vi.fn();
  const options = countryPhoneOptions("tr");
  const { container } = render(<form><PhoneCountrySearch name="phoneCountry" value="TR" options={options}
    label="Telefon ülke kodu" autoComplete="tel-country-code" lang="tr" onChange={changed} /></form>);
  const trigger = screen.getByRole("button", { name: `Telefon ülke kodu: +90 · ${options.find(option => option.country === "TR")!.name}` });
  expect(trigger.querySelector("[data-phone-country-compact]")?.textContent).toBe("TR +90");
  expect(trigger.querySelector("[data-phone-country-compact]")?.getAttribute("aria-hidden")).toBe("true");
  expect(new FormData(container.querySelector("form")!).get("phoneCountry")).toBe("TR");
  fireEvent.change(container.querySelector("select")!, { target: { value: "DE" } });
  expect(changed).toHaveBeenLastCalledWith("DE");
});

it("makes footer groups native mobile disclosures and restores the open desktop navigation on resize", async () => {
  const media = Object.assign(new EventTarget(), { matches: true, media: "(max-width: 767px)" });
  vi.stubGlobal("matchMedia", () => media);
  const { container } = render(<Footerdemo contact={{ phone: "", whatsapp: "", email: "" }} />);
  const groups = [...container.querySelectorAll("details")];
  expect(groups).toHaveLength(2);
  for (const group of groups) expect(group.open).toBe(false);
  const shopping = groups[0];
  expect(shopping.querySelector("summary")?.tabIndex).toBe(0);
  fireEvent.click(shopping.querySelector("summary")!);
  await waitFor(() => expect(shopping.open).toBe(true));
  expect(within(shopping).getByRole("link", { name: "Sepetim" }).getAttribute("href")).toBe("/sepet");
  act(() => { media.matches = false; media.dispatchEvent(new Event("change")); });
  await waitFor(() => { for (const group of groups) expect(group.open).toBe(true); });
  for (const group of groups) {
    expect(group.querySelector("summary")?.tabIndex).toBe(-1);
    fireEvent.click(group.querySelector("summary")!);
    expect(group.open).toBe(true);
  }
});

it("keeps all footer destinations visible in server HTML before JavaScript", () => {
  const html = renderToStaticMarkup(<Footerdemo contact={{ phone: "", whatsapp: "", email: "" }} />);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const groups = [...doc.querySelectorAll("details")];
  expect(groups).toHaveLength(2);
  for (const group of groups) expect(group.open).toBe(true);
  for (const path of ["/#kiler", "/#urunler", "/sepet", "/#toptan-iletisim", "/siparis-takip", "/hesabim", "/#sik-sorulanlar", "/iade", "/kvkk", "/mesafeli-satis"]) {
    expect(doc.querySelector(`a[href="${path}"]`)).not.toBeNull();
  }
});

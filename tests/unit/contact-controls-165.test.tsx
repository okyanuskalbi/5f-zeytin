import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CustomerPhoneField } from "@/components/ui/customer-phone-field";
import { AddressSearchField } from "@/components/ui/address-search-field";

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let popoverStyle: HTMLStyleElement;
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  // jsdom has no Popover API and Vitest does not apply the imported stylesheet.
  // Use the same visible fallback as phone-country-search.css.
  popoverStyle = document.createElement("style");
  popoverStyle.textContent = ".phone-country-panel { display: flex; }";
  document.head.append(popoverStyle);
});
afterEach(() => {
  cleanup();
  popoverStyle.remove();
  if (scrollIntoViewDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollIntoViewDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("supports searching country codes, keyboard selection and Escape without submitting the form", async () => {
  const submit = vi.fn();
  const fetch = vi.fn().mockResolvedValue(Response.json({ items: [{ country: "GB", name: "Birleşik Krallık", code: "+44" }] }));
  vi.stubGlobal("fetch", fetch);
  render(<form onSubmit={submit}><CustomerPhoneField name="phone" lang="tr" /></form>);
  fireEvent.click(screen.getByRole("button", { name: /Telefon ülke kodu/ }));
  const query = screen.getByRole("combobox", { name: "Ülke veya kod ara" });
  fireEvent.change(query, { target: { value: "+44" } });
  await screen.findByRole("option", { name: /Birleşik Krallık/ });
  fireEvent.keyDown(query, { key: "ArrowDown" });
  fireEvent.keyDown(query, { key: "Enter" });
  expect(screen.getByRole("button", { name: /Telefon ülke kodu: \+44/ })).toBeTruthy();
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /Telefon ülke kodu/ }));
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Ülke veya kod ara" }), { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: /Telefon ülke kodu/ }));
});

it("ignores a late city response after the search changes", async () => {
  let old!: (response: Response) => void;
  const fetch = vi.fn().mockImplementationOnce(() => new Promise(resolve => { old = resolve; }))
    .mockResolvedValue(Response.json({ items: ["İstanbul"] }));
  vi.stubGlobal("fetch", fetch);
  function City() {
    const [value, setValue] = useState("");
    return <AddressSearchField name="city" label="Şehir" value={value} onChange={setValue} kind="city" lang="tr" placeholder="Şehir seçin" autoComplete="address-level1" />;
  }
  render(<City />);
  const input = screen.getByRole("combobox", { name: "Şehir" });
  fireEvent.focus(input);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  fireEvent.change(input, { target: { value: "istan" } });
  await screen.findByRole("option", { name: "İstanbul" });
  old(Response.json({ items: ["Adana"] }));
  await waitFor(() => expect(screen.queryByRole("option", { name: "Adana" })).toBeNull());
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect((input as HTMLInputElement).value).toBe("İstanbul");
});

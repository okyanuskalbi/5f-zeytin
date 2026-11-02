import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QuoteProductPicker } from "@/components/ui/quote-product-picker";
import { getProducts } from "@/lib/catalog/static-products";
import type { ProductVariant } from "@/types/catalog";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Fixture({ products, initial = {}, disabled = false, changed = () => {} }: {
  products: readonly ProductVariant[]; initial?: Record<string, string>; disabled?: boolean;
  changed?: (next: Record<string, string>) => void;
}) {
  const [quantities, setQuantities] = useState(initial);
  return <QuoteProductPicker products={products} quantities={quantities} disabled={disabled}
    onChange={next => { setQuantities(next); changed(next); }} />;
}
const choice = (product: ProductVariant) => `Ürün · ${product.name} · ${product.weight}`;
const quantity = (product: ProductVariant) => `Adet · ${product.name} · ${product.weight}`;
const step = (product: ProductVariant, action: "artır" | "azalt") => `Adedi ${action} · ${product.name} · ${product.weight}`;

it("selects real packages including a stock-zero quote item and keeps the trigger compact and named for validation", async () => {
  const products = await getProducts();
  render(<Fixture products={products} />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  expect(trigger.getAttribute("name")).toBe("productId");
  expect(trigger.getAttribute("type")).toBe("button");
  expect(trigger.textContent).toContain("Ürünleri seçin");
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Ürünleri seçin" });
  expect(within(dialog).getAllByRole("checkbox")).toHaveLength(6);
  expect(dialog.querySelectorAll("picture img")).toHaveLength(6);
  const item = products.find(product => product.stock === 0)!;
  expect(within(dialog).getByRole("checkbox", { name: choice(item) }).hasAttribute("disabled")).toBe(false);
  fireEvent.click(within(dialog).getByRole("checkbox", { name: choice(item) }));
  fireEvent.change(within(dialog).getByRole("textbox", { name: quantity(item) }), { target: { value: "12" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Tamam" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger.textContent).toContain("1 ürün · 12 adet");
  expect(document.activeElement).toBe(trigger);
});

it("keeps blank, zero and fractional edits raw, blocks completion and never repairs them with a stepper", async () => {
  const products = await getProducts(); const product = products[0]; const changed = vi.fn();
  render(<Fixture products={products} initial={{ [product.id]: "2" }} changed={changed} />);
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  const field = screen.getByRole("textbox", { name: quantity(product) });
  expect(field.getAttribute("inputmode")).toBe("numeric");
  expect(field.getAttribute("maxlength")).toBe("5");
  for (const raw of ["", "0", "1.5"]) {
    fireEvent.change(field, { target: { value: raw } });
    expect((field as HTMLInputElement).value).toBe(raw);
    expect(changed).toHaveBeenLastCalledWith({ [product.id]: raw });
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("button", { name: "Tamam" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: step(product, "artır") }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: step(product, "azalt") }).hasAttribute("disabled")).toBe(true);
  }
  fireEvent.change(field, { target: { value: "99999" } });
  expect(screen.getByRole("button", { name: step(product, "artır") }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: step(product, "azalt") }));
  expect((field as HTMLInputElement).value).toBe("99998");
  fireEvent.change(field, { target: { value: "1" } });
  expect(screen.getByRole("button", { name: step(product, "azalt") }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("button", { name: "Tamam" }).hasAttribute("disabled")).toBe(false);
});

it("bulk-selects available products without overwriting edits, excludes missing SKUs from the visible total, and clears explicitly", async () => {
  const products = await getProducts(); const changed = vi.fn();
  render(<Fixture products={products} initial={{ removed: "500", [products[0].id]: "7" }} changed={changed} />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  expect(trigger.textContent).toContain("1 ürün · 7 adet");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Tümünü seç" }));
  expect(changed.mock.lastCall?.[0]).toEqual(Object.fromEntries([
    ["removed", "500"], ...products.map((product, index) => [product.id, index ? "1" : "7"]),
  ]));
  expect(screen.getByLabelText("Seçim özeti").textContent).toContain("6 ürün · 12 adet");
  fireEvent.click(screen.getByRole("button", { name: "Seçimi temizle" }));
  expect(changed).toHaveBeenLastCalledWith({});
  for (const field of screen.getAllByRole("textbox")) expect(field.hasAttribute("disabled")).toBe(true);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

it("honors disabled even inside the portal and leaves close available", async () => {
  const products = await getProducts(); const changed = vi.fn();
  const view = render(<Fixture products={products} initial={{ [products[0].id]: "3" }} changed={changed} />);
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  view.rerender(<Fixture products={products} initial={{ [products[0].id]: "3" }} changed={changed} disabled />);
  const dialog = screen.getByRole("dialog");
  for (const control of [...within(dialog).getAllByRole("checkbox"), ...within(dialog).getAllByRole("textbox")]) expect(control.hasAttribute("disabled")).toBe(true);
  for (const name of ["Tümünü seç", "Seçimi temizle", "Tamam", step(products[0], "artır")]) expect(within(dialog).getByRole("button", { name }).hasAttribute("disabled")).toBe(true);
  fireEvent.change(within(dialog).getByRole("textbox", { name: quantity(products[0]) }), { target: { value: "9" } });
  expect(changed).not.toHaveBeenCalled();
  expect(within(dialog).getByRole("button", { name: "Kapat" }).hasAttribute("disabled")).toBe(false);
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("reflects external selections and exposes a supplied validation error on the real trigger", async () => {
  const products = await getProducts();
  const view = render(<QuoteProductPicker products={products} quantities={{}} onChange={() => {}} id="quote-products" invalid errorId="product-error" />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  expect(trigger.id).toBe("quote-products");
  expect(trigger.getAttribute("aria-describedby")).toBe("product-error");
  expect(trigger.getAttribute("aria-invalid")).toBe("true");
  await act(async () => view.rerender(<QuoteProductPicker products={products} quantities={Object.fromEntries(products.map(p => [p.id, "1"]))} onChange={() => {}} />));
  expect(trigger.textContent).toContain("6 ürün · 6 adet");
  expect(trigger.querySelectorAll("picture")).toHaveLength(3);
});

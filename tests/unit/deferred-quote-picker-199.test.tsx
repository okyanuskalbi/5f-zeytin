import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { DeferredQuoteProductPicker } from "@/components/storefront/quote/DeferredQuoteProductPicker";
import { QuoteProductPicker } from "@/components/ui/quote-product-picker";
import { getProducts } from "@/lib/catalog/static-products";

afterEach(cleanup);
const pickerModule = { QuoteProductPicker };

it("renders the same selected photos and raw-error summary without loading the closed dialog", async () => {
  const products = await getProducts();
  const loadPicker = vi.fn().mockResolvedValue(pickerModule);
  const { container } = render(<DeferredQuoteProductPicker products={products} quantities={{ [products[0].id]: "" }} onChange={() => {}} loadPicker={loadPicker} errorId="quantity-error" />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  expect(trigger.getAttribute("name")).toBe("productId");
  expect(trigger.getAttribute("aria-invalid")).toBe("true");
  expect(trigger.getAttribute("aria-describedby")).toContain("quantity-error");
  expect(trigger.textContent).toContain("1 ürün, Adetleri kontrol edin");
  expect(container.querySelectorAll("picture img")).toHaveLength(1);
  expect(loadPicker).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("opens on the first click after a delayed load, preserves updates, and keeps the loaded dialog for reopening", async () => {
  const products = await getProducts();
  let resolve!: (value: typeof pickerModule) => void;
  const loadPicker = vi.fn(() => new Promise<typeof pickerModule>(done => { resolve = done; }));
  const changed = vi.fn();
  function Fixture() {
    const [quantities, setQuantities] = useState<Record<string, string>>({});
    return <DeferredQuoteProductPicker products={products} quantities={quantities} onChange={next => { changed(next); setQuantities(next); }} loadPicker={loadPicker} />;
  }
  render(<Fixture />);
  const pending = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  pending.focus(); fireEvent.click(pending); fireEvent.click(pending);
  expect(loadPicker).toHaveBeenCalledTimes(1);
  expect(pending.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("status").textContent).toContain("yükleniyor");
  await act(async () => { resolve(pickerModule); });
  const dialog = await screen.findByRole("dialog", { name: "Ürünleri seçin" });
  const soldOut = products.find(product => product.stock === 0)!;
  const checkbox = within(dialog).getByRole("checkbox", { name: `Ürün · ${soldOut.name} · ${soldOut.weight}` });
  expect(checkbox.hasAttribute("disabled")).toBe(false);
  fireEvent.click(checkbox);
  expect(changed).toHaveBeenLastCalledWith({ [soldOut.id]: "1" });
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(trigger.textContent).toContain("1 ürün, 1 adet");
  fireEvent.click(trigger);
  expect(screen.getByRole("dialog")).toBeDefined();
  expect(loadPicker).toHaveBeenCalledTimes(1);
});

it("keeps a focused retry after failure and opens successfully on retry", async () => {
  const products = await getProducts();
  const loadPicker = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(pickerModule);
  render(<DeferredQuoteProductPicker products={products} quantities={{}} onChange={() => {}} loadPicker={loadPicker} />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  trigger.focus(); fireEvent.click(trigger);
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Ürün seçimi yüklenemedi. Yeniden denemek için ürün seçimine basın.");
  expect(document.activeElement).toBe(trigger);
  fireEvent.click(trigger);
  expect(await screen.findByRole("dialog")).toBeDefined();
  expect(loadPicker).toHaveBeenCalledTimes(2);
});

it("does not load a disabled picker or steal focus after Escape cancels a pending opening", async () => {
  const products = await getProducts();
  let resolve!: (value: typeof pickerModule) => void;
  const loadPicker = vi.fn(() => new Promise<typeof pickerModule>(done => { resolve = done; }));
  const view = render(<DeferredQuoteProductPicker products={products} quantities={{}} onChange={() => {}} loadPicker={loadPicker} disabled />);
  fireEvent.click(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }));
  expect(loadPicker).not.toHaveBeenCalled();
  view.rerender(<DeferredQuoteProductPicker products={products} quantities={{}} onChange={() => {}} loadPicker={loadPicker} />);
  const trigger = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  trigger.focus(); fireEvent.click(trigger); fireEvent.keyDown(trigger, { key: "Escape" });
  await act(async () => { resolve(pickerModule); });
  expect(screen.queryByRole("dialog")).toBeNull();
  const restored = screen.getByRole("button", { name: "İlgilendiğiniz ürünler" });
  await waitFor(() => expect(document.activeElement).toBe(restored));
  fireEvent.click(restored);
  expect(screen.getByRole("dialog")).toBeDefined();
  expect(loadPicker).toHaveBeenCalledTimes(1);
});

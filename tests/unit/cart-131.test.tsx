import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartSummary } from "@/components/cart/CartSummary";
import { Upsell } from "@/components/cart/Upsell";
import { createCartStore, CART_STORAGE_KEY } from "@/lib/cart/store";
import type { ProductVariant } from "@/types/catalog";

const olive: ProductVariant = { id: "olive", familyId: "olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 12550, stock: 4, imageKey: "urun-01-kirma-10kg", galleryKeys: [] };
const products = [olive, { ...olive, id: "oil", name: "Zeytinyağı", weight: "1 L", priceKurus: 30000 }, { ...olive, id: "brined", name: "Salamura" }, { ...olive, id: "black", name: "Siyah Zeytin" }];

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

function drawer(empty = false, checkoutHref: string | null = "/odeme") {
  const store = createCartStore({ products, storage: null });
  if (!empty) store.addItem("olive", 2);
  function Fixture() {
    const [open, setOpen] = useState(true);
    return <CartDrawer store={store} products={products} open={open} onOpenChange={setOpen} checkoutHref={checkoutHref} />;
  }
  render(<Fixture />);
  return store;
}

describe("Task 131 cart presentation", () => {
  it("shows each line's image, name, size, unit price, quantity, line total and remove control", () => {
    drawer();
    const dialog = screen.getByRole("dialog", { name: "Sepetim (2)" });
    const line = within(dialog).getByRole("group", { name: "Sofralık Zeytin" });
    expect(line.querySelector("picture img")).not.toBeNull();
    expect(within(line).getByText("1 kg")).toBeDefined();
    expect(within(line).getByText("125,50 ₺ / adet")).toBeDefined();
    expect(within(line).getByLabelText("Adet").textContent).toBe("2");
    expect(within(line).getByLabelText("Satır toplamı").textContent).toBe("251,00 ₺");
    expect(within(line).getByRole("button", { name: "Sepetten sil" })).toBeDefined();
    expect(within(dialog).getByLabelText("Ara toplam").textContent).toBe("251,00 ₺");
    expect(within(dialog).getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
    expect(within(dialog).getByText("Ödeme adımında hesaplanır")).toBeDefined();
    expect(within(dialog).getByRole("link", { name: "Ödemeye geç" }).getAttribute("href")).toBe("/odeme");
    const trust = within(dialog).getByRole("group", { name: "Güvenli ödeme" });
    for (const brand of ["PayTR", "Visa", "Mastercard", "Troy"]) expect(within(trust).getByRole("img", { name: brand })).toBeDefined();
    expect(within(dialog).getByText("Kargo 2–4 iş günü")).toBeDefined();
    expect(within(dialog).getByRole("link", { name: "Sepeti görüntüle" }).getAttribute("href")).toBe("/sepet");
  });

  it("updates line, subtotal and total through the existing store, then removes the line", async () => {
    const store = drawer();
    fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
    expect(screen.getByLabelText("Satır toplamı").textContent).toBe("376,50 ₺");
    expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("376,50 ₺");
    fireEvent.click(screen.getByRole("button", { name: "Adedi azalt" }));
    expect(screen.getByLabelText("Ara toplam").textContent).toBe("251,00 ₺");
    fireEvent.click(screen.getByRole("button", { name: "Sepetten sil" }));
    expect(store.getSnapshot().items).toEqual([]);
    expect(screen.getByText("Sepetiniz boş")).toBeDefined();
    await waitFor(() => expect(screen.queryByRole("group", { name: "Sofralık Zeytin" })).toBeNull());
    expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("0,00 ₺");
    expect(screen.getByRole("button", { name: "Ödemeye geç" }).hasAttribute("disabled")).toBe(true);
  });

  it("offers a shared empty state and closes the drawer on browsing", async () => {
    drawer(true);
    expect(screen.getByText("Sepetiniz boş")).toBeDefined();
    const browse = screen.getByRole("link", { name: "Ürünlere göz atın" });
    expect(browse.getAttribute("href")).toBe("/#urunler");
    fireEvent.click(browse);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps desktop and mobile checkout subject to the same stock, refresh and destination guards", () => {
    const store = createCartStore({ products, storage: null });
    store.addItem("olive", 2);
    const view = render(<CartSummary store={store} products={products} onRefresh={() => {}} checkoutHref="/odeme" />);
    const summary = screen.getByRole("complementary", { name: "Sepet özeti" });
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
    const bar = screen.getByRole("region", { name: "Mobil ödeme" });
    expect(within(bar).getByRole("link", { name: "Ödemeye geç" }).getAttribute("href")).toBe("/odeme");
    expect(screen.getByRole("textbox", { name: "Kupon kodu" }).hasAttribute("readonly")).toBe(true);
    expect(screen.getByRole("button", { name: "Kuponu uygula" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("376,50 ₺");
    expect(within(bar).getByLabelText("Mobil toplam (tahmini)").textContent).toBe("376,50 ₺");
    for (const props of [
      { products, checkoutHref: null },
      { products: [{ ...olive, stock: 1 }], checkoutHref: "/odeme" },
      { products, checkoutHref: "/odeme", refreshing: true },
    ]) {
      view.rerender(<CartSummary store={store} onRefresh={() => {}} {...props} />);
      expect(screen.queryAllByRole("link", { name: "Ödemeye geç" })).toHaveLength(0);
      expect(within(bar).getByRole("button", { name: "Ödemeye geç" }).hasAttribute("disabled")).toBe(true);
    }
  });

  it("preserves unread cart intent on catalog failure and shows unknown amounts", () => {
    const saved = JSON.stringify([{ productId: "olive", quantity: 2 }]);
    localStorage.setItem(CART_STORAGE_KEY, saved);
    const store = createCartStore({ products });
    render(<CartSummary store={store} products={null} onRefresh={() => {}} checkoutHref="/odeme" />);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(saved);
    expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("Fiyat yakında");
    expect(screen.queryByRole("region", { name: "Mobil ödeme" })).toBeNull();
  });

  it("uses the same empty-state language on the page without a mobile checkout bar", () => {
    const store = createCartStore({ products, storage: null });
    render(<CartSummary store={store} products={products} onRefresh={() => {}} />);
    expect(screen.getByText("Sepetiniz boş")).toBeDefined();
    expect(screen.getByRole("link", { name: "Ürünlere göz atın" }).getAttribute("href")).toBe("/#urunler");
    expect(screen.queryByRole("region", { name: "Mobil ödeme" })).toBeNull();
  });

  it("shows at most two approved suggestions and adds the chosen product", () => {
    const add = vi.fn();
    render(<Upsell products={products} items={[{ productId: "olive", quantity: 1 }]} onAdd={add}
      configuration={{ activeProductIds: products.map(p => p.id), relations: products.slice(1).map(p => ({ sourceProductId: "olive", targetProductId: p.id })) }} />);
    const region = screen.getByRole("region", { name: "Sofranıza ekleyin" });
    expect(within(region).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.click(within(region).getByRole("button", { name: "Zeytinyağı sepete ekle" }));
    expect(add).toHaveBeenCalledWith("oil");
  });
});

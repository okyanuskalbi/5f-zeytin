import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CheckoutValue } from "@/components/ui/interactive-checkout";
import { CartSummary } from "@/components/cart/CartSummary";
import { createCartStore } from "@/lib/cart/store";
import type { ProductVariant } from "@/types/catalog";

const olive: ProductVariant = { id: "olive", familyId: "olive", name: "Kırma Yeşil Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 12550, stock: 3, imageKey: "urun-01-kirma-10kg", galleryKeys: [] };
afterEach(cleanup);

describe("Task165 interactive checkout integration", () => {
  it("exposes only the latest value while quantity and money animate", () => {
    const view = render(<output aria-label="Tutar"><CheckoutValue value="125,50 ₺" /></output>);
    view.rerender(<output aria-label="Tutar"><CheckoutValue value="251,00 ₺" /></output>);
    expect(screen.getByLabelText("Tutar").textContent).toBe("251,00 ₺");
    expect(screen.queryByText("125,50 ₺")).toBeNull();
    view.rerender(<output aria-label="Tutar"><CheckoutValue value="Fiyat yakında" /></output>);
    expect(screen.getByLabelText("Tutar").textContent).toBe("Fiyat yakında");
  });

  it("follows external store edits and enforces its stock limit without a second cart", () => {
    const store = createCartStore({ products: [olive], storage: null });
    store.addItem(olive.id, 1);
    render(<CartSummary store={store} products={[olive]} onRefresh={() => {}} checkoutHref="/odeme" />);
    act(() => store.setQuantity(olive.id, 2));
    expect(screen.getByLabelText("Adet").textContent).toBe("2");
    expect(screen.getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
    fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
    expect(store.getSnapshot().items).toEqual([{ productId: olive.id, quantity: 3 }]);
    expect(screen.getByRole("button", { name: "Adedi artır" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Mobil toplam (tahmini)").textContent).toBe("376,50 ₺");
    expect(screen.getAllByRole("link", { name: "Ödemeye geç" }).every(link => link.getAttribute("href") === "/odeme")).toBe(true);
  });
});

import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

vi.mock("@/components/cart/CartDrawer", () => ({
  CartDrawer: ({ open }: { open: boolean }) => open ? <div role="dialog">Sepet</div> : null,
}));
const products: readonly Product[] = [{ id: "olive", name: "Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 10000, stock: 3 }];

function Consumer() {
  const cart = useCart();
  if (!cart) return <p>Bağlantısız</p>;
  return <>
    <output aria-label="Adet">{cart.state.items.reduce((sum, item) => sum + item.quantity, 0)}</output>
    <button onClick={(event) => cart.addItem("olive", 1, event.currentTarget)}>Ekle</button>
    <button onClick={(event) => cart.openCart(event.currentTarget)}>Aç</button>
    <button onClick={() => cart.store.removeItem("olive")}>Sil</button>
  </>;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

describe("global cart owner", () => {
  it("hydrates once, shares edits between consumers and survives layout rerender", async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: "olive", quantity: 1 }]));
    const view = render(<CartProvider products={products}><Consumer /><Consumer /></CartProvider>);
    expect(screen.getAllByRole("status", { name: "Adet" }).map((node) => node.textContent)).toEqual(["1", "1"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Ekle" })[0]);
    expect(screen.getAllByRole("status", { name: "Adet" }).map((node) => node.textContent)).toEqual(["2", "2"]);
    expect(await screen.findAllByRole("dialog")).toHaveLength(1);
    view.rerender(<CartProvider products={[...products]}><Consumer /><Consumer /></CartProvider>);
    expect(screen.getAllByRole("status", { name: "Adet" }).map((node) => node.textContent)).toEqual(["2", "2"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Sil" })[1]);
    expect(screen.getAllByRole("status", { name: "Adet" }).map((node) => node.textContent)).toEqual(["0", "0"]);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([]);
  });

  it("does not hydrate or overwrite an unread cart on catalog failure, and recovers", () => {
    const saved = JSON.stringify([{ productId: "olive", quantity: 2 }]);
    localStorage.setItem(CART_STORAGE_KEY, saved);
    const view = render(<CartProvider products={null}><Consumer /></CartProvider>);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(saved);
    expect(screen.getByRole("status", { name: "Adet" }).textContent).toBe("0");
    expect(screen.queryByRole("dialog")).toBeNull();
    view.rerender(<CartProvider products={products}><Consumer /></CartProvider>);
    expect(screen.getByRole("status", { name: "Adet" }).textContent).toBe("2");
  });

  it("keeps edits in memory when persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    render(<CartProvider products={products}><Consumer /><Consumer /></CartProvider>);
    fireEvent.click(screen.getAllByRole("button", { name: "Ekle" })[0]);
    expect(screen.getAllByRole("status", { name: "Adet" }).map((node) => node.textContent)).toEqual(["1", "1"]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it("rejects cumulative stock overflow without opening or changing saved intent", () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: "olive", quantity: 3 }]));
    const { result } = renderHook(() => useCart(), { wrapper: ({ children }) => <CartProvider products={products}>{children}<Consumer /></CartProvider> });
    expect(() => act(() => result.current!.addItem("olive", 1))).toThrow(RangeError);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("status", { name: "Adet" }).textContent).toBe("3");
  });

  it("opens the empty drawer and renders an empty SSR snapshot without browser reads", async () => {
    render(<CartProvider products={products}><Consumer /></CartProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Aç" }));
    expect(await screen.findByRole("dialog")).toBeDefined();
    const read = vi.spyOn(Storage.prototype, "getItem");
    expect(renderToString(<CartProvider products={products}><Consumer /></CartProvider>)).toContain(">0</output>");
    expect(read).not.toHaveBeenCalled();
  });

  it("supports standalone consumers without creating another store", () => {
    render(<Consumer />);
    expect(screen.getByText("Bağlantısız")).toBeDefined();
  });

  it("rejects actions until the catalog is available", () => {
    const { result } = renderHook(() => useCart(), { wrapper: ({ children }) => <CartProvider products={null}>{children}</CartProvider> });
    act(() => result.current!.openCart());
    expect(result.current!.open).toBe(false);
    expect(() => act(() => result.current!.addItem("olive", 1))).toThrow("Katalog yüklenemedi");
  });
});

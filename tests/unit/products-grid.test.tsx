import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { Products } from "@/components/landing/Products";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { CART_STORAGE_KEY } from "@/lib/cart/store";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/components/cart/useCartViewport", () => ({ useCartViewport: () => true }));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: ({ open }: { open: boolean }) => open ? <div role="dialog">Sepetim</div> : null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 });

it("renders six separate variants with catalog prices, three categories and just one first-card badge", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><Products products={products} /></CartProvider>);
  const cards = screen.getAllByRole("article");
  expect(cards).toHaveLength(6);
  expect(cards.map(card => card.getAttribute("data-product-id"))).toEqual([...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey)).map(product => product.id));
  expect(screen.getAllByText("EN ÇOK ALINAN")).toHaveLength(1);
  expect(within(cards[0]).getByText("EN ÇOK ALINAN")).toBeDefined();
  expect(screen.getAllByText("Sofralık")).toHaveLength(2);
  expect(screen.getAllByText("Salamura")).toHaveLength(2);
  expect(screen.getAllByText("Zeytinyağı")).toHaveLength(2);
  for (const product of products) {
    const card = cards.find(card => card.dataset.productId === product.id)!;
    expect(within(card).getByRole("heading", { level: 3 }).textContent).toBe(product.name);
    expect(within(card).getByLabelText("Fiyat").textContent).toBe(money.format(product.priceKurus / 100));
    expect(within(card).getByLabelText("Boy").textContent).toBe(product.weight);
    expect(within(card).getAllByRole("img")).toHaveLength(1);
    expect(card.querySelector("[data-product-scene] img")?.getAttribute("alt")).toBe("");
    expect(within(card).queryByRole("radio")).toBeNull();
  }
});

it("adds every available variant to the real store and keeps the landing free of the replaced MiniCart without opening the drawer", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><Products products={products} /></CartProvider>);
  const expected: { productId: string; quantity: number }[] = [];
  for (const product of products.filter(product => product.stock > 0)) {
    const card = document.querySelector(`[data-product-id="${product.id}"]`)!;
    fireEvent.click(within(card as HTMLElement).getByRole("button", { name: "Sepete ekle" }));
    expect(within(card as HTMLElement).getByRole("button", { name: "Eklendi ✓" })).toBeDefined();
    expected.push({ productId: product.id, quantity: 1 });
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual(expected);
    expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  }
});

it("disables stock-zero variants without fading or changing the saved cart", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><Products products={products} /></CartProvider>);
  const button = screen.getByRole("button", { name: "Mevcut değil" }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(button);
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toEqual([]);
});

it("preserves a full cart and shows a local stock error without opening the drawer", async () => {
  const [product] = await getProducts();
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: product.id, quantity: product.stock }]));
  render(<CartProvider products={[product]}><Products products={[product]} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(screen.getByRole("alert").textContent).toContain("Stok");
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: product.id, quantity: product.stock }]);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("keeps success feedback for 2400 ms and clears its timer on unmount", async () => {
  const [product] = await getProducts();
  vi.useFakeTimers();
  const view = render(<CartProvider products={[product]}><Products products={[product]} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  act(() => vi.advanceTimersByTime(2399));
  expect(screen.getByRole("button", { name: "Eklendi ✓" })).toBeDefined();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("button", { name: "Sepete ekle" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  const clear = vi.spyOn(globalThis, "clearTimeout");
  view.unmount();
  expect(clear).toHaveBeenCalled();
});

it("does not allow purchases without a readable catalog or a cart provider", async () => {
  const products = await getProducts();
  const view = render(<CartProvider products={null}><Products products={products} /></CartProvider>);
  expect(screen.getAllByRole("button", { name: "Sepete ekle" }).every(button => button.hasAttribute("disabled"))).toBe(true);
  view.unmount();
  render(<Products products={products} />);
  expect(screen.getAllByRole("button", { name: "Sepete ekle" }).every(button => button.hasAttribute("disabled"))).toBe(true);
});

it("retains all content and CTAs in server HTML and reduced-motion mode", async () => {
  const products = await getProducts();
  const html = renderToStaticMarkup(<Products products={products} />);
  expect(html).not.toMatch(/opacity:0|translateY\(26/);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(<CartProvider products={products}><Products products={products} /></CartProvider>);
  expect(screen.getAllByRole("article")).toHaveLength(6);
  expect(document.querySelectorAll('[data-product-reveal][data-reduced-motion="true"]')).toHaveLength(6);
  expect(screen.getAllByRole("button", { name: "Sepete ekle" })).toHaveLength(5);
});

it("uses supplied fractional prices rather than copied proof prices", async () => {
  const [product] = await getProducts();
  render(<Products products={[{ ...product, priceKurus: 198765 }]} />);
  expect(screen.getByLabelText("Fiyat").textContent).toBe("₺1.987,65");
});

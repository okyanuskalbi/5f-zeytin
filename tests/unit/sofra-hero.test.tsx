import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/landing/Hero";
import { CartProvider } from "@/components/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import { getProducts } from "@/lib/catalog/static-products";

const animation = vi.hoisted(() => {
  const controls = { play: vi.fn(), pause: vi.fn(), stop: vi.fn() };
  return { controls, animate: vi.fn(() => controls) };
});
vi.mock("motion/react-mini", async importOriginal => {
  const original = await importOriginal<typeof import("motion/react-mini")>();
  const { useRef } = await import("react");
  return { ...original, useAnimate: () => [useRef(null), animation.animate] };
});
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: ({ open }: { open: boolean }) => open ? <div role="dialog">Sepetim</div> : null }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.clearAllMocks(); });

it("switches between real sizes and adds each selected SKU without opening the drawer", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  const sizes = screen.getByRole("radiogroup", { name: "Boy" });
  expect((within(sizes).getByRole("radio", { name: "10 kg teneke" }) as HTMLInputElement).checked).toBe(true);
  expect(screen.getByLabelText("Seçili boyun fiyatı").textContent).toBe("₺2.200");
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(screen.getByRole("status").textContent).toContain("10 kg sepete eklendi");
  fireEvent.click(within(sizes).getByRole("radio", { name: "1 kg" }));
  expect(screen.getByLabelText("Seçili boyun fiyatı").textContent).toBe("₺220");
  expect(screen.getByRole("status").textContent).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([
    { productId: "sample-green-olive-10kg", quantity: 1 },
    { productId: "sample-green-olive-1kg", quantity: 1 },
  ]);
  expect(screen.getByRole("status").textContent).toContain("1 kg sepete eklendi");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("combobox")).toBeNull();
});

it("reads the supplied catalog price, including fractional amounts", async () => {
  const products = (await getProducts()).map(item => item.id === "sample-green-olive-10kg" ? { ...item, priceKurus: 198765 } : item);
  render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  expect(screen.getByLabelText("Seçili boyun fiyatı").textContent).toBe("₺1.987,65");
});

it("keeps stock errors honest and clears feedback on a size change", async () => {
  const products = (await getProducts()).map(item => ({ ...item, stock: 1 }));
  render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  fireEvent.click(screen.getByRole("button", { name: "Eklendi" }));
  expect(screen.getByRole("alert").textContent).toContain("Stok sınırına ulaştınız");
  expect(screen.queryByRole("button", { name: "Eklendi" })).toBeNull();
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: "sample-green-olive-10kg", quantity: 1 }]);
  fireEvent.click(screen.getByRole("radio", { name: "1 kg" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

it("disables the unavailable variant and retains both section links", async () => {
  const products = (await getProducts()).map(item => item.id === "sample-green-olive-10kg" ? { ...item, stock: 0 } : item);
  render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  expect(screen.getByRole("button", { name: "Ürün şu an mevcut değil" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: "1 kg" }));
  expect(screen.getByRole("button", { name: "Sepete ekle" }).hasAttribute("disabled")).toBe(false);
  expect(screen.getByRole("link", { name: "Ürünleri gör" }).getAttribute("href")).toBe("#urunler");
  expect(screen.getByRole("link", { name: "Tesisimiz" }).getAttribute("href")).toBe("#tesisimiz");
});

it("does not sell a missing variant or unread catalog", async () => {
  const products = (await getProducts()).filter(item => item.id !== "sample-green-olive-10kg");
  const view = render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  expect(screen.getByRole("button", { name: "Ürün şu an mevcut değil" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: "1 kg" }));
  expect(screen.getByRole("button", { name: "Sepete ekle" }).hasAttribute("disabled")).toBe(false);
  view.rerender(<CartProvider products={null}><Hero products={products} /></CartProvider>);
  expect(screen.getByRole("button", { name: "Sepete ekle" }).hasAttribute("disabled")).toBe(true);
});

it("resets the added confirmation after its feedback interval", async () => {
  const products = await getProducts();
  vi.useFakeTimers();
  render(<CartProvider products={products}><Hero products={products} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  act(() => vi.advanceTimersByTime(2400));
  expect(screen.getByRole("button", { name: "Sepete ekle" })).toBeDefined();
  expect(screen.getByRole("status").textContent).toBe("");
});

it("keeps reduced-motion content complete and scrolls without a URL fragment", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const destination = document.createElement("section");
  destination.id = "urunler";
  destination.scrollIntoView = vi.fn();
  document.body.append(destination);
  const replace = vi.spyOn(history, "replaceState");
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Düziçi'nden sofranıza.");
  expect(document.querySelector("[data-hero-intro]")?.getAttribute("data-reduced-motion")).toBe("true");
  expect(animation.animate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("link", { name: "Ürünleri gör" }));
  expect(destination.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
  expect(replace).toHaveBeenCalled();
  expect(window.location.hash).toBe("");
  expect(screen.getByRole("button", { name: "Ürün şu an mevcut değil" })).toBeDefined();
  destination.remove();
});

it("runs the 18-second Ken Burns loop and pauses both decorative animations in hidden tabs", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const view = render(<Hero />);
  expect(animation.animate).toHaveBeenCalledWith("[data-hero-photo]", {
    transform: ["scale(1.02) translateY(0%)", "scale(1.10) translateY(-2%)"],
  }, { duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" });
  expect(animation.animate).toHaveBeenCalledWith("[data-scroll-line]", expect.anything(), expect.objectContaining({ duration: 1.8 }));
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  fireEvent(document, new Event("visibilitychange"));
  expect(animation.controls.pause).toHaveBeenCalledTimes(2);
  view.unmount();
  expect(animation.controls.stop).toHaveBeenCalledTimes(2);
});

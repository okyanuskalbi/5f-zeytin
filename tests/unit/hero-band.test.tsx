import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CartProvider } from "@/components/cart/CartProvider";
import { LazyMotion, domAnimation } from "motion/react";
import { HeroBand } from "@/components/landing/HeroBand";
import { getProducts } from "@/lib/catalog/static-products";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import { motionTokens } from "@/lib/ui-motion";

const scroll = vi.hoisted(() => ({ set: (value: number): void => { void value; } }));
vi.mock("motion/react", async importOriginal => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const { useState } = await import("react");
  return { ...actual, useScroll: vi.fn(() => {
    const [progress] = useState(() => actual.motionValue(0.5));
    scroll.set = value => progress.set(value);
    return { scrollYProgress: progress };
  }) };
});

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it("adds the 10 kg tin and 1 kg jar as separate variants with inline feedback", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}><HeroBand products={products} /></CartProvider>);
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Kışlık kiler için 10 kg teneke.");
  expect(screen.getByLabelText("10 kg teneke fiyatı").textContent).toBe("₺2.200");
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  fireEvent.click(screen.getByRole("button", { name: "1 kg kavanoz" }));
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([
    { productId: "sample-green-olive-10kg", quantity: 1 },
    { productId: "sample-green-olive-1kg", quantity: 1 },
  ]);
  expect(screen.getAllByRole("status").map(node => node.textContent).join(" ")).toMatch(/10 kg sepete eklendi.*1 kg sepete eklendi/);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("uses catalog prices and disables missing or out-of-stock variants", async () => {
  const products = (await getProducts()).map(item => item.weight === "10 kg" ? { ...item, priceKurus: 198765, stock: 0 } : item).filter(item => item.id !== "sample-green-olive-1kg");
  render(<CartProvider products={products}><HeroBand products={products} /></CartProvider>);
  expect(screen.getByLabelText("10 kg teneke fiyatı").textContent).toBe("₺1.987,65");
  expect(screen.getAllByRole("button").every(button => button.hasAttribute("disabled"))).toBe(true);
});

it("keeps stock-limit errors local and resets success feedback", async () => {
  const products = (await getProducts()).map(item => ({ ...item, stock: 1 }));
  vi.useFakeTimers();
  render(<CartProvider products={products}><HeroBand products={products} /></CartProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Sepete ekle" }));
  fireEvent.click(screen.getByRole("button", { name: "Eklendi ✓" }));
  expect(screen.getByRole("alert").textContent).toContain("Stok");
  fireEvent.click(screen.getByRole("button", { name: "1 kg kavanoz" }));
  act(() => vi.advanceTimersByTime(2400));
  expect(screen.getByRole("button", { name: "1 kg kavanoz" })).toBeDefined();
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toHaveLength(2);
});

it("keeps reduced-motion imagery fixed and content visible", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const products = await getProducts();
  const view = render(<CartProvider products={products}><HeroBand products={products} /></CartProvider>);
  expect(view.container.querySelector("[data-band-photo]")?.getAttribute("style") ?? "").not.toMatch(/transform/);
  expect(view.container.querySelector('[style*="opacity:0"], [style*="translate"]')).toBeNull();
  expect(motionTokens.band.parallax).toBeLessThanOrEqual(60);
  expect(screen.getByRole("button", { name: "1 kg kavanoz" })).toBeDefined();
});

it("keeps both missing-size actions disabled without inventing a price", () => {
  render(<CartProvider products={[]}><HeroBand products={[]} /></CartProvider>);
  expect(screen.getByLabelText("10 kg teneke fiyatı").textContent).toBe("—");
  expect(screen.getAllByRole("button").every(button => button.hasAttribute("disabled"))).toBe(true);
});

it("clamps the animated photo to 60px even outside the normal scroll range", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  const view = render(<LazyMotion features={domAnimation}><HeroBand products={[]} /></LazyMotion>);
  const photo = view.container.querySelector<HTMLElement>("[data-band-photo]")!;
  act(() => scroll.set(-1));
  await vi.waitFor(() => expect(photo.style.transform).toBe("translateY(-60px)"));
  act(() => scroll.set(2));
  await vi.waitFor(() => expect(photo.style.transform).toBe("translateY(60px)"));
});

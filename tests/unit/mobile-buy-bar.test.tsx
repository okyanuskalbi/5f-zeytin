import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MobileBuyBar } from "@/components/landing/MobileBuyBar";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

const state = vi.hoisted(() => ({ pathname: "/", reduced: false }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/cart/useCartViewport", () => ({ useCartViewport: () => true }));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: ({ open }: { open: boolean }) => open ? <div role="dialog" aria-modal="true">Sepet</div> : null }));
vi.mock("@/lib/media/use-deferred-enhancement", () => ({ usePrefersReducedMotion: () => state.reduced }));
const product: Product = { id: "sample-green-olive-10kg", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin", weight: "10 kg", priceKurus: 198765, stock: 2 };
const frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
function flushFrames() {
  const pending = [...frames.values()]; frames.clear();
  act(() => pending.forEach(callback => callback(16)));
}
let heroBottom = 800;
let footerBottom = 5000;

function OpenCart() {
  const cart = useCart();
  return <button onClick={event => cart?.openCart(event.currentTarget)}>Çekmeceyi aç</button>;
}
function setup(item = product) {
  return render(<CartProvider products={[item]}><MobileBuyBar product={item} /><OpenCart /></CartProvider>);
}
function scroll(y: number, hero = 0) {
  heroBottom = hero;
  window.scrollY = y;
  fireEvent.scroll(window);
  flushFrames();
}
beforeEach(() => {
  frames.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  state.pathname = "/";
  state.reduced = false;
  heroBottom = 800;
  footerBottom = 5000;
  for (const [key, value] of Object.entries({ innerWidth: 390, innerHeight: 800, scrollY: 0 })) Object.defineProperty(window, key, { configurable: true, writable: true, value });
  const hero = document.createElement("section");
  hero.dataset.heroIntro = "";
  vi.spyOn(hero, "getBoundingClientRect").mockImplementation(() => ({ bottom: heroBottom }) as DOMRect);
  const footer = document.createElement("footer");
  vi.spyOn(footer, "getBoundingClientRect").mockImplementation(() => ({ bottom: footerBottom }) as DOMRect);
  document.body.append(hero, footer);
});
afterEach(() => {
  cleanup();
  document.querySelector("[data-hero-intro]")?.remove();
  document.querySelector("footer")?.remove();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("starts inaccessible in SSR and waits for both the strict 80% threshold and the hero exit", () => {
  expect(renderToStaticMarkup(<MobileBuyBar product={product} />)).toContain('aria-hidden="true"');
  setup();
  const bar = document.querySelector("[data-mobile-buy-bar]")!;
  expect(bar.hasAttribute("inert")).toBe(true);
  scroll(640);
  expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull();
  scroll(641, 1);
  expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull();
  scroll(800);
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBe(bar);
  expect(bar.hasAttribute("inert")).toBe(false);
  scroll(0, 800);
  expect(bar.getAttribute("aria-hidden")).toBe("true");
});

it("shows only at widths up to 900px, including restored scroll positions", () => {
  window.scrollY = 1000;
  heroBottom = -200;
  setup();
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined();
  window.innerWidth = 901;
  fireEvent.resize(window);
  expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull();
  window.innerWidth = 900;
  fireEvent.resize(window);
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined();
});

it("hides at the final 120px of the footer and reappears when scrolling back", () => {
  setup();
  scroll(1000);
  footerBottom = 921;
  fireEvent.scroll(window);
  flushFrames();
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined();
  footerBottom = 920;
  fireEvent.scroll(window);
  flushFrames();
  expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull();
  footerBottom = 1000;
  fireEvent.scroll(window);
  flushFrames();
  expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined();
});

it("hides for the cart drawer", () => {
  setup();
  scroll(1000);
  fireEvent.click(screen.getByRole("button", { name: "Çekmeceyi aç" }));
  expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull();
});

it("observes portal dialogs opening and closing without another scroll", async () => {
  setup();
  scroll(1000);
  const dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.dataset.state = "open";
  act(() => { document.body.append(dialog); });
  await waitFor(() => expect(screen.queryByRole("region", { name: "Hızlı satın alma" })).toBeNull());
  act(() => { dialog.remove(); });
  await waitFor(() => expect(screen.getByRole("region", { name: "Hızlı satın alma" })).toBeDefined());
});

it("adds the supplied product through the shared cart pattern with inline feedback and stock protection", () => {
  setup();
  scroll(1000);
  const bar = screen.getByRole("region", { name: "Hızlı satın alma" });
  expect(bar.textContent).toContain("Doğal Kırma · 10 kg");
  expect(bar.textContent).toContain("₺1.987,65");
  fireEvent.click(within(bar).getByRole("button", { name: "Sepete ekle" }));
  expect(within(bar).getByRole("button", { name: "Eklendi ✓" })).toBeDefined();
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: product.id, quantity: 1 }]);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull();
  fireEvent.click(within(bar).getByRole("button", { name: "Eklendi ✓" }));
  fireEvent.click(within(bar).getByRole("button", { name: "Eklendi ✓" }));
  expect(within(bar).getByRole("alert").textContent).toContain("Stok");
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)[0].quantity).toBe(2);
});

it("preserves the CTA in reduced motion and disables unavailable stock", () => {
  state.reduced = true;
  setup({ ...product, stock: 0 });
  scroll(1000);
  const bar = screen.getByRole("region", { name: "Hızlı satın alma" });
  expect(bar.getAttribute("data-reduced-motion")).toBe("true");
  expect(within(bar).getByRole("button", { name: "Mevcut değil" }).hasAttribute("disabled")).toBe(true);
});

it("omits the reserve and bar when the product is missing", () => {
  render(<MobileBuyBar />);
  expect(document.querySelector("[data-mobile-buy-bar]")).toBeNull();
});

it("retains the mini cart on inner pages", () => {
  state.pathname = "/hesabim";
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: product.id, quantity: 1 }]));
  render(<CartProvider products={[product]}><span>Hesabım</span></CartProvider>);
  expect(screen.getByRole("complementary", { name: "Mini sepet" })).toBeDefined();
});

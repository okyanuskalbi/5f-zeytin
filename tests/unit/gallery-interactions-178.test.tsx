import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { motionValue } from "framer-motion";
import { ProductGroups } from "@/components/landing/ProductGroups";
import { PendantLampRail } from "@/components/ui/pendant-lamp-rail";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import ProductsPage from "@/app/urunler/page";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { v3Image } from "@/lib/media/v3-assets";
import sharp from "sharp";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function pointer(element: HTMLElement, type: string, x: number, y: number, pointerType = "mouse") {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: pointerType } });
  fireEvent(element, event);
}
function rail(scrub: boolean) {
  const viewport = { current: null as HTMLDivElement | null }, track = { current: null as HTMLDivElement | null };
  const x = motionValue(0), action = vi.fn();
  const seek = vi.fn((offset: number) => x.set(-offset));
  render(<PendantLampRail variant="product" label="Test rayı" viewportRef={viewport} trackRef={track} scrub={scrub} x={x} travel={600} onOffsetChange={seek}>
    {[0, 1, 2].map(i => <div data-rail-item={i} key={i}><button onClick={action}>Eylem {i}</button></div>)}
  </PendantLampRail>);
  Object.defineProperty(viewport.current, "clientWidth", { value: 300 });
  [...track.current!.children].forEach((item, i) => Object.defineProperties(item, { offsetLeft: { value: i * 300 }, offsetWidth: { value: 300 } }));
  return { viewport: viewport.current!, action, seek, offset: () => scrub ? Math.max(0, -x.get()) : viewport.current!.scrollLeft };
}
it.each([true, false])("drags all card actions in scrub=%s with mouse, touch and pen, blocks ghost clicks and accepts fresh taps", scrub => {
  for (const type of ["mouse", "touch", "pen"]) {
    const r = rail(scrub), button = screen.getByRole("button", { name: "Eylem 0" });
    pointer(button, "pointerdown", 300, 100, type);
    pointer(r.viewport, "pointermove", 100, 103, type);
    expect(r.offset()).toBe(200);
    pointer(r.viewport, "pointerup", 100, 103, type);
    expect(r.offset()).toBe(300); // reduced motion: nearest card, no velocity projection
    fireEvent.click(button, { detail: 1 });
    expect(r.action).not.toHaveBeenCalled();
    pointer(button, "pointerdown", 100, 100, type);
    pointer(button, "pointerup", 103, 101, type);
    fireEvent.click(button, { detail: 1 });
    expect(r.action).toHaveBeenCalledTimes(1);
    cleanup();
  }
});
it.each([true, false])("keeps vertical intent locked and leaves native page scrolling alone, scrub=%s", scrub => {
  const r = rail(scrub), button = screen.getByRole("button", { name: "Eylem 0" });
  pointer(button, "pointerdown", 100, 100, "touch");
  pointer(r.viewport, "pointermove", 103, 120, "touch");
  pointer(r.viewport, "pointermove", 200, 125, "touch");
  pointer(r.viewport, "pointercancel", 200, 125, "touch");
  expect(r.offset()).toBe(0);
  expect(r.seek).not.toHaveBeenCalled();
});
it.each([true, false])("keeps a touch drag alive when implicit child capture transfers to the viewport, scrub=%s", scrub => {
  const r = rail(scrub);
  const child = screen.getByRole("button", { name: "Eylem 0" });
  for (const [start, end, expected] of [[330, 70, 300], [70, 330, 0]]) {
    pointer(child, "pointerdown", start, 100, "touch");
    const direction = Math.sign(end - start);
    pointer(child, "pointermove", start + direction * 8, 100, "touch");
    // Touch implicitly captures its hit target. setPointerCapture(viewport)
    // releases that child; its lostpointercapture bubbles through the viewport.
    pointer(child, "lostpointercapture", start + direction * 8, 100, "touch");
    pointer(r.viewport, "pointermove", end, 100, "touch");
    expect(r.offset()).toBe(expected === 300 ? 260 : 40);
    pointer(r.viewport, "pointerup", end, 100, "touch");
    expect(r.offset()).toBe(expected);
    expect(child.closest("[data-rail-item]")!.getAttribute("data-rail-active")).toBe(String(expected === 0));
  }
});
it("still cancels when the viewport itself loses pointer capture", () => {
  const r = rail(true);
  pointer(r.viewport, "pointerdown", 330, 100, "touch");
  pointer(r.viewport, "pointermove", 300, 100, "touch");
  pointer(r.viewport, "lostpointercapture", 300, 100, "touch");
  pointer(r.viewport, "pointermove", 70, 100, "touch");
  expect(r.offset()).toBe(30);
  expect(r.viewport.getAttribute("data-rail-dragging")).toBe("false");
});
function QuoteState() { return <output data-testid="quote-state">{useQuoteJourney().productId}</output>; }
async function gallery() {
  const products = await getProducts();
  const result = render(<CartProvider products={products}><QuoteJourneyProvider>
    <ProductGroups /><QuoteState /><section id="toptan" tabIndex={-1}><label>Firma adı<input name="firma" /></label></section>
  </QuoteJourneyProvider></CartProvider>);
  return { ...result, products };
}
it("leaves home scrolling unlocked and sends all products to their standalone page", async () => {
  await gallery();
  const trigger = screen.getByRole("link", { name: "Tüm ürünleri gör" });
  act(() => trigger.focus());
  expect(trigger.getAttribute("href")).toBe("/urunler");
  expect(screen.queryByRole("dialog", { name: "Tüm ürünler" })).toBeNull();
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  expect(document.activeElement).toBe(trigger);
});
it("keeps the shop destination available to navigation without a shared window event", async () => {
  await gallery();
  expect(screen.getByRole("link", { name: "Tüm ürünleri gör" }).getAttribute("href")).toBe("/urunler");
  expect(document.querySelector('[aria-haspopup="dialog"][href="/urunler"]')).toBeNull();
});
it("renders every SKU in the page in image order without a background scroll lock", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await ProductsPage()}</CartProvider>);
  expect([...document.querySelectorAll("[data-product-id]")].map(n => n.getAttribute("data-product-id"))).toEqual(
    [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey)).map(product => product.id));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
});
it("offers real product destinations for quote handoff without changing the home selection", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await ProductsPage()}</CartProvider>);
  for (const product of products) {
    expect(screen.getByRole("link", { name: `Teklife ekle: ${product.name}, ${product.weight}` }).getAttribute("href")).toBe(`/toptan-satis?teklif=${product.id}`);
  }
});
it("keeps the sold-out black olive visible on the page without enabling purchase", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await ProductsPage()}</CartProvider>);
  const gridCard = document.querySelector('[data-product-id="sample-black-olive-1kg"]')!;
  expect(gridCard.querySelector("img")!.getAttribute("src")).toContain("urun-03-siyah-1kg");
  expect((within(gridCard as HTMLElement).getByRole("button", { name: "Mevcut değil" }) as HTMLButtonElement).disabled).toBe(true);
  for (const output of v3Image("urun-03-siyah-1kg").outputs) {
    const stats = await sharp(`public${output.file}`).stats();
    expect(stats.channels[3].mean).toBeGreaterThan(200);
    expect(stats.channels[0].max - stats.channels[0].min).toBeGreaterThan(100);
  }
});
it("keeps cart actions and last quote destination working in the normal page grid", async () => {
  const products = await getProducts();
  render(<CartProvider products={products}>{await ProductsPage()}</CartProvider>);
  const last = screen.getAllByRole("link", { name: /^Teklife ekle:/ }).at(-1)!;
  act(() => last.focus());
  expect(document.activeElement).toBe(last);
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  const card = document.querySelector<HTMLElement>('[data-product-id="sample-green-olive-10kg"]')!;
  fireEvent.click(within(card).getByRole("button", { name: "Sepete ekle" }));
  expect(within(card).getByRole("status").textContent).toContain("sepete eklendi.");
});

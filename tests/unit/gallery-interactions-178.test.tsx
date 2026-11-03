import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { motionValue } from "framer-motion";
import { HorizontalProductGallery } from "@/components/landing/HorizontalProductGallery";
import { PendantLampRail } from "@/components/ui/pendant-lamp-rail";
import { QuoteJourneyProvider, useQuoteJourney } from "@/components/landing/QuoteJourneyProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { v3Image } from "@/lib/media/v3-assets";
import sharp from "sharp";
import { readFileSync } from "node:fs";

vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
vi.mock("@/lib/media/use-gallery-motion", () => ({ useGalleryMotion: () => "native" }));
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); localStorage.clear(); window.location.hash = ""; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
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
    <HorizontalProductGallery products={[...products].reverse()} /><QuoteState /><section id="teklif" tabIndex={-1}>Teklif formu</section>
  </QuoteJourneyProvider></CartProvider>);
  return { ...result, products };
}
it("opens every SKU in gallery order, locks the background, closes with Escape and restores focus and rail position", async () => {
  const { container } = await gallery();
  const rail = screen.getByRole("region", { name: "Ürün galerisi" });
  rail.scrollLeft = 320;
  const ids = [...container.querySelectorAll("[data-gallery-item]")].map(n => n.getAttribute("data-gallery-item"));
  const trigger = screen.getByRole("button", { name: "Tüm ürünler" });
  act(() => trigger.focus()); fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Tüm ürünler" });
  expect([...dialog.querySelectorAll("[data-product-id]")].map(n => n.getAttribute("data-product-id"))).toEqual(ids);
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(document.body.getAttribute("data-scroll-locked")).toBe("1");
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(rail.scrollLeft).toBe(320);
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
});
it("selects the real quote product then closes and navigates to the quote without returning to the gallery", async () => {
  const { products } = await gallery();
  fireEvent.click(screen.getByRole("button", { name: "Tüm ürünler" }));
  const dialog = screen.getByRole("dialog");
  const product = products[0];
  fireEvent.click(within(dialog).getByRole("button", { name: `Teklife ekle: ${product.name}, ${product.weight}` }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(window.location.hash).toBe("#teklif"));
  expect(screen.getByTestId("quote-state").textContent).toBe(product.id);
  expect(document.activeElement).toBe(document.getElementById("teklif"));
});
it("keeps the sold-out black olive image requested in the rail and present in the grid", async () => {
  const { container } = await gallery();
  const card = container.querySelector('[data-product-id="sample-black-olive-1kg"]')!;
  expect(card.querySelector("img")!.getAttribute("loading")).toBe("eager");
  expect((within(card as HTMLElement).getByRole("button", { name: "Mevcut değil" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Tüm ürünler" }));
  const gridCard = screen.getByRole("dialog").querySelector('[data-product-id="sample-black-olive-1kg"]')!;
  expect(gridCard.querySelector("img")!.getAttribute("src")).toBe(card.querySelector("img")!.getAttribute("src"));
  for (const output of v3Image("urun-03-siyah-1kg").outputs) {
    const stats = await sharp(`public${output.file}`).stats();
    expect(stats.channels[3].mean).toBeGreaterThan(200);
    expect(stats.channels[0].max - stats.channels[0].min).toBeGreaterThan(100);
  }
});
it("keeps cart actions working inside the grid and traps Tab at the last control", async () => {
  await gallery();
  fireEvent.click(screen.getByRole("button", { name: "Tüm ürünler" }));
  const dialog = screen.getByRole("dialog");
  const controls = [...dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
  act(() => controls.at(-1)!.focus());
  fireEvent.keyDown(controls.at(-1)!, { key: "Tab" });
  expect(document.activeElement).toBe(controls[0]);
  const card = dialog.querySelector<HTMLElement>('[data-product-id="sample-green-olive-10kg"]')!;
  fireEvent.click(within(card).getByRole("button", { name: "Sepete ekle" }));
  expect(within(card).getByRole("status").textContent).toContain("sepete eklendi.");
});

it("places one shared purchase-style products trigger below the rail and before the footer", async () => {
  const { container } = await gallery();
  const triggers = screen.getAllByRole("button", { name: "Tüm ürünler" });
  expect(triggers).toHaveLength(1);
  const trigger = triggers[0];
  expect(container.querySelector("#kiler")!.contains(trigger)).toBe(false);
  const rail = screen.getByRole("region", { name: "Ürün galerisi" });
  const foot = screen.getByText("6 ambalaj. Aynı üretici.");
  expect(rail.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(trigger.compareDocumentPosition(foot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const purchase = screen.getAllByRole("button", { name: "Sepete ekle" })[0];
  expect(trigger.className).toBe(purchase.className);
});
it("gives the phone toolbar a dark surface and light text, logo and focus", () => {
  const css = readFileSync("components/site/Navbar.module.css", "utf8").split("@media(max-width:767px)")[1];
  expect(css.match(/\.menuToolbar \{([^}]+)\}/)?.[1]).toContain("background:var(--pro-ink)");
  expect(css.match(/\.menuHome \{([^}]+)\}/)?.[1]).toContain("color:var(--pro-paper)");
  expect(css.match(/\.menuClose \{([^}]+)\}/)?.[1]).toContain("color:var(--pro-paper)");
  expect(css).toContain(".menuToolbar :is(a,button):focus-visible");
  expect(readFileSync("components/site/NavbarMenu.tsx", "utf8")).toContain('<BrandLogo tone="dark" className={styles.menuLogo}');
});

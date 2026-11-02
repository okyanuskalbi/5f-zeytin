import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { motionValue } from "framer-motion";
import { PendantLampRail, railGestureIntent, nearestRailOffset } from "@/components/ui/pendant-lamp-rail";
const lifecycle = vi.hoisted(() => ({ stop: vi.fn() }));
vi.mock("framer-motion", async original => ({
  ...await original<typeof import("framer-motion")>(),
  animate: vi.fn(() => ({ stop: lifecycle.stop })),
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  lifecycle.stop.mockClear();
});

function pointer(element: HTMLElement, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: "touch" } });
  fireEvent(element, event);
}

it("a horizontal drag moves the actual rail and suppresses its accidental detail click", () => {
  const { seek, open, viewport } = setup();
  const detail = screen.getByRole("button", { name: "Ürün 1" });
  pointer(detail, "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 80, 104);
  expect(seek).toHaveBeenLastCalledWith(120);
  pointer(viewport, "pointerup", 80, 104);
  fireEvent.click(detail, { detail: 1 });
  expect(open).not.toHaveBeenCalled();
  pointer(detail, "pointerdown", 80, 104);
  pointer(detail, "pointerup", 80, 104);
  fireEvent.click(detail, { detail: 1 });
  expect(open).toHaveBeenCalledWith("bir");
});

it("vertical touch scrolling never seeks the rail or captures a purchase control", () => {
  const { seek, viewport } = setup();
  pointer(screen.getByRole("button", { name: "Ürün 1" }), "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 204, 200);
  pointer(viewport, "pointercancel", 204, 200);
  expect(seek).not.toHaveBeenCalled();
  pointer(screen.getByRole("button", { name: "Sepete ekle 1" }), "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 80, 104);
  expect(seek).not.toHaveBeenCalled();
});

it.each(["Sepete ekle 1", "Teklife ekle 1"])("the first %s tap works after native vertical scrolling cancels the pointer", label => {
  const { seek, cart, quote, viewport } = setup();
  pointer(screen.getByRole("button", { name: "Ürün 1" }), "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 204, 200);
  pointer(viewport, "pointercancel", 204, 200);
  const action = screen.getByRole("button", { name: label });
  pointer(action, "pointerdown", 100, 100);
  pointer(action, "pointerup", 100, 100);
  fireEvent.click(action, { detail: 1 });
  expect(label.startsWith("Sepete") ? cart : quote).toHaveBeenCalledExactlyOnceWith("bir");
  expect(seek).not.toHaveBeenCalled();
});

it("preserves drag ghost-click protection while accepting a new purchase tap", () => {
  const { open, cart, viewport } = setup();
  const detail = screen.getByRole("button", { name: "Ürün 1" });
  pointer(detail, "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 80, 104);
  pointer(viewport, "pointercancel", 80, 104);
  fireEvent.click(detail, { detail: 1 });
  expect(open).not.toHaveBeenCalled();
  pointer(detail, "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 80, 104);
  pointer(viewport, "pointercancel", 80, 104);
  const purchase = screen.getByRole("button", { name: "Sepete ekle 1" });
  pointer(purchase, "pointerdown", 100, 100);
  pointer(purchase, "pointerup", 100, 100);
  fireEvent.click(purchase, { detail: 1 });
  expect(cart).toHaveBeenCalledExactlyOnceWith("bir");
});

it("accepts a new drag after a pending press was released outside the rail or the window blurred", () => {
  const { seek, viewport } = setup();
  const detail = screen.getByRole("button", { name: "Ürün 1" });
  pointer(detail, "pointerdown", 200, 100);
  fireEvent.pointerLeave(viewport);
  pointer(detail, "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 80, 104);
  expect(seek).toHaveBeenLastCalledWith(120);
  fireEvent.blur(window);
  expect(viewport.getAttribute("data-rail-dragging")).toBe("false");
  seek.mockClear();
  pointer(viewport, "pointermove", 40, 104);
  expect(seek).not.toHaveBeenCalled();
  pointer(detail, "pointerdown", 200, 100);
  pointer(viewport, "pointermove", 100, 104);
  expect(seek).toHaveBeenLastCalledWith(100);
});

it("stops finite settling work when the product rail leaves the viewport", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  let visibility: IntersectionObserverCallback | undefined;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { visibility = callback; }
    observe() {} disconnect() {}
  });
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Sonraki ürün" }));
  expect(lifecycle.stop).not.toHaveBeenCalled();
  act(() => visibility?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(lifecycle.stop).toHaveBeenCalled();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("distinguishes a horizontal pull from a tap and native vertical page scroll", () => {
  expect(railGestureIntent(4, 1)).toBe("pending");
  expect(railGestureIntent(16, 4)).toBe("horizontal");
  expect(railGestureIntent(4, 16)).toBe("vertical");
});

it("settles inside the real first/last package bounds without inventing another SKU", () => {
  expect(nearestRailOffset(-200, [0, 280, 560])).toBe(0);
  expect(nearestRailOffset(440, [0, 280, 560])).toBe(560);
  expect(nearestRailOffset(2000, [0, 280, 560])).toBe(560);
  expect(nearestRailOffset(500, [])).toBe(0);
});

function setup({ scrub = true, controlsPlacement = "after" }: { scrub?: boolean; controlsPlacement?: "before" | "after" } = {}) {
  const seek = vi.fn();
  const open = vi.fn();
  const cart = vi.fn(), quote = vi.fn();
  const viewport = { current: null as HTMLDivElement | null };
  const track = { current: null as HTMLDivElement | null };
  render(<PendantLampRail variant="product" label="AFİNA ürünleri" x={motionValue(0)} scrub={scrub} travel={560} controlsPlacement={controlsPlacement}
    viewportRef={viewport} trackRef={track} onOffsetChange={seek}>
    {["bir", "iki", "uc"].map((id, index) => <article key={id} data-rail-item={id}>
      <button type="button" aria-haspopup="dialog" onClick={() => open(id)}>Ürün {index + 1}</button>
      <button type="button" onClick={() => cart(id)}>Sepete ekle {index + 1}</button>
      <button type="button" onClick={() => quote(id)}>Teklife ekle {index + 1}</button>
    </article>)}
  </PendantLampRail>);
  Object.defineProperty(viewport.current, "clientWidth", { value: 300, configurable: true });
  [...track.current!.children].forEach((item, i) => {
    Object.defineProperty(item, "offsetLeft", { value: i * 280, configurable: true });
    Object.defineProperty(item, "offsetWidth", { value: 300, configurable: true });
  });
  return { seek, open, cart, quote, viewport: viewport.current! };
}

it("keyboard navigation moves focus to the actual detail control and leaves purchase controls native", () => {
  const { seek, open } = setup();
  act(() => screen.getByRole("button", { name: "Ürün 1" }).focus());
  fireEvent.keyDown(screen.getByRole("button", { name: "Ürün 1" }), { key: "End" });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Ürün 3" }));
  expect(seek).toHaveBeenLastCalledWith(560);
  fireEvent.click(document.activeElement!);
  expect(open).toHaveBeenCalledWith("uc");
  seek.mockClear();
  fireEvent.keyDown(screen.getByRole("button", { name: "Sepete ekle 3" }), { key: "ArrowLeft" });
  expect(seek).not.toHaveBeenCalled();
});

it.each([true, false])("places one visible navigation group before the products and uses the same SKU offsets (scrub=%s)", scrub => {
  const { seek, viewport } = setup({ scrub, controlsPlacement: "before" });
  const navigation = screen.getByRole("group", { name: "Ürünler arasında gezin" });
  expect(navigation.compareDocumentPosition(viewport) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "Sonraki ürün" })).toHaveLength(1);
  expect((screen.getByRole("button", { name: "Önceki ürün" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Sonraki ürün" }));
  if (scrub) expect(seek).toHaveBeenLastCalledWith(280);
  else { expect(viewport.scrollLeft).toBe(280); expect(seek).not.toHaveBeenCalled(); }
  expect(navigation.textContent).toContain("02 / 03");
  fireEvent.click(screen.getByRole("button", { name: "Sonraki ürün" }));
  expect(navigation.textContent).toContain("03 / 03");
  expect((screen.getByRole("button", { name: "Sonraki ürün" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Önceki ürün" }));
  expect(navigation.textContent).toContain("02 / 03");
});

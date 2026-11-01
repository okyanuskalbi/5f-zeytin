import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LiquidNavbar } from "@/components/ui/liquid-glass-navbar";

const items = [{ label: "Ürünler", href: "/#urunler" }, { label: "İletişim", href: "/#iletisim" }];
let reduced = false;
let enter: IntersectionObserverCallback;
const listeners = new Set<() => void>();
beforeEach(() => {
  reduced = false; listeners.clear();
  vi.stubGlobal("matchMedia", () => ({ get matches() { return reduced; }, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class { constructor(fn: IntersectionObserverCallback) { enter = fn; } observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("ships real navigation links and independent filter IDs with a complete CSS fallback", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<><LiquidNavbar items={items} ariaLabel="Bir" /><LiquidNavbar items={items} ariaLabel="İki" /></>), "text/html");
  expect(doc.querySelectorAll('nav[data-gl="off"]')).toHaveLength(2);
  expect(doc.querySelectorAll('a[href="/#urunler"]')).toHaveLength(2);
  const ids = [...doc.querySelectorAll("filter")].map(el => el.id);
  expect(ids).toHaveLength(2); expect(new Set(ids).size).toBe(2);
  expect(doc.querySelectorAll("button")).toHaveLength(0);
});

it("moves keyboard focus without activating a destination or changing the selected section", () => {
  const onChange = vi.fn();
  render(<LiquidNavbar items={items} onChange={onChange} />);
  const first = screen.getByRole("link", { name: "Ürünler" });
  const last = screen.getByRole("link", { name: "İletişim" });
  first.focus(); fireEvent.keyDown(first, { key: "ArrowRight" });
  expect(document.activeElement).toBe(last);
  expect(onChange).not.toHaveBeenCalled();
  expect(first.getAttribute("aria-current")).toBe("location");
  fireEvent.keyDown(last, { key: "Home" }); expect(document.activeElement).toBe(first);
});

it("does not announce an unrelated current link on interior pages", () => {
  const { container } = render(<LiquidNavbar items={items} active={-1} />);
  expect(container.querySelector("[aria-current]")).toBeNull();
  expect(screen.getAllByRole("link")).toHaveLength(2);
});

it("respects modified-link clicks and removes live motion listeners on unmount", () => {
  const onChange = vi.fn();
  const view = render(<LiquidNavbar items={items} onChange={onChange} />);
  fireEvent.click(screen.getByRole("link", { name: "İletişim" }), { metaKey: true });
  expect(onChange).not.toHaveBeenCalled();
  act(() => { reduced = true; listeners.forEach(fn => fn()); });
  expect(view.container.querySelector("nav")?.getAttribute("data-reduced")).toBe("true");
  expect(view.container.querySelector("nav")?.getAttribute("data-gl")).toBe("off");
  view.unmount(); expect(listeners.size).toBe(0);
});

it("pauses the water driver on hidden documents and frees owned GPU objects when motion is disabled", () => {
  const calls = new Map<string, ReturnType<typeof vi.fn>>();
  const method = (name: string) => {
    if (!calls.has(name)) calls.set(name, vi.fn(() => name.startsWith("create") || name === "getUniformLocation" ? {} : name === "getShaderParameter" || name === "getProgramParameter" ? true : 0));
    return calls.get(name)!;
  };
  const context = new Proxy({}, { get: (_target, key: string) => key === key.toUpperCase() ? 1 : method(key) });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as WebGLRenderingContext);
  let visible: DocumentVisibilityState = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visible);
  const frames = new Map<number, FrameRequestCallback>(); let frame = 0;
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => { frames.set(++frame, fn); return frame; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const view = render(<LiquidNavbar items={items} />);
  act(() => enter([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(frames.size).toBe(1);
  act(() => { const jobs = [...frames.values()]; frames.clear(); jobs.forEach(fn => fn(16)); });
  expect(method("drawArrays")).toHaveBeenCalled();
  act(() => { visible = "hidden"; document.dispatchEvent(new Event("visibilitychange")); });
  expect(frames.size).toBe(0);
  act(() => { reduced = true; listeners.forEach(fn => fn()); });
  expect(method("deleteBuffer")).toHaveBeenCalledOnce();
  expect(method("deleteProgram")).toHaveBeenCalledOnce();
  expect(method("deleteShader")).toHaveBeenCalledTimes(2);
  expect(view.container.querySelector("nav")?.getAttribute("data-gl")).toBe("off");
});

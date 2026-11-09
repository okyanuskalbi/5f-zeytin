import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/link", () => ({ default: ({ onClick, ...props }: ComponentProps<"a">) => <a {...props} onClick={event => {
  onClick?.(event);
  // The fixture commits the router's resulting URL and scroll position below.
  event.preventDefault();
}} /> }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

let headerHeight = 80;
const anchorGap = 16;
const viewportHeight = 900;
const pageHeight = 6000;
const sectionTops = { baslangic: 80, tesisimiz: 1000, urunler: 2000, hakkimizda: 3000, toptan: 4200, iletisim: 5400 };
let position = 0;
let frameId = 0;
let frames: Map<number, FrameRequestCallback>;
let measuredTops: Record<string, number>;

beforeEach(() => {
  route.pathname = "/"; position = 0; frameId = 0; frames = new Map(); headerHeight = 80;
  measuredTops = { ...sectionTops };
  history.replaceState(null, "", "/");
  vi.stubGlobal("innerWidth", 1440);
  vi.stubGlobal("innerHeight", viewportHeight);
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => position);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(pageHeight);
  vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(pageHeight);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(viewportHeight);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("scrollTo", (options: ScrollToOptions) => { position = options.top ?? position; });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const isHeader = this.hasAttribute("data-site-navbar");
    const top = isHeader ? 0 : (measuredTops[this.id] ?? 0) - position;
    const height = isHeader ? headerHeight : 400;
    return { x: 0, y: top, top, bottom: top + height, left: 0, right: 1440, width: 1440, height, toJSON: () => ({}) };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });

function mount() {
  render(<><Navbar /><main>{Object.keys(sectionTops).map(id => <section id={id} key={id} />)}</main><footer>Alt bilgi</footer></>);
}
function flush() {
  act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(0)); });
}
function navigate(name: string, id: keyof typeof sectionTops) {
  const link = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getByRole("link", { name });
  fireEvent.click(link);
  history.replaceState(null, "", link.getAttribute("href")!);
  position = Math.min(pageHeight - viewportHeight, Math.max(0, sectionTops[id] - headerHeight - anchorGap));
  fireEvent(window, new HashChangeEvent("hashchange"));
  fireEvent.scroll(window);
  flush();
  return link;
}
function active() {
  return within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link")
    .filter(link => link.hasAttribute("aria-current"));
}
function scrollTo(y: number) { position = y; fireEvent.scroll(window); flush(); }

it.each([
  ["Hakkımızda", "hakkimizda"], ["Üretim Tesisimiz", "tesisimiz"], ["Ürünler", "urunler"],
  ["Toptan Satış", "toptan"], ["İletişim", "iletisim"],
] as const)("keeps %s current after its native anchor finishes below the fixed desktop header", (name, id) => {
  mount(); flush();
  const link = navigate(name, id);
  expect(active()).toEqual([link]);
  expect(link.getAttribute("aria-current")).toBe("location");
  if (id !== "iletisim") expect(document.getElementById(id)!.getBoundingClientRect().top).toBe(headerHeight + anchorGap);
  fireEvent.resize(window); flush();
  expect(active()).toEqual([link]);
});

it("marks Contact at the document bottom even when the short final section cannot reach the reading line", () => {
  mount(); flush();
  scrollTo(pageHeight - viewportHeight);
  expect(document.getElementById("iletisim")!.getBoundingClientRect().top).toBe(300);
  expect(active().map(link => link.textContent)).toEqual(["İletişim"]);
  expect(active()[0].getAttribute("aria-current")).toBe("location");
});

it("uses the two-pixel document-end tolerance and returns to the visible section when scrolling away", () => {
  mount(); flush();
  scrollTo(pageHeight - viewportHeight - 3);
  expect(active().map(link => link.textContent)).toEqual(["Toptan Satış"]);
  scrollTo(pageHeight - viewportHeight - 2);
  expect(active().map(link => link.textContent)).toEqual(["İletişim"]);
  scrollTo(pageHeight - viewportHeight - 3);
  expect(active().map(link => link.textContent)).toEqual(["Toptan Satış"]);
});

it.each([["hakkimizda", "Hakkımızda"], ["iletisim", "İletişim"]] as const)("resolves a direct #%s arrival against its settled native scroll position", (id, name) => {
  history.replaceState(null, "", `/#${id}`);
  position = Math.min(pageHeight - viewportHeight, sectionTops[id] - headerHeight - anchorGap);
  mount(); flush();
  expect(active().map(link => link.textContent)).toEqual([name]);
});

it("follows manual scrolling after a clicked hash instead of pinning the clicked item", () => {
  mount(); flush();
  navigate("Hakkımızda", "hakkimizda");
  scrollTo(sectionTops.urunler - headerHeight - anchorGap);
  expect(active().map(link => link.textContent)).toEqual(["Ürünler"]);
  expect(location.hash).toBe("#hakkimizda");
  scrollTo(0);
  expect(active().map(link => link.textContent)).toEqual(["Ana Sayfa"]);
});

it("uses the phone header geometry with the same single sixteen-pixel native anchor gap", () => {
  headerHeight = 72; vi.stubGlobal("innerWidth", 390);
  mount(); flush();
  const link = navigate("Ürünler", "urunler");
  expect(document.getElementById("urunler")!.getBoundingClientRect().top).toBe(88);
  expect(active()).toEqual([link]);
});

it("keeps Home current when a short document cannot scroll and Contact has not reached the reading line", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(600);
  vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(600);
  measuredTops.iletisim = 300;
  render(<><Navbar /><main><section id="baslangic" /><section id="iletisim" /></main></>); flush();
  expect(active().map(link => link.textContent)).toEqual(["Ana Sayfa"]);
});

it("does not invent a current Contact destination when the section is absent at document end", () => {
  render(<><Navbar /><main>{Object.keys(sectionTops).filter(id => id !== "iletisim").map(id => <section id={id} key={id} />)}</main></>); flush();
  scrollTo(pageHeight - viewportHeight);
  expect(active().map(link => link.textContent)).toEqual(["Toptan Satış"]);
});

it("does not force Contact on an interior page at its document bottom", () => {
  route.pathname = "/hesabim"; history.replaceState(null, "", "/hesabim");
  position = pageHeight - viewportHeight;
  mount(); flush();
  expect(active()).toEqual([]);
});

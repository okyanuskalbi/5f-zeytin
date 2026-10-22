import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { siteContact } from "@/lib/site/contact";

const state = vi.hoisted(() => ({ pathname: "/", scroll: undefined as undefined | ((value: number) => void) }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("motion/react", async importOriginal => ({
  ...await importOriginal<typeof import("motion/react")>(),
  useScroll: () => ({ scrollY: null }),
  useMotionValueEvent: (_value: unknown, _event: string, callback: (value: number) => void) => { state.scroll = callback; },
}));

beforeEach(() => {
  state.pathname = "/";
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  const hero = document.createElement("section");
  hero.setAttribute("data-hero-intro", "");
  vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ bottom: 900 } as DOMRect);
  document.body.append(hero);
  vi.stubGlobal("ResizeObserver", class { observe(): void {} disconnect(): void {} });
});

afterEach(() => {
  cleanup();
  Object.assign(siteContact, { phone: "", whatsapp: "", email: "" });
  document.querySelector("[data-hero-intro]")?.remove();
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("keeps all four v4 section destinations and the cart control", () => {
  render(<Navbar />);
  for (const [name, href] of [["Ürünler", "/#urunler"], ["Tesisimiz", "/#tesisimiz"], ["Toptan", "/#toptan-iletisim"], ["SSS", "/#sik-sorulanlar"]]) {
    expect(screen.getByRole("link", { name }).getAttribute("href")).toBe(href);
  }
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" }).textContent).toBe("Sepet (0)");
});

it("switches the transparent navigation only after 40px", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("hero");
  act(() => state.scroll?.(40));
  expect(header.getAttribute("data-tone")).toBe("hero");
  act(() => state.scroll?.(41));
  expect(header.getAttribute("data-tone")).toBe("solid");
  act(() => state.scroll?.(450));
  expect(header.getAttribute("data-tone")).toBe("solid");
  act(() => state.scroll?.(0));
  expect(header.getAttribute("data-tone")).toBe("hero");
});

it("restores the solid surface on a scrolled page load and pageshow", () => {
  window.scrollY = 240;
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("solid");
  window.scrollY = 0;
  fireEvent(window, new Event("pageshow"));
  expect(header.getAttribute("data-tone")).toBe("hero");
});

it("keeps interior routes on the solid dark surface while scrolling", () => {
  state.pathname = "/kvkk";
  render(<Navbar />);
  act(() => state.scroll?.(240));
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
});

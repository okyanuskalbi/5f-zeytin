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

it("hides the wholesale navigation destination until contact details exist", () => {
  const view = render(<Navbar />);
  expect(screen.queryByRole("link", { name: /^Toptan$/ })).toBeNull();
  Object.assign(siteContact, { email: "contact@example.com" });
  view.rerender(<Navbar />);
  expect(screen.getByRole("link", { name: /^Toptan$/ }).getAttribute("href")).toBe("/#toptan-iletisim");
});

it("uses the pantry surface on the first scroll, before hero actions reach the header", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("hero");
  act(() => state.scroll?.(1));
  expect(header.getAttribute("data-tone")).toBe("pantry");
  act(() => state.scroll?.(450));
  expect(header.getAttribute("data-tone")).toBe("pantry");
  act(() => state.scroll?.(0));
  expect(header.getAttribute("data-tone")).toBe("hero");
});

it("restores the pantry surface on a scrolled page load and pageshow", () => {
  window.scrollY = 240;
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("pantry");
  window.scrollY = 0;
  fireEvent(window, new Event("pageshow"));
  expect(header.getAttribute("data-tone")).toBe("hero");
});

it("keeps interior routes on the light surface while scrolling", () => {
  state.pathname = "/kvkk";
  render(<Navbar />);
  act(() => state.scroll?.(240));
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("light");
});

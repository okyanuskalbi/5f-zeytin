import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { siteContact } from "@/lib/site/contact";

const state = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));

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

it("keeps corporate section destinations and the cart control", () => {
  render(<Navbar />);
  for (const [name, href] of [["Kurumsal", "/#kurumsal"], ["Ürünlerimiz", "/#urunler"], ["Üretim Tesisimiz", "/#tesisimiz"], ["Toptan Satış", "/#toptan-iletisim"], ["İletişim", "/#iletisim"]]) {
    expect(screen.getByRole("link", { name }).getAttribute("href")).toBe(href);
  }
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" }).textContent).toBe("Sepet (0)");
});

it("keeps the landing navigation on dark glass before and after every scroll threshold", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("glass");
  for (const scrollY of [40, 41, 450, 0]) {
    window.scrollY = scrollY;
    fireEvent.scroll(window);
    expect(header.getAttribute("data-tone")).toBe("glass");
  }
});

it("retains the dark glass surface on a restored landing load and pageshow", () => {
  window.scrollY = 240;
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("glass");
  window.scrollY = 0;
  fireEvent(window, new Event("pageshow"));
  expect(header.getAttribute("data-tone")).toBe("glass");
});

it("keeps interior routes on the solid dark surface while scrolling", () => {
  state.pathname = "/kvkk";
  render(<Navbar />);
  window.scrollY = 240;
  fireEvent.scroll(window);
  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("solid");
});

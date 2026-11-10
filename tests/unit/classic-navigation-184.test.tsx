import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); history.replaceState(null, "", "/"); });

it("renders the seven page destinations on a solid light header with a shop page link and existing cart/account", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("solid");
  expect(within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link").filter(link => !link.closest("details")).map(link => [link.textContent, link.getAttribute("href")])).toEqual([
    ["Ana Sayfa", "/"], ["Ürünler", "/urunler"], ["Hakkımızda", "/hakkimizda"],
    ["Toptan Satış", "/toptan-satis"], ["Bayilik", "/bayilik"], ["Blog", "/blog"], ["İletişim", "/hakkimizda#iletisim"],
  ]);
  expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Online Mağaza" }).getAttribute("href")).toBe("/urunler");
});

it("serves the AFİNA signature footer with the light logo, locality, all destinations, legal links and payment logos", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  expect(doc.querySelector("footer")?.getAttribute("data-surface")).toBe("dark");
  expect(doc.querySelector('img[alt="AFİNA ZEYTİN"]')?.getAttribute("src")).toContain("yatay-dark@");
  expect(doc.body.textContent).toContain("Ellek, Düziçi / Osmaniye");
  expect(doc.body.textContent).toContain("AFİNA Şirketler Topluluğu markasıdır.");
  expect(doc.querySelectorAll('nav[aria-label="Alt menü"] a')).toHaveLength(5);
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect([...doc.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  expect(doc.querySelector('form, [role="switch"], a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
  expect(doc.body.textContent).toContain("©");
});

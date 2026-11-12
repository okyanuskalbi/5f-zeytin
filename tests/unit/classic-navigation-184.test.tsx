import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { StoreHeader as Navbar } from "@/components/storefront/StoreHeader";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); history.replaceState(null, "", "/"); });

// Task208: five section destinations of the one landing page.
it("renders the five section destinations on a solid light header with the existing cart/account", () => {
  render(<Navbar />);
  const header = screen.getByRole("banner");
  expect(header.getAttribute("data-tone")).toBe("solid");
  expect(within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link").map(link => [link.textContent, link.getAttribute("href")])).toEqual([["Ürünler", "/#urunler"], ["Hikâyemiz", "/#hikayemiz"], ["Toptan & Bayilik", "/#toptan-bayilik"], ["Blog", "/#blog"], ["İletişim", "/#iletisim"]]);
  expect(screen.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" })).toBeTruthy();
});

// Task208: three link columns; the corporate column has five section links.
it("serves the AFİNA signature footer with the light logo, all destinations, legal links and payment logos", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  expect(doc.querySelector("footer")?.getAttribute("data-surface")).toBe("dark");
  expect(doc.querySelector('img[alt="AFİNA ZEYTİN"]')?.getAttribute("src")).toContain("yatay-dark@");
  expect(doc.body.textContent).toContain("AFİNA Şirketler Topluluğu markasıdır.");
  expect([...doc.querySelectorAll('nav[aria-label="Alt menü"] a')].map(link => link.getAttribute("href"))).toEqual([
    "/#hikayemiz", "/?sekme=toptan#toptan-bayilik", "/?sekme=bayilik#toptan-bayilik", "/#blog", "/#iletisim",
  ]);
  expect(doc.querySelectorAll('nav[aria-label="Kategoriler"] a')).toHaveLength(5);
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect([...doc.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  expect(doc.querySelector('form, [role="switch"], [data-pill], address')).toBeNull();
  expect(doc.body.textContent).toContain("©");
});

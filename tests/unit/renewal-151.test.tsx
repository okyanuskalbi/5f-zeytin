import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { Navbar } from "@/components/site/Navbar";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
afterEach(cleanup);

it("puts the official brand story and real production facility before the shop", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  const sections = [...doc.querySelectorAll("main > section")].map(section => section.id);
  expect(sections.indexOf("kurumsal")).toBeGreaterThan(-1);
  expect(sections.indexOf("tesisimiz")).toBeLessThan(sections.indexOf("urunler"));
  expect(doc.querySelector("#tesisimiz img")?.getAttribute("src")).toMatch(/tesis-musteri/);
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(6);
  expect(doc.body.textContent).not.toMatch(/400 ton|EN ÇOK ALINAN|aynı gün dönüş/);
  expect(doc.querySelector('a[href="#toptan-iletisim"]')).not.toBeNull();
});

it("offers the customer's six corporate destinations, a shop entry and the existing cart", () => {
  render(<Navbar />);
  const nav = screen.getByRole("navigation", { name: "Ana navigasyon" });
  for (const [name, href] of [["Ana Sayfa", "/"], ["Kurumsal", "/#kurumsal"], ["Üretim Tesisimiz", "/#tesisimiz"], ["Ürünlerimiz", "/#urunler"], ["Toptan Satış", "/#toptan-iletisim"], ["İletişim", "/#iletisim"]]) {
    expect(within(nav).getByRole("link", { name }).getAttribute("href")).toBe(href);
  }
  expect(screen.getByRole("link", { name: "Online Mağaza" }).getAttribute("href")).toBe("/#urunler");
  expect(screen.getByRole("button", { name: "Sepetim, 0 adet" })).toBeDefined();
});

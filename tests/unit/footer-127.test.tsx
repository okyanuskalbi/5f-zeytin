import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { StoreFooter as Footer } from "@/components/storefront/StoreFooter";

// Task208: the corporate column leads to sections of the home page; categories open the products section filtered.
it("keeps every C destination and legal/payment content usable before JavaScript", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  expect([...doc.querySelectorAll("[data-footer-links] h2")].map(heading => heading.textContent)).toEqual(["Ürünler", "Kurumsal", "Yardım"]);
  expect([...doc.querySelectorAll('nav[aria-label="Alt menü"] a')].map(link => link.getAttribute("href"))).toEqual([
    "/#hikayemiz", "/?sekme=toptan#toptan-bayilik", "/?sekme=bayilik#toptan-bayilik", "/#blog", "/#iletisim",
  ]);
  expect([...doc.querySelectorAll('nav[aria-label="Kategoriler"] a')].map(link => link.getAttribute("href"))).toEqual([
    "/?kategori=zeytinyagi#urunler", "/?kategori=zeytin#urunler", "/?kategori=siyah-zeytin#urunler", "/?kategori=yesil-zeytin#urunler", "/?kategori=kirma-zeytin#urunler",
  ]);
  expect([...doc.querySelectorAll('nav[aria-label="Müşteri ve yasal bilgiler"] a')].map(link => link.getAttribute("href"))).toEqual(["/hesabim", "/siparis-takip", "/iade", "/kvkk", "/mesafeli-satis"]);
  expect(doc.querySelectorAll('[aria-label="Güvenli ödeme"] img')).toHaveLength(4);
  expect(doc.querySelector('a[href="#"]')).toBeNull();
  expect(doc.querySelector('input, button, canvas, [data-pill], address')).toBeNull();
});

it("uses named local payment vectors with safe markup and reserved dimensions in the footer's paper pill", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect([...payment.querySelectorAll("img")].map(image => image.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  for (const image of payment.querySelectorAll("img")) {
    expect(image.getAttribute("src")).toBe(`/images/payment/${image.alt.toLowerCase()}${image.alt === "Mastercard" ? "" : "-dark"}.svg`);
    expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    const svg = new DOMParser().parseFromString(readFileSync(`public${image.getAttribute("src")}`, "utf8"), "image/svg+xml");
    expect(svg.documentElement.getAttribute("viewBox")).toBeTruthy();
    expect(svg.querySelector("parsererror, script, foreignObject, image, use")).toBeNull();
    expect([...svg.querySelectorAll("*")].flatMap(node => [...node.attributes]).filter(attribute => !attribute.name.startsWith("xmlns"))
      .some(attribute => /^on/i.test(attribute.name) || /^(?:https?:|data:|javascript:)/i.test(attribute.value))).toBe(false);
  }
});

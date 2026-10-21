import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { Pantry } from "@/components/landing/Pantry";

it("renders the new contentful sections in order with one footer preview note", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect([...doc.querySelectorAll("main > section, main > div > section")].map(section => section.getAttribute("aria-labelledby") ?? section.getAttribute("aria-label"))).toEqual([
    "hero-title", "kiler-title", "Alışveriş bilgileri", "tesisimiz-title", "sss-title",
  ]);
  expect(doc.querySelectorAll("article")).toHaveLength(4);
  expect(doc.querySelectorAll("picture source").length).toBeGreaterThan(5);
  expect(doc.querySelector("#hero-title")?.textContent).toBe("Düziçi’nden sofranıza.");
  expect(doc.body.textContent?.match(/Önizleme: fiyatlar ve görseller temsilidir\./g)).toHaveLength(1);
  expect(doc.body.textContent).not.toMatch(/Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil|Temsili görsel/);
  expect(doc.querySelector("#toptan-iletisim form")).toBeNull();
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
});

it("retains the catalog destination and empty-state content without blank cards", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Pantry families={[]} />);
  expect(doc.querySelector("#urunler")).not.toBeNull();
  expect(doc.querySelector('[role="status"]')?.textContent).toBe("Görüntülenecek ürün bulunmuyor.");
  expect(doc.querySelector("article")).toBeNull();
});

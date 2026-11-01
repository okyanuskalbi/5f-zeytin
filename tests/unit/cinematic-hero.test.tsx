import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { OliveScrollHero } from "@/components/landing/OliveScrollHero";

function serverHero(): Document {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<OliveScrollHero />);
  return doc;
}

it("ships the accepted Flow opening as a responsive poster before JavaScript loads", () => {
  const doc = serverHero();
  const poster = doc.querySelector("#baslangic picture img");
  expect(poster?.getAttribute("src")).toBe("/videos/afina-zeytinlik-poster.webp");
  expect(poster?.getAttribute("width")).toBe("1280");
  expect(poster?.getAttribute("height")).toBe("720");
  expect(poster?.getAttribute("fetchpriority")).toBe("high");
  for (const format of ["avif", "webp"]) {
    expect(doc.querySelector(`picture source[type="image/${format}"][media]`)?.getAttribute("srcset"))
      .toBe(`/videos/afina-zeytinlik-poster.${format} 1280w`);
  }
  expect(doc.querySelector('link[rel="preload"][as="image"]')?.getAttribute("href"))
    .toBe("/videos/afina-zeytinlik-poster.avif");
  expect(doc.querySelector("[data-cinematic-opening][data-cinematic-scene] [data-hero-visual]"))
    .not.toBeNull();
  expect(doc.querySelector("[data-hero-card], [data-frame-sequence]")).toBeNull();
});

it("keeps the official slogan and both real destinations readable without an animation or preloader", () => {
  const doc = serverHero();
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  expect(doc.querySelector('a[href="#urunler"]')?.textContent).toContain("Ürünleri Keşfet");
  expect(doc.querySelector('a[href="#teklif"]')?.textContent).toContain("Kurumsal Teklif Al");
  expect(doc.querySelector("iframe, canvas, [data-preloader]")).toBeNull();
  expect(doc.querySelector("video")?.getAttribute("src")).toBeNull();
  expect(doc.querySelector("video")?.hasAttribute("loop")).toBe(true);
  expect(doc.querySelector("video")?.getAttribute("poster")).toBe("/videos/afina-zeytinlik-poster.avif");
  expect(doc.querySelector("h1")?.getAttribute("style") ?? "").not.toContain("opacity:0");
});

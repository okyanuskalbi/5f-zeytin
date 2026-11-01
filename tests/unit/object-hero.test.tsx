import path from "node:path";
import sharp from "sharp";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { OliveScrollHero } from "@/components/landing/OliveScrollHero";

function serverHero(): Document {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<OliveScrollHero />);
  return doc;
}

it("serves the official slogan and both actual destinations without a product-picker prerequisite", () => {
  const doc = serverHero();
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  expect(doc.querySelector('a[href="#urunler"]')?.textContent).toContain("Ürünleri Keşfet");
  expect(doc.querySelector('a[href="#teklif"]')?.textContent).toContain("Kurumsal Teklif Al");
  expect(doc.querySelector("[data-hero-product]")?.getAttribute("aria-hidden")).toBe("true");
  expect(doc.querySelector("[data-hero-product] img")?.getAttribute("src")).toContain("urun-01-kirma-10kg");
  expect(doc.querySelector("fieldset")).toBeNull();
  expect(doc.querySelector("h1")?.closest('[style*="opacity:0"]')).toBeNull();
  expect(doc.querySelector("#baslangic")?.getAttribute("aria-labelledby")).toBe(doc.querySelector("h1")?.id);
});

it("leaves an independent, persistent action bar outside the three decorative caption bands", () => {
  const doc = serverHero();
  const captions = doc.querySelectorAll("[data-hero-copy] a, [data-hero-beat] button");
  expect(captions).toHaveLength(0);
  expect(doc.querySelectorAll("[data-hero-beat]")).toHaveLength(2);
  expect(doc.querySelector("[data-cinematic-scrub] video")?.getAttribute("src")).toBeNull();
  expect(doc.querySelector("video")?.hasAttribute("autoplay")).toBe(false);
});

it("uses a real transparent near-branch layer independently of the film and semantic copy", async () => {
  const doc = serverHero();
  const branch = doc.querySelector("[data-hero-near-plane]");
  const image = branch?.querySelector("img");
  expect(branch).not.toBeNull();
  expect(branch?.querySelector("h1,a,button")).toBeNull();
  expect(image?.getAttribute("alt")).toBe("");
  expect(image?.getAttribute("aria-hidden")).toBe("true");
  expect(image?.getAttribute("src")).toBe("/images/hero-katman/on-dal-w1200.webp");
  const filename = path.join(process.cwd(), "public", image!.getAttribute("src")!.slice(1));
  const [metadata, stats] = await Promise.all([sharp(filename).metadata(), sharp(filename).stats()]);
  expect(metadata.hasAlpha).toBe(true);
  expect(stats.channels[3].min).toBe(0);
  expect(stats.channels[3].max).toBe(255);
});

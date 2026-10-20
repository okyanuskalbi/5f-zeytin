import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/site/Footer";
import { ProductShowcase } from "@/components/landing/ProductShowcase";

it("replaces the v1 label, stub, product slips and scallops without losing destinations", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<><Hero products={[]} /><ProductShowcase products={[]} /><Footer /></>);
  expect(doc.querySelector("[data-hero-label], [data-hero-card], [data-hero-stub], [data-product-slip], [data-footer-scallop], [data-footer-stamp]")).toBeNull();
  expect(doc.querySelector("h1")?.textContent).toContain("Kökü toprakta.");
  expect(doc.querySelector('a[href="#urunler"]')).not.toBeNull();
  expect(doc.querySelector('a[href="/kvkk"]')).not.toBeNull();
});

it("defines the v2 earth, table and factory palette without the label stripe token", () => {
  const css = readFileSync("app/globals.css", "utf8");
  for (const token of ["--brand-earth: #0d110d", "--brand-ivory: #f6f1e6", "--brand-sand: #ede4d1", "--factory-green: #6ccb3c"]) expect(css).toContain(token);
  expect(css).not.toContain("--label-green");
});

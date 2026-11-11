import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
const source = (path: string) => readFileSync(path, "utf8");
it("gives the native select the shared 48px field sizing and a custom arrow", () => {
  const css = source("components/storefront/quote/QuoteComposer.module.css");
  expect(css).toMatch(/\.field input, \.field select\s*\{[^}]*min-height:48px/);
  expect(css).toMatch(/\.field select\s*\{[^}]*appearance:\s*none/);
  expect(css).toMatch(/\.field select\s*\{[^}]*background-image:/);
});
it.each(["sepet", "giris", "kayit", "kvkk", "iade", "mesafeli-satis", "siparis-takip", "odeme"])("gives %s its own canonical without changing noindex", route => {
  const page = source(`app/${route}/page.tsx`);
  expect(page).toContain(`alternates: { canonical: "/${route}" }`);
  expect(page).toContain("robots: { index: false, follow: false }");
});
it("reserves the empty cart content before hydration", () => {
  expect(source("components/cart/CartExperience.module.css")).toMatch(/\.contents\s*\{[^}]*min-height:\s*320px/);
});

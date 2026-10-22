import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { expect, it } from "vitest";
import { Footer } from "@/components/site/Footer";
import { seller } from "@/lib/site/seller";

const css = postcss.parse(readFileSync("components/site/Footer.module.css", "utf8"));

function declarations(selector: string, media?: string): Record<string, string> {
  const values: Record<string, string> = {};
  css.walkRules(selector, rule => {
    const parent = rule.parent;
    const query = parent?.type === "atrule" ? parent.params : undefined;
    if (query === media) rule.walkDecls(decl => { values[decl.prop] = decl.value; });
  });
  return values;
}

it("places all four columns and three imprint groups in source order without losing content", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
  const brand = doc.querySelector('[aria-labelledby="footer-brand-title"]')!;
  const columns = brand.parentElement!;
  expect([...columns.children].map(node => node.getAttribute("aria-labelledby"))).toEqual([
    "footer-brand-title", "footer-shopping-title", "footer-help-title", "footer-contact-title",
  ]);
  const payment = columns.nextElementSibling!;
  expect(payment.getAttribute("aria-label")).toBe("Güvenli ödeme");
  expect([...payment.querySelectorAll("img")].map(img => img.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  const imprint = payment.nextElementSibling!;
  expect(imprint.children).toHaveLength(3);
  expect(imprint.children[0].textContent).toBe(`${seller.name} · ${seller.taxOffice} VD · VKN ${seller.taxId}`);
  expect([...imprint.children[1].querySelectorAll("a")].map(link => link.getAttribute("href"))).toEqual(["/kvkk", "/mesafeli-satis", "/iade"]);
  expect(imprint.children[2].textContent).toContain("© 2026 AFİNA ZEYTİN");
  expect(doc.body.textContent?.match(/Önizleme: fiyatlar ve görseller temsilidir\./g)).toHaveLength(1);
  expect(doc.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
});

it("preserves all Task 123 text, link destinations and images except the Task 129 brand replacement", () => {
  const parse = (html: string): Document => new DOMParser().parseFromString(html, "text/html");
  const before = parse(readFileSync("tests/e2e/fixtures/footer-123.html", "utf8"));
  const after = parse(renderToStaticMarkup(<Footer />));
  expect(after.querySelector("footer")!.textContent).toBe(before.querySelector("footer")!.textContent);
  const links = (doc: Document) => [...doc.querySelectorAll("a")].map(link => ({
    text: link.textContent, href: link.getAttribute("href"), rel: link.rel, target: link.target,
  }));
  // Only the brand artwork is replaced by Task 129; keep the frozen baseline intact.
  const images = (doc: Document) => [...doc.images]
    .filter(img => !img.closest('a[aria-label="Afina Zeytin ana sayfa"]'))
    .map(img => ({ alt: img.alt, src: img.getAttribute("src") }));
  expect(links(after)).toEqual(links(before));
  expect(images(after)).toEqual(images(before));
  expect(before.querySelector(".columns > .navigation")).not.toBeNull();
});

it("uses the requested compact rhythm and keeps separate mobile and desktop target sizes", () => {
  const tokens = declarations(".footer");
  expect(tokens).toMatchObject({
    "--footer-heading-gap": "14px", "--footer-link-gap": "8px",
    "--footer-link-target": "44px", "padding-block": "56px max(24px, env(safe-area-inset-bottom, 0px))",
  });
  expect(declarations(".heading")).toMatchObject({
    "margin-bottom": "var(--footer-heading-gap)", "font-size": "13px", "font-weight": "600", "text-transform": "uppercase",
  });
  expect(declarations(".column ul")["gap"]).toBe("var(--footer-link-gap)");
  expect(declarations(".link")["min-height"]).toBe("var(--footer-link-target)");
  expect(declarations(".footer", "(min-width: 1024px)")["--footer-link-target"]).toBe("32px");
  expect(declarations(".logo")["height"]).toBe("48px");
  expect(declarations(".logo", "(min-width: 768px)")["height"] ?? declarations(".logo")["height"]).toBe("48px");
  expect(declarations(".signature")["font-size"]).toBe("24px");
  expect(declarations(".signature", "(min-width: 768px)")["font-size"]).toBe("28px");
});

it("defines the phone, tablet and desktop grids with compact payment and imprint rows", () => {
  expect(declarations(".columns")["grid-template-columns"]).toBe("repeat(2, minmax(0, 1fr))");
  expect(declarations(".message")["grid-column"]).toBe("1 / -1");
  expect(declarations(".destination")["grid-column"]).toBe("1 / -1");
  expect(declarations(".columns", "(min-width: 768px)")["grid-template-columns"]).toBe("repeat(3, minmax(0, 1fr))");
  expect(declarations(".columns", "(min-width: 1024px)")).toMatchObject({
    "grid-template-columns": "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)", "gap": "48px",
  });
  expect(declarations(".payment")).toMatchObject({ "margin-top": "32px", "padding-block": "16px" });
  expect(declarations(".imprint")).toMatchObject({ "margin-top": "16px", "gap": "8px", "font-size": "12px" });
  expect(declarations(".imprint", "(min-width: 1024px)")["grid-template-columns"]).toBeTruthy();
  expect(declarations(".notice")["gap"]).toBe("8px");
});

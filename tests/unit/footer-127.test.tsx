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
  const service = columns.nextElementSibling!;
  const form = service.querySelector('form[aria-label="E-postayla teklif taslağı"]')!;
  expect(form).not.toBeNull();
  const payment = service.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect(payment).not.toBeNull();
  expect(payment.contains(form)).toBe(false);
  expect([...payment.querySelectorAll("img")].map(img => img.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  const imprint = service.nextElementSibling!;
  expect(imprint.children).toHaveLength(3);
  expect(imprint.children[0].textContent).toBe(`${seller.name} · ${seller.taxOffice} VD · VKN ${seller.taxId}`);
  expect([...imprint.children[1].querySelectorAll("a")].map(link => link.getAttribute("href"))).toEqual(["/kvkk", "/mesafeli-satis", "/iade"]);
  expect(imprint.children[2].textContent).toContain("© 2026 AFİNA ZEYTİN");
  expect(doc.body.textContent?.match(/Önizleme: fiyatlar ve görseller temsilidir\./g)).toHaveLength(1);
  expect(doc.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
});

it("retains established footer destinations while integrating the requested email action and scoped theme", () => {
  const parse = (html: string): Document => new DOMParser().parseFromString(html, "text/html");
  const before = parse(readFileSync("tests/e2e/fixtures/footer-123.html", "utf8").replace("Kışlık kiler", "Online Mağaza"));
  const after = parse(renderToStaticMarkup(<Footer />));
  const links = (doc: Document) => [...doc.querySelectorAll("a")].map(link => ({
    text: link.textContent, href: link.getAttribute("href"), rel: link.rel, target: link.target,
  }));
  for (const link of links(before)) expect(links(after)).toContainEqual(link);
  expect(after.querySelector("footer")?.getAttribute("data-footer-component")).toBe("Footerdemo");
  expect(after.querySelector("footer")?.getAttribute("data-21st-source")).toBe("26006");
  expect(after.querySelector("footer")?.getAttribute("data-surface")).toBe("light");
  expect(after.querySelector('input[type="email"][required]')).not.toBeNull();
  expect(after.querySelector('form[aria-label="E-postayla teklif taslağı"]')?.textContent).toContain("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
  expect(after.querySelector('button[role="switch"]')?.getAttribute("aria-checked")).toBe("false");
  expect(after.querySelectorAll('a[href="#"]')).toHaveLength(0);
  expect(after.body.textContent).not.toMatch(/Subscribe|Stay Connected|hello@example|Facebook|Twitter|LinkedIn/);
});

it("keeps readable navigation and full touch targets in the object-journey close", () => {
  expect(declarations(".footer")["--footer-link-target"]).toBe("44px");
  expect(Number.parseFloat(declarations(".heading")["font-size"])).toBeGreaterThanOrEqual(16);
  expect(declarations(".heading")["text-transform"]).not.toBe("uppercase");
  expect(declarations(".link")["min-height"]).toBe("var(--footer-link-target)");
  expect(declarations(".footer", "(min-width: 1024px)")["--footer-link-target"] ?? "44px").toBe("44px");
  expect(declarations(".signature")["font-size"]).toMatch(/^clamp\(/);
  expect(declarations(".home")["min-height"]).toBe("44px");
  expect(declarations(".link:focus-visible")["outline"] ?? readFileSync("components/site/Footer.module.css", "utf8")).toContain("2px solid");
});

it("uses four columns on wide screens and keeps payment and legal information reachable", () => {
  expect(declarations(".columns")["grid-template-columns"]).toBe("repeat(2,minmax(0,1fr))");
  expect(declarations(".message")["grid-column"]).toBe("1 / -1");
  expect(declarations(".destination")["grid-column"]).toBe("1 / -1");
  expect(declarations(".columns", "(min-width:1100px)")["grid-template-columns"]).toBe("minmax(0,1.4fr) minmax(0,.7fr) minmax(0,.8fr) minmax(0,1.1fr)");
  expect(declarations(".payment")["display"]).toBe("flex");
  expect(declarations(".imprint")["display"]).toBe("grid");
  expect(Number.parseFloat(declarations(".imprint")["font-size"])).toBeGreaterThanOrEqual(13);
  expect(declarations(".imprint", "(min-width:1100px)")["grid-template-columns"]).toBeTruthy();
  expect(declarations(".notice")["display"]).toBe("grid");
});

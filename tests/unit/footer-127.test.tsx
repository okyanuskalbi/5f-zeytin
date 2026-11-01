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

it("preserves footer content and destinations while selecting the v6 light-surface artwork", () => {
  const parse = (html: string): Document => new DOMParser().parseFromString(html, "text/html");
  const before = parse(readFileSync("tests/e2e/fixtures/footer-123.html", "utf8").replace("Kışlık kiler", "Online Mağaza"));
  const after = parse(renderToStaticMarkup(<Footer />));
  expect(after.querySelector("footer")!.textContent).toBe(before.querySelector("footer")!.textContent);
  const links = (doc: Document) => [...doc.querySelectorAll("a")].map(link => ({
    text: link.textContent, href: link.getAttribute("href"), rel: link.rel, target: link.target,
  }));
  // Preserve the frozen source fixture; only its approved light-surface image
  // choices change in v6. The horizontal home artwork is checked separately.
  const images = (doc: Document) => [...doc.images]
    .filter(img => !img.closest('a[aria-label="Afina Zeytin ana sayfa"]'))
    .map(img => ({ alt: img.alt, src: img.getAttribute("src") }));
  expect(links(after)).toEqual(links(before));
  const v6Sources: Record<string, string> = {
    "/brand/afina-topluluk-dark.svg": "/brand/afina-topluluk.svg",
    "/images/payment/paytr.svg": "/images/payment/paytr-dark.svg",
    "/images/payment/visa.svg": "/images/payment/visa-dark.svg",
    "/images/payment/troy.svg": "/images/payment/troy-dark.svg",
  };
  expect(images(after)).toEqual(images(before).map(image => ({
    ...image, src: image.src ? v6Sources[image.src] ?? image.src : image.src,
  })));
  expect(after.querySelector("footer")?.getAttribute("data-surface")).toBe("light");
  expect(before.querySelector(".columns > .navigation")).not.toBeNull();
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

it("gives the brand close a full row and keeps payment and legal information reachable", () => {
  expect(declarations(".columns")["grid-template-columns"]).toBe("repeat(2, minmax(0, 1fr))");
  expect(declarations(".message")["grid-column"]).toBe("1 / -1");
  expect(declarations(".destination")["grid-column"]).toBe("1 / -1");
  expect(declarations(".columns", "(min-width: 768px)")["grid-template-columns"]).toBe("minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr)");
  expect(declarations(".payment")["display"]).toBe("flex");
  expect(declarations(".imprint")["display"]).toBe("grid");
  expect(Number.parseFloat(declarations(".imprint")["font-size"])).toBeGreaterThanOrEqual(13);
  expect(declarations(".imprint", "(min-width: 1024px)")["grid-template-columns"]).toBeTruthy();
  expect(declarations(".notice")["display"]).toBe("grid");
});

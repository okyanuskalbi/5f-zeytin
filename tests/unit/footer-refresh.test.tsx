import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { expect, it } from "vitest";
import { Footer } from "@/components/site/Footer";
import { TrustStrip } from "@/components/landing/TrustStrip";
import facility from "@/public/images/tesis-v4-manifest.json";

function footerDocument(): Document {
  return new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
}

it("names secure payment without a provider in the four unchanged trust facts", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<TrustStrip />), "text/html");
  expect([...doc.querySelectorAll("li")].map(item => item.textContent)).toEqual([
    "Kendi tesisimizde dolum", "Kargo 2–4 iş günü", "Güvenli Ödeme", "Toptan alım için teklif",
  ]);
  expect(doc.body.textContent).not.toContain("PayTR ile");
});

it("keeps the three navigation columns together beside the complete brand block", () => {
  const doc = footerDocument();
  const brand = doc.querySelector('[aria-labelledby="footer-brand-title"]')!;
  expect(brand.querySelector('img[alt="Afina Zeytin"]')).not.toBeNull();
  expect(brand.textContent?.replace(/\s+/g, " ")).toContain("Kökü toprakta. Yeri sofrada.");
  expect(brand.textContent).toContain("Toprağın sunduğu lezzet, Afina’nın özeniyle.");
  const headings = ["footer-shopping-title", "footer-help-title", "footer-contact-title"].map(id => doc.getElementById(id)!);
  expect(headings.map(node => node.textContent)).toEqual(["Alışveriş", "Yardım", "İletişim"]);
  const navigation = headings[0].parentElement!.parentElement!;
  expect(headings.every(node => node.parentElement!.parentElement === navigation)).toBe(true);
  expect(navigation.contains(brand)).toBe(false);
});

it("puts the small community logo and attribution in one safe external link", () => {
  const doc = footerDocument();
  const links = doc.querySelectorAll<HTMLAnchorElement>('a[href="https://afina.com.tr"]');
  expect(links).toHaveLength(1);
  expect(links[0].target).toBe("_blank");
  expect(links[0].rel.split(/\s+/)).toContain("noopener");
  expect(links[0].textContent).toBe("Bir AFİNA Şirketler Topluluğu markası");
  expect(links[0].querySelectorAll('img[alt="AFİNA Şirketler Topluluğu"]')).toHaveLength(1);
});

it("shows only the four supported payment logos directly on a dark surface", () => {
  const doc = footerDocument();
  const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect(payment.querySelector("p")?.textContent).toBe("Güvenli Ödeme");
  expect([...payment.querySelectorAll("img")].map(image => image.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  const backgrounds: string[] = [];
  postcss.parse(readFileSync("components/site/Footer.module.css", "utf8")).walkRules(rule => {
    if (/\.(?:payment\w*|provider|cards)\b/.test(rule.selector)) {
      rule.walkDecls(/^background(?:-color)?$/, declaration => { backgrounds.push(declaration.value); });
    }
  });
  // White provider/card artwork must never inherit a cream or white plate again.
  for (const background of backgrounds) expect(["none", "transparent", "var(--ink)", "#0A0F0B"]).toContain(background);
  expect(payment.querySelector('[style*="background"]')).toBeNull();
});

it("keeps footer copy and legal metadata above AA contrast on the ink surface", () => {
  const tokens = new Map<string, string>();
  for (const file of ["app/globals.css", "components/site/Footer.module.css"]) {
    postcss.parse(readFileSync(file, "utf8")).walkDecls(/^--/, declaration => { tokens.set(declaration.prop, declaration.value); });
  }
  function luminance(value: string): number {
    const token = value.match(/^var\((--[\w-]+)\)$/);
    if (token) return luminance(tokens.get(token[1])!);
    const channels = value.slice(1).match(/../g)!.map(channel => parseInt(channel, 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const background = luminance("var(--footer-ink)");
  expect(background).toBeLessThan(0.01);
  for (const foreground of ["--footer-copy", "--footer-muted", "--sut", "--brand-gold"]) {
    const contrast = (luminance(`var(${foreground})`) + 0.05) / (background + 0.05);
    expect(contrast, foreground).toBeGreaterThanOrEqual(4.5);
  }
});

it("registers the specified medium tone on the same pinned redacted source", () => {
  expect(facility.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(facility.sourceSha256).toBe("d35378a93dcbad69c0e62d09e2481af8a82bc6298c2526ab4ee55a594728b67d");
  expect(facility.operation).toEqual({ saturation: 0.48, linear: [1.04, 1, 0.95], brightness: 0.96 });
  expect(facility.outputs.map(output => output.file)).toEqual([
    "/images/tesis/tesis-osmaniye-v4-1200.webp", "/images/tesis/tesis-osmaniye-v4-2400.webp",
  ]);
});

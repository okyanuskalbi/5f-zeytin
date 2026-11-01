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

it("keeps the three navigation columns beside the complete brand block in one grid", () => {
  const doc = footerDocument();
  const brand = doc.querySelector('[aria-labelledby="footer-brand-title"]')!;
  expect(brand.querySelector('img[alt="AFİNA ZEYTİN"]')).not.toBeNull();
  expect(brand.textContent?.replace(/\s+/g, " ")).toContain("Kökü toprakta. Yeri sofrada.");
  expect(brand.textContent).toContain("Toprağın sunduğu lezzet, Afina’nın özeniyle.");
  const headings = ["footer-shopping-title", "footer-help-title", "footer-contact-title"].map(id => doc.getElementById(id)!);
  expect(headings.map(node => node.textContent)).toEqual(["Alışveriş", "Yardım", "İletişim"]);
  const navigation = headings[0].parentElement!.parentElement!;
  expect(headings.every(node => node.parentElement!.parentElement === navigation)).toBe(true);
  expect(navigation.contains(brand)).toBe(true);
  expect(navigation.children).toHaveLength(4);
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

it("shows only the four supported payment logos directly on the light pro footer", () => {
  const doc = footerDocument();
  const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
  expect(payment.querySelector("p")?.textContent).toBe("Güvenli Ödeme");
  expect([...payment.querySelectorAll("img")].map(image => image.alt)).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  expect(payment.closest("[data-surface]")?.getAttribute("data-surface")).toBe("light");
  const backgrounds: string[] = [];
  postcss.parse(readFileSync("components/site/Footer.module.css", "utf8")).walkRules(rule => {
    if (/\.(?:payment\w*|provider|cards)\b/.test(rule.selector)) {
      rule.walkDecls(/^background(?:-color)?$/, declaration => { backgrounds.push(declaration.value); });
    }
  });
  // Dark artwork shares the paper footer; payment groups add no separate plate.
  for (const background of backgrounds) expect(["none", "transparent", "var(--footer-ink)", "#E5E3D7"]).toContain(background);
  expect(payment.querySelector('[style*="background"]')).toBeNull();
});

it("keeps both scoped footer themes readable without rewriting global site tokens", () => {
  const globals = new Map<string, string>();
  postcss.parse(readFileSync("app/globals.css", "utf8")).walkDecls(/^--/, declaration => { globals.set(declaration.prop, declaration.value); });
  const sheet = postcss.parse(readFileSync("components/site/Footer.module.css", "utf8"));
  const light = new Map(globals);
  sheet.walkRules(".footer", rule => rule.walkDecls(/^--/, declaration => { light.set(declaration.prop, declaration.value); }));
  const dark = new Map(light);
  sheet.walkRules('.footer[data-surface="dark"]', rule => rule.walkDecls(/^--/, declaration => { dark.set(declaration.prop, declaration.value); }));
  function luminance(value: string, tokens: Map<string, string>): number {
    const token = value.match(/^var\((--[\w-]+)\)$/);
    if (token) return luminance(tokens.get(token[1])!, tokens);
    const channels = value.slice(1).match(/../g)!.map(channel => parseInt(channel, 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  expect(light.get("--footer-ink")).toBe("var(--pro-stone)");
  for (const tokens of [light, dark]) {
    for (const backgroundToken of ["--footer-ink", "--footer-field"]) {
      const background = luminance(`var(${backgroundToken})`, tokens);
      for (const foreground of ["--footer-copy", "--footer-muted", "--footer-accent"]) {
        const text = luminance(`var(${foreground})`, tokens);
        const contrast = (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
        expect(contrast, `${backgroundToken}/${foreground}`).toBeGreaterThanOrEqual(4.5);
      }
    }
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

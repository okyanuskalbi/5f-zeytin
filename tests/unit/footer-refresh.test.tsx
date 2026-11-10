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

it("uses the requested light footer without overriding site tokens", () => {
  const doc = footerDocument();
  expect(doc.querySelector("footer")?.getAttribute("data-surface")).not.toBe("dark");
  const sheet = postcss.parse(readFileSync("components/site/ClassicFooter.module.css", "utf8"));
  const colors = new Map<string, string>();
  sheet.walkRules(".footer", rule => rule.walkDecls(decl => { colors.set(decl.prop, decl.value); }));
  const siteTokens = new Map<string, string>();
  postcss.parse(readFileSync("app/globals.css", "utf8")).walkRules(":root", rule => {
    rule.walkDecls(decl => { if (decl.prop.startsWith("--")) siteTokens.set(decl.prop, decl.value); });
  });
  function resolve(value: string): string {
    const variable = /^var\((--[\w-]+)\)$/.exec(value);
    return variable ? resolve(siteTokens.get(variable[1])!) : value;
  }
  const background = resolve(colors.get("background")!);
  expect(background).toBe("#F5F1E7");
  expect(colors.get("color")).toBe("#172B21");
  function luminance(value: string): number {
    const channels = value.slice(1).match(/../g)!.map(channel => parseInt(channel, 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  expect((luminance(background) + 0.05) / (luminance(colors.get("color")!) + 0.05)).toBeGreaterThanOrEqual(4.5);
  const community = doc.querySelector<HTMLAnchorElement>('a[href="https://afina.com.tr"]')!;
  expect(community.textContent).toBe("AFİNA Şirketler Topluluğu markasıdır.");
  expect(community.target).toBe("_blank");
  expect(community.rel.split(/\s+/)).toContain("noopener");
});

it("registers the specified medium tone on the same pinned redacted source", () => {
  expect(facility.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(facility.sourceSha256).toBe("d35378a93dcbad69c0e62d09e2481af8a82bc6298c2526ab4ee55a594728b67d");
  expect(facility.operation).toEqual({ saturation: 0.48, linear: [1.04, 1, 0.95], brightness: 0.96 });
  expect(facility.outputs.map(output => output.file)).toEqual([
    "/images/tesis/tesis-osmaniye-v4-1200.webp", "/images/tesis/tesis-osmaniye-v4-2400.webp",
  ]);
});

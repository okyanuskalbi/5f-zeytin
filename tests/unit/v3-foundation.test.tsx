import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, statSync } from "node:fs";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { Products } from "@/components/landing/Products";
import { TrustStrip } from "@/components/landing/TrustStrip";

vi.mock("server-only", () => ({}));

it("renders the classic home with the existing private quote form", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect(doc.querySelector("#baslangic h1")?.textContent).toBe("Doğal, Lezzetli, Güvenilir Zeytin");
  expect(doc.body.textContent).not.toMatch(/Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil|Temsili görsel/);
  expect(doc.querySelector('#toptan form[aria-label="Kurumsal teklif talebi"]')?.getAttribute("method")).toBe("post");
  expect(doc.querySelector('#toptan button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "https://afina.com.tr"]) expect(doc.querySelector(`a[href="${href}"]`)).not.toBeNull();
});

it("retains the catalog destination and empty-state content without blank cards", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<Products products={[]} />);
  expect(doc.querySelector("#urunler")).not.toBeNull();
  expect(doc.querySelector('[role="status"]')?.textContent).toBe("Görüntülenecek ürün bulunmuyor.");
  expect(doc.querySelector("article")).toBeNull();
});

it("renders four trust facts with a wholesale destination and decorative gold dots", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<TrustStrip />);
  expect([...doc.querySelectorAll("li")].map(item => item.textContent)).toEqual([
    "Kendi tesisimizde dolum", "Kargo 2–4 iş günü", "Güvenli Ödeme", "Toptan alım için teklif",
  ]);
  expect(doc.querySelector('a[href="/#toptan-iletisim"]')).not.toBeNull();
  expect(doc.querySelectorAll('[data-trust-dot][aria-hidden="true"]')).toHaveLength(4);
});

it("maps page and UI tokens to readable C light defaults and preserved local dark surfaces", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const root = css.match(/:root\s*\{([^}]+)\}/)![1];
  const dark = css.match(/:where\(\[data-surface="dark"\]\)\s*\{([^}]+)\}/)![1];
  const declarations = (source: string) => Object.fromEntries([...source.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
  const tokens = declarations(root);
  const darkTokens = { ...tokens, ...declarations(dark) };
  expect(root).toContain("color-scheme: light;");
  expect(dark).toContain("color-scheme: dark;");
  expect(tokens).toMatchObject({
    "--ink": "#0E1510", "--zeytin": "#1F3324", "--zeytin-2": "#2A4532",
    "--altin": "#D4B483", "--altin-2": "#E6CB97", "--sut": "#F7F3EA", "--gri": "#B9C0B6",
    "--background": "#FAF8F2", "--foreground": "#172B21",
    "--primary": "#88630B", "--primary-foreground": "#FFFFFF",
  });
  expect(darkTokens).toMatchObject({
    "--background": "var(--ink)", "--foreground": "var(--sut)",
    "--primary": "var(--altin)", "--primary-foreground": "var(--ink)",
  });
  function resolve(token: string, palette: Record<string, string>): string {
    const value = palette[token];
    return value.startsWith("var(") ? resolve(value.slice(4, -1), palette) : value;
  }
  function luminance(color: string): number {
    const channels = color.slice(1).match(/../g)!.map(hex => parseInt(hex, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  for (const [surface, palette] of [["light", tokens], ["dark", darkTokens]] as const) for (const [background, foreground] of [
    ["--background", "--foreground"], ["--card", "--card-foreground"], ["--popover", "--popover-foreground"],
    ["--primary", "--primary-foreground"], ["--secondary", "--secondary-foreground"],
    ["--muted", "--muted-foreground"], ["--accent", "--accent-foreground"], ["--destructive", "--destructive-foreground"],
  ]) {
    const values = [luminance(resolve(background, palette)), luminance(resolve(foreground, palette))].sort((a, b) => b - a);
    expect((values[0] + 0.05) / (values[1] + 0.05), `${surface}: ${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
  }
});

it("requests the hero photograph eagerly with reserved geometry and responsive sources", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  const hero = doc.querySelector("#baslangic")!;
  const image = hero.querySelector("img")!;
  expect(image.getAttribute("fetchpriority")).toBe("high");
  expect(image.getAttribute("loading")).toBe("eager");
  expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
  expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
  expect(hero.querySelector('source[type="image/avif"]')?.getAttribute("sizes")).toBeTruthy();
  expect(hero.querySelector("video,canvas")).toBeNull();
  const path = image.getAttribute("src")!;
  expect(statSync(`public${path}`).size).toBeLessThanOrEqual(500000);
});

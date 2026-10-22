import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, statSync } from "node:fs";
import { expect, it } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { Products } from "@/components/landing/Products";
import { TrustStrip } from "@/components/landing/TrustStrip";

it("renders the new contentful sections in order with one footer preview note", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<>{await Home()}<Footer /></>);
  expect([...doc.querySelectorAll("main > section, main > div > section")].map(section => section.getAttribute("aria-labelledby") ?? section.getAttribute("aria-label"))).toEqual([
    "hero-title", "trust-title", "urunler-title", "tesisimiz-title", "kahraman-title", "toptan-title", "sss-title",
  ]);
  expect(doc.querySelectorAll("article[data-product-id]")).toHaveLength(6);
  expect(doc.querySelectorAll("#tesisimiz article")).toHaveLength(3);
  expect(doc.querySelectorAll("picture source").length).toBeGreaterThan(5);
  expect(doc.querySelector("#hero-title")?.textContent).toBe("Düziçi'nden sofranıza.");
  expect(doc.body.textContent?.match(/Önizleme: fiyatlar ve görseller temsilidir\./g)).toHaveLength(1);
  expect(doc.body.textContent).not.toMatch(/Örnek ürünler|Gerçek satış kataloğu|kullanıma açık değil|Temsili görsel/);
  expect(doc.querySelector("#toptan-iletisim form")).toBeNull();
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

it("maps v4 page and UI tokens to readable dark surfaces", () => {
  const root = readFileSync("app/globals.css", "utf8").match(/:root\s*\{([^}]+)\}/)![1];
  const tokens = Object.fromEntries([...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
  expect(tokens).toMatchObject({
    "--ink": "#0E1510", "--zeytin": "#1F3324", "--zeytin-2": "#2A4532",
    "--altin": "#D4B483", "--altin-2": "#E6CB97", "--sut": "#F7F3EA", "--gri": "#B9C0B6",
    "--background": "var(--ink)", "--foreground": "var(--sut)",
    "--primary": "var(--altin)", "--primary-foreground": "var(--ink)",
  });
  function resolve(token: string): string {
    const value = tokens[token];
    return value.startsWith("var(") ? resolve(value.slice(4, -1)) : value;
  }
  function luminance(color: string): number {
    const channels = color.slice(1).match(/../g)!.map(hex => parseInt(hex, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  for (const [background, foreground] of [
    ["--background", "--foreground"], ["--card", "--card-foreground"], ["--popover", "--popover-foreground"],
    ["--primary", "--primary-foreground"], ["--secondary", "--secondary-foreground"],
    ["--muted", "--muted-foreground"], ["--accent", "--accent-foreground"], ["--destructive", "--destructive-foreground"],
  ]) {
    const values = [luminance(resolve(background)), luminance(resolve(foreground))].sort((a, b) => b - a);
    expect((values[0] + 0.05) / (values[1] + 0.05), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
  }
});

it("keeps matching SSR preloads and all hero sources within byte budgets", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  const preloads = [...doc.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')];
  expect(preloads.map(link => link.media)).toEqual([
    "(max-width: 900px)", "(min-width: 901px)", "(max-width: 900px)", "(min-width: 901px)",
  ]);
  expect(preloads.every(link => link.getAttribute("fetchpriority") === "high")).toBe(true);
  const photo = doc.querySelector("[data-hero-photo]")!;
  expect(photo.querySelector("img")?.getAttribute("fetchPriority")).toBe("high");
  expect(photo.querySelector("source")?.getAttribute("media")).toBe("(max-width: 900px)");
  const manifest = JSON.parse(readFileSync("public/images/v3/manifest.json", "utf8"));
  for (const [key, budget] of [["hero-masaustu", 180000], ["hero-mobil", 120000]] as const) {
    for (const output of manifest.assets[key].outputs) expect(statSync(`public${output.file}`).size).toBeLessThanOrEqual(budget);
  }
});

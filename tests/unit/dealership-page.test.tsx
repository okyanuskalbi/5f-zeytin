import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { parse } from "postcss";
import { afterEach, expect, it, vi } from "vitest";
import { DealershipPage } from "@/components/dealership/DealershipPage";

vi.mock("@/components/dealership/DealershipForm", () => ({
  DealershipForm: () => <form aria-label="Bayilik başvurusu"><button type="submit">Başvuru E-postasını Hazırla</button></form>,
}));

afterEach(cleanup);

const pageCss = parse(readFileSync("components/dealership/DealershipPage.module.css", "utf8"));
const classicCss = parse(readFileSync("components/landing/ClassicHome.module.css", "utf8"));

function declarations(css: ReturnType<typeof parse>, selector: string, viewport: number): Record<string, string> {
  const values: Record<string, string> = {};
  css.walkRules(selector, rule => {
    const parent = rule.parent;
    if (parent?.type === "atrule" && parent.name === "media") {
      const maximum = parent.params.match(/max-width:\s*(\d+)px/);
      if (!maximum || viewport > Number(maximum[1])) return;
    }
    rule.walkDecls(declaration => { values[declaration.prop] = declaration.value; });
  });
  return values;
}

function trackRatios(template: string): number[] {
  const expanded = template.replace(/repeat\((\d+),minmax\(0,([\d.]+)fr\)\)/g, (_, count, weight) => Array(Number(count)).fill(`minmax(0,${weight}fr)`).join(" "));
  return [...expanded.matchAll(/([\d.]+)fr/g)].map(match => Number(match[1]));
}

it("introduces dealership with one H1 and working application and product anchors", () => {
  const { container } = render(<DealershipPage />);
  expect(screen.getAllByRole("heading", { level: 1 }).map(node => node.textContent)).toEqual(["Bayimiz Olun"]);
  expect(screen.getByText("AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Başvuru Formu" }).getAttribute("href")).toBe("#basvuru");
  expect(screen.getByRole("link", { name: "Ürünleri İncele" }).getAttribute("href")).toBe("/#urunler");
  expect(container.querySelector("header, footer")).toBeNull();
  expect(container.querySelector("video, canvas")).toBeNull();
});

it("offers a sharp orchard hero at tablet and desktop widths and keeps the branch on phones", () => {
  const { container } = render(<DealershipPage />);
  const picture = container.querySelector('section[aria-labelledby="bayilik-title"] picture')!;
  const mobile = picture.querySelector('source[media="(max-width: 767px)"][type="image/avif"]');
  expect(mobile?.getAttribute("srcset")).toContain("/images/klasik/zeytin-dali-800.avif 800w");
  const desktop = picture.querySelector('source:not([media])[type="image/avif"]');
  expect(desktop?.getAttribute("srcset")).toContain("/images/klasik/zeytinlik-1880.avif 1880w");
  expect(picture.querySelector("img")?.getAttribute("src")).toContain("/images/klasik/zeytinlik-");
});

it.each([1440, 768, 390])("keeps the 3 L tin at least ninety percent of the jar height without overflowing at %ipx", viewport => {
  render(<DealershipPage />);
  const section = within(screen.getByRole("region", { name: "Neden AFİNA ZEYTİN?" }));
  const images = section.getAllByRole("img");
  const container = declarations(classicCss, ".container", viewport);
  const outerWidth = Math.min(viewport - Number(container.width.match(/-\s*(\d+)px/)![1]), parseFloat(container["max-width"]));
  const facts = declarations(pageCss, ".factsGrid", viewport);
  const columns = trackRatios(facts["grid-template-columns"]);
  const packageWidth = (outerWidth - (columns.length - 1) * parseFloat(facts.gap)) / columns.length;
  const packaging = declarations(pageCss, ".packaging", viewport);
  const tracks = trackRatios(packaging["grid-template-columns"]);
  const availableWidth = packageWidth - (tracks.length - 1) * parseFloat(packaging.gap);
  const widths = tracks.map(ratio => availableWidth * ratio / tracks.reduce((sum, value) => sum + value, 0));
  const height = declarations(pageCss, ".packaging picture", viewport).height;
  const clamp = height.match(/clamp\((\d+)px,([\d.]+)vw,(\d+)px\)/);
  const maximumHeight = clamp ? Math.max(Number(clamp[1]), Math.min(viewport * Number(clamp[2]) / 100, Number(clamp[3]))) : parseFloat(height);
  const heights = images.map((image, index) => Math.min(maximumHeight, widths[index] * Number(image.getAttribute("height")) / Number(image.getAttribute("width"))));
  expect(heights[0] / heights[1]).toBeGreaterThanOrEqual(.9);
  expect(widths.reduce((sum, value) => sum + value, 0) + (tracks.length - 1) * parseFloat(packaging.gap)).toBeLessThanOrEqual(packageWidth + .01);
});

it("shows the three specified business profiles with their descriptions", () => {
  render(<DealershipPage />);
  const section = within(screen.getByRole("region", { name: "Kimler başvurabilir?" }));
  expect(section.getAllByRole("article")).toHaveLength(3);
  for (const title of ["Market ve şarküteriler", "Kuruyemiş ve yöresel ürün dükkânları", "Toptancı ve distribütörler"]) {
    expect(section.getByRole("heading", { name: title })).toBeTruthy();
  }
  for (const description of [
    "Rafında yöresel zeytin ve zeytinyağı bulundurmak isteyen işletmeler.",
    "Ambalajlı zeytin ve zeytinyağı satan dükkânlar.",
    "Bölgesindeki satış noktalarına ürün ulaştıran firmalar.",
  ]) expect(section.getByText(description)).toBeTruthy();
});

it("pairs only verified production and packaging facts with the current product cutouts", () => {
  const { container } = render(<DealershipPage />);
  const section = within(screen.getByRole("region", { name: "Neden AFİNA ZEYTİN?" }));
  for (const fact of ["Kendi tesisimizde hazırlanır", "Ellek zeytini, geleneksel doğal kırma", "3 L teneke, 1 kg kavanoz ve zeytinyağı seçenekleri", "Koli bazında sipariş"]) {
    expect(section.getByText(fact)).toBeTruthy();
  }
  expect(section.getByText("Osmaniye Düziçi")).toBeTruthy();
  const images = section.getAllByRole("img");
  expect(images.map(image => image.getAttribute("src"))).toEqual([
    "/images/v3/urun-01-kirma-10kg-h300.webp",
    "/images/v3/urun-02-kirma-1kg-h300.webp",
    "/images/v3/urun-04-yag-1l-h300.webp",
  ]);
  for (const image of images) {
    expect(image.getAttribute("width")).toBeTruthy();
    expect(image.getAttribute("height")).toBeTruthy();
    expect(image.getAttribute("loading")).toBe("lazy");
  }
  expect(container.textContent).not.toMatch(/₺|fiyat|indirim|kâr marjı|bölge sözü|sertifika|Türkiye geneli|başvurunuz alındı/i);
});

it("explains the application in a real three-step ordered list", () => {
  render(<DealershipPage />);
  const section = within(screen.getByRole("region", { name: "Başvuru nasıl ilerler?" }));
  const list = section.getByRole("list");
  expect(list.tagName).toBe("OL");
  const steps = within(list).getAllByRole("listitem");
  expect(steps).toHaveLength(3);
  expect(steps.map(step => within(step).getByRole("heading").textContent)).toEqual([
    "Formu doldurun", "Size dönüş yapalım", "Koşulları birlikte belirleyelim",
  ]);
  expect(steps.map(step => step.querySelector("p")?.textContent)).toEqual([
    "Firma ve bölge bilgilerinizi bize iletin.",
    "Başvurunuzu inceledikten sonra sizinle iletişime geçeriz.",
    "Ürün, miktar ve sevkiyat planını birlikte netleştiririz.",
  ]);
});

it("provides the named application anchor and composes the separate form", () => {
  render(<DealershipPage />);
  const section = screen.getByRole("region", { name: "Bayilik Başvuru Formu" });
  expect(section.id).toBe("basvuru");
  expect(within(section).getByRole("form", { name: "Bayilik başvurusu" })).toBeTruthy();
  expect(within(section).getByText(/e-posta taslağı/i)).toBeTruthy();
});

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DealershipPage } from "@/components/dealership/DealershipPage";

vi.mock("@/components/dealership/DealershipForm", () => ({
  DealershipForm: () => <form aria-label="Bayilik başvurusu"><button type="submit">Başvuru E-postasını Hazırla</button></form>,
}));

afterEach(cleanup);

it("introduces dealership with one H1 and working application and product anchors", () => {
  const { container } = render(<DealershipPage />);
  expect(screen.getAllByRole("heading", { level: 1 }).map(node => node.textContent)).toEqual(["Bayimiz Olun"]);
  expect(screen.getByText("AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Başvuru Formu" }).getAttribute("href")).toBe("#basvuru");
  expect(screen.getByRole("link", { name: "Ürünleri İncele" }).getAttribute("href")).toBe("/#urunler");
  expect(container.querySelector("header, footer")).toBeNull();
  expect(container.querySelector("video, canvas")).toBeNull();
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

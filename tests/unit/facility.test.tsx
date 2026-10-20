import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Facility } from "@/components/landing/Facility";

const source = readFileSync("docs/referans/icerik.md", "utf8");
const story = source.split("### Marka hikâyesi / detay sayfası tanıtımı\n\n")[1]
  .split("\n\n###")[0].trim().split("\n\n");
const description = source.split("### KISA MARKA TANIMI / WEB SİTESİ KARTI\n\n")[1].split("\n\n")[0];

afterEach(cleanup);

it("sets the exact second official paragraph as the lead and preserves the official short definition", () => {
  render(<Facility />);
  const facility = screen.getByRole("region", { name: "Tesisimiz" });
  expect(within(facility).getByRole("heading", { name: "Tesisimiz", level: 2 })).toBeDefined();
  expect(facility.querySelector("[data-facility-lead]")?.textContent).toBe(story[1]);
  expect(facility.querySelector("[data-facility-definition]")?.textContent).toBe(description);
  expect(description.split(/\s+/).length).toBeLessThanOrEqual(35);
  expect(facility.textContent?.replace(/\s/g, "")).toContain(story[0].replace(/\s/g, ""));
});

it("pairs all four official/plate facts with semantic labels and includes an accessible regional map", () => {
  render(<Facility />);
  const facility = screen.getByRole("region", { name: "Tesisimiz" });
  expect([...facility.querySelectorAll("dt")].map(node => node.textContent))
    .toEqual(["Konum", "Ürünler", "Satış", "Faaliyet"]);
  expect([...facility.querySelectorAll("dd")].map(node => node.textContent))
    .toEqual(["Ellek, Düziçi / Osmaniye", "Sofralık zeytin, salamura zeytin, zeytinyağı", "Perakende + toptan", "2021’den bu yana"]);
  const map = within(facility).getByRole("img", { name: "Osmaniye il sınırı ve Düziçi" });
  expect(map.querySelectorAll("path")).toHaveLength(1);
  expect(map.querySelectorAll("circle")).toHaveLength(1);
});

it("renders a complete typographic section without unapproved photography or placeholders", () => {
  render(<Facility />);
  const facility = screen.getByRole("region", { name: "Tesisimiz" });
  expect(facility.querySelector("img, picture, source, video, canvas, image, iframe")).toBeNull();
  expect(facility.textContent).not.toMatch(/görsel.*(yakında|hazırlanıyor)|%\s*100|sertifikalı|lider/i);
  expect(within(facility).getByRole("link", { name: "Ürünlerimizi Keşfedin" }).getAttribute("href")).toBe("#urunler");
  expect(within(facility).getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" }).getAttribute("href")).toBe("#toptan-iletisim");
});

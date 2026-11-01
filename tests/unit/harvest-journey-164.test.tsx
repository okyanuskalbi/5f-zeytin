import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { HarvestJourney } from "@/components/landing/HarvestJourney";

vi.mock("@/components/media/CinematicScrub", () => ({ CinematicScrub: () => <div data-test-poster="" /> }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("keeps the full origin, real facility and table story readable before JavaScript", () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(<HarvestJourney />);
  expect(doc.querySelector("[data-harvest-journey]")?.getAttribute("data-mode")).toBe("native");
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe("Kökü toprakta. Yeri sofrada.");
  for (const id of ["baslangic", "kurumsal", "tesisimiz", "uretim-yolculugu"]) expect(doc.getElementById(id)).not.toBeNull();
  expect(doc.querySelector("#tesisimiz address")?.textContent).toContain("Osmaniye");
  expect(doc.querySelector("#uretim-yolculugu img")?.getAttribute("src")).toContain("urun-");
  expect(doc.querySelectorAll('[inert], [hidden]')).toHaveLength(0);
  expect(doc.querySelector('a[href="#urunler"]')).not.toBeNull();
  expect(doc.querySelector('a[href="#teklif"]')).not.toBeNull();
});

it("lets keyboard focus reach the matching scene even after reverse scrolling", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: !query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  const scrollTo = vi.fn(); vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("innerHeight", 900); vi.stubGlobal("scrollY", 0);
  const view = render(<HarvestJourney />);
  const journey = view.container.querySelector<HTMLElement>("[data-harvest-journey]")!;
  Object.defineProperty(journey, "clientHeight", { value: 5400 });
  vi.spyOn(journey, "getBoundingClientRect").mockReturnValue({ top: 0, height: 5400 } as DOMRect);
  expect(journey.dataset.mode).toBe("cinematic");
  fireEvent.focus(screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 4050, behavior: "instant" });
  fireEvent.focus(screen.getByRole("link", { name: "Ürünleri Keşfet" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
});

it("does not reposition normal document focus in the reduced-motion experience", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  const scrollTo = vi.fn(); vi.stubGlobal("scrollTo", scrollTo);
  render(<HarvestJourney />);
  act(() => screen.getByRole("link", { name: "Sofranız için ürünleri keşfedin" }).focus());
  expect(scrollTo).not.toHaveBeenCalled();
});

import { readFile } from "node:fs/promises";
import { act, render, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/landing/Hero";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function scene(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-layer="products"], [data-layer="branch"]')];
}

it("orders decorative planes around semantic copy and keeps the purchase card above them", () => {
  render(<Hero />);
  expect([...document.querySelectorAll("[data-layer], [data-hero-copy], [data-hero-card]")].map(node =>
    node.getAttribute("data-layer") ?? (node.hasAttribute("data-hero-copy") ? "copy" : "card"),
  )).toEqual(["plate", "copy", "products", "branch", "card"]);
  for (const layer of document.querySelectorAll("[data-layer]")) {
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    for (const image of layer.querySelectorAll("img")) expect(image.alt).toBe("");
  }
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Düziçi'nden sofranıza.");
  expect(screen.queryByText("KAYDIR")).toBeNull();
  expect(document.querySelector("[data-scroll-hint], [data-scroll-line]")).toBeNull();
});

it("loads above-fold products and their reveal-gating branch eagerly at high priority", () => {
  render(<Hero />);
  const images = scene().flatMap(layer => [...layer.querySelectorAll("img")]);
  expect(images).toHaveLength(3);
  for (const image of images) {
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
    fireEvent.load(image);
    if (image !== images.at(-1)) expect(scene().every(layer => layer.dataset.ready === "false")).toBe(true);
  }
  expect(scene().every(layer => layer.dataset.ready === "true")).toBe(true);
});

it.each([0, 1, 2])("keeps the complete plate if enhancement image %i fails, including a late failure", failing => {
  render(<Hero />);
  const images = scene().flatMap(layer => [...layer.querySelectorAll("img")]);
  expect(images).toHaveLength(3);
  images.forEach(image => fireEvent.load(image));
  fireEvent.error(images[failing]);
  images.forEach(image => fireEvent.load(image));
  expect(scene().every(layer => layer.dataset.ready === "false")).toBe(true);
  expect(document.querySelector('[data-layer="plate"] img')).not.toBeNull();
});

it("recognizes cached layers that finished before hydration", async () => {
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(720);
  render(<Hero />);
  await waitFor(() => expect(scene().every(layer => layer.dataset.ready === "true")).toBe(true));
});

it("waits for image decoding and hides both planes on a decode failure", async () => {
  render(<Hero />);
  const images = scene().flatMap(layer => [...layer.querySelectorAll("img")]);
  let finish!: () => void;
  images[2].decode = () => new Promise(resolve => { finish = resolve; });
  images.forEach(image => fireEvent.load(image));
  expect(scene().every(layer => layer.dataset.ready === "false")).toBe(true);
  await act(async () => finish());
  expect(scene().every(layer => layer.dataset.ready === "true")).toBe(true);
  images[0].decode = () => Promise.reject(new Error("decode failed"));
  await act(async () => fireEvent.load(images[0]));
  expect(scene().every(layer => layer.dataset.ready === "false")).toBe(true);
});

it("retains a complete static composition without inline transforms in reduced motion", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(<Hero />);
  const planes = [...document.querySelectorAll<HTMLElement>("[data-layer], [data-hero-copy]")];
  expect(planes).toHaveLength(4);
  scene().flatMap(layer => [...layer.querySelectorAll("img")]).forEach(image => fireEvent.load(image));
  expect(scene().every(layer => layer.dataset.ready === "true")).toBe(true);
  expect(planes.every(layer => !layer.style.transform && layer.style.opacity !== "0.2")).toBe(true);
  const css = await readFile("components/landing/SofraHero.module.css", "utf8");
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  expect(css).toMatch(/transform:\s*none\s*!important/);
});

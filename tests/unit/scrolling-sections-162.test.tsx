import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { ProductionStory } from "@/components/landing/ProductionStory";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

vi.mock("@/lib/catalog/read", async () => {
  const { getProductFamilies } = await import("@/lib/catalog/static-products");
  return { readProductFamilies: getProductFamilies };
});

it("changes the held scene and its chapter marker together, and disconnects its observer", () => {
  let notify: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: !query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = disconnect;
  });
  const view = render(<ProductionStory />);
  expect(view.container.querySelector("#uretim-yolculugu")?.getAttribute("data-story-mode")).toBe("sticky");
  const last = view.container.querySelector("#hikaye-sofra")!;
  act(() => notify!([{ target: last, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(view.container.querySelector("[data-story-active]")?.getAttribute("data-story-active")).toBe("hikaye-sofra");
  expect(screen.getByRole("link", { name: "Sofranız" }).getAttribute("aria-current")).toBe("step");
  expect(screen.getByRole("link", { name: "Toprağımız" }).hasAttribute("aria-current")).toBe(false);
  fireEvent.click(screen.getByRole("link", { name: "Üretimimiz" }));
  expect(view.container.querySelector("[data-story-active]")?.getAttribute("data-story-active")).toBe("hikaye-uretim");
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it.each(["phone", "reduced", "observer-unavailable"])("retains all three readable figures in natural flow for %s", mode => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? mode === "reduced" : mode !== "phone",
    addEventListener() {}, removeEventListener() {},
  }));
  vi.stubGlobal("IntersectionObserver", mode === "observer-unavailable" ? undefined : class {
    observe() {} unobserve() {} disconnect() {}
  });
  const { container } = render(<ProductionStory />);
  expect(container.querySelector("#uretim-yolculugu")?.getAttribute("data-story-mode")).toBe("native");
  expect(container.querySelectorAll("[data-story-chapter] figure img")).toHaveLength(3);
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
});

it("provides the origin, real producer and table story before the catalog without JavaScript", async () => {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = renderToStaticMarkup(await Home());
  const ids = [...doc.querySelectorAll("main section[data-sc-scene]")].map(section => section.id);
  expect(ids.indexOf("uretim-yolculugu")).toBeLessThan(ids.indexOf("urunler"));
  const story = doc.getElementById("uretim-yolculugu")!;
  expect(doc.getElementById("tesisimiz")?.querySelector("address")?.textContent).toContain("Osmaniye");
  expect(story.querySelector("h2")?.textContent).toBe("Yeri sofrada.");
  expect(story.querySelector("img")?.getAttribute("alt")).toBeTruthy();
  expect(story.querySelector('a[href="#urunler"]')).not.toBeNull();
  expect(doc.querySelectorAll("[data-product-id]")).toHaveLength(6);
  expect(doc.querySelector("#iletisim h2")?.textContent).toBeTruthy();
  expect(doc.getElementById("iletisim")?.textContent).toContain("Sofrada görüşürüz.");
});

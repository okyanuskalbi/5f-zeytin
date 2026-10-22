import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useRef, useState } from "react";
import postcss from "postcss";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CartProvider } from "@/components/cart/CartProvider";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { getProducts } from "@/lib/catalog/static-products";
import { motionTokens } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";

const animation = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn() }));
vi.mock("motion/react-mini", () => ({ useAnimate: () => [useRef(null), animation.animate] }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
let reduced = true;
let width = 1440;

beforeEach(() => {
  reduced = true; width = 1440;
  animation.animate.mockReset().mockImplementation(() => Object.assign(Promise.resolve(), animation));
  animation.stop.mockClear();
  vi.stubGlobal("matchMedia", (query: string) => Object.assign(new EventTarget(), {
    media: query, matches: query.includes("767px") ? width < 768 : reduced,
  }));
});
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

function Detail({ products, initialId }: { products: readonly ProductVariant[]; initialId: string }) {
  const [id, setId] = useState(initialId);
  return <CartProvider products={products}><ProductDetail product={products.find(product => product.id === id)!}
    products={products} onSelect={setId} onClose={() => {}} onRestoreFocus={() => {}} /></CartProvider>;
}

async function mount(id = "sample-green-olive-10kg") {
  render(<Detail products={await getProducts()} initialId={id} />);
  const dialog = screen.getByRole("dialog");
  return { dialog, image: dialog.querySelector<HTMLElement>("[data-product-detail-image]")! };
}

const positions = [
  ["sample-green-olive-10kg", "90% center"],
  ["sample-green-olive-1kg", "80% center"],
  ["sample-black-olive-1kg", "85% center"],
  ["sample-olive-oil-1l", "80% center"],
  ["sample-olive-oil-5l", "90% center"],
  ["sample-brined-green-olive-5kg", "90% center"],
] as const;

it.each(positions)("keeps studio centered and focuses the scene's product for %s", async (id, position) => {
  const { dialog, image } = await mount(id);
  expect(image.style.getPropertyValue("--product-image-position")).toBe("center");
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  expect(image.style.getPropertyValue("--product-image-position")).toBe(position);
  expect(image.querySelector("img")!.getAttribute("src")).toContain("sahne");
  fireEvent.click(within(dialog).getByRole("button", { name: "Stüdyo görseli" }));
  expect(image.style.getPropertyValue("--product-image-position")).toBe("center");
});

it.each([390, 1440])("keeps the image container and overlay thumbnails in one gallery at %ipx", async viewport => {
  width = viewport;
  const { dialog, image } = await mount();
  const gallery = dialog.querySelector("[data-product-detail-gallery]");
  const strip = within(dialog).getByRole("group", { name: "Ürün görselleri" });
  expect(image.parentElement).toBe(gallery);
  expect(strip.parentElement).toBe(gallery);
  fireEvent.click(within(strip).getByRole("button", { name: "Sofra görseli" }));
  expect(dialog.querySelector("[data-product-detail-image]")).toBe(image);
  expect(strip.parentElement).toBe(gallery);
  expect(animation.animate).not.toHaveBeenCalled();
});

it("fades only image opacity for 200ms and stops the previous fade on rapid selection", async () => {
  reduced = false;
  const { dialog, image } = await mount();
  animation.animate.mockClear(); animation.stop.mockClear();
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  expect(animation.animate).toHaveBeenLastCalledWith(image, { opacity: [0, 1] }, { duration: motionTokens.duration.crossfade });
  fireEvent.click(within(dialog).getByRole("button", { name: "Stüdyo görseli" }));
  expect(animation.stop).toHaveBeenCalledTimes(1);
  expect(dialog.querySelector("[data-product-detail-image]")).toBe(image);
});

it("resets the focus point to the studio when changing size", async () => {
  const { dialog, image } = await mount();
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  fireEvent.click(within(dialog).getByRole("radio", { name: "1 kg" }));
  expect(image.querySelector("img")!.getAttribute("src")).toContain("1kg-studyo");
  expect(image.style.getPropertyValue("--product-image-position")).toBe("center");
});

const css = postcss.parse(readFileSync("components/catalog/ProductDetail.module.css", "utf8"));
function declarations(selector: string, media?: string): Record<string, string> {
  const result: Record<string, string> = {};
  css.walkRules(rule => {
    const query = rule.parent?.type === "atrule" ? rule.parent.params : undefined;
    if (query === media && rule.selectors.includes(selector)) rule.walkDecls(decl => {
      result[decl.prop] = `${decl.value}${decl.important ? " !important" : ""}`;
    });
  });
  return result;
}

it("fills the padding-free gallery with an absolute cover image and overlays a 64px strip", () => {
  expect(declarations(".gallery")).toMatchObject({ position: "relative", padding: "0", overflow: "hidden", "border-radius": "inherit" });
  expect(declarations(".image")).toMatchObject({ position: "absolute", inset: "0", padding: "0" });
  for (const selector of [".image picture", ".image img"]) {
    expect(declarations(selector)).toMatchObject({ position: "absolute", inset: "0", width: "100%", height: "100%" });
  }
  expect(declarations(".image img")).toMatchObject({ "object-fit": "cover", "object-position": "var(--product-image-position, center)" });
  expect(declarations(".thumbnails")).toMatchObject({ position: "absolute", bottom: "16px", "z-index": "2" });
  expect(declarations(".thumbnails button")).toMatchObject({ width: "64px", height: "64px" });
  expect(declarations('.thumbnails button[aria-pressed="true"]')["border"]).toBe("2px solid var(--altin)");
  expect(declarations(".gallery::after")).toMatchObject({ position: "absolute", bottom: "0", "pointer-events": "none" });
  expect(declarations(".gallery::after")["background"]).toContain("linear-gradient");
});

it("reserves mobile height before image loading, with a 16px gap before the content", () => {
  expect(declarations(".gallery")["height"]).toBe("min(62svh, 125vw)");
  expect(declarations(".scroller")).toMatchObject({ padding: "0", gap: "16px" });
  expect(declarations(".info")["padding"]).toBe("0 16px 24px");
});

it("keeps desktop columns full height and scrolls only the information column within the viewport", () => {
  const desktop = "(min-width: 768px)";
  expect(declarations(".dialog")["max-height"]).toBe("calc(100dvh - 48px)");
  expect(declarations(".sheet")["max-height"]).toBe("calc(100dvh - 48px)");
  expect(declarations(".scroller", desktop)).toMatchObject({ "align-items": "stretch", gap: "0", overflow: "hidden" });
  expect(declarations(".gallery", desktop)["height"]).toBe("100%");
  expect(declarations(".info", desktop)).toMatchObject({ "min-height": "0", "overflow-y": "auto" });
  expect(declarations(".image", "(prefers-reduced-motion: reduce)")["opacity"]).toBe("1 !important");
});

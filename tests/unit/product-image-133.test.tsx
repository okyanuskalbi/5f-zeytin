import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { useRef } from "react";
import postcss from "postcss";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CartProvider } from "@/components/cart/CartProvider";
import { ProductDetail as ProductPage } from "@/components/storefront/ProductDetail";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/urunler" }));
import { getProductFamilies } from "@/lib/catalog/static-products";
import { productHref } from "@/lib/catalog/product-pages";


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
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null,"","/"); vi.unstubAllGlobals(); });

async function mount(id = "sample-green-olive-10kg") {
  const families=await getProductFamilies();const products=families.flatMap(family=>family.variants);
  const product=products.find(item=>item.id===id)!;const family=families.find(item=>item.id===product.familyId)!;
  history.replaceState(null,"",productHref(product));
  render(<CartProvider products={products}><ProductPage family={family} related={[]} /></CartProvider>);
  const dialog = document.querySelector<HTMLElement>("[data-product-page]")!;
  return { dialog, image: dialog.querySelector<HTMLElement>("[data-product-detail-image]")! };
}

it.each(["sample-green-olive-10kg", "sample-green-olive-1kg", "sample-black-olive-1kg", "sample-olive-oil-1l", "sample-olive-oil-5l", "sample-brined-green-olive-5kg"])("switches the approved studio and scene image for %s", async id => {
  const { dialog, image } = await mount(id);
  expect(image.querySelector("img")!.getAttribute("src")).toContain("studyo");
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  expect(image.querySelector("img")!.getAttribute("src")).toContain("sahne");
  fireEvent.click(within(dialog).getByRole("button", { name: "Stüdyo görseli" }));
  expect(image.querySelector("img")!.getAttribute("src")).toContain("studyo");
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

it("resets the focus point to the studio when changing size", async () => {
  const { dialog, image } = await mount();
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  fireEvent.click(within(dialog).getByRole("radio", { name: "1 kg" }));
  expect(image.querySelector("img")!.getAttribute("src")).toContain("1kg-studyo");

});

const css = postcss.parse(readFileSync("components/storefront/ProductDetail.module.css", "utf8"));
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

it("reserves image space while containing the entire packaging", () => {
  // Task205: one 4:5 stage on every width, the same proportions as the studio photograph.
  expect(declarations(".image")["aspect-ratio"]).toBe("4 / 5");
  expect(declarations(".image img")["object-fit"]).toBe("contain");
  expect(declarations(".image", "(max-width: 767px)")["aspect-ratio"]).toBeUndefined();
  expect(declarations(".product")["align-items"]).toBe("start");
});

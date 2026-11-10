import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AddToCart } from "@/components/catalog/AddToCart";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGroups } from "@/components/landing/ProductGroups";
import { getProducts } from "@/lib/catalog/static-products";
import { v3Image } from "@/lib/media/v3-assets";

const cart = vi.hoisted(() => ({ addItem: vi.fn() }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({ state: { hydrated: true }, products: [], store: { addItem: cart.addItem } }) }));
beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("renders reduced-motion cards and home groups directly without scroll entrances or hidden SSR content", async () => {
  const product = (await getProducts()).find(item => item.stock > 0)!;
  const html = renderToStaticMarkup(<><ProductCard product={product} image={v3Image(product.imageKey)} /><ProductGroups /></>);
  expect(html).not.toMatch(/opacity:0|translateY|scale\(0/);
  for (const file of ["components/catalog/ProductCard.tsx", "components/ui/order-history.tsx"]) {
    expect(readFileSync(file, "utf8"), file).not.toMatch(/whileInView|useInView|useScroll|onViewportEnter/);
  }
  const { container } = render(<ProductCard product={product} image={v3Image(product.imageKey)} staticPresentation />);
  expect(container.querySelector("[data-reduced-motion]")?.getAttribute("data-reduced-motion")).toBe("true");
});

it("keeps addition feedback accessible and both text widths reserved without changing the cart action", async () => {
  const product = (await getProducts()).find(item => item.stock > 0)!;
  const { container } = render(<AddToCart product={product} />);
  expect(container.querySelector("[data-add-label-measure]")?.getAttribute("aria-hidden")).toBe("true");
  const button = screen.getByRole("button", { name: "Sepete ekle" });
  fireEvent.click(button);
  expect(cart.addItem).toHaveBeenCalledWith(product.id, 1);
  expect(await screen.findByRole("button", { name: "Eklendi ✓" })).toBeDefined();
  expect(screen.getByRole("status").textContent).toContain("sepete eklendi");
  expect(container.querySelector("[data-add-label]")?.getAttribute("style") ?? "").not.toMatch(/opacity:0|scale\(0/);
});

it("keeps unavailable stock separate and motionless", async () => {
  const product = (await getProducts()).find(item => item.stock === 0)!;
  const { container } = render(<AddToCart product={product} />);
  const button = screen.getByRole("button", { name: "Mevcut değil" });
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(button.getAttribute("style")).toContain("transform: none");
  expect(container.querySelector("[data-add-label]")).toBeNull();
});

import { existsSync, readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { afterEach, describe, expect, it } from "vitest";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartSummary } from "@/components/cart/CartSummary";
import { Footer } from "@/components/site/Footer";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { createCartStore } from "@/lib/cart/store";
import type { Product } from "@/types/catalog";

const brands = ["PayTR", "Visa", "Mastercard", "Troy"];
const products: readonly Product[] = [
  { id: "olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 22000, stock: 4 },
];

afterEach(cleanup);

describe("PaymentLogos", () => {
  it.each(["light", "dark"] as const)("selects %s artwork for all four named brands", tone => {
    const { container } = render(<PaymentLogos tone={tone} />);
    expect(screen.getAllByRole("img").map(image => image.getAttribute("alt"))).toEqual(brands);
    for (const brand of brands) {
      const image = screen.getByRole("img", { name: brand });
      const suffix = tone === "dark" && brand !== "Mastercard" ? "-dark" : "";
      expect(image.getAttribute("src")).toBe(`/images/payment/${brand.toLowerCase()}${suffix}.svg`);
      expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
      expect(image.getAttribute("loading")).toBe("lazy");
      expect(image.getAttribute("decoding")).toBe("async");
    }
    // The caller owns the surface; the shared artwork must not introduce a plate.
    expect(container.querySelector("div, [style]")).toBeNull();
  });

  it("preserves footer card-list semantics and image styling for a selected subset", () => {
    render(<ul aria-label="Kabul edilen kartlar"><PaymentLogos tone="light" brands={["visa", "mastercard", "troy"]}
      asListItems className="footer-logo" /></ul>);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("img", { name: "PayTR" })).toBeNull();
    for (const image of screen.getAllByRole("img")) expect(image.className).toBe("footer-logo");
  });
});

describe("Task 132 payment artwork and surfaces", () => {
  it.each(["drawer", "page"])("uses four named, dark logos on the %s's milk plate", view => {
    const store = createCartStore({ products, storage: null });
    store.addItem("olive");
    render(view === "drawer"
      ? <CartDrawer store={store} products={products} open onOpenChange={() => {}} />
      : <CartSummary store={store} products={products} onRefresh={() => {}} />);
    const payment = screen.getByRole("group", { name: "Güvenli ödeme" });
    expect(within(payment).getAllByRole("img").map(image => image.getAttribute("alt"))).toEqual(brands);
    for (const brand of brands) {
      const file = `${brand.toLowerCase()}${brand === "Mastercard" ? "" : "-dark"}.svg`;
      expect(within(payment).getByRole("img", { name: brand }).getAttribute("src")).toBe(`/images/payment/${file}`);
    }
    const backgrounds: string[] = [];
    postcss.parse(readFileSync("components/cart/CartExperience.module.css", "utf8")).walkRules(rule => {
      if (rule.selector === ".paymentLogos") rule.walkDecls("background", decl => { backgrounds.push(decl.value); });
    });
    expect(backgrounds).toEqual(["var(--sut)"]);
  });

  it.each([["paytr", "#0E1510"], ["visa", "#1A1F71"], ["troy", "#0E1510"]])(
    "changes only the white fill in the %s light-surface asset", (brand, fill) => {
      const original = readFileSync(`public/images/payment/${brand}.svg`, "utf8");
      const path = `public/images/payment/${brand}-dark.svg`;
      expect(existsSync(path), path).toBe(true);
      const dark = readFileSync(path, "utf8");
      expect(original).toContain('fill="white"');
      expect(dark).toBe(original.replaceAll('fill="white"', `fill="${fill}"`));
      expect(dark).not.toContain('fill="white"');
    },
  );

  it("keeps the footer's original white artwork and card list on its dark surface", () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Footer />), "text/html");
    const payment = doc.querySelector('[aria-label="Güvenli ödeme"]')!;
    expect(payment.closest("[data-surface]")?.getAttribute("data-surface")).toBe("dark");
    expect([...payment.querySelectorAll("img")].map(image => ({ alt: image.alt, src: image.getAttribute("src") })))
      .toEqual(brands.map(brand => ({ alt: brand, src: `/images/payment/${brand.toLowerCase()}.svg` })));
    expect(payment.querySelectorAll('ul[aria-label="Kabul edilen kartlar"] > li')).toHaveLength(3);
  });
});

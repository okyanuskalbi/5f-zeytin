import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import postcss from "postcss";
import { compile } from "tailwindcss";
import { afterEach, expect, it, vi } from "vitest";
import { Navbar } from "@/components/site/Navbar";
import { NavbarMenu } from "@/components/site/NavbarMenu";
import { Footer } from "@/components/site/Footer";
import { MembershipFrame } from "@/components/account/MembershipFrame";
import { AdminShell } from "@/components/admin/AdminShell";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { createCartStore } from "@/lib/cart/store";
import { ClassicHero, TrustStrip, ClassicBusiness } from "@/components/landing/ClassicHome";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/" }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const css = () => readFileSync("app/globals.css", "utf8");
function declarations(selector: string, source = css()): Record<string, string> {
  const values: Record<string, string> = {};
  postcss.parse(source).walkRules(rule => {
    if (rule.selector === selector) rule.walkDecls(declaration => { values[declaration.prop] = declaration.value; });
  });
  return values;
}
function color(value: string, palette: Record<string, string>): string {
  return value.startsWith("var(") ? color(palette[value.slice(4, -1)], palette) : value;
}
function contrast(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const digits = hex.slice(1).length === 3 ? hex.slice(1).split("").map(digit => digit + digit).join("") : hex.slice(1);
    const rgb = [0, 2, 4].map(index => parseInt(digits.slice(index, index + 2), 16) / 255)
      .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const pair = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (pair[0] + .05) / (pair[1] + .05);
}

it("uses readable light semantic surface pairs by default and keeps dark tokens local", () => {
  const light = declarations(":root");
  expect(light["color-scheme"]).toBe("light");
  expect(color(light["--background"], light).toLowerCase()).toBe("#faf8f2");
  for (const surface of ["background", "card", "popover", "primary", "secondary", "muted", "accent", "destructive"]) {
    const text = surface === "background" ? "foreground" : `${surface}-foreground`;
    expect(contrast(color(light[`--${text}`], light), color(light[`--${surface}`], light)), surface).toBeGreaterThanOrEqual(4.5);
  }
  const dark = { ...light, ...declarations(':where([data-surface="dark"])') };
  expect(dark["color-scheme"]).toBe("dark");
  expect(dark["--background"]).toBe("var(--ink)");
  expect(dark["--foreground"]).toBe("var(--sut)");
  expect(dark["--card"]).toBe("var(--zeytin)");
  expect(css().match(/color-scheme:\s*dark/g)).toHaveLength(1);
});

it("compiles dark helpers against explicit surface ancestry rather than the operating system", async () => {
  const custom = css().match(/@custom-variant dark[^;]+;/)?.[0];
  expect(custom).toBeTruthy();
  const compiler = await compile(`@theme { --color-black:#000; } ${custom} @tailwind utilities;`);
  const output = compiler.build(["dark:bg-black"]);
  expect(output).toContain('[data-surface="dark"]');
  expect(output).not.toContain("prefers-color-scheme");
});

it("keeps navigation and footer light while isolating the brand panel and photo cards", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<><Navbar /><Footer /><MembershipFrame mode="login"><p>Form</p></MembershipFrame><ClassicHero /><TrustStrip /><ClassicBusiness /></>), "text/html");
  expect(doc.querySelector('[data-site-navbar]')?.getAttribute("data-surface")).not.toBe("dark");
  expect(doc.querySelector("footer")?.getAttribute("data-surface")).not.toBe("dark");
  expect(doc.querySelector('aside[aria-label="AFİNA ZEYTİN"]')?.getAttribute("data-surface")).toBe("dark");
  expect(doc.querySelector("#baslangic")?.getAttribute("data-surface")).toBe("dark");
  expect(doc.querySelector("main[data-surface=dark]")).toBeNull();
});

it("keeps the entire phone menu light including its logo toolbar", () => {
  render(<NavbarMenu links={[{ href: "/", label: "Ana Sayfa" }]} onClose={() => {}} onRestoreFocus={() => {}} />);
  expect(screen.getByRole("dialog").getAttribute("data-surface")).not.toBe("dark");
  expect(screen.getByRole("button", { name: "Kapat" }).closest('[data-surface="dark"]')).toBeNull();
  expect(screen.getByRole("link", { name: "Online Mağaza" }).closest('[data-surface="dark"]')).toBeNull();
});

it("scopes only the cart summary and drawer footer while product lines remain light", () => {
  const store = createCartStore({ products: [], storage: null });
  const page = render(<CartSummary store={store} products={[]} onRefresh={() => {}} />);
  expect(screen.getByRole("complementary").getAttribute("data-surface")).toBe("dark");
  expect(screen.getByRole("main").getAttribute("data-surface")).not.toBe("dark");
  page.unmount();
  render(<CartDrawer store={store} products={[]} open onOpenChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Ödemeye geç" }).closest('[data-surface="dark"]')).not.toBeNull();
  expect(screen.getByRole("dialog").getAttribute("data-surface")).not.toBe("dark");
});

it("preserves the admin's existing local light palette in the shell and its portal", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
  render(<AdminShell />);
  expect(document.querySelector("[data-admin-shell]")?.getAttribute("data-surface")).toBe("admin");
  fireEvent.click(screen.getByRole("button", { name: "Yönetim menüsünü aç" }));
  expect(screen.getByRole("dialog").getAttribute("data-surface")).toBe("admin");
  const admin = declarations(".theme", readFileSync("components/admin/AdminShell.module.css", "utf8"));
  expect(admin["color-scheme"]).toBe("light");
  expect(admin["--background"]).toBe("#fff");
  expect(admin["--foreground"]).toBe("#202722");
  expect(admin["--primary"]).toBe("#243a29");
});

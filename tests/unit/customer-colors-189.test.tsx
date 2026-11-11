import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AccountSummary } from "@/components/account/AccountSummary";
import { CustomerWorkspace } from "@/components/account/CustomerWorkspace";
import panel from "@/components/storefront/account/AccountSurface.module.css";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
const css = readFileSync("components/storefront/account/AccountSurface.module.css", "utf8");
const profile = { name: "Yerel Renk Kontrolü", email: "renk@example.test", phone: "05321234567" };
const globalCss = readFileSync("app/globals.css", "utf8");
const variables = new Map<string, string>();
for (const match of globalCss.matchAll(/(--[\w-]+):\s*(#[\da-fA-F]{3,6});/g)) {
  if (!variables.has(match[1])) variables.set(match[1], match[2]);
}
for (const match of css.slice(0, css.indexOf("}")).matchAll(/(--[\w-]+):\s*([^;]+);/g)) variables.set(match[1], match[2].trim());
function resolve(value: string): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value);
  return match ? resolve(variables.get(match[1]) ?? "") : value;
}
function declaration(selector: string, name: string): string | undefined {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return;
  const block = css.slice(start, css.indexOf("}", start));
  return new RegExp(`(?:^|[;{])\\s*${name}:\\s*([^;]+);`).exec(block)?.[1].trim();
}
function luminance(hex: string): number {
  let color = resolve(hex).replace("#", "");
  if (color.length === 3) color = [...color].map(character => character + character).join("");
  if (!/^[\da-f]{6}$/i.test(color)) throw new Error(`Expected concrete CSS colour, received ${hex}`);
  const linear = [0, 2, 4].map(offset => parseInt(color.slice(offset, offset + 2), 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("keeps the actual account overview button readable on its white quick-link surface", () => {
  render(<AccountSummary profile={profile} />);
  const link = screen.getByRole("link", { name: /Sipariş geçmişim/ });
  expect(link.getAttribute("href")).toBe("/hesabim/siparisler");
  expect(link.closest(`.${panel.quickLinks}`)).not.toBeNull();
  const foreground = declaration(".quickLinks a", "color") ?? "var(--primary-foreground)";
  const background = declaration(".quickLinks a", "background") ?? "var(--sf-ivory)";
  expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  expect(contrast("var(--customer-copy)", "var(--customer-paper)")).toBeGreaterThanOrEqual(4.5);
});

it.each(["orders", "addresses", "profile"] as const)("preserves readable customer %s surfaces using local component data", async section => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: section === "orders" ? { orders: [], page: 1, total: 0 } : [] })));
  render(<CustomerWorkspace section={section} profile={profile} />);
  expect(screen.getByRole("main").classList.contains(panel.customerPage)).toBe(true);
  if (section === "orders") await screen.findByText("Henüz siparişiniz yok.");
  if (section === "addresses") await screen.findByRole("button", { name: "Adres ekle" });
  if (section === "profile") expect(screen.getByRole("form", { name: "Hesap bilgilerini düzenle" })).toBeDefined();
  expect(screen.getByRole("navigation", { name: "Müşteri hesabı" }).classList.contains(panel.customerNav)).toBe(true);
  const body = "var(--customer-olive)", muted = "var(--customer-copy)";
  for (const surface of ["var(--customer-paper)", declaration(".card", "background")!, declaration(".fields input", "background")!]) {
    expect(contrast(body, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, surface)).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(declaration('.customerNav a[aria-current="page"]', "color")!, declaration('.customerNav a[aria-current="page"]', "background")!)).toBeGreaterThanOrEqual(4.5);
  expect(contrast("var(--customer-error)", "var(--customer-paper)")).toBeGreaterThanOrEqual(4.5);
});

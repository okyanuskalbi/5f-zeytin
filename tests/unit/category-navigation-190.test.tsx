import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { ProductGroups } from "@/components/landing/ProductGroups";

const route = vi.hoisted(() => ({ pathname: "/urunler" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
afterEach(() => { cleanup(); route.pathname = "/urunler"; });

const groups = [
  ["siyah-zeytin", "Siyah Zeytin"], ["yesil-zeytin", "Yeşil Zeytin"],
  ["kirma-zeytin", "Kırma Zeytin"], ["zeytinyagi", "Zeytinyağı"],
] as const;

it("provides ordinary category photo links before JavaScript without opening a detail dialog", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<ProductGroups />), "text/html");
  for (const [id, name] of groups) {
    const link = doc.querySelector(`a[href="/urunler/${id}"]`);
    expect(link?.textContent).toContain(name);
    expect(link?.querySelector("picture img")?.getAttribute("alt")).toBe("");
    expect(link?.hasAttribute("aria-haspopup")).toBe(false);
  }
  expect(doc.querySelector("button")).toBeNull();
  expect(doc.querySelector('a[href="/urunler"]')?.textContent).toContain("Tüm ürünleri gör");
});

it.each([["/urunler", "Tüm ürünler"], ...groups.map(([id, name]) => [`/urunler/${id}`, name])])("marks only %s as the current category and preserves breadcrumb order", async (path, name) => {
  route.pathname = path;
  const { CatalogShell } = await import("@/components/catalog/CatalogShell");
  render(<CatalogShell><div data-testid="grid" /></CatalogShell>);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(name);
  const navigation = screen.getByRole("navigation", { name: "Ürün grupları" });
  const links = within(navigation).getAllByRole("link");
  expect(links).toHaveLength(5);
  expect(links.filter(link => link.getAttribute("aria-current") === "page")).toEqual([within(navigation).getByRole("link", { name })]);
  for (const link of links) expect(link.querySelector("img")?.getAttribute("alt")).toBe("");
  const breadcrumb = screen.getByRole("navigation", { name: "İçerik yolu" });
  expect(within(breadcrumb).getByRole("link", { name: "Ana Sayfa" }).getAttribute("href")).toBe("/");
  const current = breadcrumb.querySelector('[aria-current="page"]');
  expect(current?.textContent).toBe(path === "/urunler" ? "Ürünler" : name);
  if (path !== "/urunler") expect(within(breadcrumb).getByRole("link", { name: "Ürünler" }).getAttribute("href")).toBe("/urunler");
  expect(screen.getByRole("heading", { level: 1 }).compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(navigation.compareDocumentPosition(screen.getByTestId("grid")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

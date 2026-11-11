import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { StoreMenu as NavbarMenu } from "@/components/storefront/StoreMenu";

vi.mock("next/link", () => ({ default: (props: ComponentProps<"a"> & { prefetch?: boolean }) => { const html = { ...props }; delete html.prefetch; return <a {...html} onClick={event => { props.onClick?.(event); event.preventDefault(); }} />; } }));
const links = [
  { label: "Ürünler", href: "/urunler" }, { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Toptan Satış", href: "/toptan-satis" }, { label: "Bayilik", href: "/bayilik" }, { label: "Blog", href: "/blog" },
];
afterEach(cleanup);
function Fixture() {
  const [open, setOpen] = useState(false);
  return <><button id="menu-opener" onClick={() => setOpen(true)}>Menüyü aç</button>
    {open && <NavbarMenu links={links} pathname="/" onClose={() => setOpen(false)} onRestoreFocus={() => document.getElementById("menu-opener")?.focus()} />}</>;
}
function openMenu() {
  render(<Fixture />);
  fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
  return within(screen.getByRole("dialog", { name: "Site menüsü" }));
}
it("keeps the main destinations, categories and account in the phone panel", () => {
  const menu = openMenu();
  const nav = menu.getByRole("navigation", { name: "Mobil navigasyon" });
  expect(within(nav).getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(links.map(link => link.href));
  expect(menu.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  expect(menu.getByRole("link", { name: "Sipariş takibi" }).getAttribute("href")).toBe("/siparis-takip");
  expect(document.activeElement).toBe(menu.getByRole("button", { name: "Menüyü kapat" }));
});
it.each(["Escape", "Kapat"])("closes through %s and restores the opener", async method => {
  const menu = openMenu();
  if (method === "Escape") fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  else fireEvent.click(menu.getByRole("button", { name: "Menüyü kapat" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Menüyü aç" })));
});
it("closes after selecting a destination", () => {
  const menu = openMenu();
  fireEvent.click(menu.getByRole("link", { name: "Ürünler" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("keeps keyboard Tab within the open menu", () => {
  const menu = openMenu();
  const last = menu.getByRole("link", { name: "Sipariş takibi" });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab" });
  expect(document.activeElement).toBe(menu.getByRole("button", { name: "Menüyü kapat" }));
});

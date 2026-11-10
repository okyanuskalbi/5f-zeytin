import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { NavbarMenu } from "@/components/site/NavbarMenu";

vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));
const links = [
  { label: "Ana Sayfa", href: "/" }, { label: "Hakkımızda", href: "/#hakkimizda" },
  { label: "Üretim Tesisimiz", href: "/#tesisimiz" }, { label: "Ürünler", href: "/#urunler" },
  { label: "Toptan Satış", href: "/#toptan" }, { label: "Bayilik", href: "/bayilik" }, { label: "İletişim", href: "/#iletisim" },
];
afterEach(cleanup);
function Fixture() {
  const [open, setOpen] = useState(false);
  return <><button id="menu-opener" onClick={() => setOpen(true)}>Menüyü aç</button>
    {open && <NavbarMenu links={links} onClose={() => setOpen(false)} onRestoreFocus={() => document.getElementById("menu-opener")?.focus()} />}</>;
}
function openMenu() {
  render(<Fixture />);
  fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
  return within(screen.getByRole("dialog", { name: "Site menüsü" }));
}
it("keeps the original light logo, all seven navigation destinations and shopping actions in the C mobile panel", () => {
  const menu = openMenu();
  const home = menu.getByRole("link", { name: "Afina Zeytin ana sayfa" });
  expect(home.querySelector("img")?.getAttribute("src")).toContain("yatay-dark");
  const nav = menu.getByRole("navigation", { name: "Site navigasyonu" });
  expect(within(nav).getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(links.map(link => link.href));
  expect(menu.getByRole("link", { name: "Online Mağaza" }).getAttribute("href")).toBe("/urunler");
  expect(menu.getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  expect(menu.getByRole("link", { name: "Sepetim" }).getAttribute("href")).toBe("/sepet");
  expect(document.activeElement).toBe(menu.getByRole("link", { name: "Ana Sayfa" }));
});
it.each(["Escape", "Kapat"])("closes through %s and restores the opener", async method => {
  const menu = openMenu();
  if (method === "Escape") fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  else fireEvent.click(menu.getByRole("button", { name: "Kapat" }));
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
  const last = menu.getByRole("link", { name: "Sepetim" });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab" });
  expect(document.activeElement).toBe(menu.getByRole("link", { name: "Afina Zeytin ana sayfa" }));
});

it("closes after selecting the shop page", () => {
  const menu = openMenu();
  fireEvent.click(menu.getByRole("link", { name: "Online Mağaza" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NavbarMenu } from "@/components/site/NavbarMenu";

vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }));

const links = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Kurumsal", href: "/#kurumsal" },
  { label: "Üretim Tesisimiz", href: "/#tesisimiz" },
  { label: "Ürünlerimiz", href: "/#urunler" },
  { label: "Toptan Satış", href: "/#toptan-iletisim" },
  { label: "İletişim", href: "/#iletisim" },
];
let mobile: boolean;
let listeners: Set<() => void>;
beforeEach(() => {
  mobile = true;
  listeners = new Set();
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query, get matches() { return query.startsWith("(max-width: 767px)") && mobile; },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

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

it("shows only the home logo and close control in the phone toolbar while retaining the accessible home link", () => {
  const menu = openMenu();
  const home = menu.getByRole("link", { name: "Ana Sayfa" });
  expect(home.getAttribute("href")).toBe("/");
  expect(home.querySelector("img")).not.toBeNull();
  expect(home.textContent).toBe("");
  expect(within(home.parentElement!).queryByText("Ana Sayfa")).toBeNull();
  expect(within(home.parentElement!).getByRole("button", { name: "Kapat" })).toBeTruthy();
  expect(document.activeElement).toBe(home);
});

it("groups mobile shopping destinations without losing or duplicating existing routes and focuses home first", async () => {
  const menu = openMenu();
  expect(document.activeElement).toBe(menu.getByRole("link", { name: "Ana Sayfa" }));
  const quick = within(menu.getByRole("group", { name: "Hızlı erişim" }));
  expect(quick.getAllByRole("link").map(link => link.getAttribute("href")))
    .toEqual(["/#urunler", "/#toptan-iletisim", "/hesabim", "/sepet"]);
  expect(menu.getAllByRole("link").map(link => link.getAttribute("href")).sort())
    .toEqual([...links.map(link => link.href), "/hesabim", "/sepet"].sort());
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Menüyü aç" })));
});

it("keeps the focused destination when an open panel changes between phone and tablet layouts", () => {
  const menu = openMenu();
  act(() => menu.getByRole("link", { name: "Sepetim" }).focus());
  act(() => { mobile = false; listeners.forEach(notify => notify()); });
  expect(document.activeElement).toBe(screen.getByRole("link", { name: "Sepetim" }));
  expect(screen.queryByRole("group", { name: "Hızlı erişim" })).toBeNull();
  expect(within(screen.getByRole("navigation", { name: "Site navigasyonu" })).getAllByRole("link").map(link => link.textContent))
    .toEqual([...links.map(link => link.label), "Hesabım", "Sepetim"]);
  act(() => { mobile = true; listeners.forEach(notify => notify()); });
  expect(document.activeElement).toBe(screen.getByRole("link", { name: "Sepetim" }));
});

it("closes through the fixed close action and restores the opener", async () => {
  const menu = openMenu();
  fireEvent.click(menu.getByRole("button", { name: "Kapat" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Menüyü aç" })));
});

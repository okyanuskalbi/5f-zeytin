import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { MotionProvider } from "@/components/site/MotionProvider";

const mocks = vi.hoisted(() => ({ openCart: vi.fn(), openMembership: vi.fn(), hydrated: true, quantity: 3 }));
// Task208: a product page marks the Ürünler section link.
vi.mock("next/navigation", () => ({ usePathname: () => "/urun/naturel-sizma-zeytinyagi" }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: mocks.hydrated, items: mocks.quantity ? [{ quantity: mocks.quantity }] : [] },
  products: [], open: false, openCart: mocks.openCart,
}) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => mocks.openMembership }));
beforeEach(() => {
  mocks.hydrated = true; mocks.quantity = 3;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("keeps the five destination links, real logo and provider-owned cart/account actions", () => {
  render(<MotionProvider><StoreHeader /></MotionProvider>);
  const links = within(screen.getByRole("navigation", { name: "Ana navigasyon" })).getAllByRole("link");
  expect(links.map(link => link.getAttribute("href"))).toEqual(["/#urunler", "/#hikayemiz", "/#toptan-bayilik", "/#blog", "/#iletisim"]);
  expect(links.map(link => link.getAttribute("aria-current"))).toEqual(["true", null, null, null, null]);
  expect(screen.getByAltText("AFİNA ZEYTİN").getAttribute("src")).toContain("afina-zeytin-yatay@2x.webp");
  const cart = screen.getByRole("button", { name: "Sepetim, 3 adet" });
  fireEvent.click(cart);
  expect(mocks.openCart).toHaveBeenCalledWith(cart);
  const account = screen.getByRole("link", { name: "Hesabım" });
  fireEvent.click(account);
  expect(mocks.openMembership).toHaveBeenCalledWith(account);
});

it("does not expose an enabled cart before hydration and caps the visible badge", () => {
  mocks.hydrated = false; mocks.quantity = 105;
  render(<MotionProvider><StoreHeader /></MotionProvider>);
  expect((screen.getByRole("button", { name: "Sepetim, 105 adet" }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText("99+")).toBeTruthy();
});

it("opens an accessible drawer and restores its trigger after Escape", async () => {
  render(<MotionProvider><StoreHeader /></MotionProvider>);
  const trigger = screen.getByRole("button", { name: "Menüyü aç" });
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Site menüsü" });
  expect(within(dialog).getByRole("link", { name: "Hesabım" }).getAttribute("href")).toBe("/hesabim");
  // Task208: the drawer carries the section links; category pills live in the Ürünler section itself.
  expect(within(within(dialog).getByRole("navigation", { name: "Mobil navigasyon" })).getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/#urunler", "/#hikayemiz", "/#toptan-bayilik", "/#blog", "/#iletisim"]);
  expect(within(dialog).queryByRole("link", { name: "Siyah Zeytin" })).toBeNull();
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

// Task208: contact channels moved to the İletişim section (stated once); the footer links to it.
it("has the contact section link, legal routes, categories and all four payment marks", () => {
  render(<StoreFooter />);
  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getByRole("link", { name: "İletişim" }).getAttribute("href")).toBe("/#iletisim");
  expect(footer.querySelector('a[href^="tel:"], a[href^="mailto:"], address')).toBeNull();
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "/siparis-takip", "/?kategori=kirma-zeytin#urunler"]) {
    expect(footer.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
  expect([...footer.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  expect(footer.querySelector('a[href="#"], a[href*="wa.me"], form')).toBeNull();
});

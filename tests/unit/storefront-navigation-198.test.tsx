import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { MotionProvider } from "@/components/site/MotionProvider";

const mocks = vi.hoisted(() => ({ openCart: vi.fn(), openMembership: vi.fn(), hydrated: true, quantity: 3 }));
vi.mock("next/navigation", () => ({ usePathname: () => "/urunler" }));
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
  expect(links.map(link => link.getAttribute("href"))).toEqual(["/urunler", "/hakkimizda", "/toptan-satis", "/bayilik", "/blog"]);
  expect(links[0].getAttribute("aria-current")).toBe("page");
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
  expect(within(dialog).getByRole("link", { name: "Siyah Zeytin" }).getAttribute("href")).toBe("/urunler/siyah-zeytin");
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("has real contact channels, legal routes, categories and all four payment marks", () => {
  render(<StoreFooter />);
  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getByRole("link", { name: "0 328 882 77 08" }).getAttribute("href")).toBe("tel:+903288827708");
  expect(within(footer).getByRole("link", { name: "info@afina.com.tr" }).getAttribute("href")).toBe("mailto:info@afina.com.tr");
  for (const href of ["/kvkk", "/mesafeli-satis", "/iade", "/siparis-takip", "/urunler/kirma-zeytin"]) {
    expect(footer.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
  expect([...footer.querySelectorAll('[aria-label="Güvenli ödeme"] img')].map(image => image.getAttribute("alt"))).toEqual(["PayTR", "Visa", "Mastercard", "Troy"]);
  expect(footer.querySelector('a[href="#"], a[href*="wa.me"], form')).toBeNull();
});

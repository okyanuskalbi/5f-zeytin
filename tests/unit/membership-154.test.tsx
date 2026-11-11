import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SignIn } from "@/components/account/SignIn";
import { AccountSummary } from "@/components/account/AccountSummary";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
afterEach(cleanup);

it("offers login/register navigation and the guest route without an unavailable Google action", () => {
  render(<SignIn />);
  expect(screen.getByRole("navigation", { name: "Üyelik işlemleri" })).toBeDefined();
  expect(within(screen.getByRole("navigation", { name: "Üyelik işlemleri" })).getByRole("link", { name: "Hesap oluştur" }).getAttribute("href")).toBe("/kayit");
  expect(screen.queryByRole("button", { name: /Google/ })).toBeNull();
  expect(screen.getByRole("link", { name: "Üye olmadan alışverişe devam et" }).getAttribute("href")).toBe("/sepet");
});

it("gives the verified customer a complete panel without admin links", () => {
  render(<AccountSummary profile={{ name: "Deniz Sofra", email: "deniz@example.test", phone: null }} />);
  const destinations = ["/hesabim", "/hesabim/siparisler", "/hesabim/adresler", "/hesabim/bilgilerim", "/hesabim/guvenlik"];
  for (const path of destinations) expect(document.querySelector(`nav[aria-label="Müşteri hesabı"] a[href="${path}"]`)).not.toBeNull();
  expect(document.querySelector('a[href^="/admin"]')).toBeNull();
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MembershipFrame } from "@/components/account/MembershipFrame";
import { Field } from "@/components/account/FormControls";
import CheckoutPage from "@/app/odeme/page";

vi.mock("@/lib/checkout/adapter", () => ({ isCheckoutDemoEnabled: () => false }));
vi.mock("@/lib/payments/preview", () => ({ isPaymentPreviewEnabled: () => false }));
vi.mock("@/lib/payments/paytr", () => ({ getPaytrCredentials: vi.fn(() => null) }));
afterEach(cleanup);

it("uses a single static membership surface without overlapping 3D card faces", () => {
  const { container } = render(<MembershipFrame mode="login"><h1>Giriş yap</h1><input name="password" type="password" aria-label="Şifre" /></MembershipFrame>);
  expect(container.querySelector('[aria-label="AFİNA üyelik kartı"]')).toBeNull();
  expect(container.querySelector("[data-store-membership]")).not.toBeNull();
  expect(screen.getByRole("link", { name: "Hesap oluştur" }).getAttribute("href")).toBe("/kayit");
});

it("explains unavailable online payment and offers a real quote destination", () => {
  render(<CheckoutPage />);
  expect(screen.getByText(/Online ödeme yakında açılıyor/)).toBeDefined();
  expect(screen.getByRole("link", { name: "Teklif İste" }).getAttribute("href")).toBe("/toptan-satis");
  expect(screen.getByRole("link", { name: "Sepetime dön" }).getAttribute("href")).toBe("/sepet");
  expect(document.querySelector("form")).toBeNull();
});

it("keeps the security password field value and accessible error when toggled", () => {
  render(<Field id="account-password" name="password" label="Yeni şifre" type="password" defaultValue="OnlyLocal123!" error="En az 10 karakter kullanın." />);
  const input = screen.getByLabelText("Yeni şifre") as HTMLInputElement;
  expect(input.type).toBe("password");
  fireEvent.click(screen.getByRole("button", { name: "Yeni şifre: göster" }));
  expect(input.type).toBe("text");
  expect(input.value).toBe("OnlyLocal123!");
  expect(input.getAttribute("aria-describedby")).toBe("account-password-error");
  fireEvent.click(screen.getByRole("button", { name: "Yeni şifre: gizle" }));
  expect(input.type).toBe("password");
});

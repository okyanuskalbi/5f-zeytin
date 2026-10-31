import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthDialog } from "@/components/account/AuthDialog";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
beforeEach(() =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({}, { status: 401 })),
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("opens one accessible membership dialog and switches to the real registration form", async () => {
  render(<AuthDialog onClose={vi.fn()} />);
  expect(screen.getByRole("dialog", { name: "AFİNA üyelik" })).toBeDefined();
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  fireEvent.click(screen.getByRole("button", { name: "Hesap oluştur" }));
  expect(
    screen.getByRole("form", { name: "E-posta ile üyelik" }),
  ).toBeDefined();
  expect(screen.queryByRole("form", { name: "E-posta ile giriş" })).toBeNull();
});
it("offers the existing account only after the server confirms the session", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          data: { name: "Deniz", email: "deniz@example.test", phone: null },
        }),
      ),
  );
  render(<AuthDialog onClose={vi.fn()} />);
  expect(await screen.findByText("Oturumunuz açık.")).toBeDefined();
  expect(screen.queryByRole("form", { name: "E-posta ile giriş" })).toBeNull();
});
it("closes on Escape and restores the original trigger focus", async () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const close = vi.fn();
  const view = render(<AuthDialog onClose={close} trigger={trigger} />);
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
  view.unmount();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});
it("closes the overlay only after a successful real sign in", async () => {
  const close = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({}, { status: 401 }))
      .mockResolvedValueOnce(
        Response.json({
          data: { status: "signed_in", redirectTo: "/hesabim" },
        }),
      ),
  );
  render(<AuthDialog onClose={close} />);
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  fireEvent.change(screen.getByLabelText("E-posta", { exact: true }), {
    target: { value: "deniz@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Şifre", { exact: true }), {
    target: { value: "SecurePassword123" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "E-posta ile giriş yap" }),
  );
  await vi.waitFor(() => expect(close).toHaveBeenCalledOnce());
});

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthDialog } from "@/components/account/AuthDialog";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
const preventDocumentNavigation = (event: MouseEvent) => {
  if (event.target instanceof Element && event.target.closest("a[href]")) event.preventDefault();
};
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({}, { status: 401 })),
  );
  // Runs after the portal's React click handler; jsdom must not navigate away.
  document.addEventListener("click", preventDocumentNavigation);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.removeEventListener("click", preventDocumentNavigation);
});

function DialogJourney() {
  const [open, setOpen] = useState(true);
  return open ? <AuthDialog onClose={() => setOpen(false)} /> : null;
}

it("keeps registration details when the required legal text opens in a new tab", async () => {
  render(<DialogJourney />);
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  fireEvent.click(screen.getByRole("button", { name: "Hesap oluştur" }));
  const registration = screen.getByRole("form", { name: "E-posta ile üyelik" });
  fireEvent.change(within(registration).getByLabelText("Ad soyad"), {
    target: { value: "Deniz Test" },
  });
  fireEvent.change(within(registration).getByLabelText("E-posta", { exact: true }), {
    target: { value: "deniz@example.test" },
  });
  const legalLink = within(registration).getByRole("link", {
    name: "KVKK aydınlatma metnini",
  });
  expect(legalLink.getAttribute("target")).toBe("_blank");
  fireEvent.click(legalLink);
  expect(screen.getByRole("dialog", { name: "AFİNA üyelik" })).toBeDefined();
  expect((screen.getByLabelText("Ad soyad") as HTMLInputElement).value).toBe("Deniz Test");
  expect((screen.getByLabelText("E-posta", { exact: true }) as HTMLInputElement).value)
    .toBe("deniz@example.test");
});

it.each(["ctrlKey", "metaKey", "shiftKey", "altKey"] as const)(
  "keeps the sign-in form when a navigation link is clicked with %s",
  async (modifier) => {
    render(<DialogJourney />);
    await screen.findByRole("form", { name: "E-posta ile giriş" });
    fireEvent.change(screen.getByLabelText("E-posta", { exact: true }), {
      target: { value: "deniz@example.test" },
    });
    fireEvent.click(screen.getByRole("link", { name: "Üye ol" }), { [modifier]: true });
    expect(screen.getByRole("form", { name: "E-posta ile giriş" })).toBeDefined();
    expect((screen.getByLabelText("E-posta", { exact: true }) as HTMLInputElement).value)
      .toBe("deniz@example.test");
  },
);

it("closes for ordinary same-tab navigation to continue shopping", async () => {
  render(<DialogJourney />);
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  fireEvent.click(screen.getByRole("link", { name: "Üye olmadan alışverişe devam et" }));
  expect(screen.queryByRole("dialog", { name: "AFİNA üyelik" })).toBeNull();
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

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthDialog } from "@/components/account/AuthDialog";
const navigation = vi.hoisted(() => ({ replace: vi.fn(), documentReplace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));
const preventDocumentNavigation = (event: MouseEvent) => {
  if (event.target instanceof Element && event.target.closest("a[href]")) event.preventDefault();
};
beforeEach(() => {
  navigation.replace.mockReset(); navigation.documentReplace.mockReset(); navigation.refresh.mockReset();
  vi.stubGlobal("location", { replace: navigation.documentReplace });
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(async input => {
      if (input === "/api/auth/providers") return Response.json({ google: false });
      if (input === "/api/account") return Response.json({}, { status: 401 });
      throw new Error("Unexpected membership request");
    }),
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

it("switches the embedded registration and sign-in forms without navigating or repeating the session lookup", async () => {
    render(<DialogJourney />);
    await screen.findByRole("form", { name: "E-posta ile giriş" });
    const signUp = screen.getByRole("link", { name: "Hesap oluştur" });
    expect(signUp.getAttribute("href")).toBe("/kayit");
    fireEvent.click(signUp);
    expect(screen.getByRole("form", { name: "E-posta ile üyelik" })).toBeDefined();
    expect(screen.queryByRole("form", { name: "E-posta ile giriş" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Hesap oluştur" })).toBeNull();
    const returnPrompt = screen.getByText(/Zaten hesabınız var mı/);
    const signIn = within(returnPrompt).getByRole("link", { name: "Giriş yap" });
    expect(signIn.getAttribute("href")).toBe("/giris");
    fireEvent.click(signIn);
    expect(screen.getByRole("form", { name: "E-posta ile giriş" })).toBeDefined();
    expect(screen.getByRole("dialog", { name: "AFİNA üyelik" })).toBeDefined();
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === "/api/account")).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === "/api/auth/providers")).toHaveLength(3);
    expect(vi.mocked(fetch).mock.calls.every(([url]) => ["/api/account", "/api/auth/providers"].includes(String(url)))).toBe(true);
    expect(fetch).toHaveBeenCalledWith("/api/account", expect.objectContaining({ credentials: "same-origin", cache: "no-store" }));
    expect(navigation.replace).not.toHaveBeenCalled(); expect(navigation.refresh).not.toHaveBeenCalled();
});

it.each(["ctrlKey", "metaKey", "shiftKey", "altKey"] as const)(
  "retains native registration-link semantics and the current form with %s",
  async modifier => {
    render(<DialogJourney />);
    await screen.findByRole("form", { name: "E-posta ile giriş" });
    fireEvent.change(screen.getByLabelText("E-posta", { exact: true }), { target: { value: "deniz@example.test" } });
    fireEvent.click(screen.getByRole("link", { name: "Hesap oluştur" }), { [modifier]: true });
    expect(screen.getByRole("form", { name: "E-posta ile giriş" })).toBeDefined();
    expect((screen.getByLabelText("E-posta", { exact: true }) as HTMLInputElement).value).toBe("deniz@example.test");
    expect(navigation.replace).not.toHaveBeenCalled();
  },
);

it.each(["ctrlKey", "metaKey", "shiftKey", "altKey"] as const)(
  "retains native sign-in-link semantics and registration values with %s",
  async modifier => {
    render(<DialogJourney />);
    await screen.findByRole("form", { name: "E-posta ile giriş" });
    fireEvent.click(screen.getByRole("button", { name: "Hesap oluştur" }));
    fireEvent.change(screen.getByLabelText("Ad soyad"), { target: { value: "Deniz Test" } });
    const returnPrompt = screen.getByText(/Zaten hesabınız var mı/);
    fireEvent.click(within(returnPrompt).getByRole("link", { name: "Giriş yap" }), { [modifier]: true });
    expect(screen.getByRole("form", { name: "E-posta ile üyelik" })).toBeDefined();
    expect((screen.getByLabelText("Ad soyad") as HTMLInputElement).value).toBe("Deniz Test");
    expect(navigation.replace).not.toHaveBeenCalled();
  },
);

it("keeps one accessible close control outside the internal scrolling body", async () => {
  render(<DialogJourney />);
  await screen.findByRole("form", { name: "E-posta ile giriş" });
  const dialog = screen.getByRole("dialog", { name: "AFİNA üyelik" });
  const body = dialog.querySelector("[data-auth-dialog-body]");
  const close = within(dialog).getByRole("button", { name: "Kapat" });
  expect(body).not.toBeNull();
  expect(body?.contains(screen.getByRole("form", { name: "E-posta ile giriş" }))).toBe(true);
  expect(body?.contains(close)).toBe(false);
  expect(within(dialog).getAllByRole("button", { name: "Kapat" })).toHaveLength(1);
  fireEvent.click(close);
  expect(screen.queryByRole("dialog", { name: "AFİNA üyelik" })).toBeNull();
});

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
    vi.fn<typeof fetch>().mockImplementation(async input => {
      if (input === "/api/auth/providers") return Response.json({ google: false });
      if (input === "/api/account") return Response.json({
        data: { name: "Deniz", email: "deniz@example.test", phone: null },
      });
      throw new Error("Unexpected membership request");
    }),
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
    vi.fn<typeof fetch>().mockImplementation(async input => {
      if (input === "/api/auth/providers") return Response.json({ google: false });
      if (input === "/api/account") return Response.json({}, { status: 401 });
      if (input === "/api/auth/login") return Response.json({
        data: { status: "signed_in", redirectTo: "/hesabim" },
      });
      throw new Error("Unexpected membership request");
    }),
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
  expect(navigation.documentReplace).toHaveBeenCalledExactlyOnceWith("/hesabim");
  expect(close.mock.invocationCallOrder[0]).toBeLessThan(navigation.documentReplace.mock.invocationCallOrder[0]);
  expect(navigation.replace).not.toHaveBeenCalled();
  expect(navigation.refresh).not.toHaveBeenCalled();
});

it("handles 401 as a guest without application console errors (181)", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    render(<AuthDialog onClose={vi.fn()} />);
    await screen.findByRole("form", { name: "E-posta ile giriş" });
    expect(error).not.toHaveBeenCalled();
    expect(screen.queryByText("Oturumunuz açık.")).toBeNull();
  } finally { error.mockRestore(); }
});

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Page, { metadata } from "@/app/kayit/page";
import { registrationConfirmation } from "@/lib/contracts/register";

const fetchMock = vi.fn<typeof fetch>();
const form = () => screen.getByRole("form", { name: "E-posta ile üyelik" });
const field = (label: string) => screen.getByLabelText(label, { exact: true }) as HTMLInputElement;
function fill(marketing = false) {
  fireEvent.change(field("Ad soyad"), { target: { value: "  Deniz Test  " } });
  fireEvent.change(field("E-posta"), { target: { value: " Deniz@example.test " } });
  fireEvent.change(field("Şifre"), { target: { value: "Sofrada123!" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /KVKK/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /Açık rıza/ }));
  if (marketing) fireEvent.click(screen.getByRole("checkbox", { name: /Ticari/ }));
}
beforeEach(() => {
  fetchMock.mockReset().mockImplementation(async () => Response.json({ data: { status: "confirmation_required", message: registrationConfirmation } }, { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("renders a production registration form with separate unchecked consents, recovery links and no Google", () => {
  vi.stubEnv("NODE_ENV", "production");
  render(<Page />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Soframıza katılın.");
  expect(metadata.robots).toEqual({ index: false, follow: false });
  const marketing = screen.getByRole("checkbox", { name: /Ticari/ }) as HTMLInputElement;
  expect(marketing.checked).toBe(false);
  expect(marketing.required).toBe(false);
  expect(screen.queryByRole("button", { name: /Google/ })).toBeNull();
  expect(screen.getByRole("link", { name: "Giriş yap" }).getAttribute("href")).toBe("/giris");
  expect(screen.getByRole("link", { name: "Üye olmadan alışverişe devam et" }).getAttribute("href")).toBe("/sepet");
  expect(field("Şifre").autocomplete).toBe("new-password");
});
it("validates locally, focuses the invalid field and associates errors without sending", async () => {
  render(<Page />);
  fireEvent.submit(form());
  await waitFor(() => expect(document.activeElement).toBe(field("Ad soyad")));
  expect(field("Ad soyad").getAttribute("aria-invalid")).toBe("true");
  const description = field("Ad soyad").getAttribute("aria-describedby")!;
  expect(document.getElementById(description)?.textContent).toContain("2–100");
  expect(screen.getByRole("alert").textContent).toContain("alanları kontrol");
  expect(fetchMock).not.toHaveBeenCalled();
});
it.each([false, true])("submits optional marketing=%s, blocks duplicate submits and awaits email confirmation", async marketing => {
  let finish!: (response: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  render(<Page />);
  fill(marketing);
  act(() => { fireEvent.submit(form()); fireEvent.submit(form()); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/auth/register");
  expect(options).toMatchObject({ method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" } });
  expect(JSON.parse(String(options?.body))).toEqual({ name: "Deniz Test", email: "deniz@example.test", password: "Sofrada123!", privacy: true, consent: true, marketing });
  expect(form().getAttribute("aria-busy")).toBe("true");
  expect((screen.getByRole("button", { name: "İşleniyor…" }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => { finish(Response.json({ data: { status: "confirmation_required" } }, { status: 202 })); });
  expect(screen.getByRole("status").textContent).toBe(registrationConfirmation);
  expect(field("Şifre").value).toBe("");
  expect(document.activeElement).toBe(screen.getByRole("status"));
  expect(sessionStorage.length + localStorage.length).toBe(0);
});
it("retains input after a safe error and supports retry without displaying arbitrary provider messages", async () => {
  fetchMock.mockImplementationOnce(async () => Response.json({ error: { code: "auth_unavailable", message: "private-secret" } }, { status: 503 }));
  render(<Page />);
  fill();
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Üyelik hizmeti"));
  expect(document.body.textContent).not.toContain("private-secret");
  expect(field("Şifre").value).toBe("Sofrada123!");
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(registrationConfirmation));
});
it.each(["network", "malformed", "rate", "password"])("handles %s errors and keeps the form usable", async mode => {
  if (mode === "network") fetchMock.mockRejectedValueOnce(new Error("private-secret"));
  if (mode === "malformed") fetchMock.mockResolvedValueOnce(Response.json({ unexpected: true }));
  if (mode === "rate") fetchMock.mockResolvedValueOnce(Response.json({}, { status: 429 }));
  if (mode === "password") fetchMock.mockResolvedValueOnce(Response.json({ error: { code: "validation_error", fields: { password: "private-secret" } } }, { status: 422 }));
  render(<Page />);
  fill();
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("alert").textContent).not.toBe(""));
  expect(document.body.textContent).not.toContain("private-secret");
  expect((screen.getByRole("button", { name: "Üyelik oluştur" }) as HTMLButtonElement).disabled).toBe(false);
  if (mode === "password") await waitFor(() => expect(document.activeElement).toBe(field("Şifre")));
});
it("supports the keyboard-operable password visibility control", () => {
  render(<Page />);
  const button = screen.getByRole("button", { name: "Şifreyi göster" });
  button.focus();
  fireEvent.click(button);
  expect(field("Şifre").type).toBe("text");
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  expect(field("Şifre").type).toBe("password");
  expect(fetchMock).not.toHaveBeenCalled();
});

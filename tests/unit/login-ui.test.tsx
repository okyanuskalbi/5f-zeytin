import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SignIn } from "@/components/account/SignIn";
import Page, { metadata } from "@/app/giris/page";

const magicLinkConfirmation = "İsteğiniz alındı. Hesabınız uygunsa e-posta adresinize bir giriş bağlantısı gönderilir. Bağlantıyı isteği başlattığınız tarayıcıda açın.";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), getUser: vi.fn(), cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth/server", () => ({ getVerifiedUser: mocks.getUser }));
const fetchMock = vi.fn<typeof fetch>();
const form = () => screen.getByRole("form", { name: "E-posta ile giriş" });
const field = (label: string) => screen.getByLabelText(label, { exact: true }) as HTMLInputElement;
function fill() {
  fireEvent.change(field("E-posta"), { target: { value: " Deniz@example.test " } });
  fireEvent.change(field("Şifre"), { target: { value: " Sofrada123! " } });
}
beforeEach(() => {
  mocks.replace.mockReset(); mocks.refresh.mockReset(); mocks.getUser.mockReset();
  mocks.cookies.mockResolvedValue({ getAll: () => [] });
  fetchMock.mockReset().mockResolvedValue(Response.json({ data: { status: "signed_in", redirectTo: "/sepet" } }));
  vi.stubGlobal("fetch", fetchMock);
  localStorage.clear(); sessionStorage.clear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("renders the real form in production, keeps guest/register links and disables Google", async () => {
  vi.stubEnv("NODE_ENV", "production");
  render(await Page({ searchParams: Promise.resolve({ next: "/sepet" }) }));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Soframıza hoş geldiniz.");
  expect(form()).toBeTruthy();
  expect(metadata.robots).toEqual({ index: false, follow: false });
  expect(screen.queryByRole("button", { name: /Google/ })).toBeNull();
  expect(document.body.textContent).not.toMatch(/Demo|yakında/);
  expect(screen.getByRole("link", { name: "Üye ol" }).getAttribute("href")).toBe("/kayit");
  expect(screen.getByRole("link", { name: "Üye olmadan alışverişe devam et" }).getAttribute("href")).toBe("/sepet");
  expect(field("Şifre").autocomplete).toBe("current-password");
  expect(mocks.getUser).not.toHaveBeenCalled();
});
it("validates and focuses invalid fields without sending", async () => {
  render(<SignIn />);
  fireEvent.submit(form());
  await waitFor(() => expect(document.activeElement).toBe(field("E-posta")));
  expect(field("E-posta").getAttribute("aria-invalid")).toBe("true");
  expect(document.getElementById(field("E-posta").getAttribute("aria-describedby")!)?.textContent).toContain("Geçerli");
  expect(fetchMock).not.toHaveBeenCalled();
});
it("submits once, clears the password and refreshes the authenticated destination", async () => {
  let finish!: (response: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  render(<SignIn next="/sepet" />); fill();
  act(() => { fireEvent.submit(form()); fireEvent.submit(form()); });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0]).toEqual(["/api/auth/login", expect.objectContaining({ method: "POST", credentials: "same-origin", body: JSON.stringify({ method: "password", email: "deniz@example.test", password: " Sofrada123! ", next: "/sepet" }) })]);
  expect((screen.getByRole("button", { name: "İşleniyor…" }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => finish(Response.json({ data: { status: "signed_in", redirectTo: "/sepet" } })));
  expect(field("Şifre").value).toBe("");
  expect(mocks.replace).toHaveBeenCalledWith("/sepet");
  expect(mocks.refresh).toHaveBeenCalledOnce();
  expect(localStorage.length + sessionStorage.length).toBe(0);
});
it.each([401, 429, 503, "network", "malformed"])("handles %s without exposing arbitrary provider text and allows retry", async status => {
  if (status === "network") fetchMock.mockRejectedValueOnce(new Error("private-secret"));
  else fetchMock.mockResolvedValueOnce(Response.json({ error: { message: "private-secret" } }, { status: typeof status === "number" ? status : 200 }));
  render(<SignIn />); fill(); fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("alert").textContent).not.toBe(""));
  expect(document.body.textContent).not.toContain("private-secret");
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  expect(field("Şifre").value).toBe(" Sofrada123! ");
  expect(mocks.replace).not.toHaveBeenCalled();
  fireEvent.submit(form());
  await waitFor(() => expect(mocks.replace).toHaveBeenCalled());
});
it("defensively sanitizes a tampered successful redirect", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ data: { status: "signed_in", redirectTo: "https://evil.example" } }));
  render(<SignIn next="//evil.example" />); fill(); fireEvent.submit(form());
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/hesabim"));
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).next).toBe("/hesabim");
});
it("requests a magic link without a password, stays on the page and focuses neutral confirmation", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ data: { status: "link_requested" } }, { status: 202 }));
  render(<SignIn next="/odeme" />);
  fireEvent.click(screen.getByRole("button", { name: "E-posta bağlantısıyla giriş" }));
  expect(screen.queryByLabelText("Şifre", { exact: true })).toBeNull();
  fireEvent.change(field("E-posta"), { target: { value: "deniz@example.test" } });
  fireEvent.submit(form());
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(magicLinkConfirmation));
  expect(document.activeElement).toBe(screen.getByRole("status"));
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ method: "magic_link", email: "deniz@example.test", next: "/odeme" });
  expect(mocks.replace).not.toHaveBeenCalled();
});
it("supports password visibility without losing focus or submitting", () => {
  render(<SignIn />);
  const control = screen.getByRole("button", { name: "Şifreyi göster" });
  control.focus(); fireEvent.click(control);
  expect(field("Şifre").type).toBe("text");
  expect(control.getAttribute("aria-pressed")).toBe("true");
  expect(document.activeElement).toBe(control);
  fireEvent.click(control); expect(field("Şifre").type).toBe("password");
  expect(fetchMock).not.toHaveBeenCalled();
});
it("offers logout only after server verification and clears local UI after success", async () => {
  mocks.cookies.mockResolvedValue({ getAll: () => [{ name: "sb-fixture-auth-token", value: "cookie-is-not-proof" }] });
  mocks.getUser.mockResolvedValue({ id: "verified-member", email: "deniz@example.test" });
  render(await Page({ searchParams: Promise.resolve({ next: ["/sepet", "//evil.example"] }) }));
  expect(screen.queryByRole("form")).toBeNull();
  expect(document.body.textContent).not.toContain("deniz@example.test");
  expect(screen.getByRole("link", { name: "Alışverişe devam et" }).getAttribute("href")).toBe("/hesabim");
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(form()).toBeTruthy());
  expect(fetchMock).toHaveBeenCalledWith("/auth/logout", expect.objectContaining({ method: "POST", credentials: "same-origin" }));
  expect(mocks.replace).toHaveBeenCalledWith("/giris");
  expect(mocks.refresh).toHaveBeenCalled();
});
it("keeps logout available after an error and never claims the session ended", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ error: { message: "private-secret" } }, { status: 429 }));
  render(<SignIn signedIn />);
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Çok fazla deneme"));
  expect(screen.queryByRole("form")).toBeNull();
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(document.body.textContent).not.toContain("private-secret");
});
it("reflects newly verified server state when the same route is refreshed", () => {
  const view = render(<SignIn signedIn={false} />);
  expect(form()).toBeTruthy();
  view.rerender(<SignIn signedIn />);
  expect(screen.queryByRole("form")).toBeNull();
  expect(screen.getByRole("button", { name: "Çıkış yap" })).toBeTruthy();
});
it.each([503, "network"] as const)("keeps the session open on logout %s and allows retry", async status => {
  if (status === "network") fetchMock.mockRejectedValueOnce(new Error("private-secret"));
  else fetchMock.mockResolvedValueOnce(Response.json({}, { status }));
  render(<SignIn signedIn />);
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).not.toBe(""));
  expect(screen.queryByRole("form")).toBeNull();
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(document.body.textContent).not.toContain("private-secret");
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(form()).toBeTruthy());
});
it("returns from magic link to password login with the password cleared", async () => {
  render(<SignIn />); fill();
  fireEvent.click(screen.getByRole("button", { name: "E-posta bağlantısıyla giriş" }));
  fireEvent.click(screen.getByRole("button", { name: "Şifreyle girişe dön" }));
  expect(field("Şifre").value).toBe("");
  expect(field("Şifre").type).toBe("password");
  expect(field("E-posta").value).toBe("Deniz@example.test");
  expect(fetchMock).not.toHaveBeenCalled();
});
it("treats a forged/expired session as anonymous and handles service failures safely", async () => {
  mocks.cookies.mockResolvedValue({ getAll: () => [{ name: "sb-fixture-auth-token", value: "forged" }] });
  mocks.getUser.mockResolvedValueOnce(null);
  const rendered = render(await Page());
  expect(form()).toBeTruthy(); rendered.unmount();
  mocks.getUser.mockRejectedValueOnce(new Error("private-secret"));
  render(await Page());
  expect(form()).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("Üyelik hizmeti");
  expect(document.body.textContent).not.toContain("private-secret");
});

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Page, { dynamic, metadata } from "@/app/hesabim/page";
import { AccountSummary } from "@/components/account/AccountSummary";

const mocks = vi.hoisted(() => ({ read: vi.fn(), cookies: vi.fn(), replace: vi.fn(), refresh: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/account/read", () => ({ readOwnAccount: mocks.read }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }), redirect: mocks.redirect }));
const profile = { name: "Deniz Sofra", email: "deniz@example.test", phone: "05321234567" };
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset());
  mocks.cookies.mockResolvedValue({ getAll: () => [{ name: "sb-fixture-auth-token", value: "cookie-is-not-proof" }] });
  mocks.read.mockResolvedValue(profile);
  mocks.redirect.mockImplementation((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`); });
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  sessionStorage.clear(); localStorage.clear();
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it.each(["production", "development"])("requires server verification even when demo storage is seeded (%s)", async mode => {
  vi.stubEnv("NODE_ENV", mode); vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
  sessionStorage.setItem("afina:membership:demo-session:v1", JSON.stringify(profile));
  mocks.cookies.mockResolvedValue({ getAll: () => [] });
  await expect(Page()).rejects.toThrow("NEXT_REDIRECT:/giris?next=/hesabim");
  expect(mocks.read).not.toHaveBeenCalled();
});
it("redirects a forged or expired session without catching the framework redirect", async () => {
  mocks.read.mockResolvedValue(null);
  await expect(Page()).rejects.toThrow("NEXT_REDIRECT:/giris?next=/hesabim");
  expect(mocks.read).toHaveBeenCalledOnce();
});
it("renders the verified own profile with no admin data or profile mutation controls", async () => {
  render(await Page());
  expect(dynamic).toBe("force-dynamic");
  expect(metadata.robots).toEqual({ index: false, follow: false });
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hesabım");
  Object.values(profile).forEach(value => expect(screen.getByRole("main").textContent).toContain(value));
  expect(screen.getByRole("link", { name: "Sipariş geçmişim" }).getAttribute("href")).toBe("/hesabim/siparisler");
  expect(document.querySelector('a[href^="/admin"], form, input')).toBeNull();
  expect(document.body.textContent).not.toMatch(/admin|Demo|yakında|DEMO-10801/);
  expect(fetchMock).not.toHaveBeenCalled();
});
it("shows a safe recoverable service failure without member information", async () => {
  mocks.read.mockRejectedValue(new Error("private-secret deniz@example.test"));
  render(await Page());
  expect(screen.getByRole("alert").textContent).toContain("Hesap bilgileri yüklenemedi");
  expect(document.body.textContent).not.toMatch(/private-secret|deniz|05321234567/);
  expect(screen.queryByRole("button", { name: "Çıkış yap" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Yeniden dene" }));
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
it("renders missing fields honestly and treats display names as text", () => {
  const view = render(<AccountSummary profile={{ name: null, email: null, phone: null }} />);
  expect(screen.getAllByText("Belirtilmedi")).toHaveLength(3);
  view.rerender(<AccountSummary profile={{ ...profile, name: '<img src=x onerror="alert(1)">' }} />);
  expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeTruthy();
  expect(document.querySelector("img, script")).toBeNull();
});
it("locks duplicate logout requests, clears personal data on success, refreshes and preserves the cart", async () => {
  let finish!: (value: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  localStorage.setItem("guest-cart", "preserved");
  render(<AccountSummary profile={profile} />);
  const logout = screen.getByRole("button", { name: "Çıkış yap" });
  act(() => { fireEvent.click(logout); fireEvent.click(logout); });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock).toHaveBeenCalledWith("/auth/logout", expect.objectContaining({ method: "POST", credentials: "same-origin" }));
  expect((screen.getByRole("button", { name: "İşleniyor…" }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => finish(new Response(null, { status: 204 })));
  expect(document.body.textContent).not.toMatch(/Deniz Sofra|deniz@example.test|05321234567/);
  expect(screen.getByRole("status").textContent).toBe("Oturumunuz kapatıldı.");
  expect(mocks.replace).toHaveBeenCalledWith("/giris");
  expect(mocks.refresh).toHaveBeenCalledOnce();
  expect(localStorage.getItem("guest-cart")).toBe("preserved");
  expect(sessionStorage.length).toBe(0);
});
it.each([401, 429, 503, 200, "network"] as const)("keeps the profile visible after logout failure %s and allows retry", async status => {
  if (status === "network") fetchMock.mockRejectedValueOnce(new Error("private-provider-secret"));
  else fetchMock.mockResolvedValueOnce(Response.json({ error: { message: "private-provider-secret" } }, { status }));
  render(<AccountSummary profile={profile} />);
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).not.toBe(""));
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  expect(screen.getByRole("main").textContent).toContain(profile.email);
  expect(document.body.textContent).not.toContain("private-provider-secret");
  expect(mocks.replace).not.toHaveBeenCalled();
  if (status === 429) expect(screen.getByRole("alert").textContent).toContain("Çok fazla deneme");
  fireEvent.click(screen.getByRole("button", { name: "Çıkış yap" }));
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/giris"));
});
it("uses newly verified profile props after refresh and removes stale data on service failure", () => {
  const view = render(<AccountSummary profile={profile} />);
  view.rerender(<AccountSummary profile={{ name: "Başka Üye", email: "other@example.test", phone: null }} />);
  expect(document.body.textContent).not.toContain(profile.email);
  expect(document.body.textContent).toContain("other@example.test");
  view.rerender(<AccountSummary profile={null} />);
  expect(document.body.textContent).not.toContain("other@example.test");
  expect(screen.getByRole("alert")).toBeTruthy();
});

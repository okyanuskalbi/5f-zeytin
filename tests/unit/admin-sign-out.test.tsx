import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin/AdminShell";

const nav = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));

beforeEach(() => {
  nav.replace.mockReset(); nav.refresh.mockReset();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("panel sign-out", () => {
  it("is present in the sidebar", () => {
    render(<AdminShell />);
    expect(screen.getAllByRole("button", { name: "Çıkış yap" }).length).toBeGreaterThanOrEqual(1);
  });
  it("posts to /auth/logout, disables while busy, then redirects to /giris", async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi.fn(() => new Promise<Response>(done => { resolve = done; }));
    vi.stubGlobal("fetch", fetcher);
    render(<AdminShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Çıkış yap" })[0]);
    expect(fetcher).toHaveBeenCalledWith("/auth/logout", { method: "POST", credentials: "same-origin" });
    const busy = await screen.findByRole("button", { name: "Çıkış yapılıyor…" });
    expect((busy as HTMLButtonElement).disabled).toBe(true);
    resolve(new Response(null, { status: 204 }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith("/giris"));
    expect(nav.refresh).toHaveBeenCalled();
  });
  it("stays on the page and shows an error when logout fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    render(<AdminShell />);
    fireEvent.click(screen.getAllByRole("button", { name: "Çıkış yap" })[0]);
    await waitFor(() => expect(screen.getAllByText("Çıkış yapılamadı. Lütfen yeniden deneyin.").length).toBeGreaterThan(0));
    expect(nav.replace).not.toHaveBeenCalled();
    expect((screen.getAllByRole("button", { name: "Çıkış yap" })[0] as HTMLButtonElement).disabled).toBe(false);
  });
});

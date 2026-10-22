import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/admin/page";
import { AdminShell, type AdminOverview } from "@/components/admin/AdminShell";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), refresh: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
const fixture: AdminOverview = { status: "fixture", activeProducts: 3, awaitingPayment: 2, readyToShip: 1 };
const areas = ["Ürünler", "Siparişler", "Kargo", "Kupon / Kampanya", "Terk Edilen Sepet", "Müşteriler"];
let media: { matches: boolean; listeners: Set<(event: { matches: boolean }) => void> };

beforeEach(() => {
  mocks.requireAdmin.mockReset().mockResolvedValue({ id: "verified-admin", email: "private@example.test" });
  mocks.refresh.mockReset();
  media = { matches: false, listeners: new Set() };
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: media.matches,
    addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => media.listeners.add(listener),
    removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) => media.listeners.delete(listener),
  })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("protected admin shell", () => {
  it("rechecks admin permission in the page and never passes identity to the client", async () => {
    render(await Page());
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Genel Bakış");
    expect(document.body.textContent).not.toContain("private@example.test");
  });
  it.each([401, 403, 503])("does not create shell content after failed authorization %s", async status => {
    mocks.requireAdmin.mockRejectedValue({ status });
    await expect(Page()).rejects.toEqual({ status });
    expect(screen.queryByRole("main")).toBeNull();
  });
  it("groups six operations and links only to existing on-page areas", () => {
    render(<AdminShell overview={fixture} />);
    const nav = within(screen.getByRole("navigation", { name: "Yönetim navigasyonu" }));
    expect(nav.getByRole("link", { name: "Genel Bakış" }).getAttribute("aria-current")).toBe("location");
    for (const area of areas) {
      const link = nav.getByRole("link", { name: area });
      expect(link.getAttribute("href")).toMatch(/^#admin-/);
      expect(document.getElementById(link.getAttribute("href")!.slice(1))).toBeTruthy();
      expect(screen.getByRole("region", { name: area })).toBeTruthy();
    }
    expect(nav.getByText("Operasyon")).toBeTruthy();
    expect(nav.getByText("Pazarlama")).toBeTruthy();
    fireEvent.click(nav.getByRole("link", { name: "Siparişler" }));
    expect(nav.getByRole("link", { name: "Siparişler" }).getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("region", { name: "Siparişler" }).contains(document.activeElement)).toBe(true);
    expect(document.querySelector('a[href^="/admin/"]')).toBeNull();
  });
  it("labels all three sample summaries and keeps unavailable analysis honest", () => {
    render(<AdminShell overview={fixture} />);
    const summaries = within(screen.getByRole("region", { name: "Operasyon özeti" }));
    expect(summaries.getAllByText("TEST VERİSİ")).toHaveLength(3);
    expect(summaries.getByRole("region", { name: "Aktif ürün" }).textContent).toContain("3 / 6");
    expect(summaries.getByRole("region", { name: "Ödeme bekleyen sipariş" }).textContent).toContain("2");
    expect(summaries.getByRole("region", { name: "Kargoya hazır sipariş" }).textContent).toContain("1");
    expect(screen.getByRole("region", { name: "Sipariş görünümü" }).textContent).toContain("Henüz sipariş verisi yok");
    expect(document.querySelector("table, canvas")).toBeNull();
    expect(document.body.textContent).not.toMatch(/ciro|%|AI önerisi/i);
  });
  it("searches Turkish area names without accessing customer data or services", () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    render(<AdminShell />);
    const input = screen.getByRole("searchbox", { name: "Yönetim alanlarında ara" });
    fireEvent.change(input, { target: { value: "SİPARİŞ" } });
    const results = within(screen.getByRole("navigation", { name: "Arama sonuçları" }));
    expect(results.getAllByRole("link")).toHaveLength(1);
    fireEvent.click(results.getByRole("link", { name: "Siparişler" }));
    expect(screen.getByRole("region", { name: "Siparişler" }).contains(document.activeElement)).toBe(true);
    expect((input as HTMLInputElement).value).toBe("");
    fireEvent.change(input, { target: { value: "olmayan" } });
    expect(screen.getByRole("status").textContent).toContain("Eşleşen yönetim alanı bulunamadı");
    fireEvent.keyDown(input, { key: "Escape" });
    expect((input as HTMLInputElement).value).toBe("");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("distinguishes empty and loading summaries without showing sample values", () => {
    const view = render(<AdminShell overview={{ status: "loading" }} />);
    expect(screen.getByRole("status").textContent).toContain("Özet yükleniyor");
    expect(screen.getByRole("region", { name: "Operasyon özeti" }).getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText("TEST VERİSİ")).toBeNull();
    view.rerender(<AdminShell overview={{ status: "empty" }} />);
    expect(screen.getByRole("region", { name: "Operasyon özeti" }).textContent).toContain("Henüz veri yok");
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("shows a recoverable error and requests a server refresh", () => {
    render(<AdminShell overview={{ status: "error" }} />);
    expect(screen.getByRole("alert").textContent).toContain("Özet yüklenemedi");
    expect(screen.queryByText("TEST VERİSİ")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Yeniden dene" }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it.each([
    { activeProducts: 7 }, { activeProducts: -1 }, { activeProducts: 1.5 },
    { awaitingPayment: -1 }, { readyToShip: Number.NaN },
  ])("rejects invalid sample counts rather than displaying them: %j", counts => {
    render(<AdminShell overview={{ ...fixture, ...counts }} />);
    expect(screen.getByRole("alert").textContent).toContain("Özet yüklenemedi");
    expect(screen.queryByText("TEST VERİSİ")).toBeNull();
  });
  it("supports valid zero counts and all six product slots", () => {
    render(<AdminShell overview={{ status: "fixture", activeProducts: 6, awaitingPayment: 0, readyToShip: 0 }} />);
    expect(screen.getByRole("region", { name: "Aktif ürün" }).textContent).toContain("6 / 6");
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("opens the mobile sheet, traps focus and restores focus on close", async () => {
    render(<AdminShell />);
    const trigger = screen.getByRole("button", { name: "Yönetim menüsünü aç" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Yönetim menüsü" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
  it("closes mobile navigation on selection and focuses the target heading", async () => {
    render(<AdminShell />);
    fireEvent.click(screen.getByRole("button", { name: "Yönetim menüsünü aç" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("link", { name: "Müşteriler" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(screen.getByRole("region", { name: "Müşteriler" }).contains(document.activeElement)).toBe(true));
  });
});

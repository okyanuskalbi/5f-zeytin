import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DiscountsPage from "@/app/panel/indirimler/page";
import { CartSummary } from "@/components/cart/CartSummary";
import { DiscountsManager } from "@/components/admin/DiscountsManager";
import { createCartStore } from "@/lib/cart/store";
import type { ProductVariant } from "@/types/catalog";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const olive: ProductVariant = { id: "olive", familyId: "olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 12550, stock: 9, imageKey: "urun-01-kirma-10kg", galleryKeys: [] };
const products = [olive];
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => {
  mocks.requireAdmin.mockReset().mockResolvedValue({ id: "a", email: "a@example.test" });
  fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function cart(quantity = 2) {
  const store = createCartStore({ products, storage: null });
  store.addItem("olive", quantity);
  render(<CartSummary store={store} products={products} onRefresh={() => {}} discountEnabled />);
  return { store, summary: screen.getByRole("complementary", { name: "Sepet özeti" }) };
}
const ok = (discountKurus: number, code = "ZEYTIN10") => Response.json({ data: { code, type: "percent", value: 10, subtotalKurus: 0, discountKurus, totalKurus: 0 } });

describe("sepette indirim kodu", () => {
  it("sends only the code and product/quantity, shows the server discount row and lowers the totals", async () => {
    fetcher.mockResolvedValue(ok(2510));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "zeytin10" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    expect(await within(summary).findByText("İndirim kodu uygulandı.")).toBeTruthy();
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("/api/discount/validate");
    expect(JSON.parse(init.body)).toEqual({ code: "zeytin10", items: [{ productId: "olive", quantity: 2 }] });
    expect(within(summary).getByLabelText("İndirim").textContent).toBe("-25,10 ₺");
    expect(within(summary).getByText("İndirim (ZEYTIN10)")).toBeTruthy();
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("225,90 ₺");
    expect(within(screen.getByRole("region", { name: "Mobil ödeme" })).getByLabelText("Mobil toplam (tahmini)").textContent).toBe("225,90 ₺");
    expect(within(summary).getByLabelText("Ara toplam").textContent).toBe("251,00 ₺");
  });
  it("shows the generic error for an invalid code and keeps the totals", async () => {
    fetcher.mockResolvedValue(Response.json({ error: { code: "invalid_code", message: "Kod geçersiz." } }, { status: 422 }));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "yanlis" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    expect((await within(summary).findByRole("alert")).textContent).toBe("Kod geçersiz.");
    expect(within(summary).queryByText(/İndirim \(/)).toBeNull();
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
  });
  it("removes the applied code and restores the total", async () => {
    fetcher.mockResolvedValue(ok(2510));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "zeytin10" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    fireEvent.click(await within(summary).findByRole("button", { name: "ZEYTIN10 indirim kodunu kaldır" }));
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("251,00 ₺");
    expect(within(summary).getByLabelText("İndirim kodu")).toBeTruthy();
    expect(within(summary).getByText("İndirim kodu kaldırıldı.")).toBeTruthy();
  });
  it("re-validates on the server when the cart changes and takes the new amount", async () => {
    fetcher.mockResolvedValueOnce(ok(2510)).mockResolvedValueOnce(ok(3765));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "zeytin10" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    await within(summary).findByText("İndirim (ZEYTIN10)");
    fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ code: "ZEYTIN10", items: [{ productId: "olive", quantity: 3 }] });
    await waitFor(() => expect(within(summary).getByLabelText("İndirim").textContent).toBe("-37,65 ₺"));
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("338,85 ₺");
  });
  it("drops the code with a notice when it stops being valid for the changed cart", async () => {
    fetcher.mockResolvedValueOnce(ok(2510)).mockResolvedValueOnce(Response.json({ error: { code: "invalid_code" } }, { status: 422 }));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "zeytin10" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    await within(summary).findByText("İndirim (ZEYTIN10)");
    fireEvent.click(screen.getByRole("button", { name: "Adedi artır" }));
    expect((await within(summary).findByRole("alert")).textContent).toContain("geçerli değil");
    expect(within(summary).getByLabelText("Toplam (tahmini)").textContent).toBe("376,50 ₺");
  });
  it("shows a retryable message when the network fails", async () => {
    fetcher.mockRejectedValue(new Error("ağ"));
    const { summary } = cart();
    fireEvent.change(within(summary).getByLabelText("İndirim kodu"), { target: { value: "zeytin10" } });
    fireEvent.click(within(summary).getByRole("button", { name: "İndirim kodunu uygula" }));
    expect((await within(summary).findByRole("alert")).textContent).toContain("Lütfen yeniden deneyin");
  });
});

const discount = { id: "d1", code: "ZEYTIN10", type: "percent", value: 10, minSubtotalKurus: 5000, startsAt: null, endsAt: null, maxUses: 5, usedCount: 2, active: true, createdAt: "2026-11-01T10:00:00.000Z", note: "Açılış" };
const list = (data: unknown[]) => Response.json({ data, total: data.length, page: 1, pageSize: 20 });

describe("panel /panel/indirimler", () => {
  it("rechecks admin permission and marks the navigation item active", async () => {
    fetcher.mockResolvedValue(list([]));
    render(await DiscountsPage());
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("İndirim kodları");
    expect(within(screen.getByRole("navigation", { name: "Yönetim navigasyonu" })).getByRole("link", { name: "İndirim kodları" }).getAttribute("aria-current")).toBe("page");
    await screen.findByText("Henüz kod yok.");
  });
  it("lists codes with usage and status", async () => {
    fetcher.mockResolvedValue(list([discount]));
    render(<DiscountsManager />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("ZEYTIN10")).toBeTruthy();
    expect(within(table).getByText("%10")).toBeTruthy();
    expect(within(table).getByText("2 / 5")).toBeTruthy();
    expect(within(table).getByText("Açık")).toBeTruthy();
  });
  it("creates a fixed-amount code in kuruş with Istanbul dates and closes the dialog", async () => {
    fetcher.mockImplementation(async (_url: string, init?: RequestInit) => (init?.method === "POST" ? Response.json({ id: "n1" }, { status: 201 }) : list([])));
    render(<DiscountsManager />);
    await screen.findByText("Henüz kod yok.");
    fireEvent.click(screen.getByRole("button", { name: "Yeni kod" }));
    const dialog = await screen.findByRole("dialog", { name: "Yeni indirim kodu" });
    fireEvent.change(within(dialog).getByLabelText("Kod"), { target: { value: "yaz25" } });
    fireEvent.click(within(dialog).getByRole("radio", { name: "Tutar (₺)" }));
    fireEvent.change(within(dialog).getByLabelText("İndirim tutarı (₺)"), { target: { value: "25,50" } });
    fireEvent.change(within(dialog).getByLabelText("En düşük sepet tutarı (₺)"), { target: { value: "100" } });
    fireEvent.change(within(dialog).getByLabelText("Bitiş"), { target: { value: "2026-12-31T23:59" } });
    fireEvent.change(within(dialog).getByLabelText("Kullanım limiti"), { target: { value: "50" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const call = fetcher.mock.calls.find(([, init]) => init?.method === "POST")!;
    expect(JSON.parse(call[1].body)).toEqual({ code: "YAZ25", type: "fixed", value: 2550, minSubtotalKurus: 10000, startsAt: null, endsAt: "2026-12-31T20:59:00.000Z", maxUses: 50, note: null, active: true });
  });
  it("validates before sending and maps duplicate to a short message", async () => {
    fetcher.mockImplementation(async (_url: string, init?: RequestInit) => (init?.method === "POST" ? Response.json({ error: { code: "discount_duplicate" } }, { status: 409 }) : list([])));
    render(<DiscountsManager />);
    await screen.findByText("Henüz kod yok.");
    fireEvent.click(screen.getByRole("button", { name: "Yeni kod" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("İndirim yüzdesi"), { target: { value: "150" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));
    expect((await within(dialog).findByRole("alert")).textContent).toBe("Yüzde 1 ile 100 arasında olmalı.");
    expect(fetcher.mock.calls.some(([, init]) => init?.method === "POST")).toBe(false);
    fireEvent.change(within(dialog).getByLabelText("İndirim yüzdesi"), { target: { value: "10" } });
    fireEvent.change(within(dialog).getByLabelText("Kod"), { target: { value: "var" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Oluştur" }));
    await waitFor(() => expect(within(dialog).getByRole("alert").textContent).toBe("Bu kod zaten var."));
  });
  it("edits without touching the code or usage, and toggles active state", async () => {
    fetcher.mockImplementation(async (_url: string, init?: RequestInit) => (init?.method === "PATCH" ? Response.json({ id: "d1" }) : list([discount])));
    render(<DiscountsManager />);
    fireEvent.click(await screen.findByRole("button", { name: "ZEYTIN10 kodunu aç" }));
    const dialog = await screen.findByRole("dialog", { name: "ZEYTIN10" });
    expect((within(dialog).getByLabelText("Kod") as HTMLInputElement).readOnly).toBe(true);
    expect(within(dialog).getByText("2 / 5")).toBeTruthy();
    fireEvent.change(within(dialog).getByLabelText("İndirim yüzdesi"), { target: { value: "15" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));
    await within(dialog).findByText("Kod güncellendi.");
    expect(JSON.parse(fetcher.mock.calls.find(([, init]) => init?.method === "PATCH")![1].body)).toEqual({ id: "d1", type: "percent", value: 15, minSubtotalKurus: 5000, startsAt: null, endsAt: null, maxUses: 5, note: "Açılış" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kodu kapat" }));
    await waitFor(() => expect(JSON.parse(fetcher.mock.calls.filter(([, init]) => init?.method === "PATCH").at(-1)![1].body)).toEqual({ id: "d1", active: false }));
  });
});

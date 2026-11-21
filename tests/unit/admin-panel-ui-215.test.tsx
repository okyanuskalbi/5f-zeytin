import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrdersPage from "@/app/panel/siparisler/page";
import CustomersPage from "@/app/panel/musteriler/page";
import LeadsPage from "@/app/panel/leadler/page";
import { CustomersManager, LeadsManager, OrdersManager } from "@/components/admin/PanelManagers";
import { sendLead } from "@/lib/contact/lead-client";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const order = { id: "o1", orderNo: "AZ-1001", status: "paid", totalKurus: 25000, createdAt: "2026-11-01T10:00:00.000Z", customerName: "Ayşe Yılmaz", customerEmail: "ayse@example.test", itemCount: 2 };
const orderDetail = { ...order, currency: "TRY", shippingCarrier: null, trackingNo: null,
  deliveryAddress: { recipient: "Ayşe Yılmaz", line: "Zeytin Sk. 1", district: "Düziçi", city: "Osmaniye", postalCode: "80600", phone: "" },
  items: [{ id: "i1", productName: "Yeşil zeytin", weight: "1 kg", quantity: 2, unitPriceKurus: 12500 }] };
const customer = { id: "u1", name: "Ayşe Yılmaz", email: "ayse@example.test", phone: null, createdAt: "2026-10-01T10:00:00.000Z", orderCount: 2, totalKurus: 25000, addressCount: 1 };
const lead = { id: "l1", createdAt: "2026-11-02T09:00:00.000Z", name: "Ali Veli", email: "ali@example.test", phone: null, message: "Toptan fiyat", source: "bayilik", status: "new", note: null };
const list = (data: unknown[]) => Response.json({ data, total: data.length, page: 1, pageSize: 20 });
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => { mocks.requireAdmin.mockReset().mockResolvedValue({ id: "a", email: "a@example.test" }); fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }))); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("panel pages", () => {
  it.each([[OrdersPage, "Siparişler"], [CustomersPage, "Müşteriler"], [LeadsPage, "Leadler"]] as const)("recheck admin permission and mark the navigation item active (%#)", async (Page, label) => {
    fetcher.mockResolvedValue(list([]));
    render(await Page());
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(label);
    expect(within(screen.getByRole("navigation", { name: "Yönetim navigasyonu" })).getByRole("link", { name: label }).getAttribute("aria-current")).toBe("page");
    await screen.findByText("Toplam kayıt");
  });
  it.each([401, 403])("renders nothing when authorization fails (%s)", async status => {
    mocks.requireAdmin.mockRejectedValue({ status });
    await expect(OrdersPage()).rejects.toEqual({ status });
  });
});

describe("orders manager", () => {
  it("lists orders in a labelled table with Turkish status text and queries the filtered API", async () => {
    fetcher.mockImplementation(async () => list([order]));
    render(<OrdersManager />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("AZ-1001")).toBeTruthy();
    expect(within(table).getByText("Ödendi")).toBeTruthy();
    expect(within(table).getByText(/250,00/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Durum"), { target: { value: "shipped" } });
    fireEvent.change(screen.getByLabelText("Sipariş no, ad veya e-posta"), { target: { value: "ayse" } });
    fireEvent.click(screen.getByRole("button", { name: "Ara" }));
    await waitFor(() => expect(String(fetcher.mock.calls.at(-1)![0])).toBe("/api/admin/orders?page=1&status=shipped&q=ayse"));
  });
  it("shows an honest empty state and a retryable error", async () => {
    fetcher.mockResolvedValueOnce(new Response("{}", { status: 503 })).mockResolvedValue(list([]));
    render(<OrdersManager />);
    expect((await screen.findByRole("alert")).textContent).toContain("Sipariş yüklenemedi");
    fireEvent.click(screen.getByRole("button", { name: "Yeniden dene" }));
    expect(await screen.findByText("Henüz sipariş yok.")).toBeTruthy();
  });
  it("opens the detail dialog, loads items and sends only the status and shipping fields", async () => {
    fetcher.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") return Response.json({ id: "o1", status: "shipped" });
      return String(url).includes("?id=") ? Response.json({ data: orderDetail }) : list([order]);
    });
    render(<OrdersManager />);
    fireEvent.click(await screen.findByRole("button", { name: "AZ-1001 ayrıntısını aç" }));
    const dialog = await screen.findByRole("dialog", { name: "Sipariş AZ-1001" });
    expect(await within(dialog).findByText("Yeşil zeytin")).toBeTruthy();
    expect(within(dialog).getByText(/Zeytin Sk\. 1/)).toBeTruthy();
    expect((within(dialog).getByRole("button", { name: "Kaydet" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("Yeni durum"), { target: { value: "shipped" } });
    fireEvent.change(within(dialog).getByLabelText("Takip no"), { target: { value: "TR55" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));
    await within(dialog).findByText("Sipariş güncellendi.");
    const call = fetcher.mock.calls.find(([, init]) => init?.method === "PATCH")!;
    expect(JSON.parse(call[1].body)).toEqual({ id: "o1", status: "shipped", trackingNo: "TR55" });
  });
  it("maps a conflict to a short Turkish message", async () => {
    fetcher.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") return Response.json({ error: { code: "order_conflict" } }, { status: 409 });
      return String(url).includes("?id=") ? Response.json({ data: orderDetail }) : list([order]);
    });
    render(<OrdersManager />);
    fireEvent.click(await screen.findByRole("button", { name: "AZ-1001 ayrıntısını aç" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText("Yeşil zeytin");
    fireEvent.change(within(dialog).getByLabelText("Yeni durum"), { target: { value: "delivered" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));
    expect((await within(dialog).findByRole("alert")).textContent).toContain("durum geçişi yapılamaz");
  });
});

describe("customers and leads managers", () => {
  it("shows customer totals and loads addresses in the detail", async () => {
    fetcher.mockImplementation(async (url: string) => String(url).includes("?id=")
      ? Response.json({ data: { ...customer, addresses: [{ id: "a1", title: "Ev", recipient: "Ayşe Yılmaz", phone: "+905551112233", city: "Osmaniye", district: "Düziçi", line: "Zeytin Sk. 1", postalCode: "80600", isDefault: true }] } })
      : list([customer]));
    render(<CustomersManager />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("ayse@example.test")).toBeTruthy();
    expect(screen.queryByLabelText("Durum")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ayşe Yılmaz ayrıntısını aç" }));
    const dialog = await screen.findByRole("dialog", { name: "Ayşe Yılmaz" });
    expect(await within(dialog).findByText("Varsayılan")).toBeTruthy();
    expect(within(dialog).getByText(/Zeytin Sk\. 1, Düziçi \/ Osmaniye 80600/)).toBeTruthy();
  });
  it("saves lead status and note through the leads API", async () => {
    fetcher.mockImplementation(async (_url: string, init?: RequestInit) => init?.method === "PATCH" ? Response.json({ id: "l1" }) : list([lead]));
    render(<LeadsManager />);
    expect(within(await screen.findByRole("table")).getByText("Yeni")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ali Veli kaydını aç" }));
    const dialog = await screen.findByRole("dialog", { name: "Ali Veli" });
    expect(within(dialog).getByRole("link", { name: "ali@example.test" }).getAttribute("href")).toBe("mailto:ali@example.test");
    fireEvent.change(within(dialog).getByLabelText("Durum"), { target: { value: "contacted" } });
    fireEvent.change(within(dialog).getByLabelText("Not"), { target: { value: "Arandı" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));
    await within(dialog).findByText("Kayıt güncellendi.");
    const call = fetcher.mock.calls.find(([, init]) => init?.method === "PATCH")!;
    expect(JSON.parse(call[1].body)).toEqual({ id: "l1", status: "contacted", note: "Arandı" });
  });
});

describe("silent lead record from public forms", () => {
  it("posts JSON to the contact endpoint and never throws", async () => {
    fetcher.mockResolvedValue(Response.json({ ok: true }, { status: 201 }));
    expect(await sendLead({ name: "Ali Veli", phone: "+905550000000", message: "x", source: "teklif" })).toBe(true);
    expect(String(fetcher.mock.calls[0][0])).toBe("/api/contact");
    expect(fetcher.mock.calls[0][1].method).toBe("POST");
    fetcher.mockRejectedValue(new Error("offline"));
    expect(await sendLead({ name: "Ali Veli", phone: "+905550000000", message: "x", source: "teklif" })).toBe(false);
    fetcher.mockResolvedValue(new Response("{}", { status: 429 }));
    expect(await sendLead({ name: "Ali Veli", phone: "+905550000000", message: "x", source: "teklif" })).toBe(false);
  });
});

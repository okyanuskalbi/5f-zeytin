import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CustomerWorkspace } from "@/components/account/CustomerWorkspace";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
const profile = {
  name: "Deniz Sofra",
  email: "deniz@example.test",
  phone: "05321234567",
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows an honest empty order list and never a sample order", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ data: { orders: [], page: 1, total: 0 } }),
      ),
  );
  render(<CustomerWorkspace section="orders" profile={profile} />);
  expect(await screen.findByText("Henüz siparişiniz yok.")).toBeDefined();
  expect(document.body.textContent).not.toMatch(/DEMO-|Örnek sipariş/);
});
it("keeps unavailable storage distinct from an empty order list", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ error: {} }, { status: 503 })),
  );
  render(<CustomerWorkspace section="orders" profile={profile} />);
  expect(await screen.findByRole("alert")).toBeDefined();
  expect(screen.queryByText("Henüz siparişiniz yok.")).toBeNull();
  expect(screen.getByRole("button", { name: "Yeniden dene" })).toBeDefined();
});
it("updates only the signed-in profile display fields and preserves the email", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({ data: { ...profile, name: "Deniz Yeni" } }),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<CustomerWorkspace section="profile" profile={profile} />);
  fireEvent.change(screen.getByLabelText("Ad soyad"), {
    target: { value: "Deniz Yeni" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Bilgileri kaydet" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
    name: "Deniz Yeni",
    phone: profile.phone,
  });
  expect(
    await screen.findByText("Hesap bilgileriniz güncellendi."),
  ).toBeDefined();
});
it("hides the previous page while a different order page is loading", async () => {
  let complete: (response: Response) => void = () => {};
  const order = {
    no: "AF-001",
    date: "2026-11-01T00:00:00Z",
    totalKurus: 50000,
    status: "paid",
    items: [],
    deliveryAddress: "",
    shipping: null,
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ data: { orders: [order], page: 1, total: 21 } }),
    )
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<CustomerWorkspace section="orders" profile={profile} />);
  await screen.findByText("AF-001");
  fireEvent.click(screen.getByRole("button", { name: "Sonraki" }));
  expect(screen.queryByText("AF-001")).toBeNull();
  expect(screen.getByText("Siparişleriniz yükleniyor…")).toBeDefined();
  complete(Response.json({ data: { orders: [], page: 2, total: 20 } }));
  expect(
    await screen.findByText("Bu sayfada sipariş bulunamadı."),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Önceki sayfaya dön" }),
  ).toBeDefined();
});
it("saves a production address through the customer API and shows the returned address", async () => {
  const address = {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Ev",
    recipient: "Deniz Test",
    phone: "05321234567",
    city: "Osmaniye",
    district: "Düziçi",
    line: "Örnek sokak no 1",
    postalCode: "80000",
    isDefault: true,
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ data: [] }))
    .mockResolvedValueOnce(Response.json({ data: address }, { status: 201 }))
    .mockResolvedValueOnce(Response.json({ data: [address] }));
  vi.stubGlobal("fetch", fetcher);
  render(<CustomerWorkspace section="addresses" profile={profile} />);
  fireEvent.click(await screen.findByRole("button", { name: "Adres ekle" }));
  for (const [label, value] of [
    ["Adres başlığı", address.title],
    ["Alıcı", address.recipient],
    ["Telefon", address.phone],
    ["İl", address.city],
    ["İlçe", address.district],
    ["Açık adres", address.line],
    ["Posta kodu", address.postalCode],
  ])
    fireEvent.change(screen.getByLabelText(label, { exact: true }), {
      target: { value },
    });
  fireEvent.click(screen.getByRole("button", { name: "Adresi kaydet" }));
  expect(await screen.findByText("Varsayılan adres")).toBeDefined();
  expect(fetcher.mock.calls[1][0]).toBe("/api/account/addresses");
  expect(fetcher.mock.calls[1][1].method).toBe("POST");
  expect(document.body.textContent).not.toContain("demo adres");
});

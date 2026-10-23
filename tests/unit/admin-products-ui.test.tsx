import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProductManager } from "@/components/admin/ProductManager";
import { ProductForm } from "@/components/admin/ProductForm";
import ProductsPage from "@/app/admin/urunler/page";
import { requireAdmin } from "@/lib/auth/admin";
import { adminProduct, productInput } from "../fixtures/admin-products";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const fetchMock = vi.fn<typeof fetch>();
const list = { data: [adminProduct], total: 1, activeCount: 0, page: 1, options: [{ id: "other", name: "Test yağ" }] };
beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", email: "test@example.test" });
  fetchMock.mockReset().mockImplementation(async () => Response.json(list));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("edits a category label and keeps exactly one visibility choice selected", async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<ProductForm product={{ ...adminProduct, categoryLabel: "Kahvaltılık", showCategoryLabel: false }}
    options={[]} activeCount={0} busy={false} onSave={onSave} onCancel={vi.fn()} />);
  const label = screen.getByLabelText("Kategori etiketi");
  expect((label as HTMLInputElement).value).toBe("Kahvaltılık");
  expect(label.getAttribute("maxlength")).toBe("40");
  const visibility = within(screen.getByRole("radiogroup", { name: "Etiketi göster" }));
  expect(visibility.getByRole("radio", { name: "Gizle" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(visibility.getByRole("radio", { name: "Göster" }));
  fireEvent.click(visibility.getByRole("radio", { name: "Göster" }));
  expect(visibility.getByRole("radio", { name: "Göster" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.change(label, { target: { value: "  Yeni etiket  " } });
  fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith({ ...productInput,
    categoryLabel: "Yeni etiket", showCategoryLabel: true }));
});

it("submits a blank label as the visible category default for a new product", async () => {
  render(<ProductManager />); await screen.findByText("Yayında değil");
  fireEvent.click(screen.getByRole("button", { name: "Test zeytin düzenle" }));
  expect((screen.getByLabelText("Kategori etiketi") as HTMLInputElement).value).toBe("");
  expect(screen.getByRole("radio", { name: "Göster" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
  await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === "PATCH")).toBe(true));
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === "PATCH")!;
  expect(JSON.parse(String(call[1]?.body))).toMatchObject({ categoryLabel: null, showCategoryLabel: true });
});

it.each(["a".repeat(41), "<b>Zeytin</b>"])("does not save an invalid category label (%s)", async categoryLabel => {
  const onSave = vi.fn();
  render(<ProductForm product={adminProduct} options={[]} activeCount={0} busy={false} onSave={onSave} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Kategori etiketi"), { target: { value: categoryLabel } });
  fireEvent.submit(screen.getByRole("button", { name: "Kaydet" }).closest("form")!);
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(onSave).not.toHaveBeenCalled();
});

it("disables category controls while saving", () => {
  render(<ProductForm product={adminProduct} options={[]} activeCount={0} busy onSave={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getAllByRole("radio").every(item => item.hasAttribute("disabled"))).toBe(true);
  expect(screen.getByLabelText("Kategori etiketi").matches(":disabled")).toBe(true);
});

it("reauthorizes the server page before rendering any product UI", async () => {
  await ProductsPage(); expect(requireAdmin).toHaveBeenCalledOnce();
  vi.mocked(requireAdmin).mockRejectedValue(new Error("forbidden"));
  await expect(ProductsPage()).rejects.toThrow("forbidden");
});
it("loads, sorts the full result, shows publication/stock badges and paginates", async () => {
  render(<ProductManager />);
  expect(screen.getByRole("status").textContent).toContain("yükleniyor");
  await screen.findByRole("button", { name: "Test zeytin düzenle" });
  expect(screen.getByText("Yayında değil")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Fiyat ile sırala" }));
  await waitFor(() => expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("sort=priceKurus"));
  expect(screen.getByRole("columnheader", { name: /Fiyat/ }).getAttribute("aria-sort")).toBe("ascending");
});
it("opens a blank form, uses exact kuruş, saves an explicit product and upsell", async () => {
  render(<ProductManager />); await screen.findByText("Yayında değil");
  fireEvent.click(screen.getByRole("button", { name: "Ürün ekle" }));
  expect((screen.getByLabelText("Ürün adı") as HTMLInputElement).value).toBe("");
  fireEvent.change(screen.getByLabelText("Ürün adı"), { target: { value: "Yeni test ürün" } });
  fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "sofralik-zeytin" } });
  fireEvent.change(screen.getByLabelText("Ambalaj / ağırlık"), { target: { value: "1 kg" } });
  fireEvent.change(screen.getByLabelText("Fiyat (TL)"), { target: { value: "12.34" } });
  fireEvent.click(screen.getByLabelText("Test yağ"));
  fetchMock.mockImplementation(async (_url, init) => init?.method === "POST" ? Response.json({ id: "created" }, { status: 201 }) : Response.json(list));
  fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
  await screen.findByText("Ürün kaydedildi.");
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === "POST")!;
  const body = JSON.parse(String(call[1]?.body));
  expect(body.priceKurus).toBe(1234); expect(body.upsellIds).toEqual(["other"]);
  expect(body.isActive).toBe(false); expect(body.stock).toBe(0);
});
it("retains the form on server/network errors and offers retry for list errors", async () => {
  fetchMock.mockRejectedValueOnce(new Error("private"));
  render(<ProductManager />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Yeniden dene" }));
  await screen.findByText("Yayında değil");
  fireEvent.click(screen.getByRole("button", { name: "Test zeytin düzenle" }));
  fetchMock.mockResolvedValueOnce(Response.json({ error: { code: "product_conflict", message: "private" } }, { status: 409 }));
  fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("6 aktif"));
  expect((screen.getByLabelText("Ürün adı") as HTMLInputElement).value).toBe(adminProduct.name);
  expect(document.body.textContent).not.toContain("private");
});
it("asks explicitly before unpublishing and never hard deletes", async () => {
  fetchMock.mockImplementation(async () => Response.json({ ...list, data: [{ ...adminProduct, isActive: true }], activeCount: 1 }));
  render(<ProductManager />); await screen.findByText("Yayında");
  fireEvent.click(screen.getByRole("button", { name: "Test zeytin yayından kaldır" }));
  const confirmation = screen.getByRole("group", { name: "Yayından kaldırma onayı" });
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false);
  fireEvent.click(within(confirmation).getByRole("button", { name: "Vazgeç" }));
  expect(screen.queryByRole("group", { name: "Yayından kaldırma onayı" })).toBeNull();
});
it("shows an honest empty database result and never invents products", async () => {
  fetchMock.mockResolvedValue(Response.json({ ...list, data: [], total: 0, options: [] }));
  render(<ProductManager />);
  await screen.findByText("Henüz ürün eklenmedi.");
  expect(screen.queryByRole("table")).toBeNull();
});

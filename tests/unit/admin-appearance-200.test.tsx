import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductManager } from "@/components/admin/ProductManager";
import { adminProduct } from "../fixtures/admin-products";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("exposes only working panel/product destinations and no sample statistics by default", () => {
  render(<AdminShell />);
  const nav = within(screen.getByRole("navigation", { name: "Yönetim navigasyonu" }));
  expect(nav.getAllByRole("link").map(link => link.textContent)).toEqual(["Panel", "Ürünler"]);
  expect(nav.queryByRole("link", { name: "Siparişler" })).toBeNull();
  expect(nav.getByText("Siparişler")).toBeTruthy();
  expect(screen.queryByText("TEST VERİSİ")).toBeNull();
  expect(screen.getAllByText("Henüz veri yok")).toHaveLength(3);
});
it("edits inside a named modal and restores focus after cancelling without saving", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ data: [adminProduct], total: 1, activeCount: 0, page: 1, options: [] }));
  vi.stubGlobal("fetch", fetcher);
  render(<ProductManager />);
  const edit = await screen.findByRole("button", { name: "Test zeytin düzenle" });
  fireEvent.click(edit);
  const dialog = await screen.findByRole("dialog", { name: "Ürünü düzenle" });
  expect(within(dialog).getByLabelText("Ürün adı")).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Vazgeç" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(edit));
  expect(fetcher.mock.calls.every(call => !call[1]?.method)).toBe(true);
});
it("moves focus to the saved notice after the modal closes", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: [adminProduct], total: 1, activeCount: 0, page: 1, options: [] })));
  render(<ProductManager />);
  fireEvent.click(await screen.findByRole("button", { name: "Test zeytin düzenle" }));
  fireEvent.click(await screen.findByRole("button", { name: "Kaydet" }));
  await screen.findByText("Ürün kaydedildi.");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("status")));
});

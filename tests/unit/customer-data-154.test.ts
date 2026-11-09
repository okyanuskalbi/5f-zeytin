// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { deleteCustomerAddress, listCustomerAddresses, listCustomerOrders, readCustomerOrder, saveCustomerAddress } from "@/lib/account/customer-server";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ user: vi.fn(), query: vi.fn(), transaction: vi.fn(), tx: vi.fn() }));
vi.mock("@/lib/auth/server", async original => ({
  ...(await original<typeof import("@/lib/auth/server")>()), getVerifiedUser: mocks.user,
}));
vi.mock("@/lib/db", () => ({ query: mocks.query, transaction: mocks.transaction }));
const owner = "11111111-1111-4111-8111-111111111111";
const id = "22222222-2222-4222-8222-222222222222";
const address = { title: "Ev", recipient: "Deniz Test", phone: "05321234567", city: "Osmaniye", district: "Düziçi", line: "Örnek sokak no 1", postalCode: "80000", isDefault: true };
const row = { ...address, id, postal_code: address.postalCode, is_default: true };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: owner, email: "owner@example.test" });
  mocks.query.mockResolvedValue({ rows: [] });
  mocks.tx.mockResolvedValue({ rows: [], rowCount: 0 });
  mocks.transaction.mockImplementation(fn => fn({ query: mocks.tx }));
});
it("never reads customer tables for an anonymous session", async () => {
  mocks.user.mockResolvedValue(null);
  await expect(listCustomerAddresses()).rejects.toMatchObject({ status: 401 });
  expect(mocks.query).not.toHaveBeenCalled();
  expect(mocks.transaction).not.toHaveBeenCalled();
});
it("scopes lists to the verified identity and bounds the order page", async () => {
  await expect(listCustomerAddresses()).resolves.toEqual([]);
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("user_id = $1"), [owner]);
  mocks.query.mockResolvedValueOnce({ rows: [{ total: 0 }] }).mockResolvedValueOnce({ rows: [] });
  await expect(listCustomerOrders(2)).resolves.toEqual({ orders: [], page: 2, total: 0 });
  expect(mocks.query).toHaveBeenLastCalledWith(expect.stringContaining("o.user_id = $1"), [owner, 20, 20]);
});
it("does not turn a failed relation into an empty successful list", async () => {
  mocks.query.mockRejectedValue(new Error("private upstream error"));
  await expect(listCustomerAddresses()).rejects.toMatchObject({ status: 503, code: "customer_data_unavailable" });
});
it("rejects forged ownership and malformed inputs before accessing storage", async () => {
  await expect(saveCustomerAddress({ ...address, user_id: "another-user" })).rejects.toMatchObject({ status: 400 });
  await expect(listCustomerOrders(0)).rejects.toMatchObject({ status: 400 });
  await expect(deleteCustomerAddress("bad")).rejects.toMatchObject({ status: 400 });
  expect(mocks.query).not.toHaveBeenCalled(); expect(mocks.transaction).not.toHaveBeenCalled();
});
it("filters an order detail by both verified owner and public order number", async () => {
  await expect(readCustomerOrder("AF-001")).rejects.toMatchObject({ status: 404 });
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("o.user_id = $1 AND o.order_no = $2"), [owner, "AF-001"]);
});
it("hides foreign address existence before making any mutation", async () => {
  await expect(saveCustomerAddress({ ...address, id })).rejects.toMatchObject({ status: 404 });
  expect(mocks.tx.mock.calls[1]).toEqual([expect.stringContaining("id = $2 AND user_id = $1"), [owner, id]]);
  expect(mocks.tx.mock.calls.some(([sql]) => /UPDATE|INSERT|DELETE/.test(sql))).toBe(false);
});
it("keeps address changes within one transaction and locks by verified owner", async () => {
  mocks.tx.mockImplementation(async sql => {
    if (sql.includes("count(*)")) return { rows: [{ count: 0 }] };
    if (sql.includes("RETURNING")) return { rows: [row], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  });
  await expect(saveCustomerAddress(address)).resolves.toMatchObject({ id, isDefault: true });
  expect(mocks.transaction).toHaveBeenCalledOnce();
  expect(mocks.tx).toHaveBeenCalledWith("SELECT pg_advisory_xact_lock(hashtext($1))", [owner]);
  expect(mocks.tx).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO public.customer_addresses"), expect.arrayContaining([owner, address.recipient]));
});
it("does not delete another customer's address", async () => {
  await expect(deleteCustomerAddress(id)).rejects.toMatchObject({ status: 404 });
  expect(mocks.tx).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM public.customer_addresses WHERE user_id = $1 AND id = $2"), [owner, id]);
});

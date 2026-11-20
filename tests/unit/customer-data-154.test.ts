// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { deleteCustomerAddress, listCustomerAddresses, listCustomerOrders, readCustomerOrder, saveCustomerAddress } from "@/lib/account/customer-server";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ user: vi.fn(), query: vi.fn(), batch: vi.fn() }));
vi.mock("@/lib/auth/server", async original => ({
  ...(await original<typeof import("@/lib/auth/server")>()), getVerifiedUser: mocks.user,
}));
vi.mock("@/lib/db", async original => ({ ...(await original<typeof import("@/lib/db")>()), query: mocks.query, batch: mocks.batch }));
const owner = "11111111-1111-4111-8111-111111111111";
const id = "22222222-2222-4222-8222-222222222222";
const address = { title: "Ev", recipient: "Deniz Test", phone: "05321234567", city: "Osmaniye", district: "Düziçi", line: "Örnek sokak no 1", postalCode: "80000", isDefault: true };
const row = { ...address, id, postal_code: address.postalCode, is_default: true };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: owner, email: "owner@example.test" });
  mocks.query.mockResolvedValue({ rows: [] });
  mocks.batch.mockResolvedValue([]);
});
it("never reads customer tables for an anonymous session", async () => {
  mocks.user.mockResolvedValue(null);
  await expect(listCustomerAddresses()).rejects.toMatchObject({ status: 401 });
  expect(mocks.query).not.toHaveBeenCalled();
  expect(mocks.batch).not.toHaveBeenCalled();
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
  expect(mocks.query).not.toHaveBeenCalled(); expect(mocks.batch).not.toHaveBeenCalled();
});
it("filters an order detail by both verified owner and public order number", async () => {
  await expect(readCustomerOrder("AF-001")).rejects.toMatchObject({ status: 404 });
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("o.user_id = $1 AND o.order_no = $2"), [owner, "AF-001"]);
});
it("hides foreign address existence before making any mutation", async () => {
  mocks.batch.mockRejectedValueOnce(new Error("D1_ERROR: guard:address_not_found"));
  await expect(saveCustomerAddress({ ...address, id })).rejects.toMatchObject({ status: 404 });
  const [guard] = mocks.batch.mock.calls[0][0];
  expect(guard.text).toContain("id = $2 AND user_id = $1");
  expect(guard.values).toEqual(expect.arrayContaining([owner, id]));
});
it("keeps address changes within one atomic batch scoped by the verified owner", async () => {
  mocks.batch.mockResolvedValueOnce([{ rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [{ ...row, is_default: 1 }] }]);
  await expect(saveCustomerAddress(address)).resolves.toMatchObject({ id, isDefault: true });
  expect(mocks.batch).toHaveBeenCalledOnce();
  const statements = mocks.batch.mock.calls[0][0];
  expect(statements.every((statement: { values: unknown[] }) => statement.values.includes(owner))).toBe(true);
  expect(statements.some((statement: { text: string }) => statement.text.includes("INSERT INTO customer_addresses"))).toBe(true);
});
it("maps the address limit guard to a 409", async () => {
  mocks.batch.mockRejectedValueOnce(new Error("D1_ERROR: guard:address_limit"));
  await expect(saveCustomerAddress(address)).rejects.toMatchObject({ status: 409, code: "address_limit" });
});
it("does not remove another customer's address", async () => {
  mocks.batch.mockRejectedValueOnce(new Error("D1_ERROR: guard:address_not_found"));
  await expect(deleteCustomerAddress(id)).rejects.toMatchObject({ status: 404 });
  expect(mocks.batch.mock.calls[0][0][1]).toEqual({ text: "DELETE FROM customer_addresses WHERE user_id = $1 AND id = $2", values: [owner, id] });
});

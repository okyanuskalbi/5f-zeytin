// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { POST as passwordChange } from "@/app/api/account/password/route";
import { PATCH as profileChange } from "@/app/api/account/profile/route";
import { customerInput } from "@/lib/account/customer-http";
import {
  deleteCustomerAddress,
  readCustomerOrder,
  saveCustomerAddress,
} from "@/lib/account/customer-server";
import { parseCustomerOrder } from "@/lib/contracts/customer";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  client: vi.fn(),
  service: vi.fn(),
  origin: vi.fn(),
  signIn: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/auth/server", async (original) => ({
  ...(await original<typeof import("@/lib/auth/server")>()),
  getVerifiedUser: mocks.user,
  createAuthServerClient: mocks.client,
  assertRequestOrigin: mocks.origin,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: mocks.service,
}));
const owner = "11111111-1111-4111-8111-111111111111";
const id = "22222222-2222-4222-8222-222222222222";
const address = {
  title: "Ev",
  recipient: "Deniz Test",
  phone: "05321234567",
  city: "Osmaniye",
  district: "Düziçi",
  line: "Örnek sokak no 1",
  postalCode: "80000",
  isDefault: true,
};
const request = (body: unknown) =>
  new Request("https://afinazeytin.com/api/account/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
let chain: Record<string, unknown>;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: owner, email: "owner@example.test" });
  mocks.signIn.mockResolvedValue({
    data: { user: { id: owner } },
    error: null,
  });
  mocks.update.mockResolvedValue({
    data: { user: { id: owner } },
    error: null,
  });
  mocks.client.mockResolvedValue({
    auth: { signInWithPassword: mocks.signIn, updateUser: mocks.update },
  });
  chain = { data: null, error: null };
  for (const key of ["select", "eq", "retry", "abortSignal", "maybeSingle"])
    chain[key] = vi.fn(() => chain);
  mocks.service.mockReturnValue({
    from: vi.fn(() => chain),
    rpc: vi.fn(() => chain),
  });
});
it("checks the existing password against the verified email before any password mutation", async () => {
  const response = await passwordChange(
    request({ currentPassword: "OldSecure123", password: "NewSecure456" }),
  );
  expect(response.status).toBe(204);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(mocks.signIn).toHaveBeenCalledWith({
    email: "owner@example.test",
    password: "OldSecure123",
  });
  expect(mocks.update).toHaveBeenCalledWith({ password: "NewSecure456" });
  expect(mocks.signIn.mock.invocationCallOrder[0]).toBeLessThan(
    mocks.update.mock.invocationCallOrder[0],
  );
});
it("never changes a password after incorrect credentials or a different returned identity", async () => {
  mocks.signIn.mockResolvedValueOnce({
    data: { user: null },
    error: { status: 400, message: "provider secret" },
  });
  const response = await passwordChange(
    request({ currentPassword: "Wrong123", password: "NewSecure456" }),
  );
  expect(response.status).toBe(401);
  expect(await response.text()).not.toContain("provider secret");
  expect(mocks.update).not.toHaveBeenCalled();
  mocks.signIn.mockResolvedValueOnce({ data: { user: { id } }, error: null });
  expect(
    (
      await passwordChange(
        request({ currentPassword: "Wrong123", password: "NewSecure456" }),
      )
    ).status,
  ).toBe(401);
  expect(mocks.update).not.toHaveBeenCalled();
});
it("rejects profile role/email injection and wrong field types before accessing auth", async () => {
  for (const body of [
    { name: "Deniz", phone: "", role: "admin" },
    { name: "Deniz", phone: "", email: "other@example.test" },
    { name: "Deniz", phone: 5321234567 },
  ])
    expect((await profileChange(request(body))).status).toBe(400);
  expect(mocks.client).not.toHaveBeenCalled();
  const response = await profileChange(
    request({ name: " Deniz Test ", phone: "05321234567" }),
  );
  expect(response.status).toBe(200);
  expect(mocks.update).toHaveBeenCalledWith({
    data: { name: "Deniz Test", phone: "05321234567" },
  });
});
it("bounds streamed JSON by actual bytes and rejects malformed or non-JSON input", async () => {
  await expect(
    customerInput(request({ name: "a".repeat(8192) })),
  ).rejects.toMatchObject({ status: 413 });
  await expect(
    customerInput(
      new Request("https://example.test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    ),
  ).rejects.toMatchObject({ status: 400 });
  await expect(
    customerInput(
      new Request("https://example.test", {
        method: "POST",
        body: "name=Deniz",
      }),
    ),
  ).rejects.toMatchObject({ status: 415 });
});
it("uses the verified owner in atomic address RPCs and hides foreign resource existence", async () => {
  const rpc = vi.fn(() => chain);
  mocks.service.mockReturnValue({ rpc });
  chain.data = {
    id,
    ...address,
    postal_code: address.postalCode,
    is_default: true,
  };
  await expect(saveCustomerAddress(address)).resolves.toMatchObject({ id });
  expect(rpc).toHaveBeenCalledWith("customer_save_address", {
    p_user_id: owner,
    p_id: null,
    p_address: address,
  });
  chain.error = { code: "P0002", message: "private foreign address" };
  await expect(deleteCustomerAddress(id)).rejects.toMatchObject({
    status: 404,
  });
  expect(rpc).toHaveBeenLastCalledWith("customer_delete_address", {
    p_user_id: owner,
    p_id: id,
  });
});
it("filters the order detail by both verified owner and public number", async () => {
  await expect(readCustomerOrder("AF-001")).rejects.toMatchObject({
    status: 404,
  });
  expect(chain.eq).toHaveBeenCalledWith("user_id", owner);
  expect(chain.eq).toHaveBeenCalledWith("order_no", "AF-001");
});
it("never exposes private address fields or unsafe tracking links in an order DTO", () => {
  const order = parseCustomerOrder({
    order_no: "AF-001",
    status: "paid",
    created_at: "2026-11-01T00:00:00Z",
    total_kurus: 50000,
    order_items: [],
    delivery_address: { recipient: "Deniz", line: "Ev", secret: "hidden" },
    shipping_carrier: "Kargo",
    tracking_no: "123",
    tracking_url: "javascript:alert(1)",
    provider_secret: "hidden",
  });
  expect(order).toMatchObject({
    deliveryAddress: "Deniz, Ev",
    shipping: { url: null },
  });
  expect(JSON.stringify(order)).not.toContain("hidden");
});
it("does not create an address through PATCH or overwrite an address through POST", async () => {
  const { POST, PATCH } = await import("@/app/api/account/addresses/route");
  expect((await PATCH(request(address))).status).toBe(400);
  expect((await POST(request({ ...address, id }))).status).toBe(400);
  expect(mocks.service).not.toHaveBeenCalled();
});

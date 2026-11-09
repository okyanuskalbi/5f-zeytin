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
  query: vi.fn(),
  transaction: vi.fn(),
  tx: vi.fn(),
  origin: vi.fn(),
  signIn: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/auth/server", async (original) => ({
  ...(await original<typeof import("@/lib/auth/server")>()),
  getVerifiedUser: mocks.user,
  authRequest: mocks.client,
  assertRequestOrigin: mocks.origin,
}));
vi.mock("@/lib/db", () => ({ query: mocks.query, transaction: mocks.transaction }));
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
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: owner, email: "owner@example.test" });
  mocks.client.mockResolvedValue(Response.json({success:true}));
  mocks.query.mockResolvedValue({ rows: [] });
  mocks.tx.mockResolvedValue({ rows: [], rowCount: 0 });
  mocks.transaction.mockImplementation(fn => fn({ query: mocks.tx }));
});
it("uses Better Auth change-password with current password and revokes other sessions", async () => {
 const response=await passwordChange(request({currentPassword:"OldSecure123",password:"NewSecure456"}));
 expect(response.status).toBe(204);expect(response.headers.get("cache-control")).toContain("no-store");
 expect(mocks.client).toHaveBeenCalledWith(expect.any(Request),"/change-password",{currentPassword:"OldSecure123",newPassword:"NewSecure456",revokeOtherSessions:true});
});
it("does not report password success after incorrect credentials", async()=>{
 mocks.client.mockResolvedValueOnce(Response.json({message:"private password"},{status:400}));
 const response=await passwordChange(request({currentPassword:"Wrong123",password:"NewSecure456"}));
 expect(response.status).toBe(401);expect(await response.text()).not.toContain("private password");
});
it("rejects profile role/email injection and wrong field types before accessing auth",async()=>{
 for(const body of [{name:"Deniz",phone:"",role:"admin"},{name:"Deniz",phone:"",email:"other@example.test"},{name:"Deniz",phone:5321234567}]) expect((await profileChange(request(body))).status).toBe(400);
 expect(mocks.client).not.toHaveBeenCalled();
 const response=await profileChange(request({name:" Deniz Test ",phone:"05321234567"}));
 expect(response.status).toBe(200);expect(mocks.client).toHaveBeenCalledWith(expect.any(Request),"/update-user",{name:"Deniz Test",phone:"05321234567"});
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
it("uses the verified owner for atomic address changes and hides foreign resource existence", async () => {
  mocks.tx.mockImplementation(async sql => {
    if (sql.includes("count(*)")) return { rows: [{ count: 0 }] };
    if (sql.includes("INSERT")) return { rows: [{ id, ...address, postal_code: address.postalCode, is_default: true }] };
    return { rows: [], rowCount: 0 };
  });
  await expect(saveCustomerAddress(address)).resolves.toMatchObject({ id });
  expect(mocks.tx).toHaveBeenCalledWith("SELECT pg_advisory_xact_lock(hashtext($1))", [owner]);
  await expect(deleteCustomerAddress(id)).rejects.toMatchObject({ status: 404 });
  expect(mocks.tx).toHaveBeenLastCalledWith(expect.stringContaining("DELETE FROM public.customer_addresses WHERE user_id = $1 AND id = $2"), [owner, id]);
});
it("filters the order detail by both verified owner and public number", async () => {
  await expect(readCustomerOrder("AF-001")).rejects.toMatchObject({
    status: 404,
  });
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("o.user_id = $1 AND o.order_no = $2"), [owner, "AF-001"]);
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
  expect(mocks.transaction).not.toHaveBeenCalled();
});

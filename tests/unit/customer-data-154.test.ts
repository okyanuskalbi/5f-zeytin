// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  listCustomerAddresses,
  listCustomerOrders,
  saveCustomerAddress,
} from "@/lib/account/customer-server";
import { PATCH as updateProfile } from "@/app/api/account/profile/route";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  service: vi.fn(),
  authClient: vi.fn(),
  origin: vi.fn(),
}));
vi.mock("@/lib/auth/server", async (original) => ({
  ...(await original<typeof import("@/lib/auth/server")>()),
  getVerifiedUser: mocks.user,
  createAuthServerClient: mocks.authClient,
  assertRequestOrigin: mocks.origin,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: mocks.service,
}));
let query: ReturnType<typeof vi.fn> & Record<string, ReturnType<typeof vi.fn>>;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({
    id: "11111111-1111-4111-8111-111111111111",
    email: "owner@example.test",
  });
  const chain = { data: [], error: null, count: 0 } as Record<string, unknown>;
  for (const key of [
    "select",
    "eq",
    "order",
    "range",
    "limit",
    "retry",
    "abortSignal",
    "maybeSingle",
  ])
    chain[key] = vi.fn(() => chain);
  query = chain as typeof query;
  mocks.service.mockReturnValue({
    from: vi.fn(() => chain),
    rpc: vi.fn(() => chain),
  });
  mocks.authClient.mockResolvedValue({
    auth: {
      updateUser: vi
        .fn()
        .mockResolvedValue({
          data: { user: { id: "11111111-1111-4111-8111-111111111111" } },
          error: null,
        }),
    },
  });
});
afterEach(() => vi.restoreAllMocks());

it("never reads customer tables for an anonymous session", async () => {
  mocks.user.mockResolvedValue(null);
  await expect(listCustomerAddresses()).rejects.toMatchObject({ status: 401 });
  expect(mocks.service).not.toHaveBeenCalled();
});
it("scopes both lists to the verified identity and bounds the order page", async () => {
  await expect(listCustomerAddresses()).resolves.toEqual([]);
  expect(query.eq).toHaveBeenCalledWith(
    "user_id",
    "11111111-1111-4111-8111-111111111111",
  );
  await expect(listCustomerOrders(2)).resolves.toMatchObject({
    orders: [],
    page: 2,
    total: 0,
  });
  expect(query.range).toHaveBeenCalledWith(20, 39);
});
it("does not turn an unavailable relation into an empty successful list", async () => {
  Object.assign(query, {
    data: null,
    error: { message: "private upstream error" },
  });
  await expect(listCustomerAddresses()).rejects.toMatchObject({ status: 503 });
});
it("rejects forged ownership and malformed address data before calling privileged storage", async () => {
  await expect(
    saveCustomerAddress({ user_id: "another-user", title: "X" }),
  ).rejects.toMatchObject({ status: 400 });
  expect(mocks.service).not.toHaveBeenCalled();
});
it("rejects a cross-site profile update before provider access", async () => {
  const { AuthCoreError } = await import("@/lib/auth/server");
  mocks.origin.mockImplementationOnce(() => {
    throw new AuthCoreError(403, "csrf_rejected");
  });
  const response = await updateProfile(
    new Request("https://afinazeytin.com/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        origin: "https://evil.example",
      },
      body: JSON.stringify({ name: "Deniz", phone: "" }),
    }),
  );
  expect(response.status).toBe(403);
  expect(mocks.authClient).not.toHaveBeenCalled();
});

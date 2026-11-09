// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST, dynamic } from "@/app/api/auth/[...all]/route";
import { GET as providers } from "@/app/api/auth/providers/route";

vi.mock("server-only", () => ({}));
const auth = vi.hoisted(() => ({ get: vi.fn(), handler: vi.fn() }));
vi.mock("@/lib/auth/better-auth", () => ({ getAuth: auth.get }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.get.mockReturnValue({ handler: auth.handler });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

function expectPrivateHeaders(response: Response) {
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
}

describe.each([["GET", GET], ["POST", POST]] as const)("Better Auth %s route boundary", (method, invoke) => {
  it("passes the exact request to the auth handler and preserves its response with private headers", async () => {
    const request = new Request("https://afina-preview-187.vercel.app/api/auth/get-session", { method });
    const upstream = Response.json({ success: true }, { status: 201, headers: {
      "cache-control": "public, max-age=3600", "x-auth-result": "preserved",
      "set-cookie": "better-auth.session_token=; Path=/; HttpOnly; Max-Age=0",
    } });
    auth.handler.mockResolvedValueOnce(upstream);
    const result = await invoke(request);
    expect(auth.handler).toHaveBeenCalledExactlyOnceWith(request);
    expect(result).toBe(upstream);
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ success: true });
    expect(result.headers.get("x-auth-result")).toBe("preserved");
    expect(result.headers.getSetCookie()).toEqual(["better-auth.session_token=; Path=/; HttpOnly; Max-Age=0"]);
    expectPrivateHeaders(result);
    expect(dynamic).toBe("force-dynamic");
  });
  it("turns driver failures into a safe private error without leaking or logging details", async () => {
    const privateDetail = randomBytes(32).toString("hex");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.handler.mockRejectedValueOnce(new Error(`Driver failure ${privateDetail}`));
    const result = await invoke(new Request("https://afina-preview-187.vercel.app/api/auth/get-session", { method }));
    expect(result.status).toBe(503);
    const body = await result.text();
    expect(JSON.parse(body)).toEqual({ error: { code: "auth_unavailable", message: "Üyelik hizmeti şu anda kullanılamıyor." } });
    expect(body).not.toContain(privateDetail);
    expect(body).not.toContain("Driver failure");
    expect(log).not.toHaveBeenCalled();
    expectPrivateHeaders(result);
  });
  it("safely converts authentication initialization failures before the handler is available", async () => {
    auth.get.mockImplementationOnce(() => { throw new Error("Auth configuration unavailable"); });
    const result = await invoke(new Request("https://afina-preview-187.vercel.app/api/auth/get-session", { method }));
    expect(result.status).toBe(503);
    expect(auth.handler).not.toHaveBeenCalled();
    expect(await result.text()).not.toContain("Auth configuration unavailable");
    expectPrivateHeaders(result);
  });
});

describe("public authentication provider capabilities", () => {
  it.each([
    [undefined, undefined, false], ["", "", false], ["configured", undefined, false],
    [undefined, "configured", false], [" ", "configured", false], ["configured", "\t", false],
    ["configured", "configured", true],
  ] as const)("reports only a boolean when credentials are present or incomplete (%#)", async (id, secret, enabled) => {
    const clientId = id === "configured" ? randomBytes(16).toString("hex") : id;
    const clientSecret = secret === "configured" ? randomBytes(32).toString("hex") : secret;
    vi.stubEnv("GOOGLE_CLIENT_ID", clientId);
    vi.stubEnv("GOOGLE_CLIENT_SECRET", clientSecret);
    const response = providers();
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(JSON.parse(body)).toEqual({ google: enabled });
    if (clientId?.trim()) expect(body).not.toContain(clientId);
    if (clientSecret?.trim()) expect(body).not.toContain(clientSecret);
    expectPrivateHeaders(response);
  });
});

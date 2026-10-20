// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const credentials = { merchantId: "123456", merchantKey: "fixture-key", merchantSalt: "fixture-salt" };
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("PAYMENT_PREVIEW", "1");
  vi.stubEnv("PAYTR_MERCHANT_ID", credentials.merchantId);
  vi.stubEnv("PAYTR_MERCHANT_KEY", credentials.merchantKey);
  vi.stubEnv("PAYTR_MERCHANT_SALT", credentials.merchantSalt);
  vi.stubEnv("PAYTR_TEST_MODE", "0");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json({ status: "success", token: "mocktoken123" }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
});

function request(origin: string | null = "http://localhost:3004", body?: string): Request {
  return new Request("http://localhost:3004/api/odeme-onizleme/paytr-token", {
    method: "POST", headers: origin ? { Origin: origin, "Content-Type": "application/json" } : {}, body,
  });
}

describe("PayTR independently calculated HMAC fixtures", () => {
  it("matches the token fixture (Python hmac/sha256, fixed base64 basket)", async () => {
    const { createPaytrTokenSignature } = await import("../../lib/payments/paytr");
    expect(createPaytrTokenSignature({ user_ip: "203.0.113.10", merchant_oid: "PREVIEW123",
      email: "preview@example.invalid", payment_amount: "100", user_basket: "W1siVGVzdCIsIjEuMDAiLDFdXQ==",
      no_installment: "1", max_installment: "0", currency: "TL", test_mode: "1" }, credentials))
      .toBe("WqeoBvZQNGmuEOp6I/Qg5FqafpsOIlBFJDPDtFjHsVY=");
  });

  it("verifies callback hash and rejects wrong, truncated or tampered hashes", async () => {
    const { verifyPaytrCallback } = await import("../../lib/payments/paytr");
    const callback = { merchantOid: "PREVIEW123", status: "success", totalAmount: "100",
      hash: "tKX4t5hSVA6UKYJfOlnlhtgfNhRrf5cNCRQRb1Z/saQ=" };
    expect(verifyPaytrCallback(callback, credentials)).toBe(true);
    for (const hash of ["", "bad", callback.hash.replace("t", "a")]) {
      expect(verifyPaytrCallback({ ...callback, hash }, credentials)).toBe(false);
    }
    expect(verifyPaytrCallback({ ...callback, totalAmount: "101" }, credentials)).toBe(false);
  });
});

describe("local preview boundary and fixture", () => {
  it.each([undefined, "1", "0"])("production stays closed with flag %s", async (flag) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMENT_PREVIEW", flag);
    const { isPaymentPreviewEnabled } = await import("../../lib/payments/preview");
    expect(isPaymentPreviewEnabled()).toBe(false);
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    expect((await POST(request())).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows local default/explicit opt-in and closes explicit opt-out", async () => {
    const { isPaymentPreviewEnabled } = await import("../../lib/payments/preview");
    vi.stubEnv("PAYMENT_PREVIEW", undefined);
    expect(isPaymentPreviewEnabled()).toBe(true);
    vi.stubEnv("PAYMENT_PREVIEW", "0");
    expect(isPaymentPreviewEnabled()).toBe(false);
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    expect((await POST(request())).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates a fixed integer-kuruş order with unique IDs and a five minute lifetime", async () => {
    const { createPreviewOrder } = await import("../../lib/payments/preview");
    const order = createPreviewOrder();
    expect(order.amountKurus).toBe(100);
    expect(order.quantity).toBe(1);
    expect(order.merchantOid).toMatch(/^[a-zA-Z0-9]{1,64}$/);
    expect(order.merchantOid).not.toBe(createPreviewOrder().merchantOid);
    expect(order.expiresAt - order.createdAt).toBe(300_000);
  });
});

describe("token route, mocked upstream", () => {
  it("ignores client amount/cart/mode and posts only the server fixture in test mode", async () => {
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    const response = await POST(request(undefined, JSON.stringify({ payment_amount: 99999, test_mode: 0, cart: [] })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ iframeUrl: "https://www.paytr.com/odeme/guvenli/mocktoken123", token: "mocktoken123" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://www.paytr.com/odeme/api/get-token");
    const form = init!.body as URLSearchParams;
    expect(form.get("test_mode")).toBe("1");
    expect(form.get("payment_amount")).toBe("100");
    expect(form.get("merchant_ok_url")).toBe("http://localhost:3004/odeme-onizleme/sonuc/ok");
    expect(form.get("merchant_fail_url")).toBe("http://localhost:3004/odeme-onizleme/sonuc/fail");
    expect(form.get("merchant_oid")).toMatch(/^PREVIEW[a-f0-9]+$/);
    expect(JSON.parse(Buffer.from(form.get("user_basket")!, "base64").toString())).toEqual([["Örnek zeytin · test ürünü", "1.00", 1]]);
    expect(form.get("merchant_key")).toBeNull();
    expect(form.get("merchant_salt")).toBeNull();
    expect(init!.signal).toBeInstanceOf(AbortSignal);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each([null, "https://attacker.invalid", "null"])("rejects unsafe origin %s without upstream", async (origin) => {
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    expect((await POST(request(origin))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"])("handles missing %s safely", async (name) => {
    vi.stubEnv(name, "");
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: { code: "missing_keys", message: "Test anahtarı eksik — .env.local'e ekleyin" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits the whole local preview to five token attempts per minute", async () => {
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    for (let i = 0; i < 5; i++) expect((await POST(request())).status).toBe(200);
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(5);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect((await POST(request())).status).toBe(200);
  });

  it.each([Response.json({ status: "failed", reason: "fixture-key fixture-salt" }),
    new Response("fixture-key", { status: 502 }), new Response("not json"),
    Response.json({ status: "success", token: "../../attacker" }), Response.json(null)])("masks provider failure %#", async (upstream) => {
    fetchMock.mockResolvedValue(upstream);
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    const response = await POST(request());
    expect(response.status).toBe(502);
    const text = await response.text();
    expect(text).not.toMatch(/fixture-key|fixture-salt|paytr_token|reason/);
  });

  it("masks network errors", async () => {
    fetchMock.mockRejectedValue(new Error("fixture-key"));
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("fixture-key");
  });

  it("aborts a stalled upstream request after eight seconds", async () => {
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init!.signal!.addEventListener("abort", () => reject(new DOMException("timeout", "AbortError")));
    }));
    const { POST } = await import("../../app/api/odeme-onizleme/paytr-token/route");
    vi.useFakeTimers();
    const response = POST(request());
    await vi.advanceTimersByTimeAsync(8_001);
    expect((await response).status).toBe(504);
    expect(fetchMock.mock.calls[0][1]!.signal!.aborted).toBe(true);
  });
});

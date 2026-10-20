import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PreviewOrder } from "./preview";

type PaytrCredentials = Readonly<{ merchantId: string; merchantKey: string; merchantSalt: string }>;
type TokenFields = Readonly<Record<"user_ip" | "merchant_oid" | "email" | "payment_amount" |
  "user_basket" | "no_installment" | "max_installment" | "currency" | "test_mode", string>>;

export function getPaytrCredentials(): PaytrCredentials | null {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();
  return merchantId && merchantKey && merchantSalt ? { merchantId, merchantKey, merchantSalt } : null;
}

export function createPaytrTokenSignature(fields: TokenFields, credentials: PaytrCredentials): string {
  const value = credentials.merchantId + fields.user_ip + fields.merchant_oid + fields.email +
    fields.payment_amount + fields.user_basket + fields.no_installment + fields.max_installment +
    fields.currency + fields.test_mode + credentials.merchantSalt;
  return createHmac("sha256", credentials.merchantKey).update(value).digest("base64");
}

export function verifyPaytrCallback(
  callback: Readonly<{ merchantOid: string; status: string; totalAmount: string; hash: string }>,
  credentials: PaytrCredentials,
): boolean {
  const expected = createHmac("sha256", credentials.merchantKey)
    .update(callback.merchantOid + credentials.merchantSalt + callback.status + callback.totalAmount)
    .digest("base64");
  const received = Buffer.from(callback.hash);
  const actual = Buffer.from(expected);
  return received.length === actual.length && timingSafeEqual(received, actual);
}

export class PaytrRequestError extends Error {
  constructor(public readonly timedOut: boolean) {
    super("PayTR test session unavailable");
  }
}

/** Preview only. Production session creation belongs to Task 047. */
export async function createPreviewPaytrSession(
  order: PreviewOrder, origin: string, userIp: string, credentials: PaytrCredentials,
): Promise<{ iframeUrl: string; token: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  const fields: TokenFields = {
    user_ip: userIp,
    merchant_oid: order.merchantOid,
    email: order.email,
    payment_amount: String(order.amountKurus),
    user_basket: Buffer.from(JSON.stringify([[order.productName, (order.amountKurus / 100).toFixed(2), order.quantity]])).toString("base64"),
    no_installment: "1", max_installment: "0", currency: "TL",
    // Never use PAYTR_TEST_MODE or client input here, even for a live merchant.
    test_mode: "1",
  };
  try {
    const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST", cache: "no-store", signal: controller.signal, redirect: "error",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...fields, merchant_id: credentials.merchantId,
        paytr_token: createPaytrTokenSignature(fields, credentials),
        user_name: order.userName, user_address: order.userAddress, user_phone: order.userPhone,
        merchant_ok_url: `${origin}/odeme-onizleme/sonuc/ok`,
        merchant_fail_url: `${origin}/odeme-onizleme/sonuc/fail`,
        timeout_limit: String(Math.max(1, Math.ceil((order.expiresAt - Date.now()) / 60_000))),
        debug_on: "0", lang: "tr",
      }),
    });
    if (!response.ok) throw new Error("upstream");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("status" in data) || data.status !== "success" ||
      !("token" in data) || typeof data.token !== "string" || !/^[a-zA-Z0-9]{1,256}$/.test(data.token)) {
      throw new Error("invalid upstream response");
    }
    return { iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`, token: data.token };
  } catch {
    // Do not surface provider reasons, raw errors, credentials or request HMACs.
    throw new PaytrRequestError(controller.signal.aborted);
  } finally {
    clearTimeout(timer);
  }
}

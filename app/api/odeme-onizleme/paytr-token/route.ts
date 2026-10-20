import { isIP } from "node:net";
import { consumePreviewAttempt, createPreviewOrder, isPaymentPreviewEnabled } from "@/lib/payments/preview";
import { createPreviewPaytrSession, getPaytrCredentials, PaytrRequestError } from "@/lib/payments/paytr";

export const runtime = "nodejs";

function failure(code: string, message: string, status: number, headers = {}) {
  return Response.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request): Promise<Response> {
  if (!isPaymentPreviewEnabled()) return failure("not_found", "Bulunamadı", 404);
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return failure("invalid_origin", "İstek bu siteden gönderilmeli.", 403);
  }
  const credentials = getPaytrCredentials();
  if (!credentials) return failure("missing_keys", "Test anahtarı eksik — .env.local'e ekleyin", 503);
  const retryAfter = consumePreviewAttempt();
  if (retryAfter) return failure("rate_limited", "Çok fazla deneme. Bir dakika sonra yeniden deneyin.", 429, { "Retry-After": String(retryAfter) });

  // Localhost has no public client IP. Optional server-only override is needed
  // by PayTR for a real iframe; never accept IP/price/cart/mode from the body.
  const candidate = process.env.PAYTR_PREVIEW_USER_IP?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const userIp = isIP(candidate) ? candidate : "127.0.0.1";
  try {
    const session = await createPreviewPaytrSession(createPreviewOrder(), origin, userIp, credentials);
    return Response.json(session, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const timeout = error instanceof PaytrRequestError && error.timedOut;
    return failure(timeout ? "timeout" : "provider_error",
      timeout ? "PayTR yanıt vermedi. Yeniden deneyin." : "PayTR test ekranı açılamadı. Yeniden deneyin.",
      timeout ? 504 : 502);
  }
}

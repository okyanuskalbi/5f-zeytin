import "server-only";
import { AuthCoreError, authErrorResponse, authResponseHeaders } from "./server";

/** Panel API'lerinin ortak yanıt ve girdi yardımcıları (ürün API'siyle aynı kalıp). */
export const apiFailure = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, {
  status, headers: { ...authResponseHeaders, ...(status === 503 ? { "Retry-After": "5" } : {}) },
});
export function apiError(error: unknown, code: string) {
  return error instanceof AuthCoreError ? authErrorResponse(error)
    : apiFailure(503, code, "İşlem tamamlanamadı. Lütfen yeniden deneyin.");
}
export const apiJson = (body: unknown, status = 200) => Response.json(body, { status, headers: authResponseHeaders });

/** JSON gövdesini boyut sınırıyla okur; sınır aşımı 413, bozuk gövde 400, yanlış tür 415. */
export async function readJsonBody(request: Request, limit = 16384): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new AuthCoreError(415, "unsupported_media_type");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthCoreError(400, "invalid_request");
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new AuthCoreError(413, "payload_too_large"); }
      text += decoder.decode(value, { stream: true });
    }
    const input = JSON.parse(text + decoder.decode());
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
    return input;
  } catch (error) {
    throw error instanceof AuthCoreError ? error : new AuthCoreError(400, "invalid_request");
  } finally { reader.releaseLock(); }
}

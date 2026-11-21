import "server-only";
import { NextResponse } from "next/server";

// Ara katman (proxy.ts) yalnız bu dosyayı içe aktarır: Better Auth/e-posta zinciri ara katman paketine girmez.
export const authResponseHeaders = { "Cache-Control": "private, no-store", Pragma: "no-cache", Expires: "0", "Referrer-Policy": "no-referrer" };
export class AuthCoreError extends Error {
  constructor(public status: number, public code: string, public retryAfter?: number) { super(code); }
}
export function authFailure(error: unknown, invalidStatus = 401): AuthCoreError {
  if (error instanceof AuthCoreError) return error;
  const source = error && typeof error === "object" ? error as { status?: unknown; statusCode?: unknown } : {};
  const status = typeof source.statusCode === "number" ? source.statusCode : source.status;
  if (status === 429) return new AuthCoreError(429, "auth_rate_limited", 60);
  if (typeof status !== "number" || status >= 500 || status === 0) return new AuthCoreError(503, "auth_unavailable", 5);
  return new AuthCoreError(invalidStatus, invalidStatus === 400 ? "invalid_callback" : "unauthenticated");
}
/** Preserve a bounded server-supplied progressive wait across compatibility routes. */
export function authRateLimitError(response: Response): AuthCoreError {
  const value = Number(response.headers.get("Retry-After"));
  const retryAfter = Number.isSafeInteger(value) && value > 0 && value <= 900 ? value : 60;
  return new AuthCoreError(429, "auth_rate_limited", retryAfter);
}
export function authErrorResponse(error: unknown) {
  const failure = authFailure(error);
  const message = failure.code === "admin_configuration_unavailable" ? "Yönetim paneli şu an yapılandırılıyor."
    : failure.code === "email_not_configured" ? "E-posta ile giriş hizmeti henüz yapılandırılmadı. Şifreyle giriş yapabilirsiniz."
    : failure.status === 429 ? "Çok fazla deneme. Daha sonra yeniden deneyin."
    : failure.status === 503 ? "Üyelik hizmeti şu anda kullanılamıyor." : "İşlem doğrulanamadı. Yeniden deneyin.";
  return NextResponse.json({ error: { code: failure.code, message } }, { status: failure.status, headers: { ...authResponseHeaders, ...(failure.retryAfter ? { "Retry-After": String(failure.retryAfter) } : {}) } });
}

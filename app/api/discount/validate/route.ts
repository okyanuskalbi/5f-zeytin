import { AuthCoreError, assertRequestOrigin, authResponseHeaders } from "@/lib/auth/server";
import { apiError, apiFailure, apiJson, readJsonBody } from "@/lib/auth/admin-api";
import { invalidCodeMessage, parseValidateRequest } from "@/lib/contracts/discounts";
import { consumeDiscountAttempt } from "@/lib/db/discounts";
import { quoteDiscount } from "@/lib/orders/discount-quote";

export const dynamic = "force-dynamic";

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Sepet için indirim kodu doğrulama. İstemciden yalnız kod ve (ürün kimliği, adet) satırları alınır; fiyat, toplam ve indirim
 * sunucuda hesaplanır. Her başarısızlık nedeni aynı "Kod geçersiz." yanıtını verir (kodun varlığı sızmaz). */
export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
    const input = parseValidateRequest(await readJsonBody(request, 8192));
    if (!input) return apiFailure(400, "validation_error", "Kod veya sepet bilgisi geçersiz.");
    if (!await consumeDiscountAttempt(clientAddress(request))) {
      return Response.json({ error: { code: "rate_limited", message: "Çok fazla deneme. Daha sonra yeniden deneyin." } },
        { status: 429, headers: { ...authResponseHeaders, "Retry-After": "600" } });
    }
    const quote = await quoteDiscount(input.code, input.items);
    if (!quote.ok) {
      return quote.reason === "cart_invalid"
        ? apiFailure(409, "cart_invalid", "Sepet güncel değil. Fiyat ve stokları yenileyin.")
        : apiFailure(422, "invalid_code", invalidCodeMessage);
    }
    return apiJson({ data: { code: quote.code, type: quote.type, value: quote.value, subtotalKurus: quote.subtotalKurus,
      discountKurus: quote.discountKurus, totalKurus: quote.totalKurus } });
  } catch (error) {
    if (error instanceof AuthCoreError) return apiError(error, "discount_unavailable");
    return apiFailure(503, "discount_unavailable", "İşlem tamamlanamadı. Lütfen yeniden deneyin.");
  }
}

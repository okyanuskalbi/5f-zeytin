import { AuthCoreError, assertRequestOrigin, authResponseHeaders } from "@/lib/auth/server";
import { apiError, apiFailure, apiJson, readJsonBody } from "@/lib/auth/admin-api";
import { parseLeadInput } from "@/lib/contracts/admin-panel";
import { consumeContactAttempt, createLead } from "@/lib/db/leads";

export const dynamic = "force-dynamic";

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** İletişim, bayilik ve teklif formları: kayıt D1 `leads` tablosuna yazılır. Kişisel veri loga yazılmaz. */
export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
    const body = await readJsonBody(request, 8192);
    // Gizli "website" alanı botlar içindir: doluysa kayıt açılmaz, yanıt başarılı görünür.
    if (typeof body.website === "string" && body.website.trim()) return apiJson({ ok: true }, 201);
    const input = parseLeadInput(body);
    if (!input) return apiFailure(400, "validation_error", "Form alanlarını kontrol edin.");
    if (!await consumeContactAttempt(clientAddress(request))) {
      return Response.json({ error: { code: "rate_limited", message: "Çok fazla deneme. Daha sonra yeniden deneyin." } },
        { status: 429, headers: { ...authResponseHeaders, "Retry-After": "600" } });
    }
    await createLead(input);
    return apiJson({ ok: true }, 201);
  } catch (error) {
    if (error instanceof AuthCoreError) return apiError(error, "contact_unavailable");
    return apiFailure(503, "contact_unavailable", "Form gönderilemedi. Lütfen yeniden deneyin.");
  }
}

import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { adminListPageSize, parseListQuery } from "@/lib/contracts/admin-panel";
import { discountStatuses, parseDiscountCreate, parseDiscountPatch } from "@/lib/contracts/discounts";
import { createDiscount, listDiscounts, updateDiscount, type DiscountWriteResult } from "@/lib/db/discounts";
import { apiError, apiFailure, apiJson, readJsonBody } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const query = parseListQuery(new URL(request.url).searchParams, discountStatuses);
    if (!query) return apiFailure(400, "invalid_query", "Liste süzgeci veya sayfası geçersiz.");
    const { rows, total } = await listDiscounts(query);
    return apiJson({ data: rows, total, page: query.page, pageSize: adminListPageSize });
  } catch (error) { return apiError(error, "discounts_unavailable"); }
}

function failure(result: Exclude<DiscountWriteResult, { status: "ok" }>) {
  switch (result.status) {
    case "duplicate": return apiFailure(409, "discount_duplicate", "Bu kod zaten var.");
    case "not_found": return apiFailure(404, "discount_not_found", "Kod bulunamadı. Listeyi yenileyin.");
    case "limit_below_usage": return apiFailure(409, "discount_limit_below_usage", "Kullanım limiti, kullanılan sayıdan az olamaz.");
    default: return apiFailure(400, "validation_error", "Alanları kontrol edin.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminMutation(request);
    const input = parseDiscountCreate(await readJsonBody(request));
    if (!input) return apiFailure(400, "validation_error", "Alanları kontrol edin.");
    const result = await createDiscount(input);
    return result.status === "ok" ? apiJson({ id: result.id }, 201) : failure(result);
  } catch (error) { return apiError(error, "discounts_unavailable"); }
}

/** Kod ve kullanım sayısı değişmez; diğer alanlar ve açık/kapalı durumu güncellenir. */
export async function PATCH(request: Request) {
  try {
    await requireAdminMutation(request);
    const patch = parseDiscountPatch(await readJsonBody(request));
    if (!patch) return apiFailure(400, "validation_error", "Alanları kontrol edin.");
    const result = await updateDiscount(patch);
    return result.status === "ok" ? apiJson({ id: result.id }) : failure(result);
  } catch (error) { return apiError(error, "discounts_unavailable"); }
}

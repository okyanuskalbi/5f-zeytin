import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { adminListPageSize, leadStatuses, parseLeadPatch, parseListQuery } from "@/lib/contracts/admin-panel";
import { listLeads, updateLead } from "@/lib/db/admin-panel";
import { apiError, apiFailure, apiJson, readJsonBody } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const query = parseListQuery(new URL(request.url).searchParams, leadStatuses);
    if (!query) return apiFailure(400, "invalid_query", "Liste süzgeci veya sayfası geçersiz.");
    const { rows, total } = await listLeads(query);
    return apiJson({ data: rows, total, page: query.page, pageSize: adminListPageSize });
  } catch (error) { return apiError(error, "leads_unavailable"); }
}

/** Yalnız durum ve not güncellenir. */
export async function PATCH(request: Request) {
  try {
    await requireAdminMutation(request);
    const patch = parseLeadPatch(await readJsonBody(request));
    if (!patch) return apiFailure(400, "validation_error", "Durum veya not alanını kontrol edin.");
    return await updateLead(patch) ? apiJson({ id: patch.id }) : apiFailure(404, "lead_not_found", "Kayıt bulunamadı. Listeyi yenileyin.");
  } catch (error) { return apiError(error, "leads_unavailable"); }
}

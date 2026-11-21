import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { adminListPageSize, orderStatuses, parseListQuery, parseOrderPatch } from "@/lib/contracts/admin-panel";
import { getOrder, listOrders, updateOrderStatus } from "@/lib/db/admin-panel";
import { apiError, apiFailure, apiJson, readJsonBody } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const query = parseListQuery(new URL(request.url).searchParams, orderStatuses);
    if (!query) return apiFailure(400, "invalid_query", "Liste süzgeci veya sayfası geçersiz.");
    if (query.id) {
      const order = await getOrder(query.id);
      return order ? apiJson({ data: order }) : apiFailure(404, "order_not_found", "Sipariş bulunamadı.");
    }
    const { rows, total } = await listOrders(query);
    return apiJson({ data: rows, total, page: query.page, pageSize: adminListPageSize });
  } catch (error) { return apiError(error, "orders_unavailable"); }
}

/** Yalnız lojistik durum ve kargo bilgisi güncellenir; tutar, kalem ve müşteri değişmez. */
export async function PATCH(request: Request) {
  try {
    await requireAdminMutation(request);
    const patch = parseOrderPatch(await readJsonBody(request));
    if (!patch) return apiFailure(400, "validation_error", "Sipariş durumunu ve kargo alanlarını kontrol edin.");
    const result = await updateOrderStatus(patch);
    if (result === "not_found") return apiFailure(404, "order_not_found", "Sipariş bulunamadı. Listeyi yenileyin.");
    if (result === "conflict") return apiFailure(409, "order_conflict", "Bu sipariş için istenen durum geçişi yapılamaz.");
    return apiJson({ id: patch.id, status: patch.status });
  } catch (error) { return apiError(error, "orders_unavailable"); }
}

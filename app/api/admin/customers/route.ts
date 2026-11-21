import { requireAdmin } from "@/lib/auth/admin";
import { adminListPageSize, parseListQuery } from "@/lib/contracts/admin-panel";
import { getCustomer, listCustomers } from "@/lib/db/admin-panel";
import { apiError, apiFailure, apiJson } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

/** Salt okunur: müşteri bilgileri yalnız yönetici yanıtında döner. */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const query = parseListQuery(new URL(request.url).searchParams, []);
    if (!query || query.status) return apiFailure(400, "invalid_query", "Liste süzgeci veya sayfası geçersiz.");
    if (query.id) {
      const customer = await getCustomer(query.id);
      return customer ? apiJson({ data: customer }) : apiFailure(404, "customer_not_found", "Müşteri bulunamadı.");
    }
    const { rows, total } = await listCustomers(query);
    return apiJson({ data: rows, total, page: query.page, pageSize: adminListPageSize });
  } catch (error) { return apiError(error, "customers_unavailable"); }
}

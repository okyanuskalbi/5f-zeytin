import { requireAdmin } from "@/lib/auth/admin";
import { parseVisitPeriod } from "@/lib/contracts/visits";
import { getVisitSummary } from "@/lib/db/visits";
import { apiError, apiFailure, apiJson } from "@/lib/auth/admin-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const period = parseVisitPeriod(new URL(request.url).searchParams.get("period") ?? "7");
    if (!period) return apiFailure(400, "invalid_query", "Dönem geçersiz.");
    return apiJson({ data: await getVisitSummary(period) });
  } catch (error) { return apiError(error, "visitors_unavailable"); }
}

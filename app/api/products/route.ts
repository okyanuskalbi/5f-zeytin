import { readCatalog } from "@/lib/catalog/read";
import type { CatalogErrorResponse } from "@/lib/contracts/catalog";

// Refresh publication, price and stock on every request, including after recovery.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  try {
    return Response.json(await readCatalog(), { headers });
  } catch {
    const error: CatalogErrorResponse = {
      error: { code: "catalog_unavailable", message: "Ürünler şu anda yüklenemiyor. Yeniden deneyin." },
    };
    return Response.json(error, { status: 503, headers: { ...headers, "Retry-After": "5" } });
  }
}

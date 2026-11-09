import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { AuthCoreError, authErrorResponse, authResponseHeaders } from "@/lib/auth/server";
import { query as dbQuery } from "@/lib/db";
import { adminProductPageSize, parseAdminProduct, parseProductInput, validProductId, type ProductSort } from "@/lib/contracts/admin-products";

export const dynamic = "force-dynamic";
const columns = `p.id,p.name,p.category,p.category_label,p.show_category_label,p.weight,p.price_kurus,p.currency,p.stock,p.is_active,
  coalesce((select json_agg(json_build_object('upsell_id', u.upsell_id)) from product_upsells u where u.product_id = p.id), '[]'::json) as product_upsells`;
const sorts: Record<ProductSort, string> = { name: "name", priceKurus: "price_kurus", stock: "stock", isActive: "is_active" };
const failure = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, {
  status, headers: { ...authResponseHeaders, ...(status === 503 ? { "Retry-After": "5" } : {}) },
});
function handleError(error: unknown) {
  return error instanceof AuthCoreError ? authErrorResponse(error)
    : failure(503, "products_unavailable", "Ürün işlemi tamamlanamadı. Lütfen yeniden deneyin.");
}


export async function GET(request: Request) {
  try {
    await requireAdmin();
    const query = new URL(request.url).searchParams;
    const sort = query.get("sort") ?? "name";
    const direction = query.get("direction") ?? "asc";
    const page = Number(query.get("page") ?? "1");
    const id = query.get("id");
    if ((id !== null && !validProductId(id)) || !Object.hasOwn(sorts, sort) || !["asc", "desc"].includes(direction) || !Number.isSafeInteger(page) || page < 1 || page > 1000000) {
      return failure(400, "invalid_query", "Liste sıralaması veya sayfası geçersiz.");
    }
    // SQL identifiers are selected exclusively from this fixed allowlist.
    const [rowsResult, totalResult, countResult, choicesResult] = await Promise.all([
      dbQuery(`select ${columns} from products p where ($1::text is null or p.id = $1)
        order by p.${sorts[sort as ProductSort]} ${direction === "asc" ? "ASC" : "DESC"}, p.id ASC limit $2 offset $3`,
        [id, adminProductPageSize, (page - 1) * adminProductPageSize]),
      dbQuery<{count:number}>("select count(*)::int as count from products where ($1::text is null or id = $1)", [id]),
      dbQuery<{count:number}>("select count(*)::int as count from products where is_active = true"),
      dbQuery<{id:string;name:string}>("select id,name from products where is_active = true order by name limit 6"),
    ]);
    const rows = {data: rowsResult.rows, count: totalResult.rows[0]?.count};
    const count = {count: countResult.rows[0]?.count};
    const choices = {data: choicesResult.rows};
    if (!Array.isArray(rows.data) || !Array.isArray(choices.data) || !Number.isSafeInteger(rows.count) || rows.count! < 0 ||
      !Number.isInteger(count.count) || count.count! < 0 || count.count! > 6) throw new Error();
    const data = rows.data.map(parseAdminProduct);
    if (data.some(product => !product) || choices.data.some(option => !validProductId(option.id) || typeof option.name !== "string" || !option.name.trim())) throw new Error();
    return Response.json({ data, total: rows.count, activeCount: count.count, page,
      options: choices.data.map(option => ({ id: option.id, name: option.name })) }, { headers: authResponseHeaders });
  } catch (error) { return handleError(error); }
}

async function readInput(request: Request): Promise<Record<string, unknown>> {
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
      if (size > 16384) { await reader.cancel(); throw new AuthCoreError(413, "payload_too_large"); }
      text += decoder.decode(value, { stream: true });
    }
    const input = JSON.parse(text + decoder.decode());
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
    return input;
  } catch (error) {
    throw error instanceof AuthCoreError ? error : new AuthCoreError(400, "invalid_request");
  } finally { reader.releaseLock(); }
}

async function mutate(request: Request, operation: "create" | "update" | "unpublish") {
  try {
    await requireAdminMutation(request);
    const input = await readInput(request);
    const { id, ...fields } = input;
    const product = operation === "unpublish" ? null : parseProductInput(operation === "create" ? input : fields);
    if ((operation !== "create" && !validProductId(id)) || (operation !== "unpublish" && !product) ||
      (operation === "unpublish" && Object.keys(fields).length > 0) || (product && product.upsellIds.includes(String(id)))) {
      return failure(400, "validation_error", "Ürün alanlarını ve upsell seçimini kontrol edin.");
    }
    const productId = operation === "create" ? randomUUID() : id;
    let data: unknown;
    try {
      const result = operation === "unpublish"
        ? await dbQuery("select admin_unpublish_product($1) as id", [productId])
        : await dbQuery("select admin_save_product($1, $2::jsonb, $3) as id", [productId, JSON.stringify(product), operation === "create"]);
      data = result.rows[0]?.id;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      if (code === "P0002") return failure(404, "product_not_found", "Ürün bulunamadı. Listeyi yenileyin.");
      if (typeof code === "string" && ["23514", "23505", "23503"].includes(code)) return failure(409, "product_conflict", "En fazla 6 aktif ürün olabilir. Listeyi ve upsell seçimini kontrol edin.");
      throw new Error("Product operation unavailable");
    }
    if (!validProductId(data)) throw new Error();
    revalidatePath("/");
    return Response.json({ id: data }, { status: operation === "create" ? 201 : 200,
      headers: { ...authResponseHeaders, ...(operation === "create" ? { Location: `/api/admin/products?id=${encodeURIComponent(data)}` } : {}) } });
  } catch (error) { return handleError(error); }
}
export const POST = (request: Request) => mutate(request, "create");
export const PATCH = (request: Request) => mutate(request, "update");
/** DELETE only unpublishes. Records and historical references are retained. */
export const DELETE = (request: Request) => mutate(request, "unpublish");

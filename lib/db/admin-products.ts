import "server-only";
import { DbError, batch, toDbError, type SqlStatement } from "@/lib/db";
import type { ProductInput } from "@/lib/contracts/admin-products";

/** `admin_save_product` / `admin_unpublish_product` PostgreSQL işlevlerinin D1 karşılığı.
 * Önceki işlevler tek işlemde ve danışma kilidi altında çalışıyordu. D1'de tüm ifadeler tek `batch` çağrısıdır:
 * D1 bu çağrıyı bölünmeden ve atomik çalıştırır, bir ifade (ya da `sql_guard` denetimi) hata verirse hiçbir
 * değişiklik kalmaz. Denetimler yazma ifadelerinden ÖNCE, aynı toplu çağrıda ve aynı sırayla yapılır.
 * Hata kodları eski SQLSTATE kodlarıdır: 23503 geçersiz upsell, 23514 kural ihlali, P0002 ürün yok, 23505 çift kayıt.
 */
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;

function failure(message: string, code: string): DbError {
  return new DbError(message, code);
}

function guard(code: string, condition: string, values: readonly unknown[]): SqlStatement {
  return { text: `INSERT INTO sql_guard(code, ok) SELECT '${code}', CASE WHEN ${condition} THEN 1 ELSE 0 END`, values };
}

function guardCode(error: unknown): DbError {
  const wrapped = error instanceof DbError ? error : toDbError(error);
  const found = /guard:(\w+)/.exec(wrapped.message)?.[1];
  if (found === "product_not_found") return failure("Product not found", "P0002");
  if (found === "invalid_upsell") return failure("Invalid upsell", "23503");
  return wrapped;
}

function validate(id: string, product: ProductInput): string[] {
  const label = product.categoryLabel?.trim() || null;
  if (!idPattern.test(id) || !Array.isArray(product.upsellIds)) throw failure("Invalid product", "23514");
  if (label !== null && (label.length > 40 || /[<>]/.test(label))) throw failure("Invalid category label", "23514");
  const targets = product.upsellIds;
  if (targets.length > 5 || targets.includes(id) || new Set(targets).size !== targets.length) throw failure("Invalid upsell", "23503");
  return targets;
}

export async function adminSaveProduct(id: string, product: ProductInput, create: boolean): Promise<string> {
  const targets = validate(id, product);
  const label = product.categoryLabel?.trim() || null;
  const marks = targets.map((_, index) => `$${index + 2}`).join(",");
  const statements: SqlStatement[] = [
    // Her upsell hedefi şu anda aktif bir ürün olmalı.
    targets.length
      ? guard("invalid_upsell", `(SELECT count(*) FROM products WHERE is_active = 1 AND id IN (${marks})) = ${targets.length}`, [id, ...targets])
      : guard("invalid_upsell", "1 = 1", []),
  ];
  const fields = [product.name, product.category, product.weight, product.priceKurus, product.stock, product.isActive, label, product.showCategoryLabel];
  if (create) {
    statements.push({ text: `INSERT INTO products(id, name, category, weight, price_kurus, stock, is_active, category_label, show_category_label)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, values: [id, ...fields] });
  } else {
    statements.push(guard("product_not_found", "EXISTS (SELECT 1 FROM products WHERE id = $1)", [id]));
    statements.push({ text: `UPDATE products SET name=$2, category=$3, weight=$4, price_kurus=$5, stock=$6, is_active=$7,
      category_label=$8, show_category_label=$9 WHERE id = $1`, values: [id, ...fields] });
  }
  statements.push({ text: "DELETE FROM product_upsells WHERE product_id = $1 OR (upsell_id = $1 AND $2 = 0)", values: [id, product.isActive] });
  for (const target of targets) statements.push({ text: "INSERT INTO product_upsells(product_id, upsell_id) VALUES ($1, $2)", values: [id, target] });
  try {
    await batch(statements);
  } catch (error) {
    throw guardCode(error);
  }
  return id;
}

export async function adminUnpublishProduct(id: string): Promise<string> {
  if (!idPattern.test(id)) throw failure("Invalid product", "23514");
  try {
    await batch([
      guard("product_not_found", "EXISTS (SELECT 1 FROM products WHERE id = $1)", [id]),
      { text: "UPDATE products SET is_active = 0 WHERE id = $1", values: [id] },
      { text: "DELETE FROM product_upsells WHERE product_id = $1 OR upsell_id = $1", values: [id] },
    ]);
  } catch (error) {
    throw guardCode(error);
  }
  return id;
}

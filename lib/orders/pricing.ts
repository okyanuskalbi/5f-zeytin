import "server-only";
import { readCatalog } from "@/lib/catalog/read";
import type { CartLineInput } from "@/lib/contracts/discounts";

export type PricedLine = { productId: string; name: string; weight: string; quantity: number; unitPriceKurus: number; amountKurus: number };
export type PricedCart = { lines: PricedLine[]; subtotalKurus: number };

/** Sunucu tarafı gerçek fiyat kaynağı: katalog (D1 `products`, yoksa onaylı statik liste). İstemciden yalnız ürün kimliği ve adet alınır.
 * Bilinmeyen ürün, stok yetersizliği veya taşma varsa null döner. */
export async function priceCart(lines: readonly CartLineInput[]): Promise<PricedCart | null> {
  let catalog;
  try { catalog = await readCatalog(); } catch { return null; }
  const byId = new Map(catalog.data.map(product => [product.id, product]));
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || line.quantity > product.stock || !Number.isSafeInteger(product.priceKurus) || product.priceKurus < 0) return null;
    priced.push({ productId: product.id, name: product.name, weight: product.weight, quantity: line.quantity,
      unitPriceKurus: product.priceKurus, amountKurus: product.priceKurus * line.quantity });
  }
  const subtotalKurus = priced.reduce((sum, line) => sum + line.amountKurus, 0);
  return Number.isSafeInteger(subtotalKurus) ? { lines: priced, subtotalKurus } : null;
}

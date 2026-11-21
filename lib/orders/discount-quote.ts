import "server-only";
import { evaluateDiscount, getDiscountByCode } from "@/lib/db/discounts";
import type { CartLineInput, DiscountType } from "@/lib/contracts/discounts";
import { priceCart } from "./pricing";

export type DiscountQuote =
  | { ok: true; code: string; type: DiscountType; value: number; subtotalKurus: number; discountKurus: number; totalKurus: number }
  | { ok: false; reason: "invalid_code" | "cart_invalid" };

/** Sepet için indirim teklifi: fiyatlar ve indirim yalnız sunucuda hesaplanır; toplam 0'ın altına inmez. */
export async function quoteDiscount(code: string, lines: readonly CartLineInput[], now = Date.now()): Promise<DiscountQuote> {
  const cart = await priceCart(lines);
  if (!cart) return { ok: false, reason: "cart_invalid" };
  const discount = await getDiscountByCode(code);
  const amount = evaluateDiscount(discount, cart.subtotalKurus, now);
  if (!discount || amount === null) return { ok: false, reason: "invalid_code" };
  return { ok: true, code: discount.code, type: discount.type, value: discount.value, subtotalKurus: cart.subtotalKurus,
    discountKurus: amount, totalKurus: Math.max(0, cart.subtotalKurus - amount) };
}

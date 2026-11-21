import "server-only";
import { randomUUID } from "node:crypto";
import { batch, type SqlStatement } from "@/lib/db";
import { normalizeDiscountCode, type CartLineInput } from "@/lib/contracts/discounts";
import { evaluateDiscount, getDiscountByCode, redeemStatements } from "@/lib/db/discounts";
import { priceCart } from "./pricing";

export class OrderError extends Error {
  constructor(public readonly code: "cart_invalid" | "invalid_code" | "order_exists") { super(code); this.name = "OrderError"; }
}
export type NewOrder = {
  userId: string; orderNo: string; deliveryAddress: Record<string, string>; items: readonly CartLineInput[]; discountCode?: string | null; now?: number;
};
export type CreatedOrder = { orderId: string; orderNo: string; subtotalKurus: number; discountKurus: number; totalKurus: number };

/** Siparişi tek atomik toplu çağrıyla yazar: kalemler, indirim kaydı ve kod sayacı birlikte uygulanır ya da hiçbiri uygulanmaz.
 * Fiyat ve indirim burada sunucuda yeniden hesaplanır; çağıran toplam/indirim veremez. Kargo henüz hesaba katılmaz (mevcut kural). */
export async function createOrder(input: NewOrder): Promise<CreatedOrder> {
  const now = input.now ?? Date.now();
  const cart = await priceCart(input.items);
  if (!cart || cart.lines.length === 0) throw new OrderError("cart_invalid");
  let discount = null;
  let discountKurus = 0;
  if (input.discountCode !== undefined && input.discountCode !== null && input.discountCode !== "") {
    const code = normalizeDiscountCode(input.discountCode);
    discount = code ? await getDiscountByCode(code) : null;
    const amount = evaluateDiscount(discount, cart.subtotalKurus, now);
    if (!discount || amount === null) throw new OrderError("invalid_code");
    discountKurus = amount;
  }
  const totalKurus = Math.max(0, cart.subtotalKurus - discountKurus);
  const orderId = randomUUID();
  const statements: SqlStatement[] = [
    ...(discount ? redeemStatements(discount, cart.subtotalKurus, now) : []),
    { text: "insert into orders (id, user_id, order_no, total_kurus, delivery_address) values ($1, $2, $3, $4, $5)",
      values: [orderId, input.userId, input.orderNo, totalKurus, JSON.stringify(input.deliveryAddress)] },
    ...cart.lines.map(line => ({ text: "insert into order_items (order_id, product_name, weight, quantity, unit_price_kurus) values ($1, $2, $3, $4, $5)",
      values: [orderId, line.name, line.weight, line.quantity, line.unitPriceKurus] })),
    ...(discount ? [{ text: "insert into order_discounts (order_id, discount_code_id, code, amount_kurus) values ($1, $2, $3, $4)",
      values: [orderId, discount.id, discount.code, discountKurus] }] : []),
  ];
  try {
    await batch(statements);
  } catch (error) {
    const err = error as { message?: string; code?: string | null };
    if (/guard:discount_unavailable/.test(err.message ?? "")) throw new OrderError("invalid_code");
    if (err.code === "23505") throw new OrderError("order_exists");
    throw error;
  }
  return { orderId, orderNo: input.orderNo, subtotalKurus: cart.subtotalKurus, discountKurus, totalKurus };
}

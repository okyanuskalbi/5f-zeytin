import "server-only";
import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";

export function isPaymentPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.PAYMENT_PREVIEW !== "0";
}

export function requirePaymentPreview(): void {
  if (!isPaymentPreviewEnabled()) notFound();
}

export const previewSummary = Object.freeze({
  productName: "Örnek zeytin · test ürünü",
  amountKurus: 100,
  quantity: 1,
});

export function createPreviewOrder() {
  const createdAt = Date.now();
  // Ephemeral request-local fixture: no database, customer account or paid state.
  return Object.freeze({
    ...previewSummary,
    merchantOid: `PREVIEW${randomUUID().replaceAll("-", "")}`,
    createdAt,
    expiresAt: createdAt + 300_000,
    email: "preview@example.invalid",
    userName: "Önizleme Kullanıcısı",
    userAddress: "Test adresi, Osmaniye",
    userPhone: "05000000000",
  });
}

export type PreviewOrder = ReturnType<typeof createPreviewOrder>;

// This entire endpoint is disabled in production. A single bounded local bucket
// also prevents bypassing the limit with spoofed forwarded IP headers.
let windowStart = 0;
let attempts = 0;
export function consumePreviewAttempt(): number {
  const now = Date.now();
  if (now - windowStart >= 60_000) {
    windowStart = now;
    attempts = 0;
  }
  if (attempts >= 5) return Math.max(1, Math.ceil((windowStart + 60_000 - now) / 1000));
  attempts++;
  return 0;
}

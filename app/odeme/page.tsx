import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { EmptyState } from "@/components/site/EmptyState";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import { isPaymentPreviewEnabled } from "@/lib/payments/preview";
import { getPaytrCredentials } from "@/lib/payments/paytr";

export const metadata: Metadata = { title: "Ödeme | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  if (!isCheckoutDemoEnabled()) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön">
    <p>Ödeme hazırlıkları sürüyor.</p>
    <p>Seçtiklerinizi sepetinizde gözden geçirebilirsiniz.</p>
  </EmptyState>;
  // The existing 001b preview token endpoint is always closed in production.
  // Only a boolean crosses the server/client boundary, never PayTR credentials.
  return <Checkout localPreviewAvailable={isPaymentPreviewEnabled() && getPaytrCredentials() !== null} />;
}

import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { CheckoutUnavailable } from "@/components/checkout/CheckoutUnavailable";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import { isPaymentPreviewEnabled } from "@/lib/payments/preview";
import { getPaytrCredentials } from "@/lib/payments/paytr";

export const metadata: Metadata = completeMetadata({
  description: "Online ödeme henüz kullanıma açık değildir. Ürün seçiminiz için teklif hazırlama yolunu inceleyin.", title: "Ödeme | Afina Zeytin", alternates: { canonical: "/odeme" }, robots: { index: false, follow: false } });

export default function Page() {
  if (!isCheckoutDemoEnabled()) return <CheckoutUnavailable />;
  // The existing 001b preview token endpoint is always closed in production.
  // Only a boolean crosses the server/client boundary, never PayTR credentials.
  return <Checkout localPreviewAvailable={isPaymentPreviewEnabled() && getPaytrCredentials() !== null} />;
}

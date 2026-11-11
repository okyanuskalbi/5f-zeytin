import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { ServiceState } from "@/components/storefront/account/ServiceState";
import { PaymentUnavailable } from "@/components/storefront/cart/PaymentUnavailable";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import { isPaymentPreviewEnabled } from "@/lib/payments/preview";
import { getPaytrCredentials } from "@/lib/payments/paytr";

export const metadata: Metadata = { title: "Ödeme | Afina Zeytin", alternates: { canonical: "/odeme" }, robots: { index: false, follow: false } };

export default function Page() {
  if (!isCheckoutDemoEnabled()) return <ServiceState title="Ödeme" href="/sepet" action="Sepetime dön">
    <p>Ödeme hazırlıkları sürüyor.</p>
    <PaymentUnavailable />
  </ServiceState>;
  // The existing 001b preview token endpoint is always closed in production.
  // Only a boolean crosses the server/client boundary, never PayTR credentials.
  return <Checkout localPreviewAvailable={isPaymentPreviewEnabled() && getPaytrCredentials() !== null} />;
}

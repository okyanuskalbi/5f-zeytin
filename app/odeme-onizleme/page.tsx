import type { Metadata } from "next";
import { PaymentPreview } from "@/components/checkout/PaymentPreview";
import { requirePaymentPreview, previewSummary } from "@/lib/payments/preview";
import { getPaytrCredentials } from "@/lib/payments/paytr";

export const metadata: Metadata = { title: "Yerel ödeme önizlemesi | Afina Zeytin", robots: { index: false, follow: false } };

export default function PaymentPreviewPage() {
  requirePaymentPreview();
  return <PaymentPreview keysAvailable={getPaytrCredentials() !== null} summary={previewSummary} />;
}

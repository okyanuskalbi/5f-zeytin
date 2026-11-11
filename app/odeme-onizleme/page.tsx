import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { PaymentPreview } from "@/components/checkout/PaymentPreview";
import { requirePaymentPreview, previewSummary } from "@/lib/payments/preview";
import { getPaytrCredentials } from "@/lib/payments/paytr";

export const metadata: Metadata = completeMetadata({
  description: "Yalnız yerel geliştirme için ödeme akışı önizlemesi.", title: "Yerel ödeme önizlemesi | Afina Zeytin", alternates: { canonical: "/odeme-onizleme" }, robots: { index: false, follow: false } });

export default function PaymentPreviewPage() {
  requirePaymentPreview();
  return <PaymentPreview keysAvailable={getPaytrCredentials() !== null} summary={previewSummary} />;
}

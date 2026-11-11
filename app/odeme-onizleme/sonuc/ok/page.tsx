import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";
import { requirePaymentPreview } from "@/lib/payments/preview";

export const metadata: Metadata = completeMetadata({
  description: "Yerel ödeme denemesinin başarılı dönüşünü inceleyin.", title: "Önizleme yönlendirmesi | Afina Zeytin", alternates: { canonical: "/odeme-onizleme/sonuc/ok" }, robots: { index: false, follow: false } });

export default function PreviewOkPage() {
  requirePaymentPreview();
  return <EmptyState title="Test ekranından dönüş" href="/odeme-onizleme" action="Önizlemeye dön">
    <p role="status">Önizleme yönlendirme sonucu, ödeme teyidi değildir.</p>
    <p>Bu dönüş sipariş durumunu değiştirmez.</p>
  </EmptyState>;
}

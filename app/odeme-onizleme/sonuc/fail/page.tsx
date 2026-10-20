import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";
import { requirePaymentPreview } from "@/lib/payments/preview";

export const metadata: Metadata = { title: "Önizleme hata yönlendirmesi | Afina Zeytin", robots: { index: false, follow: false } };

export default function PreviewFailPage() {
  requirePaymentPreview();
  return <EmptyState title="Test ekranı hata dönüşü" href="/odeme-onizleme" action="Önizlemeye dön">
    <p role="status">Önizleme yönlendirme sonucu, ödeme teyidi değildir.</p>
    <p>Bu dönüş sipariş durumunu değiştirmez.</p>
  </EmptyState>;
}

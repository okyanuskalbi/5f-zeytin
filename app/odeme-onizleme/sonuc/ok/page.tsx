import type { Metadata } from "next";
import Link from "next/link";
import { requirePaymentPreview } from "@/lib/payments/preview";

export const metadata: Metadata = { title: "Önizleme yönlendirmesi | Afina Zeytin", robots: { index: false, follow: false } };

export default function PreviewOkPage() {
  requirePaymentPreview();
  return <main className="mx-auto max-w-2xl px-4 py-16">
    <h1>Test ekranından dönüş</h1>
    <p role="status" className="mt-6">Önizleme yönlendirme sonucu, ödeme teyidi değildir.</p>
    <p className="mt-4 text-muted-foreground">Bu dönüş sipariş durumunu değiştirmez.</p>
    <Link href="/odeme-onizleme" className="mt-6 inline-flex min-h-11 items-center underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Önizlemeye dön</Link>
  </main>;
}

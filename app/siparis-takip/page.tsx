import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/site/EmptyState";
import { Tracking } from "@/components/orders/Tracking";
import { isTrackingDemoEnabled } from "@/lib/orders/tracking-adapter";

export const metadata: Metadata = { title: "Sipariş Takibi | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  if (isTrackingDemoEnabled()) return <Suspense fallback={<EmptyState title="Sipariş takibi"><p role="status">Sipariş takibi yükleniyor…</p></EmptyState>}><Tracking /></Suspense>;
  return <EmptyState title="Sipariş takibi">
    <p>Sipariş ve kargo takibi yakında.</p>
    <p>Sipariş veya takip bilgisi bu sayfada sorgulanamaz.</p>
  </EmptyState>;
}

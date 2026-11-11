import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceState } from "@/components/storefront/account/ServiceState";
import { Tracking } from "@/components/orders/Tracking";
import { isTrackingDemoEnabled } from "@/lib/orders/tracking-adapter";

export const metadata: Metadata = { title: "Sipariş Takibi | Afina Zeytin", alternates: { canonical: "/siparis-takip" }, robots: { index: false, follow: false } };

export default function Page() {
  if (isTrackingDemoEnabled()) return <Suspense fallback={<ServiceState title="Sipariş takibi"><p role="status">Sipariş takibi yükleniyor…</p></ServiceState>}><Tracking /></Suspense>;
  return <ServiceState title="Sipariş takibi">
    <p>Sipariş ve kargo takibi yakında.</p>
    <p>Sipariş veya takip bilgisi bu sayfada sorgulanamaz.</p>
  </ServiceState>;
}

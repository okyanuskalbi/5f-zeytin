import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = { title: "Sipariş Takibi | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  return <EmptyState title="Sipariş takibi">
    <p>Sipariş ve kargo takibi henüz kullanıma açık değil.</p>
    <p>Sipariş veya takip bilgisi bu sayfada sorgulanamaz.</p>
  </EmptyState>;
}

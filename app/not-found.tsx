import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = { title: "Sayfa bulunamadı | Afina Zeytin" };

export default function NotFound() {
  return <EmptyState title="Sayfa bulunamadı" href="/" action="Ana sayfaya dön">
    <p>Aradığınız sayfaya ulaşılamıyor. Ana sayfadan ürünlerimize ve iletişim bilgilerimize ulaşabilirsiniz.</p>
  </EmptyState>;
}

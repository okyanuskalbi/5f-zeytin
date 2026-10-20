import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = { title: "Hesabım | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  return <EmptyState title="Hesabım">
    <p>Üyelik ve hesap işlemleri henüz kullanıma açık değil.</p>
    <p>Ürünlerimizi keşfedebilir, seçtiklerinizi sepetinizde saklayabilirsiniz.</p>
  </EmptyState>;
}

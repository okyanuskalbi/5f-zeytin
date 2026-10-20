import type { Metadata } from "next";
import { EmptyState } from "@/components/site/EmptyState";
import { Account } from "@/components/account/Account";
import { isMembershipDemoEnabled } from "@/lib/auth/adapter";

export const metadata: Metadata = { title: "Hesabım | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  if (isMembershipDemoEnabled()) return <Account />;
  return <EmptyState title="Hesabım">
    <p>Yakında. Üyelik ve hesap işlemleri henüz kullanıma açık değil.</p>
    <p>Ürünlerimizi keşfedebilir, seçtiklerinizi sepetinizde saklayabilirsiniz.</p>
  </EmptyState>;
}

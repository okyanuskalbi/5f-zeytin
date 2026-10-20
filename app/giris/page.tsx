import type { Metadata } from "next";
import { SignIn } from "@/components/account/SignIn";
import { EmptyState } from "@/components/site/EmptyState";
import { isMembershipDemoEnabled } from "@/lib/auth/adapter";

export const metadata: Metadata = { title: "Giriş ve üyelik | Afina Zeytin", robots: { index: false, follow: false } };

export default function Page() {
  if (!isMembershipDemoEnabled()) return <EmptyState title="Giriş ve üyelik"><p>Yakında. Üyelik ve hesap işlemleri henüz kullanıma açık değil.</p><p>Alışverişinize üye olmadan devam edebilirsiniz.</p></EmptyState>;
  return <SignIn />;
}

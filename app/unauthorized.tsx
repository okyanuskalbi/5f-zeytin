import type { Metadata } from "next";
import type { JSX } from "react";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = {
  title: "Giriş gerekli | Afina Zeytin",
  robots: { index: false, follow: false },
};

export default function Unauthorized(): JSX.Element {
  return <EmptyState title="Giriş gerekli" href="/giris?next=%2Fadmin" action="Giriş yap">
    <p>Bu sayfayı görmek için yönetici hesabıyla giriş yapın.</p>
  </EmptyState>;
}

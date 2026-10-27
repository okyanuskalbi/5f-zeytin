import type { Metadata } from "next";
import type { JSX } from "react";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = {
  title: "Yetkiniz yok | Afina Zeytin",
  robots: { index: false, follow: false },
};

export default function Forbidden(): JSX.Element {
  return <EmptyState title="Yetkiniz yok" href="/" action="Ana sayfaya dön">
    <p>Bu hesabın yönetici yetkisi bulunmuyor.</p>
  </EmptyState>;
}

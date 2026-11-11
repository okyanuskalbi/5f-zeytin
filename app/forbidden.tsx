import type { Metadata } from "next";
import type { JSX } from "react";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = {
  title: "Yetkiniz yok | Afina Zeytin", description: "Bu sayfayı görüntülemek için gerekli yetkiniz bulunmuyor.", robots: { index: false, follow: false },
  openGraph: { title: "Yetkiniz yok | Afina Zeytin", description: "Bu sayfayı görüntülemek için gerekli yetkiniz bulunmuyor.", type: "website", images: ["/brand/og-zeytinyagi.webp"] },
  twitter: { card: "summary_large_image", title: "Yetkiniz yok | Afina Zeytin", description: "Bu sayfayı görüntülemek için gerekli yetkiniz bulunmuyor.", images: ["/brand/og-zeytinyagi.webp"] },
};

export default function Forbidden(): JSX.Element {
  return <EmptyState title="Yetkiniz yok" href="/" action="Ana sayfaya dön">
    <p>Bu hesabın yönetici yetkisi bulunmuyor.</p>
  </EmptyState>;
}

import type { Metadata } from "next";
import type { JSX } from "react";
import { EmptyState } from "@/components/site/EmptyState";

export const metadata: Metadata = {
  title: "Giriş gerekli | Afina Zeytin", description: "Bu sayfayı görüntülemek için yetkili hesabınızla giriş yapın.", robots: { index: false, follow: false },
  openGraph: { title: "Giriş gerekli | Afina Zeytin", description: "Bu sayfayı görüntülemek için yetkili hesabınızla giriş yapın.", type: "website", images: ["/brand/og-zeytinyagi.webp"] },
  twitter: { card: "summary_large_image", title: "Giriş gerekli | Afina Zeytin", description: "Bu sayfayı görüntülemek için yetkili hesabınızla giriş yapın.", images: ["/brand/og-zeytinyagi.webp"] },
};

export default function Unauthorized(): JSX.Element {
  return <EmptyState title="Giriş gerekli" href="/giris?next=%2Fadmin" action="Giriş yap">
    <p>Bu sayfayı görmek için yönetici hesabıyla giriş yapın.</p>
  </EmptyState>;
}

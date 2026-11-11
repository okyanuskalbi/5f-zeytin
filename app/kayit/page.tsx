import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { Register } from "@/components/account/Register";

export const metadata: Metadata = completeMetadata({
  description: "AFİNA ZEYTİN üyeliğinizi oluşturmak için adınızı, e-posta adresinizi ve şifrenizi girin.", title: "Üye ol | Afina Zeytin", alternates: { canonical: "/kayit" }, robots: { index: false, follow: false } });

export default function Page() {
  return <><PageBreadcrumbJsonLd name="Üye ol" path="/kayit" /><Register /></>;
}

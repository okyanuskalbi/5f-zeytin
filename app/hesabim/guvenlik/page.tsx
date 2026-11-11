import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = completeMetadata({
  description: "Hesabınızın şifre ve güvenlik seçeneklerini inceleyin.",
  title: "Hesap güvenliği | Afina Zeytin",
  alternates: { canonical: "/hesabim/guvenlik" }, robots: { index: false, follow: false },
});
export default async function Page() {
  return <><PageBreadcrumbJsonLd name="Hesap güvenliği" path="/hesabim/guvenlik" parent={{ name: "Hesabım", path: "/hesabim" }} />{await CustomerPage({ section: "security" })}</>;
}

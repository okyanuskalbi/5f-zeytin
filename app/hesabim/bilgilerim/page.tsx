import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = completeMetadata({
  description: "Hesabınıza ait ad, soyad ve iletişim bilgilerini inceleyin.",
  title: "Hesap bilgilerim | Afina Zeytin",
  alternates: { canonical: "/hesabim/bilgilerim" }, robots: { index: false, follow: false },
});
export default async function Page() {
  return <><PageBreadcrumbJsonLd name="Hesap bilgilerim" path="/hesabim/bilgilerim" parent={{ name: "Hesabım", path: "/hesabim" }} />{await CustomerPage({ section: "profile" })}</>;
}

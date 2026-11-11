import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = completeMetadata({
  description: "Hesabınıza kayıtlı teslimat adreslerinizi inceleyin ve düzenleyin.",
  title: "Adreslerim | Afina Zeytin",
  alternates: { canonical: "/hesabim/adresler" }, robots: { index: false, follow: false },
});
export default async function Page() {
  return <><PageBreadcrumbJsonLd name="Adreslerim" path="/hesabim/adresler" parent={{ name: "Hesabım", path: "/hesabim" }} />{await CustomerPage({ section: "addresses" })}</>;
}

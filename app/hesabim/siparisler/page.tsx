import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = completeMetadata({
  description: "Hesabınıza ait siparişleri ve durumlarını inceleyin.",
  title: "Siparişlerim | Afina Zeytin",
  alternates: { canonical: "/hesabim/siparisler" }, robots: { index: false, follow: false },
});
export default async function Page() {
  return <><PageBreadcrumbJsonLd name="Siparişlerim" path="/hesabim/siparisler" parent={{ name: "Hesabım", path: "/hesabim" }} />{await CustomerPage({ section: "orders" })}</>;
}

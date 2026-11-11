import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = completeMetadata({
  description: "Hesabınıza ait seçili siparişin ayrıntılarını inceleyin.",
  title: "Sipariş detayı | Afina Zeytin",
  alternates: { canonical: "/hesabim/siparisler" }, robots: { index: false, follow: false },
});
export default async function Page({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  return <><PageBreadcrumbJsonLd name="Sipariş detayı" path="/hesabim/siparisler" parent={{ name: "Hesabım", path: "/hesabim" }} />{await CustomerPage({ section: "order-detail", orderNo: (await params).no })}</>;
}

import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sipariş detayı | Afina Zeytin",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  return CustomerPage({ section: "order-detail", orderNo: (await params).no });
}

import type { Metadata } from "next";
import { CustomerPage } from "@/lib/account/customer-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hesap güvenliği | Afina Zeytin",
  robots: { index: false, follow: false },
};
export default async function Page() {
  return CustomerPage({ section: "security" });
}

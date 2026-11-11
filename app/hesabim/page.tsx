import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSummary } from "@/components/account/AccountSummary";
import { readOwnAccount } from "@/lib/account/read";

export const metadata: Metadata = completeMetadata({
  description: "AFİNA ZEYTİN hesap bilgilerinize, adreslerinize ve siparişlerinize ulaşın.", title: "Hesabım | Afina Zeytin", alternates: { canonical: "/hesabim" }, robots: { index: false, follow: false } });

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!(await cookies()).getAll().some(cookie => /^(?:__Secure-)?better-auth\.session_token$/.test(cookie.name))) redirect("/giris?next=/hesabim");
  let profile;
  try { profile = await readOwnAccount(); }
  catch { return <><PageBreadcrumbJsonLd name="Hesabım" path="/hesabim" /><AccountSummary profile={null} /></>; }
  // redirect throws; keep it outside the service error handler.
  if (!profile) redirect("/giris?next=/hesabim");
  return <><PageBreadcrumbJsonLd name="Hesabım" path="/hesabim" /><AccountSummary profile={profile} /></>;
}

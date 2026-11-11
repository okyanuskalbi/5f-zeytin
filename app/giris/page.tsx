import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SignIn } from "@/components/account/SignIn";
import { safeAuthRedirect } from "@/lib/auth/config";
import { getVerifiedUser } from "@/lib/auth/server";

export const metadata: Metadata = completeMetadata({
  description: "AFİNA ZEYTİN hesabınıza e-posta adresinizle giriş yapın veya üyelik seçeneklerini inceleyin.", title: "Giriş ve üyelik | Afina Zeytin", alternates: { canonical: "/giris" }, robots: { index: false, follow: false } });

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const next = safeAuthRedirect(typeof query?.next === "string" ? query.next : null);
  let signedIn = false;
  let unavailable = false;
  if ((await cookies()).getAll().some(cookie => ["better-auth.session_token", "__Secure-better-auth.session_token"].includes(cookie.name))) {
    try { signedIn = !!(await getVerifiedUser()); }
    catch { unavailable = true; }
  }
  return <><PageBreadcrumbJsonLd name="Giriş" path="/giris" /><SignIn next={next} signedIn={signedIn} unavailable={unavailable} /></>;
}

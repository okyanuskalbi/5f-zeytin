import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SignIn } from "@/components/account/SignIn";
import { safeAuthRedirect } from "@/lib/auth/config";
import { getVerifiedUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Giriş ve üyelik | Afina Zeytin", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> } = {}) {
  const query = await searchParams;
  const next = safeAuthRedirect(typeof query?.next === "string" ? query.next : null);
  let signedIn = false;
  let unavailable = false;
  if ((await cookies()).getAll().some(cookie => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))) {
    try { signedIn = !!(await getVerifiedUser()); }
    catch { unavailable = true; }
  }
  return <SignIn next={next} signedIn={signedIn} unavailable={unavailable} />;
}

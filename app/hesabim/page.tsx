import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSummary } from "@/components/account/AccountSummary";
import { readOwnAccount } from "@/lib/account/read";

export const metadata: Metadata = { title: "Hesabım | Afina Zeytin", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!(await cookies()).getAll().some(cookie => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))) redirect("/giris?next=/hesabim");
  let profile;
  try { profile = await readOwnAccount(); }
  catch { return <AccountSummary profile={null} />; }
  // redirect throws; keep it outside the service error handler.
  if (!profile) redirect("/giris?next=/hesabim");
  return <AccountSummary profile={profile} />;
}

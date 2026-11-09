import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readOwnAccount } from "./read";
import { AccountSummary } from "@/components/account/AccountSummary";
import {
  CustomerWorkspace,
  type CustomerSection,
} from "@/components/account/CustomerWorkspace";

export async function CustomerPage({
  section,
  orderNo,
}: {
  section: CustomerSection;
  orderNo?: string;
}) {
  const suffix = {
    orders: "siparisler",
    addresses: "adresler",
    profile: "bilgilerim",
    security: "guvenlik",
    "order-detail": "siparisler",
  }[section];
  const login = `/giris?next=${encodeURIComponent(`/hesabim/${suffix}`)}`;
  if (
    !(await cookies())
      .getAll()
      .some((cookie) => /^(?:__Secure-)?better-auth\.session_token$/.test(cookie.name))
  )
    redirect(login);
  let profile;
  try {
    profile = await readOwnAccount();
  } catch {
    return <AccountSummary profile={null} />;
  }
  if (!profile) redirect(login);
  return (
    <CustomerWorkspace
      key={profile.email}
      profile={profile}
      section={section}
      orderNo={orderNo}
    />
  );
}

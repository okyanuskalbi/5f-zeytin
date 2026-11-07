import type { Metadata } from "next";
import { Register } from "@/components/account/Register";

export const metadata: Metadata = { title: "Üye ol | Afina Zeytin", alternates: { canonical: "/kayit" }, robots: { index: false, follow: false } };

export default function Page() {
  return <Register />;
}

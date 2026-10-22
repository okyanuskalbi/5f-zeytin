import type { Metadata } from "next";
import type { ReactNode } from "react";
import { forbidden, unauthorized } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AuthCoreError } from "@/lib/auth/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthCoreError && error.status === 401) unauthorized();
    if (error instanceof AuthCoreError && error.status === 403) forbidden();
    throw error;
  }
  return children;
}

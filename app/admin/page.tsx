import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Panel | AFİNA ZEYTİN", description: "AFİNA ZEYTİN yönetim paneli.", alternates: { canonical: "/admin" }, robots: { index: false, follow: false } });

export default async function AdminPage() {
  // The layout gate alone cannot authorize a page's own reads or future loaders.
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Panel" path="/admin" /><AdminShell /></>;
}

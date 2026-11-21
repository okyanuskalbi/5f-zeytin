import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Ziyaretçiler | AFİNA ZEYTİN", description: "Çerezsiz, anonim ziyaretçi istatistikleri.", alternates: { canonical: "/panel/ziyaretciler" }, robots: { index: false, follow: false } });

export default async function Page() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Ziyaretçiler" path="/panel/ziyaretciler" /><AdminShell area="admin-ziyaretciler"><VisitorsPanel /></AdminShell></>;
}

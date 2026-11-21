import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsManager } from "@/components/admin/PanelManagers";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Lead yönetimi | AFİNA ZEYTİN", description: "Form başvurularını inceleyin ve takip edin.", alternates: { canonical: "/panel/leadler" }, robots: { index: false, follow: false } });

export default async function Page() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Leadler" path="/panel/leadler" /><AdminShell area="admin-leadler"><LeadsManager /></AdminShell></>;
}

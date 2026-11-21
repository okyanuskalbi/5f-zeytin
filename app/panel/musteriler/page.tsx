import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomersManager } from "@/components/admin/PanelManagers";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Müşteri yönetimi | AFİNA ZEYTİN", description: "Müşteri bilgilerini ve sipariş özetini inceleyin.", alternates: { canonical: "/panel/musteriler" }, robots: { index: false, follow: false } });

export default async function Page() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Müşteriler" path="/panel/musteriler" /><AdminShell area="admin-musteriler"><CustomersManager /></AdminShell></>;
}

import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrdersManager } from "@/components/admin/PanelManagers";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Sipariş yönetimi | AFİNA ZEYTİN", description: "Siparişlerin durumunu ve kargo bilgisini inceleyin.", alternates: { canonical: "/panel/siparisler" }, robots: { index: false, follow: false } });

export default async function Page() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Siparişler" path="/panel/siparisler" /><AdminShell area="admin-siparisler"><OrdersManager /></AdminShell></>;
}

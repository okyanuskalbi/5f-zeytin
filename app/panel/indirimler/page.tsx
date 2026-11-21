import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { DiscountsManager } from "@/components/admin/DiscountsManager";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "İndirim kodları | AFİNA ZEYTİN", description: "İndirim kodlarını oluşturun, düzenleyin ve açıp kapatın.", alternates: { canonical: "/panel/indirimler" }, robots: { index: false, follow: false } });

export default async function Page() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="İndirim kodları" path="/panel/indirimler" /><AdminShell area="admin-indirimler"><DiscountsManager /></AdminShell></>;
}

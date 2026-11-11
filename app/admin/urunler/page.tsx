import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductManager } from "@/components/admin/ProductManager";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = completeMetadata({ title: "Ürün yönetimi | AFİNA ZEYTİN", description: "Yönetim panelindeki ürünleri inceleyin ve düzenleyin.", alternates: { canonical: "/admin/urunler" }, robots: { index: false, follow: false } });

export default async function ProductsPage() {
  await requireAdmin();
  return <><PageBreadcrumbJsonLd name="Ürün yönetimi" path="/admin/urunler" /><AdminShell area="admin-urunler"><ProductManager /></AdminShell></>;
}

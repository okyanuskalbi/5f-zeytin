import { AdminShell } from "@/components/admin/AdminShell";
import { ProductManager } from "@/components/admin/ProductManager";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ProductsPage() {
  await requireAdmin();
  return <AdminShell area="admin-urunler"><ProductManager /></AdminShell>;
}

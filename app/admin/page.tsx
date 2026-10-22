import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPage() {
  // The layout gate alone cannot authorize a page's own reads or future loaders.
  await requireAdmin();
  return <AdminShell />;
}

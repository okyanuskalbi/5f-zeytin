import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import { getPanelCounts } from "@/lib/db/admin-panel";
import { getTodayVisitors } from "@/lib/db/visits";
import type { AdminOverview } from "@/components/admin/AdminShell";

export const metadata = completeMetadata({ title: "Panel | AFİNA ZEYTİN", description: "AFİNA ZEYTİN yönetim paneli.", alternates: { canonical: "/panel" }, robots: { index: false, follow: false } });

export default async function AdminPage() {
  // The layout gate alone cannot authorize a page's own reads or future loaders.
  await requireAdmin();
  let overview: AdminOverview;
  try {
    const [counts, todayVisitors] = await Promise.all([getPanelCounts(), getTodayVisitors().catch(() => null)]);
    overview = { status: "live", ...counts, todayVisitors };
  } catch { overview = { status: "error" }; }
  return <><PageBreadcrumbJsonLd name="Panel" path="/panel" /><AdminShell overview={overview} /></>;
}

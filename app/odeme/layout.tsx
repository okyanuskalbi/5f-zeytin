import type { ReactNode } from "react";
import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";

export default function Layout({ children }: { children: ReactNode }) {
  return <><PageBreadcrumbJsonLd name="Ödeme" path="/odeme" />{children}</>;
}

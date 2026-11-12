import type { ReactNode } from "react";
import { PageBand, PagePath } from "@/components/storefront/ui/PageBand";
import { PillButton } from "@/components/storefront/ui/PillButton";
import styles from "./ServiceState.module.css";

export function ServiceState({ title, children, href = "/urunler", action = "Ürünleri İnceleyin" }: {
  title: string; children: ReactNode; href?: string; action?: string;
}) {
  return <main className={styles.page}><section className={styles.content}>
    <PagePath steps={[{ name: "Ana Sayfa", href: "/" }, { name: title }]} />
    <PageBand title={title}>
      <div className={styles.copy}>{children}</div>
      <PillButton href={href}>{action}</PillButton>
    </PageBand>
  </section></main>;
}

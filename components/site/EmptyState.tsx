import type { ReactNode } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import styles from "@/components/storefront/content/Content.module.css";

export function EmptyState({ title, children, href = "/#urunler", action = "Ürünlerimizi keşfedin" }: {
  title: string; children: ReactNode; href?: string; action?: string;
}) {
  return <main className={styles.page}>
    <div className={styles.state}>
      <h1>{title}</h1>
      {children}
      <div className={styles.actions}><PillButton href={href}>{action}</PillButton></div>
    </div>
  </main>;
}

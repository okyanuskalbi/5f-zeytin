import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./InnerPage.module.css";

export function EmptyState({ title, children, href = "/#urunler", action = "Ürünlerimizi keşfedin" }: {
  title: string; children: ReactNode; href?: string; action?: string;
}) {
  return <main className={styles.page}>
    <div className={`${styles.paper} ${styles.statePaper} ${styles.empty}`}>
      <header className={styles.header}><h1>{title}</h1></header>
      {children}
      <Button asChild><Link href={href} prefetch={false}>{action}</Link></Button>
    </div>
  </main>;
}

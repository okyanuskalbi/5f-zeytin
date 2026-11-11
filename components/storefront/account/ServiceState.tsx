import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./ServiceState.module.css";

export function ServiceState({ title, children, href = "/urunler", action = "Ürünleri İnceleyin" }: {
  title: string; children: ReactNode; href?: string; action?: string;
}) {
  return <main className={styles.page}><section className={styles.content}>
    <nav aria-label="İçerik yolu"><Link prefetch={false} href="/">Ana Sayfa</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
    <h1>{title}</h1>
    <div className={styles.copy}>{children}</div>
    <Button asChild><Link prefetch={false} href={href}>{action}</Link></Button>
  </section></main>;
}

import type { JSX, ReactNode } from "react";
import { CatalogShell } from "@/components/storefront/catalog/CatalogShell";
import styles from "@/components/storefront/catalog/Catalog.module.css";

export default function Layout({ children }: { children: ReactNode }): JSX.Element {
  return <main className={styles.root}><div className={styles.container}><CatalogShell>{children}</CatalogShell></div></main>;
}

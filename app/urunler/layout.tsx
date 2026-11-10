import type { JSX, ReactNode } from "react";
import { CatalogShell } from "@/components/catalog/CatalogShell";
import styles from "./page.module.css";

export default function Layout({ children }: { children: ReactNode }): JSX.Element {
  return <main className={styles.root}><div className={styles.container}><CatalogShell>{children}</CatalogShell></div></main>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type JSX, type ReactNode } from "react";
import { CatalogTransitionContext } from "./CatalogGridMotion";
import { getProductGroup } from "@/lib/catalog/groups";
import { CategoryNavigation } from "@/components/catalog/CategoryNavigation";
import styles from "@/app/urunler/page.module.css";

/** Kept by the products layout while the category's product list changes. */
export function CatalogShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState({ pathname, changed: false });
  if (navigation.pathname !== pathname) setNavigation({ pathname, changed: true });
  const group = getProductGroup(pathname?.split("/")[2] ?? "");
  return <>
    <nav aria-label="İçerik yolu" className={styles.breadcrumb}>
      <ol>
        <li><Link href="/">Ana Sayfa</Link></li>
        <li><span aria-hidden="true">/</span>{group ? <Link href="/urunler">Ürünler</Link> : <span aria-current="page">Ürünler</span>}</li>
        {group && <li><span aria-hidden="true">/</span><span aria-current="page">{group.name}</span></li>}
      </ol>
    </nav>
    <header className={styles.heading}>
      <h1>{group?.name ?? "Tüm ürünler"}</h1>
      <p>Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.</p>
    </header>
    <CategoryNavigation />
    <CatalogTransitionContext.Provider value={{ pathname: navigation.pathname ?? "", changed: navigation.changed }}>{children}</CatalogTransitionContext.Provider>
  </>;
}

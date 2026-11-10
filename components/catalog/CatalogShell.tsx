"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type JSX, type ReactNode } from "react";
import { CatalogTransitionContext } from "./CatalogGridMotion";
import { getGroupTrail, getProductGroup } from "@/lib/catalog/groups";
import { CategoryNavigation } from "@/components/catalog/CategoryNavigation";
import styles from "@/app/urunler/page.module.css";

/** Kept by the products layout while the category's product list changes. */
export function CatalogShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState({ pathname, changed: false });
  if (navigation.pathname !== pathname) setNavigation({ pathname, changed: true });
  const group = getProductGroup(pathname?.split("/")[2] ?? "");
  const trail = group ? getGroupTrail(group.id) : [];
  return <>
    <nav aria-label="İçerik yolu" className={styles.breadcrumb}>
      <ol>
        <li><Link href="/">Ana Sayfa</Link></li>
        <li><span aria-hidden="true">/</span>{group ? <Link href="/urunler">Ürünler</Link> : <span aria-current="page">Ürünler</span>}</li>
        {trail.map((item, index) => <li key={item.id}><span aria-hidden="true">/</span>{index === trail.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={`/urunler/${item.id}`}>{item.name}</Link>}</li>)}
      </ol>
    </nav>
    <header className={styles.heading}>
      <h1>{group?.name ?? "Tüm ürünler"}</h1>
      <p>Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.</p>
    </header>
    <div className={styles.catalogLayout}>
      <aside className={styles.sidebar}><h2>Kategoriler</h2><CategoryNavigation /></aside>
      <div className={styles.results}><CatalogTransitionContext.Provider value={{ pathname: navigation.pathname ?? "", changed: navigation.changed }}>{children}</CatalogTransitionContext.Provider></div>
    </div>
  </>;
}

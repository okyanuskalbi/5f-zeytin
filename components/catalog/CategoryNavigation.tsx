"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";
import { productGroups } from "@/lib/catalog/groups";
import { V3Picture } from "@/components/media/V3Picture";
import photos from "@/lib/media/classic-photos.json";
import styles from "./CategoryNavigation.module.css";

export function CategoryNavigation(): JSX.Element {
  const pathname = usePathname();
  const links = [
    { href: "/urunler", name: "Tüm ürünler", photo: "zeytinlik" as const },
    ...productGroups.map(group => ({ href: `/urunler/${group.id}`, name: group.name, photo: group.photo })),
  ];
  return <nav aria-label="Ürün grupları" className={styles.navigation}>
    <ul className={styles.list}>
      {links.map(link => <li key={link.href}>
        <Link href={link.href} className={styles.link} aria-current={pathname === link.href ? "page" : undefined}>
          <V3Picture image={photos.assets[link.photo]} sizes="36px" decorative />
          <span>{link.name}</span>
        </Link>
      </li>)}
    </ul>
  </nav>;
}

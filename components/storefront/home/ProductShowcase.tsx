"use client";

import { useRef, type JSX, type ReactNode } from "react";
import { PillSwitch } from "@/components/storefront/ui/PillSwitch";
import { productGroups } from "@/lib/catalog/groups";
import { replaceSearchParam, useLocationSearch } from "./location-search";
import styles from "../StoreHome.module.css";

export type ShowcaseItem = Readonly<{ id: string; groups: readonly string[]; tile: ReactNode }>;

const ALL = "tumu";
const SWITCH_FADE_MS = 160;
const categories = [
  { value: ALL, label: "Tümü" },
  { value: "zeytinyagi", label: "Zeytinyağı" },
  { value: "zeytin", label: "Zeytin" },
  { value: "siyah-zeytin", label: "Siyah" },
  { value: "yesil-zeytin", label: "Yeşil" },
  { value: "kirma-zeytin", label: "Kırma" },
] as const;

function belongsTo(item: ShowcaseItem, category: string): boolean {
  if (category === ALL) return true;
  return item.groups.some(group => group === category || productGroups.find(entry => entry.id === group)?.parentId === category);
}

/** Category pills over one product grid: the choice filters in place and lives in `?kategori=`. */
export function ProductShowcase({ items }: { items: readonly ShowcaseItem[] }): JSX.Element {
  const requested = new URLSearchParams(useLocationSearch()).get("kategori");
  const category = categories.some(entry => entry.value === requested) ? requested! : ALL;
  const grid = useRef<HTMLDivElement>(null);
  const visible = items.filter(item => belongsTo(item, category));

  function choose(next: string): void {
    replaceSearchParam("kategori", next === ALL ? null : next);
    // The only motion on a switch: a short opacity pass, no height animation.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) grid.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: SWITCH_FADE_MS, easing: "ease-out" });
  }

  return <>
    <div className={styles.categoryPills}><PillSwitch label="Ürün kategorisi" options={categories} value={category} onChange={choose} /></div>
    <div ref={grid} className={styles.productGrid} data-product-grid="" data-category={category}>
      {visible.map(item => <div key={item.id} className={styles.productCell}>{item.tile}</div>)}
    </div>
    {visible.length === 0 && <p role="status" className={styles.empty}>{category === ALL ? "Görüntülenecek ürün bulunmuyor." : "Bu grupta şu an ürün bulunmuyor."}</p>}
  </>;
}

"use client";

import { useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import { ArrowRight, Grid2X2 } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { useProductDetail } from "@/components/catalog/ProductDetailProvider";
import photos from "@/lib/media/classic-photos.json";
import type { ProductVariant } from "@/types/catalog";
import styles from "./ProductGroups.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const groups = [
  { family: "salamura-siyah", name: "Siyah Zeytin", photo: "siyah-zeytin" },
  { family: "salamura-yesil", name: "Yeşil Zeytin", photo: "yesil-zeytin" },
  { family: "dogal-kirma", name: "Kırma Zeytin", photo: "kirma-zeytin" },
  { family: "naturel-sizma", name: "Zeytinyağı", photo: "zeytinyagi" },
] as const;

/** The existing catalogue and checkout keep variant ownership. These four
 * photographs select a family; the existing detail owns its size selection. */
export function ProductGroups({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const openDetail = useProductDetail();
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  return <section id="urunler" aria-labelledby="urunler-title" className={styles.section}>
    <span id="kiler" className={styles.anchor} aria-hidden="true" />
    <h2 id="urunler-title" className={styles.heading}>ÜRÜN GRUPLARIMIZ</h2>
    <div className={styles.groups}>
      {groups.map(group => {
        const product = products.find(item => item.familyId === group.family);
        return <button key={group.family} type="button" className={styles.group} disabled={!ready || !product} aria-haspopup="dialog"
          onClick={event => { if (product) openDetail?.(product.id, event.currentTarget); }}>
          <V3Picture image={photos.assets[group.photo]} sizes="(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1304px) 24vw, 292px" decorative />
          <span>{group.name}<ArrowRight size={22} aria-hidden="true" /></span>
        </button>;
      })}
    </div>
    <div className={styles.allActions}>
      <Link href="/urunler" className={styles.allButton}><Grid2X2 size={18} aria-hidden="true" />Tüm ürünleri gör<ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
    <noscript><p>Ürün seçimi ve alışveriş için JavaScript gerekir. Ürün bilgisi için <a href="#iletisim">bizimle iletişime geçin.</a></p></noscript>
  </section>;
}

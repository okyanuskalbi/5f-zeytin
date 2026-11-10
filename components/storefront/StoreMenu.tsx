"use client";

import type { JSX } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { UserRound, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { productGroups } from "@/lib/catalog/groups";
import styles from "./Navigation.module.css";

/** Loaded only after the visitor opens the menu; Radix owns focus and Escape. */
export function StoreMenu({ links, pathname, onClose, onRestoreFocus }: {
  links: readonly { label: string; href: string }[];
  pathname: string | null;
  onClose: () => void;
  onRestoreFocus: () => void;
}): JSX.Element {
  const reduced = useReducedMotion();
  const active = (href: string) => pathname === href || (href === "/urunler" && (pathname?.startsWith("/urunler/") || pathname?.startsWith("/urun/")));
  return (
    <Dialog open onOpenChange={value => { if (!value) onClose(); }}>
      <AnimatePresence>
        {<DialogContent key="menu" placement="fullscreen" showCloseButton={false} className={styles.drawer}
          onCloseAutoFocus={event => {
            event.preventDefault();
            onRestoreFocus();
          }}>
          <m.div initial={reduced ? false : { opacity: .6, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }} className={styles.drawerInner}>
            <div className={styles.drawerTop}><DialogTitle className={styles.drawerTitle}>Site menüsü</DialogTitle><DialogClose asChild><button type="button" className={styles.iconButton} aria-label="Menüyü kapat"><X size={24} aria-hidden="true" /></button></DialogClose></div>
            <DialogDescription className="sr-only">Ürünlerimizi, AFİNA hakkında bilgileri ve hesabınızı açın.</DialogDescription>
            <nav aria-label="Mobil navigasyon" className={styles.mobileNav}>
              {links.map(link => <DialogClose key={link.href} asChild><Link href={link.href} aria-current={active(link.href) ? "page" : undefined}>{link.label}</Link></DialogClose>)}
            </nav>
            <nav aria-label="Ürün kategorileri" className={styles.mobileCategories}>
              {productGroups.map(group => <DialogClose key={group.id} asChild><Link href={`/urunler/${group.id}`}>{group.name}</Link></DialogClose>)}
            </nav>
            <div className={styles.drawerAccount}>
              <DialogClose asChild><Link href="/hesabim" prefetch={false}><UserRound size={20} aria-hidden="true" />Hesabım</Link></DialogClose>
              <DialogClose asChild><Link href="/siparis-takip" prefetch={false}>Sipariş takibi</Link></DialogClose>
            </div>
            <p className={styles.drawerSignoff}>Kökü toprakta. Yeri sofrada.</p>
          </m.div>
        </DialogContent>}
      </AnimatePresence>
    </Dialog>
  );
}

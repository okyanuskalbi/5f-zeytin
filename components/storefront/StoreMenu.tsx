"use client";

import type { JSX } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { UserRound, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { siteSections, type SiteSectionId } from "./site-sections";
import styles from "./Navigation.module.css";

/** Loaded only after the visitor opens the menu; Radix owns focus and Escape. */
export function StoreMenu({ current, onClose, onSection, onRestoreFocus }: {
  current: SiteSectionId | null;
  onClose: () => void;
  /** The chosen section, reported before the drawer closes. */
  onSection: (id: SiteSectionId) => void;
  onRestoreFocus: () => void;
}): JSX.Element {
  const reduced = useReducedMotion();
  return (
    <Dialog open onOpenChange={value => { if (!value) onClose(); }}>
      <AnimatePresence>
        {<DialogContent key="menu" placement="fullscreen" showCloseButton={false} className={styles.drawer}
          onCloseAutoFocus={event => {
            event.preventDefault();
            onRestoreFocus();
          }}>
          {/* The drawer answers the visitor's tap: a short slide from its own edge, exit shorter than entry. */}
          <m.div initial={reduced ? false : { opacity: .6, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }} className={styles.drawerInner}>
            <div className={styles.drawerTop}><DialogTitle className={styles.drawerTitle}>Site menüsü</DialogTitle><DialogClose asChild><button type="button" className={styles.iconButton} aria-label="Menüyü kapat"><X size={22} aria-hidden="true" /></button></DialogClose></div>
            <DialogDescription className="sr-only">Ana sayfanın bölümlerine gidin ya da hesabınızı açın.</DialogDescription>
            <nav aria-label="Mobil navigasyon" className={styles.mobileNav}>
              {siteSections.map(link => <DialogClose key={link.id} asChild><Link prefetch={false} href={link.href} aria-current={current === link.id ? "true" : undefined} onClick={() => onSection(link.id)}>{link.label}</Link></DialogClose>)}
            </nav>
            <div className={styles.drawerAccount}>
              <DialogClose asChild><Link href="/hesabim" prefetch={false}><UserRound size={20} aria-hidden="true" />Hesabım</Link></DialogClose>
              <DialogClose asChild><Link href="/siparis-takip" prefetch={false}>Sipariş takibi</Link></DialogClose>
            </div>
          </m.div>
        </DialogContent>}
      </AnimatePresence>
    </Dialog>
  );
}

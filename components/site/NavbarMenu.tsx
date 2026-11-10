"use client";

import { useRef, type JSX } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BrandLogo } from "./BrandLogo";
import styles from "./Navbar.module.css";

/** Existing Radix dialog keeps focus, Escape and restored opener behavior. */
export function NavbarMenu({ links, activeHref, onClose, onRestoreFocus }: {
  links: readonly { label: string; href: string }[]; activeHref?: string; onClose: () => void; onRestoreFocus: () => void;
}): JSX.Element {
  const firstLink = useRef<HTMLAnchorElement>(null);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent placement="fullscreen" className={styles.menu} showCloseButton={false}
      onOpenAutoFocus={event => { event.preventDefault(); firstLink.current?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <DialogHeader className="sr-only">
        <DialogTitle>Site menüsü</DialogTitle>
        <DialogDescription>Ana sayfa, hakkımızda, ürünler, toptan satış, bayilik, blog ve iletişim.</DialogDescription>
      </DialogHeader>
      <div className={styles.menuToolbar}>
        <DialogClose asChild><Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.menuHome}>
          <BrandLogo tone="light" className={styles.menuLogo} />
        </Link></DialogClose>
        <DialogClose asChild><Button variant="ghost" size="icon" className={styles.menuClose} aria-label="Kapat"><X aria-hidden="true" /></Button></DialogClose>
      </div>
      <div className={styles.menuBody}>
        <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
          {links.map((link, index) => <div key={link.href}>
            <DialogClose asChild><Link ref={index === 0 ? firstLink : undefined} href={link.href} className={styles.menuLink}
              aria-current={activeHref === link.href ? "page" : undefined}>{link.label}<ArrowUpRight aria-hidden="true" /></Link></DialogClose>
            {link.href === "/urunler" && <details className={styles.mobileCategories}>
              <summary>Ürün kategorileri</summary>
              {[["Zeytinyağı", "zeytinyagi"], ["Zeytin", "zeytin"], ["Siyah Zeytin", "siyah-zeytin"], ["Yeşil Zeytin", "yesil-zeytin"], ["Kırma Zeytin", "kirma-zeytin"]].map(([label, slug]) => <DialogClose key={slug} asChild><Link href={`/urunler/${slug}`} className={styles.menuLink}>{label}</Link></DialogClose>)}
            </details>}
          </div>)}
        </nav>
        <div className={styles.menuActions}>
          <DialogClose asChild><Link href="/urunler" className={styles.menuShop}>Online Mağaza</Link></DialogClose>
          <DialogClose asChild><Link href="/hesabim" className={styles.menuLink}>Hesabım</Link></DialogClose>
          <DialogClose asChild><Link href="/sepet" className={styles.menuLink}>Sepetim</Link></DialogClose>
        </div>
        <p className={styles.menuTagline}>Kökü toprakta. Yeri sofrada.</p>
      </div>
    </DialogContent>
  </Dialog>;
}

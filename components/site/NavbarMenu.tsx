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
        <DialogDescription>Ana sayfa, hakkımızda, üretim tesisimiz, ürünler, toptan satış, bayilik ve iletişim.</DialogDescription>
      </DialogHeader>
      <div className={styles.menuToolbar}>
        <DialogClose asChild><Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.menuHome}>
          <BrandLogo tone="dark" className={styles.menuLogo} />
        </Link></DialogClose>
        <DialogClose asChild><Button variant="ghost" size="icon" className={styles.menuClose} aria-label="Kapat"><X aria-hidden="true" /></Button></DialogClose>
      </div>
      <div className={styles.menuBody}>
        <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
          {links.map((link, index) => <DialogClose key={link.href} asChild>
            <Link ref={index === 0 ? firstLink : undefined} href={link.href} className={styles.menuLink}
              aria-current={activeHref === link.href ? "page" : undefined}>{link.label}<ArrowUpRight aria-hidden="true" /></Link>
          </DialogClose>)}
        </nav>
        <div className={styles.menuActions}>
          <DialogClose asChild><Link href="/?magaza=ac#urunler" className={styles.menuShop} onClick={event => {
            if (location.pathname === "/" && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
              event.preventDefault(); onClose();
              // Open after the menu unmounts so its focus restoration cannot steal focus.
              window.setTimeout(() => window.dispatchEvent(new Event("afina:open-shop")), 0);
            }
          }}>Online Mağaza</Link></DialogClose>
          <DialogClose asChild><Link href="/hesabim" className={styles.menuLink}>Hesabım</Link></DialogClose>
          <DialogClose asChild><Link href="/sepet" className={styles.menuLink}>Sepetim</Link></DialogClose>
        </div>
        <p className={styles.menuTagline}>Kökü toprakta. Yeri sofrada.</p>
      </div>
    </DialogContent>
  </Dialog>;
}

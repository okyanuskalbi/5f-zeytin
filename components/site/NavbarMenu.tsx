"use client";

import { useRef, type JSX } from "react";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import styles from "./Navbar.module.css";

export function NavbarMenu({ links, onClose, onRestoreFocus }: {
  links: readonly { label: string; href: string }[]; onClose: () => void; onRestoreFocus: () => void;
}): JSX.Element {
  const firstLink = useRef<HTMLAnchorElement>(null);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent placement="fullscreen" className={styles.menu}
      onOpenAutoFocus={event => { event.preventDefault(); firstLink.current?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <DialogHeader className="sr-only">
        <DialogTitle>Site menüsü</DialogTitle>
        <DialogDescription>Ürünler, tesisimiz, toptan satış ve sık sorulan sorular.</DialogDescription>
      </DialogHeader>
      <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
        {links.map((link, index) => <DialogClose key={link.href} asChild>
          <Link ref={index === 0 ? firstLink : undefined} href={link.href} className={styles.link}>{link.label}</Link>
        </DialogClose>)}
        <DialogClose asChild><Link href="/hesabim" className={styles.link}>Hesabım</Link></DialogClose>
        <DialogClose asChild><Link href="/sepet" className={styles.link}>Sepetim</Link></DialogClose>
      </nav>
      <p>Kökü toprakta. Yeri sofrada.</p>
    </DialogContent>
  </Dialog>;
}

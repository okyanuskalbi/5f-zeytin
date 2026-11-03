"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, Package, ShoppingCart, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BrandLogo } from "./BrandLogo";
import styles from "./Navbar.module.css";

const phoneQuery = "(max-width: 767px), (max-width: 900px) and (max-height: 500px) and (orientation: landscape)";
function subscribePhone(notify: () => void): () => void {
  const media = window.matchMedia(phoneQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
const isPhone = () => window.matchMedia(phoneQuery).matches;

// 21st 31360 Drawer + 8343 Bottom Nav Bar: a scroll body and four clear
// destinations, adapted to our Radix focus contract without a persistent dock.
// Provenance: docs/referans/mobile-174-source.json. No upstream runtime added.
export function NavbarMenu({ links, onClose, onRestoreFocus }: {
  links: readonly { label: string; href: string }[]; onClose: () => void; onRestoreFocus: () => void;
}): JSX.Element {
  const firstLink = useRef<HTMLAnchorElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const previousPhone = useRef(phone);
  const focusedDestination = useRef<string | null>("/");
  const home = links.find(link => link.href === "/");
  const shopping = [
    ...links.filter(link => link.href === "/#urunler").map(link => ({ ...link, Icon: Package })),
    ...links.filter(link => link.href === "/#toptan-iletisim").map(link => ({ ...link, Icon: MessageSquare })),
    { label: "Hesabım", href: "/hesabim", Icon: UserRound },
    { label: "Sepetim", href: "/sepet", Icon: ShoppingCart },
  ];
  const corporate = links.filter(link => link !== home && !shopping.some(item => item.href === link.href));

  useLayoutEffect(() => {
    if (previousPhone.current === phone) return;
    previousPhone.current = phone;
    // Rotation replaces the responsive layout, but keeps the visitor's focus
    // on the same destination (or close control), never behind the modal.
    if (focusedDestination.current === null) closeButton.current?.focus();
    else {
      const matching = [...(panel.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])]
        .find(link => link.getAttribute("href") === focusedDestination.current);
      (matching ?? firstLink.current)?.focus();
    }
  }, [phone]);

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent ref={panel} placement="fullscreen" className={styles.menu} showCloseButton={false}
      data-mobile-menu={phone}
      onFocusCapture={event => {
        const link = event.target.closest<HTMLAnchorElement>("a[href]");
        if (link) focusedDestination.current = link.getAttribute("href");
        else if (closeButton.current?.contains(event.target)) focusedDestination.current = null;
      }}
      onOpenAutoFocus={event => { event.preventDefault(); firstLink.current?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <DialogHeader className="sr-only">
        <DialogTitle>Site menüsü</DialogTitle>
        <DialogDescription>Kurumsal, üretim tesisimiz, ürünlerimiz, toptan satış ve iletişim.</DialogDescription>
      </DialogHeader>
      <div className={styles.menuToolbar}>
        {phone && home && <DialogClose asChild>
          <Link ref={firstLink} href={home.href} aria-label={home.label} className={styles.menuHome}>
            <BrandLogo tone="dark" className={styles.menuLogo} /><span>{home.label}</span>
          </Link>
        </DialogClose>}
        <DialogClose asChild><Button ref={closeButton} variant="ghost" size="icon" className={styles.menuClose} aria-label="Kapat"><X aria-hidden="true" /></Button></DialogClose>
      </div>
      {phone ? <div className={styles.menuBody}>
        <nav aria-label="Site navigasyonu" className={styles.phoneLinks}>
          <div role="group" aria-label="Hızlı erişim" className={styles.quickLinks}>
            {shopping.map(({ label, href, Icon }) => <DialogClose key={href} asChild>
              <Link href={href} className={styles.quickLink}><Icon strokeWidth={1.65} aria-hidden="true" /><span>{label}</span></Link>
            </DialogClose>)}
          </div>
          <div className={styles.corporateLinks}>
            {corporate.map(link => <DialogClose key={link.href} asChild>
              <Link href={link.href} className={styles.corporateLink}><span>{link.label}</span><ArrowUpRight aria-hidden="true" /></Link>
            </DialogClose>)}
          </div>
        </nav>
        <p className={styles.menuTagline}>Kökü toprakta. Yeri sofrada.</p>
      </div> : <>
      <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
        {links.map((link, index) => <DialogClose key={link.href} asChild>
          <Link ref={index === 0 ? firstLink : undefined} href={link.href} className={styles.link}>{link.label}</Link>
        </DialogClose>)}
        <DialogClose asChild><Link href="/hesabim" className={styles.link}>Hesabım</Link></DialogClose>
        <DialogClose asChild><Link href="/sepet" className={styles.link}>Sepetim</Link></DialogClose>
      </nav>
      <p>Kökü toprakta. Yeri sofrada.</p>
      </>}
    </DialogContent>
  </Dialog>;
}

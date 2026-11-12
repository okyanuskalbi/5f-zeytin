"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useMembershipDialog } from "@/components/account/MembershipDialogProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import styles from "./Navigation.module.css";

const StoreMenu = dynamic(() => import("./StoreMenu").then(module => module.StoreMenu));

const links = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Toptan Satış", href: "/toptan-satis" },
  { label: "Bayilik", href: "/bayilik" },
  { label: "Blog", href: "/blog" },
] as const;

/** Shop bar after 21st.dev Shop Navigation Menu (#18131): flat destinations, account and a cart pill; Radix owns drawer focus. */
export function StoreHeader(): JSX.Element {
  const pathname = usePathname();
  const cart = useCart();
  const openMembership = useMembershipDialog();
  const count = cart?.state.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const home = useRef<HTMLAnchorElement>(null);
  const active = (href: string) => pathname === href || (href === "/urunler" && (pathname?.startsWith("/urunler/") || pathname?.startsWith("/urun/")));

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open]);

  return <header data-site-navbar="" data-tone="solid" className={styles.header}>
    <div className={styles.headerInner}>
      <Link prefetch={false} ref={home} href="/" aria-label="Afina Zeytin ana sayfa" className={styles.logoLink}><BrandLogo tone="light" className={styles.logo} /></Link>
      <nav aria-label="Ana navigasyon" className={styles.desktopNav}>
        {links.map(link => <Link prefetch={false} key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined}>{link.label}</Link>)}
      </nav>
      <div className={styles.actions}>
        <Link href="/hesabim" prefetch={false} aria-label="Hesabım" className={`${styles.iconButton} ${styles.account}`} onClick={event => {
          if (openMembership && pathname !== "/giris" && pathname !== "/kayit" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            event.preventDefault(); openMembership(event.currentTarget);
          }
        }}><UserRound size={22} strokeWidth={1.6} aria-hidden="true" /></Link>
        <button type="button" data-cart-pill="" className={styles.cartPill} aria-label={`Sepetim, ${count} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
          disabled={!cart?.state.hydrated || cart.products === null} onClick={event => cart?.openCart(event.currentTarget)}>
          <ShoppingCart size={20} strokeWidth={1.7} aria-hidden="true" />
          {count > 0 && <span aria-hidden="true" data-cart-count="" className={styles.badge}>{count > 99 ? "99+" : count}</span>}
        </button>
        <button ref={trigger} type="button" className={`${styles.iconButton} ${styles.menuTrigger}`} aria-label="Menüyü aç" aria-haspopup="dialog" aria-expanded={open}
          onClick={() => setOpen(true)}>
          <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
        </button>
      </div>
    </div>
    {open && <StoreMenu links={links} pathname={pathname} onClose={() => setOpen(false)}
      onRestoreFocus={() => (window.matchMedia("(min-width: 1100px)").matches ? home : trigger).current?.focus()} />}
  </header>;
}

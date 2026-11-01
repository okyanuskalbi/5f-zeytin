"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import * as motion from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs, motionTokens } from "@/lib/ui-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { useMembershipDialog } from "@/components/account/MembershipDialogProvider";
import { BrandLogo } from "./BrandLogo";
import styles from "./Navbar.module.css";

let navbarMenuPromise: Promise<typeof import("./NavbarMenu")["NavbarMenu"]> | undefined;
const NavbarMenu = dynamic(() => navbarMenuPromise ??= import("./NavbarMenu").then(module => module.NavbarMenu));

function preloadNavbarMenu(): void {
  if (navbarMenuPromise) return;
  navbarMenuPromise = import("./NavbarMenu").then(module => module.NavbarMenu);
  // An optional preload failure must still allow the normal menu load to retry.
  void navbarMenuPromise.catch(() => { navbarMenuPromise = undefined; });
}

const links = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Kurumsal", href: "/#kurumsal" },
  { label: "Üretim Tesisimiz", href: "/#tesisimiz" },
  { label: "Ürünlerimiz", href: "/#urunler" },
  { label: "Toptan Satış", href: "/#toptan-iletisim" },
  { label: "İletişim", href: "/#iletisim" },
];

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const landing = pathname === "/";
  const cart = useCart();
  const openMembership = useMembershipDialog();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    let idle: number | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const schedule = (): void => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(preloadNavbarMenu);
      else fallback = setTimeout(preloadNavbarMenu, 2000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia("(min-width: 1281px)");
    const closeOnDesktop = (): void => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    // Preserve Radix focus management while also hiding background live regions.
    const background = [...document.querySelectorAll<HTMLElement>("#ana-icerik, footer")];
    const previous = background.map(node => ({ node, inert: node.inert, hidden: node.getAttribute("aria-hidden") }));
    background.forEach(node => { node.inert = true; node.setAttribute("aria-hidden", "true"); });
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      previous.forEach(({ node, inert, hidden }) => {
        node.inert = inert;
        if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      });
    };
  }, [isOpen]);

  return (
    <header data-site-navbar="" data-tone={landing ? "paper" : "solid"}
      data-over-hero={landing} className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={() => { if (landing) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <BrandLogo tone={landing ? "light" : "dark"} className={styles.logo} />
        </Link>
        <nav aria-label="Ana navigasyon" className={styles.desktop}>
          {links.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}
        </nav>
        <div className={styles.actions}>
          <Link href="/#urunler" className={styles.shop}>Online Mağaza</Link>
          <Button variant="ghost" className={`${styles.control} ${styles.cart}`}
            aria-label={`Sepetim, ${itemCount} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
            disabled={!cart?.state.hydrated || cart.products === null}
            onClick={event => cart?.openCart(event.currentTarget)}>
            Sepet (<AnimatePresence initial={false} mode="wait">
              <motion.span key={itemCount} data-slot="count-badge" aria-hidden="true"
                className={styles.badge}
                initial={reduced ? false : { y: -motionTokens.distance.xs }} animate={{ y: 0 }}
                exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : springs.badge}>
                {itemCount > 99 ? "99+" : itemCount}
              </motion.span>
            </AnimatePresence>)
          </Button>
          <Button asChild variant="ghost" className={`${styles.control} ${styles.account}`}>
            <Link href="/hesabim" onClick={event => { if(openMembership && pathname !== "/giris" && pathname !== "/kayit" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){event.preventDefault();openMembership(event.currentTarget);} }}>Hesabım</Link>
          </Button>
          <Button ref={triggerRef} variant="ghost" className={`${styles.control} ${styles.trigger}`} aria-label="Menüyü aç"
            onPointerEnter={preloadNavbarMenu} onFocus={preloadNavbarMenu} onTouchStart={preloadNavbarMenu}
            aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>Menü</Button>
          {isOpen && <NavbarMenu links={links} onClose={() => setIsOpen(false)}
            onRestoreFocus={() => (window.matchMedia("(min-width: 1281px)").matches ? homeRef : triggerRef).current?.focus()} />}

        </div>
      </div>
    </header>
  );
}

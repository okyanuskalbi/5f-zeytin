"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UserRound } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs, motionTokens } from "@/lib/ui-motion";
import { hasSiteContact, siteContact } from "@/lib/site/contact";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import styles from "./Navbar.module.css";

const links = [
  { label: "Ürünler", href: "/#urunler" },
  { label: "Tesisimiz", href: "/#tesisimiz" },
];

export function Navbar(): JSX.Element {
  const navigation = hasSiteContact(siteContact) ? [...links, { label: "Toptan", href: "/#toptan-iletisim" }] : links;
  const landing = usePathname() === "/";
  const cart = useCart();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const [light, setLight] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const onPantry = landing && light;
  const onLight = !landing;

  useMotionValueEvent(scrollY, "change", (value) => {
    if (landing) setLight(value > 0);
  });

  useEffect(() => {
    if (!landing) return;

    const syncSurface = (): void => { setLight(window.scrollY > 0); };
    syncSurface();
    window.addEventListener("pageshow", syncSurface);
    return () => { window.removeEventListener("pageshow", syncSurface); };
  }, [landing]);

  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
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
    <header data-site-navbar="" data-tone={onLight ? "light" : onPantry ? "pantry" : "hero"}
      data-over-hero={landing} className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={() => { if (landing) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <span className={styles.logoFrame}><Image src={onLight ? "/brand/afina-zeytin.svg" : "/brand/afina-zeytin-dark.svg"}
            alt="AFİNA ZEYTİN" width={96} height={111} sizes="96px" unoptimized className={styles.logo} /></span>
          <span aria-hidden="true" className={styles.wordmark}>ZEYTİN</span>
        </Link>
        <nav aria-label="Ana navigasyon" className={styles.desktop}>
          {navigation.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}
        </nav>
        <div className={styles.actions}>
          <Button asChild variant="ghost" size="icon" className={`${styles.control} ${styles.account}`}>
            <Link href="/hesabim" aria-label="Hesabım"><UserRound aria-hidden="true" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className={styles.control}
            aria-label={`Sepetim, ${itemCount} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
            disabled={!cart?.state.hydrated || cart.products === null}
            onClick={event => cart?.openCart(event.currentTarget)}>
            <ShoppingBag aria-hidden="true" />
            <AnimatePresence initial={false} mode="wait">
              {itemCount > 0 && <motion.span key={itemCount} data-slot="count-badge" aria-hidden="true"
                className={styles.badge}
                initial={reduced ? false : { y: -motionTokens.distance.xs }} animate={{ y: 0 }}
                exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : springs.badge}>
                {itemCount > 99 ? "99+" : itemCount}
              </motion.span>}
            </AnimatePresence>
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className={`${styles.control} ${styles.trigger}`} aria-label="Menüyü aç">Menü</Button>
            </DialogTrigger>
            <DialogContent placement="fullscreen" className={styles.menu}
              onOpenAutoFocus={event => { event.preventDefault(); firstLinkRef.current?.focus(); }}
              onCloseAutoFocus={event => {
                if (window.matchMedia("(min-width: 1024px)").matches) { event.preventDefault(); homeRef.current?.focus(); }
              }}>
              <DialogHeader className="sr-only">
                <DialogTitle>Site menüsü</DialogTitle>
                <DialogDescription>Ürünler ve tesisimiz hakkında bağlantılar.</DialogDescription>
              </DialogHeader>
              <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
                {navigation.map((link, index) => <DialogClose key={link.href} asChild>
                  <Link ref={index === 0 ? firstLinkRef : undefined} href={link.href} className={styles.link}>{link.label}</Link>
                </DialogClose>)}
                <DialogClose asChild><Link href="/hesabim" className={styles.link}>Hesabım</Link></DialogClose>
                <DialogClose asChild><Link href="/sepet" className={styles.link}>Sepetim</Link></DialogClose>
              </nav>
              <p>Kökü toprakta. Yeri sofrada.</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UserRound } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { springs, motionTokens } from "@/lib/ui-motion";
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
  { label: "Toptan", href: "/#toptan-iletisim" },
];

export function Navbar(): JSX.Element {
  const landing = usePathname() === "/";
  const cart = useCart();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const [light, setLight] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const boundary = useRef(0);
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const onLight = !landing || light;

  useMotionValueEvent(scrollY, "change", (value) => {
    if (landing) setLight(value >= boundary.current);
  });

  useEffect(() => {
    if (!landing) return;
    const marker = document.querySelector<HTMLElement>("[data-nav-light]");
    const hero = document.querySelector<HTMLElement>("[data-hero-intro]");
    function measure(): void {
      boundary.current = marker ? marker.getBoundingClientRect().top + window.scrollY - (headerRef.current?.offsetHeight ?? 64) : 0;
      setLight(window.scrollY >= boundary.current);
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (hero) observer.observe(hero);
    if (headerRef.current) observer.observe(headerRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("pageshow", measure); };
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
    <header ref={headerRef} data-site-navbar="" data-tone={onLight ? "light" : "dark"}
      data-over-hero={landing} className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={() => { if (landing) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <Image src={onLight ? "/brand/afina-zeytin.svg" : "/brand/afina-zeytin-dark.svg"}
            alt="AFİNA ZEYTİN" width={80} height={56} sizes="80px" unoptimized className={styles.logo} />
        </Link>
        <nav aria-label="Ana navigasyon" className={styles.desktop}>
          {links.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}
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
                <DialogDescription>Ürünler, tesisimiz ve toptan satış bağlantıları.</DialogDescription>
              </DialogHeader>
              <nav aria-label="Site navigasyonu" className={styles.menuLinks}>
                {links.map((link, index) => <DialogClose key={link.href} asChild>
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

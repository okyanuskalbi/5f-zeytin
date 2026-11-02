"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
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
import { LiquidNavbar, NimbusIcons } from "@/components/ui/liquid-glass-navbar";
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

function subscribeLocation(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener("hashchange", notify); };
}
const publicPathname = () => window.location.pathname;

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const locationListener = useRef<(() => void) | null>(null);
  const subscribe = useCallback((notify: () => void) => {
    locationListener.current = notify;
    const unsubscribe = subscribeLocation(notify);
    return () => { locationListener.current = null; unsubscribe(); };
  }, []);
  // The public URL wins after hydration: a rewritten internal route must not
  // disable the home highlight. The server snapshot preserves hydration parity.
  const visiblePathname = useSyncExternalStore(subscribe, publicPathname, () => pathname);
  // Next commits pushState after render without emitting popstate. Recheck the
  // address after that commit even when the pre-commit snapshot was unchanged.
  useEffect(() => { locationListener.current?.(); }, [pathname]);
  const landing = !visiblePathname || visiblePathname === "/";
  const cart = useCart();
  const openMembership = useMembershipDialog();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (!landing) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector<HTMLElement>("[data-site-navbar]");
      const readingLine = (header?.getBoundingClientRect().bottom ?? 0) + 32;
      const points = links.flatMap((link, index) => {
        const id = link.href.split("#")[1];
        const element = id ? document.getElementById(id) : null;
        return element ? [{ index, top: element.getBoundingClientRect().top }] : [];
      }).filter(point => point.top <= readingLine).sort((a, b) => a.top - b.top || a.index - b.index);
      const latest = points.at(-1);
      // Kurumsal and Tesisimiz intentionally share a cinematic marker. Keep a
      // visitor's explicit choice while both still identify the visible scene.
      const requested = links.findIndex(link => link.href === `/${window.location.hash}`);
      const sameScene = latest && points.find(point => point.index === requested && Math.abs(point.top - latest.top) < 2);
      setActiveSection(sameScene?.index ?? latest?.index ?? 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("popstate", schedule);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : undefined;
    observer?.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule); window.removeEventListener("popstate", schedule);
    };
  }, [landing, pathname]);

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
    const desktop = window.matchMedia("(min-width: 1361px)");
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
    <header data-site-navbar="" data-21st-source="43059" data-tone={landing ? "glass" : "solid"}
      data-over-hero={landing} className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={event => { if (landing && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <BrandLogo tone="dark" className={styles.logo} />
        </Link>
        <LiquidNavbar ariaLabel="Ana navigasyon" className={styles.desktop} tone="dark" sound={false}
          active={landing ? activeSection : -1} onChange={index => setActiveSection(index)} items={links.map((link, index) => ({
            ...link, icon: index === 0 ? NimbusIcons.home : index === 2 ? NimbusIcons.globe : index === 3 ? NimbusIcons.drop : undefined,
            fx: index === 3 ? "drop" : index === 0 ? "glow" : "pop",
          }))} />
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
            onRestoreFocus={() => (window.matchMedia("(min-width: 1361px)").matches ? homeRef : triggerRef).current?.focus()} />}

        </div>
      </div>
    </header>
  );
}

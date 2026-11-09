"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, UserRound } from "lucide-react";
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
  { label: "Hakkımızda", href: "/#hakkimizda" },
  { label: "Üretim Tesisimiz", href: "/#tesisimiz" },
  { label: "Ürünler", href: "/#urunler" },
  { label: "Toptan Satış", href: "/#toptan" },
  { label: "Bayilik", href: "/bayilik" },
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
  // Vercel prerenders the root artifact with pathname /index; the browser
  // hydrates it at /. Normalize that known root alias before hydration so its
  // attributes match: React does not repair mismatched attributes on mount.
  // Subsequent navigation still follows the public URL, including interior pages.
  const prerenderPathname = pathname === "/index" ? "/" : pathname;
  const visiblePathname = useSyncExternalStore(subscribe, publicPathname, () => prerenderPathname);
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
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (!landing) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector<HTMLElement>("[data-site-navbar]");
      const readingLine = (header?.getBoundingClientRect().bottom ?? 0) + 32;
      const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      // The last section can be too short to reach the reading line before the
      // document ends. Still identify it when the user reaches the page bottom.
      if (scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= scrollHeight - 2
        && document.getElementById("iletisim")) {
        setActiveSection(links.findIndex(link => link.href === "/#iletisim"));
        return;
      }
      const points = links.flatMap((link, index) => {
        const id = link.href.split("#")[1];
        const element = id ? document.getElementById(id) : null;
        return element ? [{ index, top: element.getBoundingClientRect().top }] : [];
      }).filter(point => point.top <= readingLine).sort((a, b) => a.top - b.top || a.index - b.index);
      const latest = points.at(-1);
      // Preserve an explicitly selected destination when anchors share a line.
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
    <header data-site-navbar="" data-tone="solid"
      data-over-hero="false" className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={event => { if (landing && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <BrandLogo tone="dark" className={styles.logo} />
        </Link>
        <nav aria-label="Ana navigasyon" className={styles.desktop}>
          {links.map((link, index) => <Link key={link.href} href={link.href} className={styles.link}
            aria-current={landing ? index === activeSection ? "location" : undefined : visiblePathname === link.href ? "page" : undefined}
            onClick={event => {
              if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) setActiveSection(index);
            }}>{link.label}</Link>)}
        </nav>
        <div className={styles.actions}>
          <Link href="/?magaza=ac#urunler" className={styles.shop} onClick={event => {
            if (landing && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
              event.preventDefault(); window.dispatchEvent(new Event("afina:open-shop"));
            }
          }}>Online Mağaza</Link>
          <Button variant="ghost" size="icon" className={`${styles.control} ${styles.cart}`}
            aria-label={`Sepetim, ${itemCount} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
            disabled={!cart?.state.hydrated || cart.products === null}
            onClick={event => cart?.openCart(event.currentTarget)}>
            <ShoppingCart className={styles.cartIcon} strokeWidth={1.75} aria-hidden="true" />
            {itemCount > 0 && <span data-slot="count-badge" aria-hidden="true" className={styles.badge}>
              {itemCount > 99 ? "99+" : itemCount}
            </span>}
          </Button>
          <Button asChild variant="ghost" className={`${styles.control} ${styles.account}`}>
            <Link href="/hesabim" onClick={event => { if(openMembership && pathname !== "/giris" && pathname !== "/kayit" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){event.preventDefault();openMembership(event.currentTarget);} }} aria-label="Hesabım"><UserRound className={styles.accountIcon} strokeWidth={1.75} aria-hidden="true" /></Link>
          </Button>
          <Button ref={triggerRef} variant="ghost" className={`${styles.control} ${styles.trigger}`} aria-label="Menüyü aç"
            onPointerEnter={preloadNavbarMenu} onFocus={preloadNavbarMenu} onTouchStart={preloadNavbarMenu}
            aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
            <Menu className={styles.menuIcon} strokeWidth={1.75} aria-hidden="true" /><span className={styles.menuLabel}>Menü</span>
          </Button>
          {isOpen && <NavbarMenu links={links} onClose={() => setIsOpen(false)}
            onRestoreFocus={() => (window.matchMedia("(min-width: 1361px)").matches ? homeRef : triggerRef).current?.focus()} />}

        </div>
      </div>
    </header>
  );
}

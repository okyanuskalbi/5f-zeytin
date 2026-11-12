"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useMembershipDialog } from "@/components/account/MembershipDialogProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { sectionForPath, siteSections, type SiteSectionId } from "./site-sections";
import styles from "./Navigation.module.css";

const StoreMenu = dynamic(() => import("./StoreMenu").then(module => module.StoreMenu));

/** Shop bar after 21st.dev Shop Navigation Menu (#18131): flat destinations, account and a cart pill; Radix owns drawer focus. */
export function StoreHeader(): JSX.Element {
  const pathname = usePathname();
  const cart = useCart();
  const openMembership = useMembershipDialog();
  const count = cart?.state.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const home = useRef<HTMLAnchorElement>(null);
  const pendingSection = useRef<string | null>(null);
  const [visibleSection, setVisibleSection] = useState<SiteSectionId | null>(null);
  const onHome = pathname === "/";
  const current = onHome ? visibleSection : sectionForPath(pathname);

  // Which section crosses the reading line decides the marked link: a class change, never an animation.
  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = siteSections.find(item => item.id === entry.target.id);
        setVisibleSection(section?.id ?? null);
      }
    }, { rootMargin: "-45% 0px -55% 0px" });
    document.querySelectorAll("[data-landing-section]").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome]);

  // Next keeps the first address of a visit, fragment included, and can append a second fragment when a link
  // returns to that page ("/#urunler#urunler"). Keep the last fragment so the address stays shareable.
  useEffect(() => {
    const normalize = () => {
      const { hash, pathname: path, search } = window.location;
      const last = hash.lastIndexOf("#");
      if (last > 0) window.history.replaceState(window.history.state, "", `${path}${search}${hash.slice(last)}`);
    };
    let frame = 0;
    const afterNavigation = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { frame = requestAnimationFrame(normalize); }); };
    normalize();
    window.addEventListener("hashchange", normalize);
    document.addEventListener("click", afterNavigation);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", normalize); document.removeEventListener("click", afterNavigation); };
  }, [pathname]);

  // The drawer locks page scroll while open: go to the chosen section once it has closed.
  useEffect(() => {
    if (open || !pendingSection.current) return;
    const id = pendingSection.current;
    pendingSection.current = null;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()));
    return () => cancelAnimationFrame(frame);
  }, [open]);

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
        {siteSections.map(link => <Link prefetch={false} key={link.id} href={link.href} aria-current={current === link.id ? "true" : undefined}>{link.label}</Link>)}
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
    {open && <StoreMenu current={current} onClose={() => setOpen(false)} onSection={id => { if (onHome) pendingSection.current = id; }}
      onRestoreFocus={() => (window.matchMedia("(min-width: 1100px)").matches ? home : trigger).current?.focus()} />}
  </header>;
}

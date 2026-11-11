"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type JSX } from "react";
import { animate, m, useMotionValue } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens } from "@/lib/ui-motion";
import { productGroups } from "@/lib/catalog/groups";
import { V3Picture } from "@/components/media/V3Picture";
import photos from "@/lib/media/classic-photos.json";
import styles from "./CategoryNavigation.module.css";

export function CategoryNavigation(): JSX.Element {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const navigation = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const baseWidth = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleX = useMotionValue(1);

  useEffect(() => {
    let mounted = true;
    let controls: ReturnType<typeof animate>[] = [];
    let lastGeometry = "";
    const measure = (move: boolean) => {
      const row = list.current;
      const marker = indicator.current;
      const active = row?.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
      if (!row || !marker || !active) return;
      const bounds = row.getBoundingClientRect();
      const target = active.getBoundingClientRect();
      if (!target.width) return;
      const left = target.left - bounds.left + row.scrollLeft;
      const geometry = `${left}:${target.width}:${target.top - bounds.top}:${target.height}`;
      // ResizeObserver and fonts.ready notify once when attached, too. Their
      // unchanged initial reading must not cancel a route-triggered slide.
      if (!move && geometry === lastGeometry) return;
      lastGeometry = geometry;
      const first = baseWidth.current === 0;
      if (first) {
        baseWidth.current = target.width;
        marker.style.width = `${target.width}px`;
      }
      const top = target.top - bounds.top + row.scrollTop;
      marker.style.top = "0px";
      marker.style.height = `${target.height}px`;
      controls.forEach(control => control.stop());
      if (first || reduced || !move) {
        x.set(left); y.set(top); scaleX.set(target.width / baseWidth.current);
      } else {
        const transition = { duration: motionTokens.storefront.category.duration, ease: "easeOut" as const };
        controls = [animate(x, left, transition), animate(y, top, transition), animate(scaleX, target.width / baseWidth.current, transition)];
      }
      navigation.current?.setAttribute("data-indicator-ready", "");
    };
    measure(true);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => measure(false)) : undefined;
    if (list.current) observer?.observe(list.current);
    list.current?.querySelectorAll("a").forEach(link => observer?.observe(link));
    void document.fonts?.ready.then(() => { if (mounted) measure(false); });
    return () => { mounted = false; observer?.disconnect(); controls.forEach(control => control.stop()); };
  }, [pathname, reduced, x, y, scaleX]);
  const links = [
    { href: "/urunler", name: "Tüm ürünler", photo: "zeytinlik" as const, parentId: null },
    ...productGroups.map(group => ({ href: `/urunler/${group.id}`, name: group.name, photo: group.photo, parentId: group.parentId })),
  ];
  return <nav ref={navigation} aria-label="Ürün grupları" className={styles.navigation}>
    <ul ref={list} className={styles.list}>
      <li aria-hidden="true" className={styles.indicatorLayer}><m.span ref={indicator} data-category-indicator="" className={styles.indicator} initial={false} style={{ x, y, scaleX }} /></li>
      {links.map(link => <li key={link.href} data-parent={link.parentId ?? undefined}>
        <Link prefetch={false} href={link.href} className={styles.link} aria-current={pathname === link.href ? "page" : undefined}>
          <V3Picture image={photos.assets[link.photo]} sizes="36px" decorative />
          <span>{link.name}</span>
        </Link>
      </li>)}
    </ul>
  </nav>;
}

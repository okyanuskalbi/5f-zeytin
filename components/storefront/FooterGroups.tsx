"use client";

import Link from "next/link";
import { useId, useState, type JSX } from "react";
import { useCartViewport as usePhoneViewport } from "@/components/cart/useCartViewport";
import styles from "./Navigation.module.css";

export type FooterGroup = Readonly<{ id: string; title: string; label: string; links: readonly Readonly<{ label: string; href: string }>[] }>;

/**
 * The footer's three link columns. Tablets and desktops get the plain columns the server sends.
 * A phone folds them (docs/tasks/209): each heading becomes a toggle and one group is open at a time;
 * every link stays one tap away. Folding is CSS, so nothing jumps when the page hydrates.
 */
export function FooterGroups({ groups }: { groups: readonly FooterGroup[] }): JSX.Element {
  const phone = usePhoneViewport();
  const [open, setOpen] = useState<string | null>(null);
  const prefix = useId();
  return <div className={styles.footerGroups} data-footer-links>
    {groups.map(group => {
      const expanded = phone && open === group.id;
      const panel = `${prefix}-${group.id}`;
      return <section key={group.id} data-open={expanded ? "" : undefined}>
        <h2>{phone
          ? <button type="button" aria-expanded={expanded} aria-controls={panel} onClick={() => setOpen(expanded ? null : group.id)}>{group.title}</button>
          : group.title}</h2>
        <nav id={panel} aria-label={group.label}>{group.links.map(link => <Link prefetch={false} key={link.href} href={link.href}>{link.label}</Link>)}</nav>
      </section>;
    })}
  </div>;
}

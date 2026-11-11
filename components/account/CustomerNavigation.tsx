"use client";

import Link from "next/link";
import {
  HouseIcon,
  PackageIcon,
  MapPinIcon,
  UserRoundIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import styles from "@/components/storefront/account/AccountSurface.module.css";

export const customerDestinations = [
  { href: "/hesabim", label: "Hesap özeti", icon: HouseIcon },
  { href: "/hesabim/siparisler", label: "Siparişlerim", icon: PackageIcon },
  { href: "/hesabim/adresler", label: "Adreslerim", icon: MapPinIcon },
  {
    href: "/hesabim/bilgilerim",
    label: "Hesap bilgilerim",
    icon: UserRoundIcon,
  },
  { href: "/hesabim/guvenlik", label: "Güvenlik", icon: ShieldCheckIcon },
] as const;

export function CustomerNavigation({
  active = "/hesabim",
}: {
  active?: string;
}) {
  return (
    <nav aria-label="Müşteri hesabı" className={styles.customerNav}>
      {customerDestinations.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-current={active === href ? "page" : undefined}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
      <Link href="/#urunler" className={styles.continueShopping}>
        <ArrowUpRightIcon size={18} aria-hidden="true" />
        <span>Alışverişe devam et</span>
      </Link>
    </nav>
  );
}

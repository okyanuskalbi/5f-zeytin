"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/site/BrandLogo";
import ui from "@/components/storefront/ui/ui.module.css";
import styles from "./AccountSurface.module.css";

/** 21st 2110: a single readable form surface; sign-in and register switch as two pills. AFİNA keeps real auth and labels;
 * no demo success, decorative 3D card, gradients or unconfigured social buttons. */
export function MembershipFrame({ children, mode, embedded = false, onModeChange }: {
  children: ReactNode;
  mode: "login" | "register";
  embedded?: boolean;
  onModeChange?: (mode: "login" | "register") => void;
}) {
  const content = <div className={styles.authFrame} data-membership-frame data-store-membership>
    <div className={styles.authFormPanel}>
      <div className={styles.compactBrand}><BrandLogo tone="light" loading="eager" /></div>
      <nav aria-label="Üyelik işlemleri" data-pill-switch="" className={`${ui.switch} ${styles.authTabs}`}>
        {([["login", "Giriş yap", "/giris"], ["register", "Hesap oluştur", "/kayit"]] as const).map(([value, label, href]) =>
          onModeChange
            ? <button type="button" key={value} aria-current={mode === value ? "page" : undefined} onClick={() => onModeChange(value)}>{label}</button>
            : <Link prefetch={false} key={value} href={href} aria-current={mode === value ? "page" : undefined}>{label}</Link>)}
      </nav>
      <div className={styles.authContent}>{children}</div>
      <p className={styles.privacyNotice}>Kişisel verilerinizin işlenme amaçları ve haklarınız hakkında <Link prefetch={false} href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</Link> üzerinden bilgi edinebilirsiniz.</p>
    </div>
  </div>;
  return embedded ? content : <main className={styles.authPage}>{content}</main>;
}

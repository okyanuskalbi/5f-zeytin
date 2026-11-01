"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/site/BrandLogo";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { MembershipCard } from "@/components/ui/membership-card";
import styles from "./CustomerPanel.module.css";

// 21st Split Sign In Form (39096), composed with the user's Bazgold reference:
// branded left panel, paper right panel and shared login/registration navigation.
export function MembershipFrame({
  children,
  mode,
  embedded = false,
  onModeChange,
}: {
  children: ReactNode;
  mode: "login" | "register";
  embedded?: boolean;
  onModeChange?: (mode: "login" | "register") => void;
}) {
  const [secureFocus, setSecureFocus] = useState(false);
  const content = (
    <div className={styles.authFrame} data-membership-frame
      onFocusCapture={(event) => setSecureFocus(event.target instanceof HTMLInputElement && event.target.name === "password")}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setSecureFocus(false);
      }}
    >
      <aside className={styles.brandPanel} aria-label="AFİNA ZEYTİN">
        <div className={styles.brandArt} aria-hidden="true">
          <V3Picture
            image={v3Image("hero-masaustu")}
            sizes="420px"
            decorative
          />
        </div>
        <MembershipCard secure={secureFocus} />
        <h2>{mode === "login" ? "Hoş geldiniz." : "Soframıza katılın."}</h2>
        <p>
          Siparişlerinizi takip edin,
          <br />
          adreslerinizi kaydedin.
        </p>
        <span className={styles.brandSignature}>
          Kökü toprakta. Yeri sofrada.
        </span>
      </aside>
      <div className={styles.authFormPanel}>
        <div className={styles.compactBrand}>
          <BrandLogo tone="light" loading="eager" />
        </div>
        <nav aria-label="Üyelik işlemleri" className={styles.authTabs}>
          {(
            [
              ["login", "Giriş yap", "/giris"],
              ["register", "Hesap oluştur", "/kayit"],
            ] as const
          ).map(([value, label, href]) =>
            onModeChange ? (
              <button
                type="button"
                key={value}
                aria-current={mode === value ? "page" : undefined}
                onClick={() => onModeChange(value)}
              >
                {label}
              </button>
            ) : (
              <Link
                key={value}
                href={href}
                aria-current={mode === value ? "page" : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className={styles.authContent}>{children}</div>
        <p className={styles.privacyNotice}>
          Kişisel verilerinizin işlenme amaçları ve haklarınız hakkında{" "}
          <Link href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</Link> üzerinden bilgi
          edinebilirsiniz.
        </p>
      </div>
    </div>
  );
  return embedded ? (
    content
  ) : (
    <main className={styles.authPage}>{content}</main>
  );
}

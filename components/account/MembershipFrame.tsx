"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/site/BrandLogo";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
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
  const content = (
    <div className={styles.authFrame}>
      <aside className={styles.brandPanel} aria-label="AFİNA ZEYTİN">
        <div className={styles.brandArt} aria-hidden="true">
          <V3Picture
            image={v3Image("hero-masaustu")}
            sizes="420px"
            decorative
          />
        </div>
        <BrandLogo className={styles.brandLogo} />
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
        <p className={styles.privacyNotice}>
          Kişisel verilerinizin işlenme amaçları ve haklarınız hakkında{" "}
          <Link href="/kvkk">KVKK Aydınlatma Metni</Link> üzerinden bilgi
          edinebilirsiniz.
        </p>
        {children}
      </div>
    </div>
  );
  return embedded ? (
    content
  ) : (
    <main className={styles.authPage}>{content}</main>
  );
}

export function GoogleAvailability() {
  return (
    <div className={styles.googleArea}>
      <button
        type="button"
        disabled
        className={styles.googleButton}
        aria-describedby="google-availability"
      >
        <Image src="/icons/google-g.png" width={20} height={20} alt="" />
        Google ile giriş yap
      </button>
      <p id="google-availability">
        Google ile giriş şu anda kullanılamıyor. E-posta ile devam
        edebilirsiniz.
      </p>
      <div className={styles.or}>
        <span>veya</span>
      </div>
    </div>
  );
}

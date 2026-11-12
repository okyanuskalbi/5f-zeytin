import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageBand } from "@/components/storefront/ui/PageBand";
import { PillButton } from "@/components/storefront/ui/PillButton";
import styles from "./Content.module.css";

const documents = [
  { href: "/kvkk", title: "KVKK" },
  { href: "/mesafeli-satis", title: "Mesafeli Satış Sözleşmesi" },
  { href: "/iade", title: "İade ve İptal" },
];

export function LegalDocument({ title, path, scope, children }: {
  title: string; path: string; scope: string; children: ReactNode;
}) {
  return <main className={styles.page}>
    <PageBreadcrumbJsonLd name={title} path={path} />
    <div className={styles.band}><PageBand title={title} /></div>
    <article className={styles.paper}>
      <nav className={styles.contents} aria-label="İçindekiler"><h2>İçindekiler</h2><ul><li><a href="#taslak-basligi">Metnin durumu</a></li><li><a href="#kapsam-basligi">Kapsam</a></li><li><a href="#seller-title">Satıcı bilgileri</a></li></ul></nav>
      <section aria-labelledby="taslak-basligi">
        <h2 id="taslak-basligi">Taslak, onay bekleniyor</h2>
        <p>Onaylı metin henüz eklenmedi.</p>
        <p>Tam şirket unvanı, adresi ve vergi bilgileri aşağıda yer alır. İletişim bilgileri ve yasal metin onayı bekleniyor.</p>
      </section>
      <section aria-labelledby="kapsam-basligi">
        <h2 id="kapsam-basligi">{scope}</h2>
        <p>{children}</p>
      </section>
      <section aria-labelledby="seller-title">
        <h2 id="seller-title">Satıcı bilgileri</h2>
        {/* Public fields from AFINA-KAYNAK/sirket/SIRKET.md; no tax-return data. */}
        <dl className={styles.seller}>
          <div><dt>Ticari unvan</dt><dd>AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ</dd></div>
          <div><dt>Adres</dt><dd>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</dd></div>
          <div><dt>Vergi dairesi</dt><dd>Düziçi</dd></div>
          <div><dt>Vergi kimlik numarası</dt><dd>0091520061</dd></div>
        </dl>
      </section>
      <nav aria-label="Hukuk sayfaları" className={styles.legalNav}>
        <ul>{documents.map(document => <li key={document.href}>
          <Link prefetch={false} href={document.href} aria-current={path === document.href ? "page" : undefined}>{document.title}</Link>
        </li>)}</ul>
      </nav>
      <PillButton variant="quiet" href="/">Ana sayfaya dön</PillButton>
    </article>
  </main>;
}

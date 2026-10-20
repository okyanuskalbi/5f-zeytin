import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./InnerPage.module.css";

const documents = [
  { href: "/kvkk", title: "KVKK" },
  { href: "/mesafeli-satis", title: "Mesafeli Satış Sözleşmesi" },
  { href: "/iade", title: "İade ve İptal" },
];

export function LegalDocument({ title, path, scope, children }: {
  title: string; path: string; scope: string; children: ReactNode;
}) {
  return <main className={styles.page}>
    <article className={`${styles.paper} ${styles.legal}`}>
      <h1>{title}</h1>
      <section aria-labelledby="taslak-basligi">
        <h2 id="taslak-basligi">Taslak — onay bekleniyor</h2>
        <p>Onaylı metin henüz eklenmedi.</p>
        <p>Tam şirket unvanı, adresi ve vergi bilgileri aşağıda yer alır. İletişim bilgileri ve yasal metin onayı bekleniyor.</p>
      </section>
      <section aria-labelledby="kapsam-basligi">
        <h2 id="kapsam-basligi" className={styles.scopeTitle}>{scope}</h2>
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
          <Link href={document.href} aria-current={path === document.href ? "page" : undefined} className={styles.textLink}>{document.title}</Link>
        </li>)}</ul>
      </nav>
      <Link href="/" className={styles.textLink}>Ana sayfaya dön</Link>
    </article>
  </main>;
}

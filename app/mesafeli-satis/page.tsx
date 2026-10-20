import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — Taslak | Afina Zeytin",
  description: "Mesafeli Satış Sözleşmesi: onaylı metin bekleniyor.",
  robots: { index: false, follow: false },
};

const legalLink = "inline-flex min-h-11 items-center rounded-sm py-2 underline underline-offset-4 hover:text-gold-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

// Content-card structure adapted from 21st Privacy Policy Collapsible Card (24952).
// Draft information stays visible; the example's legal copy is not used.
export default function Page(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold text-gold-ink">Yasal bilgiler</p>
        <h1>Mesafeli Satış Sözleşmesi</h1>
      </header>
      <div className="divide-y rounded-lg border bg-card text-card-foreground">
        <section aria-labelledby="taslak-basligi" className="space-y-4 p-6 sm:p-8">
          <h2 id="taslak-basligi">Taslak — onay bekleniyor</h2>
          <p>Onaylı metin henüz eklenmedi.</p>
          <p className="text-muted-foreground">
            Tam şirket unvanı, adresi ve iletişim bilgileri doğrulandıktan sonra eklenecek.
          </p>
        </section>
        <section aria-labelledby="kapsam-basligi" className="space-y-4 p-6 sm:p-8">
          <h2 id="kapsam-basligi" className="text-xl">Satıcı bilgileri ve satış koşulları</h2>
          <p className="text-muted-foreground">
            Onaylı satıcı bilgileri ve mesafeli satış sözleşmesi, kullanıcı onayı alındıktan sonra burada yer alacak.
          </p>
        </section>
      </div>
      <nav aria-label="Hukuk sayfaları" className="mt-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/kvkk" className={legalLink}>KVKK</Link>
          </li>
          <li>
            <Link href="/mesafeli-satis" aria-current="page" className={legalLink}>Mesafeli Satış Sözleşmesi</Link>
          </li>
          <li>
            <Link href="/iade" className={legalLink}>İade ve İptal</Link>
          </li>
        </ul>
      </nav>
      <Link href="/" className={`${legalLink} mt-6`}>Ana sayfaya dön</Link>
    </main>
  );
}

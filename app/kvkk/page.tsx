import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

export const metadata: Metadata = {
  title: "KVKK — Taslak | Afina Zeytin",
  description: "KVKK: onaylı metin bekleniyor.",
  robots: { index: false, follow: false },
};

const legalLink = "inline-flex min-h-11 items-center rounded-none py-2 underline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

// Content-card structure adapted from 21st Privacy Policy Collapsible Card (24952).
// Draft information stays visible; the example's legal copy is not used.
export default function Page(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold text-foreground">Yasal bilgiler</p>
        <h1>KVKK</h1>
      </header>
      <div className="rounded-none bg-card text-card-foreground">
        <section aria-labelledby="taslak-basligi" className="space-y-4 p-6 sm:p-8">
          <h2 id="taslak-basligi">Taslak — onay bekleniyor</h2>
          <p>Onaylı metin henüz eklenmedi.</p>
          <p className="text-muted-foreground">
            Tam şirket unvanı, adresi ve iletişim bilgileri doğrulandıktan sonra eklenecek.
          </p>
        </section>
        <section aria-labelledby="kapsam-basligi" className="space-y-4 p-6 sm:p-8">
          <h2 id="kapsam-basligi" className="text-xl">Toptan talep, sipariş ve pazarlama izni</h2>
          <p className="text-muted-foreground">
            Toptan talep, sipariş ve pazarlama izni akışlarını kapsayan aydınlatma metni, kullanıcı onayı alındıktan sonra burada yer alacak.
          </p>
        </section>
      </div>
      <nav aria-label="Hukuk sayfaları" className="mt-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/kvkk" aria-current="page" className={legalLink}>KVKK</Link>
          </li>
          <li>
            <Link href="/mesafeli-satis" className={legalLink}>Mesafeli Satış Sözleşmesi</Link>
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

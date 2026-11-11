import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { LegalDocument } from "@/components/storefront/content/LegalDocument";

export const metadata: Metadata = completeMetadata({
  title: "Mesafeli Satış Sözleşmesi (Taslak) | Afina Zeytin",
  description: "Mesafeli Satış Sözleşmesi: onaylı metin bekleniyor.",
  alternates: { canonical: "/mesafeli-satis" }, robots: { index: false, follow: false },
});

export default function Page() {
  return <LegalDocument title="Mesafeli Satış Sözleşmesi" path="/mesafeli-satis" scope="Satıcı bilgileri ve satış koşulları">
    Onaylı mesafeli satış sözleşmesi, kullanıcı onayı alındıktan sonra burada yer alacak.
  </LegalDocument>;
}

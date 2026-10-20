import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/LegalDocument";

export const metadata: Metadata = {
  title: "İade ve İptal — Taslak | Afina Zeytin",
  description: "İade ve İptal: onaylı metin bekleniyor.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LegalDocument title="İade ve İptal" path="/iade" scope="İade ve iptal koşulları">
    İade ve iptal koşullarını ve başvuru iletişimini içeren metin, kullanıcı onayı alındıktan sonra burada yer alacak.
  </LegalDocument>;
}

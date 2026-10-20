import type { Metadata } from "next";
import { LegalDocument } from "@/components/site/LegalDocument";

export const metadata: Metadata = {
  title: "KVKK — Taslak | Afina Zeytin",
  description: "KVKK: onaylı metin bekleniyor.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LegalDocument title="KVKK" path="/kvkk" scope="Toptan talep, sipariş ve pazarlama izni">
    Toptan talep, sipariş ve pazarlama izni akışlarını kapsayan aydınlatma metni, kullanıcı onayı alındıktan sonra burada yer alacak.
  </LegalDocument>;
}

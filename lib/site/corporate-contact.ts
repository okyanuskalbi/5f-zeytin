/** Public group contact verified at https://afina.com.tr/#iletisim.
 * This is not a verified AFİNA ZEYTİN service line or a WhatsApp number. */
export const corporateContact = {
  name: "AFİNA Şirketler Topluluğu",
  email: "info@afina.com.tr",
  phone: "+903288827708",
  displayPhone: "+90 328 882 77 08",
  source: "https://afina.com.tr/#iletisim",
} as const;

export type QuoteEmailDraft = Readonly<{
  name: string;
  business: string;
  product: string;
  quantity: string;
  city: string;
  district?: string;
  phone: string;
}>;

export function cleanQuoteLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

/** No form value can become a recipient or a mail header. The user completes
 * sending in their mail application; building this URI does not send mail. */
export function buildQuoteMailto(draft: QuoteEmailDraft): string {
  const subject = "AFİNA ZEYTİN · Kurumsal teklif talebi";
  const body = [
    "AFİNA ZEYTİN ürünleri için teklif talebi",
    "",
    `Ad / firma: ${cleanQuoteLine(draft.name)}`,
    `İşletme türü: ${cleanQuoteLine(draft.business)}`,
    `Ürün: ${cleanQuoteLine(draft.product)}`,
    `Miktar: ${cleanQuoteLine(draft.quantity)}`,
    `Şehir: ${cleanQuoteLine(draft.city)}`,
    ...(draft.district ? [`İlçe: ${cleanQuoteLine(draft.district)}`] : []),
    `Telefon: ${cleanQuoteLine(draft.phone)}`,
    "",
    "Fiyat, stok ve teslimat koşulları teklif aşamasında teyit edilir.",
  ].join("\n");
  return `mailto:${corporateContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

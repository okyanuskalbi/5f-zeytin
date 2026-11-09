import { corporateContact } from "@/lib/site/corporate-contact";
import { phoneText, validPhoneParts } from "@/lib/contact/customer-phone";

export const businessTypes = ["Market", "Şarküteri", "Kuruyemiş / yöresel ürün", "Toptancı / distribütör", "Diğer"] as const;
export const outletCounts = ["1", "2–5", "6 ve üzeri"] as const;
export const dealershipLimits = { companyName: 120, contactName: 120, email: 254, city: 80, district: 80, message: 1000 } as const;
export type DealershipInput = {
  companyName: string; contactName: string; phoneCountry: string; phoneNational: string;
  email: string; city: string; district: string; businessType: string; outletCount: string; message: string; consent: boolean;
};
export type DealershipData = Omit<DealershipInput, "phoneCountry" | "phoneNational"> & { phone: string };
export type DealershipField = keyof DealershipData;
export type DealershipErrors = Partial<Record<DealershipField, string>>;
export type DealershipDraft = { subject: string; body: string; mailto: string };
type ParseResult = { success: true; data: DealershipData } | { success: false; errors: DealershipErrors };
const cleanLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

/** Frontend-only schema. Preparing this draft does not store or send an application. */
export const dealershipSchema = {
  safeParse(input: DealershipInput): ParseResult {
    const errors: DealershipErrors = {};
    const phone = validPhoneParts(input.phoneCountry, input.phoneNational);
    const data: DealershipData = {
      companyName: cleanLine(input.companyName), contactName: cleanLine(input.contactName), phone: phone ? phoneText(phone) : "",
      email: input.email.trim(), city: cleanLine(input.city), district: cleanLine(input.district),
      businessType: input.businessType, outletCount: input.outletCount,
      message: input.message.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim(), consent: input.consent === true,
    };
    if (data.companyName.length < 2 || data.companyName.length > dealershipLimits.companyName) errors.companyName = "Firma adını 2–120 karakter olarak girin.";
    if (data.contactName.length < 2 || data.contactName.length > dealershipLimits.contactName) errors.contactName = "Yetkili adı soyadını 2–120 karakter olarak girin.";
    if (!phone) errors.phone = "Seçili ülkeye uygun geçerli bir telefon numarası girin.";
    if (data.email.length > dealershipLimits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Geçerli bir e-posta adresi girin (en fazla 254 karakter).";
    if (data.city.length < 2 || data.city.length > dealershipLimits.city) errors.city = "İl bilgisini girin (2–80 karakter).";
    if (data.district.length < 2 || data.district.length > dealershipLimits.district) errors.district = "İlçe bilgisini girin (2–80 karakter).";
    if (!(businessTypes as readonly string[]).includes(data.businessType)) errors.businessType = "İşletme türünü seçin.";
    if (data.outletCount && !(outletCounts as readonly string[]).includes(data.outletCount)) errors.outletCount = "Satış noktası sayısını listedeki seçeneklerden seçin.";
    if (input.message.length > dealershipLimits.message) errors.message = "Mesaj en fazla 1000 karakter olabilir.";
    if (!data.consent) errors.consent = "Devam etmek için KVKK aydınlatma metnini okuduğunuzu belirtin.";
    return Object.keys(errors).length ? { success: false, errors } : { success: true, data };
  },
};

export function createDealershipDraft(data: DealershipData): DealershipDraft {
  const subject = `Bayilik başvurusu — ${cleanLine(data.companyName)}`;
  const body = ["AFİNA ZEYTİN — Bayilik başvurusu", "",
    `Firma adı: ${data.companyName}`, `Yetkili adı soyadı: ${data.contactName}`, `Telefon: ${data.phone}`,
    `E-posta: ${data.email}`, `İl: ${data.city}`, `İlçe: ${data.district}`, `İşletme türü: ${data.businessType}`,
    `Satış noktası sayısı: ${data.outletCount || "Belirtilmedi"}`, "", `Mesaj: ${data.message || "Belirtilmedi"}`,
    "", "KVKK onayı: KVKK aydınlatma metnini okudum.",
  ].join("\n").replace(/\n/g, "\r\n");
  return { subject, body, mailto: `mailto:${corporateContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

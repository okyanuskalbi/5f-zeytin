import type { Product } from "@/types/catalog";
import { validateWholesaleRequest, type WholesaleRequest } from "./wholesale";

export type BusinessEnquiryValues = Record<"company" | "contact" | "phone" | "email" | "city" | "productId" | "packaging" | "consumption" | "deliveryRegion" | "customerType", string>;
export type BusinessEnquiryErrors = Partial<Record<keyof BusinessEnquiryValues, string>>;
export const businessEnquiryLimits: Record<keyof BusinessEnquiryValues, number> = {
  company: 60, contact: 55, phone: 30, email: 254, city: 80, productId: 120, packaging: 100, consumption: 100, deliveryRegion: 160, customerType: 40,
};
export const businessCustomerTypes = ["Otel", "Restoran", "Market", "Yurt / toplu tüketim", "Bayi / distribütör", "Diğer işletme"] as const;

/** Keeps CRM/provider choices outside the UI; reuses the approved wholesale boundary. */
export function buildBusinessEnquiry(input: BusinessEnquiryValues, products: readonly Product[]):
  { ok: true; data: WholesaleRequest } | { ok: false; errors: BusinessEnquiryErrors } {
  const values = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim().replace(/[\r\n]+/g, " ")])) as BusinessEnquiryValues;
  const errors: BusinessEnquiryErrors = {};
  for (const key of Object.keys(businessEnquiryLimits) as (keyof BusinessEnquiryValues)[]) {
    if (key !== "email" && values[key].length < 2) errors[key] = "Bu alanı doldurun.";
    if (values[key].length > businessEnquiryLimits[key]) errors[key] = `En fazla ${businessEnquiryLimits[key]} karakter girin.`;
  }
  const product = products.find(product => product.id === values.productId);
  if (!product) errors.productId = "Katalogdan bir ürün seçin.";
  if (!(businessCustomerTypes as readonly string[]).includes(values.customerType)) errors.customerType = "İşletme türünü seçin.";
  const request = {
    name: `${values.contact} / ${values.company}`,
    phone: values.phone, email: values.email,
    message: [
      `Firma: ${values.company}`, `Yetkili: ${values.contact}`, `İşletme türü: ${values.customerType}`,
      `Şehir: ${values.city}`, `Ürün: ${product?.name ?? ""} (${product?.weight ?? ""})`,
      `Ambalaj: ${values.packaging}`, `Tahmini aylık tüketim: ${values.consumption}`, `Teslimat bölgesi: ${values.deliveryRegion}`,
    ].join("\n"),
  };
  const checked = validateWholesaleRequest(request);
  if (!checked.ok) {
    if (checked.errors.phone) errors.phone = checked.errors.phone;
    if (checked.errors.email) errors.email = checked.errors.email;
  }
  return Object.keys(errors).length || !checked.ok ? { ok: false, errors } : { ok: true, data: checked.data };
}

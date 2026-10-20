import locations from "./turkey-locations.json";
import { emailError } from "@/lib/auth/adapter";
import type { CartItem } from "@/lib/cart/types";
import type { Product } from "@/types/catalog";

export type CheckoutDetails = {
  name: string; email: string; phone: string; city: string; district: string;
  neighborhood: string; address: string; postalCode: string;
  billingType: "individual" | "corporate"; company: string; taxNumber: string; taxOffice: string;
};
export type CheckoutErrors = Partial<Record<keyof CheckoutDetails | "shipping" | "sale" | "information", string>>;
export type ShippingOption = { id: string; name: string; description: string; priceKurus: number | null };
export type CheckoutSummary = {
  ready: boolean;
  lines: { id: string; name: string; weight: string; quantity: number; amountKurus: number }[];
  subtotalKurus: number | null;
  finalTotalKurus: number | null;
};
export interface CheckoutAdapter {
  provinces(): string[];
  districts(city: string): readonly string[];
  validateDetails(input: CheckoutDetails): CheckoutErrors;
  shippingOptions(): ShippingOption[];
  summary(items: readonly CartItem[], products: readonly Product[] | null): CheckoutSummary;
}

export function isCheckoutDemoEnabled(mode = process.env.NODE_ENV, flag = process.env.NEXT_PUBLIC_DEMO): boolean {
  return mode !== "production" || flag === "1";
}

function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits && !digits.startsWith("0")) digits = `0${digits}`;
  return digits;
}

export function formatTrPhone(value: string): string {
  const digits = phoneDigits(value).slice(0, 11);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)].filter(Boolean).join(" ");
}

const provinceDistricts: Readonly<Record<string, readonly string[]>> = locations;
function districts(city: string): readonly string[] {
  return Object.hasOwn(provinceDistricts, city) ? [...provinceDistricts[city]] : [];
}

export function validateCheckoutDetails(input: CheckoutDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const labels = { name: "Ad soyad", neighborhood: "Mahalle", address: "Açık adres" } as const;
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) {
    if (input[key].trim().length < (key === "address" ? 10 : 2) || input[key].length > (key === "address" ? 500 : 100)) errors[key] = `${labels[key]} alanını kontrol edin.`;
  }
  const email = emailError(input.email);
  if (email) errors.email = email;
  if (!/^[+\d\s()-]{10,24}$/.test(input.phone) || !/^0[2-5]\d{9}$/.test(phoneDigits(input.phone))) errors.phone = "Geçerli bir Türkiye telefon numarası girin.";
  if (!Object.hasOwn(provinceDistricts, input.city)) errors.city = "İl seçin.";
  if (!districts(input.city).includes(input.district)) errors.district = "Seçtiğiniz ile ait bir ilçe seçin.";
  if (!/^\d{5}$/.test(input.postalCode)) errors.postalCode = "5 haneli posta kodunu girin.";
  if (!["individual", "corporate"].includes(input.billingType)) errors.billingType = "Fatura türünü seçin.";
  if (input.billingType === "corporate") {
    if (input.company.trim().length < 2 || input.company.length > 150) errors.company = "Firma unvanını girin (en fazla 150 karakter).";
    if (!/^\d{10}$/.test(input.taxNumber)) errors.taxNumber = "VKN 10 rakam olmalı.";
    if (input.taxOffice.trim().length < 2 || input.taxOffice.length > 100) errors.taxOffice = "Vergi dairesini girin (en fazla 100 karakter).";
  }
  return errors;
}

/** UI simulation only: no order writes, final quote, payment result or customer persistence. */
export function createMockCheckoutAdapter(): CheckoutAdapter {
  return {
    provinces: () => Object.keys(provinceDistricts).sort((a, b) => a.localeCompare(b, "tr")),
    districts,
    validateDetails: validateCheckoutDetails,
    shippingOptions: () => [{ id: "standard", name: "Standart kargo", description: "Ücret ödeme adımında", priceKurus: null }],
    summary(items, products) {
      let ready = products !== null && items.length > 0;
      const seen = new Set<string>();
      const lines = items.flatMap(item => {
        const product = products?.find(product => product.id === item.productId);
        if (!product || seen.has(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock || !Number.isSafeInteger(product.priceKurus) || product.priceKurus < 0) { ready = false; return []; }
        seen.add(item.productId);
        return [{ id: product.id, name: product.name, weight: product.weight, quantity: item.quantity, amountKurus: product.priceKurus * item.quantity }];
      });
      const subtotal = lines.reduce((sum, line) => sum + line.amountKurus, 0);
      if (!Number.isSafeInteger(subtotal)) ready = false;
      return { ready, lines, subtotalKurus: ready ? subtotal : null, finalTotalKurus: null };
    },
  };
}

export function createCheckoutAdapter(): CheckoutAdapter | null {
  return isCheckoutDemoEnabled() ? createMockCheckoutAdapter() : null;
}

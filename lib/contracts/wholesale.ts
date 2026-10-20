/** Client contract only. Task 082 must validate again at the server boundary. */
export interface WholesaleRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export type WholesaleField = keyof WholesaleRequest;
export type WholesaleErrors = Partial<Record<WholesaleField, string>>;
export type WholesaleResult = { ok: true } | { ok: false };
export type WholesaleSubmit = (request: WholesaleRequest) => Promise<WholesaleResult>;

export const wholesaleLimits = { name: 120, email: 254, phone: 30, message: 2000 } as const;

export function validateWholesaleRequest(input: WholesaleRequest):
  { ok: true; data: WholesaleRequest } | { ok: false; errors: WholesaleErrors } {
  const data: WholesaleRequest = {
    name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), message: input.message.trim(),
  };
  const errors: WholesaleErrors = {};
  if (data.name.length < 2 || data.name.length > wholesaleLimits.name) {
    errors.name = "İsim / firma 2–120 karakter olmalıdır.";
  }
  if (!data.email && !data.phone) {
    errors.email = "E-posta veya telefondan en az birini girin.";
    errors.phone = errors.email;
  }
  if (data.email && (data.email.length > wholesaleLimits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
    errors.email = "Geçerli bir e-posta adresi girin (en fazla 254 karakter).";
  }
  const digits = data.phone.replace(/\D/g, "");
  if (data.phone && (data.phone.length > wholesaleLimits.phone || !/^\+?[\d\s().-]+$/.test(data.phone) || digits.length < 7 || digits.length > 15)) {
    errors.phone = "Geçerli bir telefon girin (7–15 rakam, en fazla 30 karakter).";
  }
  if (data.message.length < 10 || data.message.length > wholesaleLimits.message) {
    errors.message = "Talep mesajı 10–2000 karakter olmalıdır.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

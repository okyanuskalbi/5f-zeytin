import { validateCredentials, type Registration } from "@/lib/auth/adapter";

export type RegisterRequest = Registration;
export type RegisterErrors = Partial<Record<keyof RegisterRequest, string>>;
export type RegisterResponse = { data: { status: "confirmation_required"; message: string } }
  | { error: { code: string; message: string; fields?: RegisterErrors } };

export const registrationConfirmation = "İsteğiniz alındı. Kayıt uygunsa e-posta adresinize bir doğrulama bağlantısı gönderilir. Bağlantıyı kaydı başlattığınız tarayıcıda açın. Zaten hesabınız varsa giriş yapabilirsiniz.";
export const registrationPasswordError = "Şifre güvenlik koşullarını karşılamıyor. Farklı bir şifre deneyin.";
const fieldNames = ["name", "email", "password", "privacy", "consent", "marketing"] as const;

/** Shared validation; the server always parses unknown input independently. */
export function validateRegisterRequest(input: unknown):
  { ok: true; data: RegisterRequest } | { ok: false; fields: RegisterErrors } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, fields: {} };
  const value = input as Record<string, unknown>;
  const data: RegisterRequest = {
    name: typeof value.name === "string" ? value.name.trim() : "",
    email: typeof value.email === "string" ? value.email.trim().toLowerCase() : "",
    password: typeof value.password === "string" ? value.password : "",
    privacy: value.privacy === true, consent: value.consent === true, marketing: value.marketing === true,
  };
  const fields: RegisterErrors = {
    ...(data.name.length < 2 || data.name.length > 100 ? { name: "Ad soyad 2–100 karakter olmalı." } : {}),
    ...validateCredentials(data, true),
  };
  if (!data.privacy) fields.privacy = "KVKK aydınlatma metnini okuduğunuzu onaylayın.";
  if (!data.consent) fields.consent = "Açık rıza onayı gereklidir.";
  if (value.marketing !== undefined && typeof value.marketing !== "boolean") fields.marketing = "Ticari ileti tercihini kontrol edin.";
  if (Object.keys(fields).length || Object.keys(value).some(key => !(fieldNames as readonly string[]).includes(key))) {
    return { ok: false, fields };
  }
  return { ok: true, data };
}

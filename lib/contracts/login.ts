import { emailError, validateCredentials } from "@/lib/auth/adapter";
import { safeAuthRedirect } from "@/lib/auth/config";

export type LoginRequest = { method: "password"; email: string; password: string; next: string }
  | { method: "magic_link"; email: string; next: string };
export type LoginErrors = Partial<Record<"email" | "password", string>>;
export type LoginResponse = { data: { status: "signed_in"; redirectTo: string } }
  | { data: { status: "link_requested"; message: string } }
  | { error: { code: string; message: string; fields?: LoginErrors } };

export const loginInvalidCredentials = "E-posta veya şifre doğrulanamadı. Bilgilerinizi ve e-posta doğrulamanızı kontrol edin.";
export const magicLinkConfirmation = "İsteğiniz alındı. Hesabınız uygunsa e-posta adresinize bir giriş bağlantısı gönderilir. Bağlantıyı isteği başlattığınız tarayıcıda açın.";

/** Parse unknown input on both sides. Passwords are never normalized. */
export function validateLoginRequest(input: unknown): { ok: true; data: LoginRequest } | { ok: false; fields: LoginErrors } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, fields: {} };
  const value = input as Record<string, unknown>;
  if ((value.method !== "password" && value.method !== "magic_link") || (value.next !== undefined && typeof value.next !== "string")) return { ok: false, fields: {} };
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  const next = safeAuthRedirect(typeof value.next === "string" ? value.next : null);
  const password = typeof value.password === "string" ? value.password : "";
  const emailMessage = emailError(email);
  const fields: LoginErrors = value.method === "password" ? validateCredentials({ email, password }) : emailMessage ? { email: emailMessage } : {};
  const allowed = value.method === "password" ? ["method", "email", "password", "next"] : ["method", "email", "next"];
  if (Object.keys(fields).length || Object.keys(value).some(key => !allowed.includes(key))) return { ok: false, fields };
  return { ok: true, data: value.method === "password" ? { method: "password", email, password, next } : { method: "magic_link", email, next } };
}

export type Session = { id: string; name: string; email: string; phone: string };
export type EmailCredentials = { email: string; password: string };
export type Registration = EmailCredentials & { name: string; privacy: boolean; consent: boolean; marketing: boolean };
export type DemoStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface AuthAdapter {
  signInWithGoogle(): Promise<Session>;
  signInWithEmail(input: EmailCredentials): Promise<Session>;
  signUp(input: Registration): Promise<Session>;
  resetPassword(email: string): Promise<{ message: string }>;
  getSession(): Promise<Session | null>;
  signOut(): Promise<void>;
}

export class MembershipError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message); }
}

export function isMembershipDemoEnabled(mode = process.env.NODE_ENV, flag = process.env.NEXT_PUBLIC_DEMO): boolean {
  return mode !== "production" || flag === "1";
}

export function emailError(email: string): string | undefined {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Geçerli bir e-posta adresi girin.";
}

export function passwordStrength(password: string): number {
  return Number(password.length >= 8) + Number(/[a-zçğıöşü]/.test(password) && /[A-ZÇĞİÖŞÜ]/.test(password)) + Number(/\d/.test(password)) + Number(/[^\p{L}\p{N}]/u.test(password));
}

export function validateCredentials(input: EmailCredentials, registration = false): Record<string, string> {
  const fields: Record<string, string> = {};
  const email = emailError(input.email);
  if (email) fields.email = email;
  if (!input.password || input.password.length > 128 || (registration && (input.password.length < 8 || !/[a-zçğıöşü]/.test(input.password) || !/[A-ZÇĞİÖŞÜ]/.test(input.password) || !/\d/.test(input.password)))) {
    fields.password = registration ? "Şifre 8–128 karakter, büyük/küçük harf ve rakam içermeli." : "Şifrenizi girin (en fazla 128 karakter).";
  }
  return fields;
}

const sessionKey = "afina:membership:demo-session:v1";

/** UI simulation only. No tokens, network, OAuth or real authentication.
 * Credentials stay in this module instance's memory and disappear on reload.
 * Only the clearly labelled demo profile is retained in tab session storage.
 */
export function createMockAuthAdapter(storage: DemoStorage): AuthAdapter {
  const users = new Map<string, { session: Session; password: string }>();
  const saveSession = (session: Session): Session => { storage.setItem(sessionKey, JSON.stringify(session)); return { ...session }; };
  return {
    async signInWithGoogle() {
      return saveSession({ id: "demo-google", name: "Demo Misafir", email: "demo@example.test", phone: "" });
    },
    async signInWithEmail(input) {
      const fields = validateCredentials(input);
      if (Object.keys(fields).length) throw new MembershipError("Lütfen alanları kontrol edin.", fields);
      const user = users.get(input.email.trim().toLowerCase());
      if (!user || user.password !== input.password) throw new MembershipError("E-posta veya şifre eşleşmiyor. Demo için önce bu sayfada üye olun; demo giriş bilgileri sayfa yenilendiğinde sıfırlanır.");
      return saveSession(user.session);
    },
    async signUp(input) {
      const fields = validateCredentials(input, true);
      if (input.name.trim().length < 2 || input.name.trim().length > 100) fields.name = "Ad soyad 2–100 karakter olmalı.";
      if (input.privacy !== true) fields.privacy = "KVKK aydınlatma metnini okuduğunuzu onaylayın.";
      if (input.consent !== true) fields.consent = "Açık rıza onayı gereklidir.";
      if (Object.keys(fields).length) throw new MembershipError("Lütfen alanları kontrol edin.", fields);
      const email = input.email.trim().toLowerCase();
      if (users.has(email)) throw new MembershipError("Bu e-posta demo oturumunda kayıtlı. Giriş sekmesini kullanın.", { email: "Bu e-posta zaten kayıtlı." });
      const session = { id: `demo-${crypto.randomUUID()}`, name: input.name.trim(), email, phone: "" };
      users.set(email, { session, password: input.password });
      return saveSession(session);
    },
    async resetPassword(email) {
      const error = emailError(email);
      if (error) throw new MembershipError(error, { email: error });
      return { message: "Demo: sıfırlama isteği örneklendi; e-posta gönderilmedi." };
    },
    async getSession() {
      try {
        const session: unknown = JSON.parse(storage.getItem(sessionKey) ?? "null");
        if (session && typeof session === "object" && "id" in session && typeof session.id === "string" && session.id.startsWith("demo-") && "name" in session && typeof session.name === "string" && "email" in session && typeof session.email === "string" && "phone" in session && typeof session.phone === "string") return session as Session;
      } catch { /* Invalid demo storage is treated as signed out. */ }
      return null;
    },
    async signOut() { storage.removeItem(sessionKey); },
  };
}

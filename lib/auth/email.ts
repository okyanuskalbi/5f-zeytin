import "server-only";
import { getMailConfig, MailNotConfiguredError, sendMail } from "@/lib/mail/send";
import { renderEmail } from "@/lib/mail/template";

export class EmailUnavailableError extends Error {
  constructor() { super("email_not_configured"); }
}

export function assertAuthEmailConfigured() {
  if (!getMailConfig()) throw new EmailUnavailableError();
}

export type AuthEmailKind = "verify" | "reset" | "magic";
type AuthEmailCopy = { subject: string; lead: string; title: string; purpose: string; button: string };
const copy: Record<AuthEmailKind, AuthEmailCopy> = {
  verify: { subject: "AFİNA ZEYTİN e-posta doğrulama", lead: "E-posta adresinizi doğrulamak için bu bağlantıyı açın:",
    title: "E-posta adresinizi doğrulayın", purpose: "E-posta adresinizi doğrulamak için aşağıdaki düğmeyi kullanın.", button: "E-postamı doğrula" },
  reset: { subject: "AFİNA ZEYTİN şifre sıfırlama", lead: "Şifrenizi yenilemek için bu bağlantıyı açın:",
    title: "Şifrenizi yenileyin", purpose: "Şifrenizi yenilemek için aşağıdaki düğmeyi kullanın.", button: "Şifremi yenile" },
  magic: { subject: "AFİNA ZEYTİN giriş bağlantısı", lead: "Hesabınıza giriş yapmak için bu bağlantıyı açın:",
    title: "Hesabınıza giriş yapın", purpose: "Hesabınıza giriş yapmak için aşağıdaki düğmeyi kullanın.", button: "Giriş yap" },
};
const securityNote = "Bu bağlantı kısa süre geçerlidir. Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın.";

/** Hesap e-postasının konusu, düz metni ve HTML hali. */
export function buildAuthEmail(kind: AuthEmailKind, url: string): { subject: string; text: string; html: string } {
  const { subject, lead, title, purpose, button } = copy[kind];
  const text = `${lead}\n${url}\n\n${securityNote}\n\nAFİNA ZEYTİN\nhttps://afinazeytin.com`;
  const html = renderEmail({ title, lead: purpose, action: { label: button, url }, note: securityNote });
  return { subject, text, html };
}

/** Başarısızlık sessizce yutulmaz: ayar yoksa EmailUnavailableError, gönderim hatasında gönderen hata atar. */
export async function sendAuthEmail(input: { to: string; url: string; kind: AuthEmailKind }) {
  try { await sendMail({ to: input.to, ...buildAuthEmail(input.kind, input.url) }); }
  catch (error) { throw error instanceof MailNotConfiguredError ? new EmailUnavailableError() : error; }
}

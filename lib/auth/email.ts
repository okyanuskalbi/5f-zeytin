import "server-only";
import { getMailConfig, MailNotConfiguredError, sendMail } from "@/lib/mail/send";

export class EmailUnavailableError extends Error {
  constructor() { super("email_not_configured"); }
}

export function assertAuthEmailConfigured() {
  if (!getMailConfig()) throw new EmailUnavailableError();
}

export type AuthEmailKind = "verify" | "reset" | "magic";
const copy: Record<AuthEmailKind, { subject: string; lead: string }> = {
  verify: { subject: "AFİNA ZEYTİN e-posta doğrulama", lead: "E-posta adresinizi doğrulamak için bu bağlantıyı açın:" },
  reset: { subject: "AFİNA ZEYTİN şifre sıfırlama", lead: "Şifrenizi yenilemek için bu bağlantıyı açın:" },
  magic: { subject: "AFİNA ZEYTİN giriş bağlantısı", lead: "Hesabınıza giriş yapmak için bu bağlantıyı açın:" },
};

/** Başarısızlık sessizce yutulmaz: ayar yoksa EmailUnavailableError, gönderim hatasında gönderen hata atar. */
export async function sendAuthEmail(input: { to: string; url: string; kind: AuthEmailKind }) {
  const { subject, lead } = copy[input.kind];
  const text = `${lead}\n${input.url}\n\nBu bağlantı kısa süre geçerlidir. Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın.\n\nAFİNA ZEYTİN\nhttps://afinazeytin.com`;
  try { await sendMail({ to: input.to, subject, text }); }
  catch (error) { throw error instanceof MailNotConfiguredError ? new EmailUnavailableError() : error; }
}

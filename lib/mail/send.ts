import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Gönderim ayarı eksik: çağıran sessizce atlar ya da kibar bir mesaj gösterir. */
export class MailNotConfiguredError extends Error {
  constructor() { super("email_not_configured"); this.name = "MailNotConfiguredError"; }
}

export type MailConfig = {
  host: string; port: number; secure: boolean; user: string; password: string;
  from: { name: string; email: string }; leadNotifyTo: string | null;
};

const emailPattern = /^[^\s@<>"',;:()[\]\\]+@[^\s@<>"',;:()[\]\\]+\.[^\s@<>"',;:()[\]\\]+$/;
const controlChars = /[\u0000-\u001f\u007f\u0085\u2028\u2029]+/g;

/** Başlıklara girecek metinde satır sonu ve denetim karakterlerini temizler (başlık enjeksiyonu koruması). */
export function cleanHeader(value: string, max = 200): string {
  return value.replace(controlChars, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanAddress(value: string | null | undefined): string | null {
  const email = cleanHeader(value ?? "", 254);
  return email.length <= 254 && emailPattern.test(email) ? email : null;
}

/** Ayarlar önce Worker bağlamından (vars + secret), sonra process.env'den okunur; yalnız metin değerler geçer. */
function readEnv(): (name: string) => string {
  let bound: Record<string, unknown> = {};
  try { bound = getCloudflareContext().env as unknown as Record<string, unknown>; } catch { /* bağlam yok: yerel/test */ }
  return name => {
    const value = bound[name];
    return typeof value === "string" ? value.trim() : (process.env[name] ?? "").trim();
  };
}

function parseFrom(value: string): { name: string; email: string } | null {
  const match = /^(.*?)\s*<([^<>]+)>$/.exec(value);
  const email = cleanAddress(match ? match[2] : value);
  if (!email) return null;
  return { name: cleanHeader(match ? match[1].replace(/^"|"$/g, "") : "", 100), email };
}

/** Eksik ya da bozuk ayarda null döner; şifre yoksa sistem "yapılandırılmamış" sayılır. */
export function getMailConfig(): MailConfig | null {
  const env = readEnv();
  const host = cleanHeader(env("SMTP_HOST"), 253);
  const portText = env("SMTP_PORT");
  const user = cleanHeader(env("SMTP_USER"), 254);
  const password = env("SMTP_PASSWORD");
  const from = parseFrom(env("MAIL_FROM"));
  if (!host || !user || !password || !from || !/^\d+$/.test(portText)) return null;
  const port = Number(portText);
  if (port < 1 || port > 65535) return null;
  const secureText = env("SMTP_SECURE").toLowerCase();
  const secure = secureText ? secureText === "true" : port === 465;
  return { host, port, secure, user, password, from, leadNotifyTo: cleanAddress(env("LEAD_NOTIFY_TO")) };
}

export function isMailConfigured(): boolean { return getMailConfig() !== null; }

/** RFC 2047 base64 kodlu kelime; çok baytlı harfleri bölmeden 75 karakter sınırı içinde parçalar. */
function encodeWords(text: string): string {
  if (!/[^\x20-\x7e]/.test(text)) return text;
  const words: string[] = [];
  let chunk = "";
  const flush = () => { if (chunk) { words.push(`=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(chunk)))}?=`); chunk = ""; } };
  for (const char of text) {
    if (new TextEncoder().encode(chunk + char).length > 36) flush();
    chunk += char;
  }
  flush();
  return words.join(" ");
}

// Gerçek `cloudflare:sockets`, derleyicinin görmemesi için değişken adla çalışma zamanında yüklenir ve
// globalThis'e konur; derlemede worker-mailer'ın içe aktarması cf-sockets-shim.ts'e yönlendirilir.
async function loadSockets(): Promise<void> {
  const specifier = "cloudflare:sockets";
  try {
    (globalThis as { __cfSockets?: unknown }).__cfSockets = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ specifier);
  } catch { /* Workers dışında yok; worker-mailer kendi hatasını verir */ }
}

export type MailMessage = { to: string; subject: string; text: string; replyTo?: string | null };

const timeouts = { socketTimeoutMs: 10_000, responseTimeoutMs: 10_000 } as const;

/**
 * Düz metin e-posta gönderir (Cloudflare Workers soketi üzerinden SMTP, worker-mailer).
 * Ayar yoksa MailNotConfiguredError; reddedilen/başarısız gönderimde hata fırlatır. Bağlantı her durumda kapatılır.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const config = getMailConfig();
  if (!config) throw new MailNotConfiguredError();
  const to = cleanAddress(message.to);
  if (!to) throw new Error("mail_invalid_recipient");
  const subject = cleanHeader(message.subject, 160);
  const text = message.text.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").slice(0, 20_000);
  const replyTo = cleanAddress(message.replyTo);
  // cloudflare:sockets yalnız Workers'ta vardır; modül gönderim anında yüklenir (Node/test ortamı etkilenmez).
  await loadSockets();
  const { WorkerMailer } = await import("worker-mailer");
  const fromHeader = config.from.name ? `${encodeWords(config.from.name)} <${config.from.email}>` : config.from.email;
  const mailer = await WorkerMailer.connect({
    host: config.host, port: config.port, secure: config.secure, startTls: !config.secure,
    credentials: { username: config.user, password: config.password }, authType: ["plain", "login"],
    logLevel: 4, ...timeouts,
  });
  try {
    await mailer.send({
      from: { email: config.from.email }, to: { email: to },
      ...(replyTo ? { reply: { email: replyTo } } : {}),
      subject, text,
      headers: { From: fromHeader, Subject: encodeWords(subject) },
    });
  } finally {
    await mailer.close().catch(() => undefined);
  }
}

function describeError(error: unknown): string {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : "";
  // Kişisel veri loga yazılmaz: e-posta benzeri değerler maskelenir, metin kısaltılır.
  return `${name}: ${message.replace(/[^\s@]+@[^\s@]+/g, "[e-posta]").slice(0, 120)}`;
}

/** İşi yanıtı geciktirmeden arka planda çalıştırır (Workers: ctx.waitUntil); hata yalnızca loglanır. */
export function runInBackground(label: string, task: () => Promise<unknown>): void {
  const guarded = (async () => { try { await task(); } catch (error) { console.error(`${label}_failed`, describeError(error)); } })();
  try { getCloudflareContext().ctx.waitUntil(guarded); } catch { /* bağlam yok: iş yine de arka planda sürer */ }
}

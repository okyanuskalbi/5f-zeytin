/** Çerezsiz ziyaretçi sayacı sözleşmeleri (görev 215 Aşama 3). İstemci ve sunucu ortak kullanır; kişisel veri taşımaz. */
export const visitPeriods = [1, 7, 30] as const;
export type VisitPeriod = (typeof visitPeriods)[number];
export const visitPeriodLabels: Record<VisitPeriod, string> = { 1: "Bugün", 7: "7 gün", 30: "30 gün" };
export const visitRetentionDays = 180;
export const visitBodyLimit = 2048;
export const visitRateLimit = { max: 60, windowMs: 60 * 1000 } as const;
export const deviceKinds = ["mobile", "tablet", "desktop"] as const;
export type DeviceKind = (typeof deviceKinds)[number];
export const deviceLabels: Record<DeviceKind, string> = { mobile: "Mobil", tablet: "Tablet", desktop: "Masaüstü" };

/** Sayılmayan yollar: panel, API, hesap ve ödeme akışları. */
const excludedPrefixes = ["/panel", "/api", "/auth", "/giris", "/kayit", "/hesabim", "/odeme", "/odeme-onizleme", "/sepet", "/siparis-takip", "/__demo", "/%5F%5Fdemo"] as const;
export function isCountablePath(path: string): boolean {
  return !excludedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

/** Sorgu ve parça atılır; küçük harfe çevrilir; yalnız güvenli yol karakterleri kabul edilir. Geçersizse null. */
export function normalizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const bare = value.split(/[?#]/)[0] ?? "";
  if (!bare.startsWith("/") || bare.startsWith("//") || bare.length > 200) return null;
  if (!/^\/[A-Za-z0-9\-._~%/çğıöşüÇĞİÖŞÜ]*$/.test(bare) || bare.includes("..")) return null;
  const trimmed = bare.length > 1 ? bare.replace(/\/+$/, "") : bare;
  return trimmed.toLowerCase() || "/";
}

/** Yalnız host döner; kendi sitemizden gelen (iç gezinti) ya da geçersiz yönlendiren null olur. */
export function referrerHost(value: unknown, ownHost: string | null): string | null {
  if (typeof value !== "string" || !value || value.length > 500) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const own = ownHost?.toLowerCase().replace(/^www\./, "") ?? null;
    return !host || host.length > 100 || host === own ? null : host;
  } catch { return null; }
}

export function cleanUtm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  return /^[a-z0-9._~+\- ]{1,64}$/.test(text) ? text : null;
}

export type VisitInput = { path: string; referrer: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null };
/** İstemci gövdesi: yalnız beyaz listedeki alanlar; fazlası yok sayılır. Yol geçersizse null. */
export function parseVisitBody(body: Record<string, unknown>): VisitInput | null {
  const path = normalizePath(body.path);
  if (!path) return null;
  return { path, referrer: typeof body.ref === "string" ? body.ref : null, utmSource: cleanUtm(body.us), utmMedium: cleanUtm(body.um), utmCampaign: cleanUtm(body.uc) };
}

const botPattern = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|python|curl|wget|httpclient|http-client|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|scrapy|phantomjs|puppeteer|playwright|selenium|bytespider|ahrefs|semrush|mj12|petalbot|yandex|baidu|embedly|whatsapp|telegram|discord|skype|linkedinbot|pinterest|vkshare|ia_archiver|archive\.org/i;
export function isBotUserAgent(userAgent: string | null): boolean {
  return !userAgent || userAgent.length < 10 || botPattern.test(userAgent);
}
export function deviceFromUserAgent(userAgent: string): DeviceKind {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android|phone/i.test(userAgent)) return "mobile";
  return "desktop";
}
/** cf-ipcountry: iki harfli ülke kodu; XX/T1 gibi özel değerler null. */
export function cleanCountry(value: string | null): string | null {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1" ? code : null;
}
export function isTrackingOptOut(headers: Pick<Headers, "get">): boolean {
  return headers.get("dnt") === "1" || headers.get("sec-gpc") === "1";
}

export type SourceKind = "direct" | "google" | "instagram" | "other";
export const sourceLabels: Record<SourceKind, string> = { direct: "Doğrudan", google: "Google", instagram: "Instagram", other: "Diğer" };
export function classifySource(host: string | null, utmSource: string | null): SourceKind {
  const probe = `${host ?? ""} ${utmSource ?? ""}`;
  if (/(^|[.\s])google\./.test(probe) || /\bgoogle\b/.test(utmSource ?? "")) return "google";
  if (/instagram|(^|\s)ig(\s|$)/.test(probe)) return "instagram";
  return host || utmSource ? "other" : "direct";
}

export type VisitSummary = {
  period: VisitPeriod;
  totals: { views: number; visitors: number };
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number }[];
  sources: { kind: SourceKind; views: number }[];
  campaigns: { source: string; medium: string; campaign: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: { device: DeviceKind; views: number }[];
};
export function parseVisitPeriod(value: string | null): VisitPeriod | null {
  const n = value === "today" ? 1 : Number(value);
  return (visitPeriods as readonly number[]).includes(n) ? (n as VisitPeriod) : null;
}

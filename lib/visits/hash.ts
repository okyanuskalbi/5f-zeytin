import "server-only";

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer, length: number) => [...new Uint8Array(bytes)].slice(0, length).map(byte => byte.toString(16).padStart(2, "0")).join("");
const hmacKey = (raw: BufferSource) => crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

/** Europe/Istanbul takvim günü (YYYY-MM-DD). */
export function istanbulDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function shiftDay(day: string, offset: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + offset)).toISOString().slice(0, 10);
}

/** Günlük tuzlu tek yönlü ziyaretçi özeti (32 hex). Anahtar BETTER_AUTH_SECRET'tan etiketle türetilir (ayrı sır yok);
 * girdiye gün katıldığı için gün değişince özet değişir, geri çevrilemez. Ham IP/UA bu fonksiyondan dışarı çıkmaz. */
export async function dailyVisitorHash(secret: string, day: string, ip: string, userAgent: string): Promise<string> {
  const subkey = await crypto.subtle.sign("HMAC", await hmacKey(encoder.encode(secret)), encoder.encode("afina-visits-v1"));
  const digest = await crypto.subtle.sign("HMAC", await hmacKey(subkey), encoder.encode(`${day}\n${ip}\n${userAgent}`));
  return hex(digest, 16);
}

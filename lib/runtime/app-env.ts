export type AppEnv = "production" | "preview" | "development";

/** Tek ortam anahtarı: APP_ENV (production | preview | development). Tanımsızsa NODE_ENV'e bakılır. */
export function getAppEnv(): AppEnv {
  const value = process.env.APP_ENV?.trim();
  if (value === "production" || value === "preview" || value === "development") return value;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/** Cloudflare kenarı `cf-connecting-ip` başlığını her istekte kendisi yazar; yalnız Workers'ta güvenilir. */
export function isCloudflareRuntime(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

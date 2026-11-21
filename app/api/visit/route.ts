import { AuthCoreError, assertRequestOrigin, authResponseHeaders } from "@/lib/auth/server";
import { getAuthConfig } from "@/lib/auth/server-config";
import { apiFailure, readJsonBody } from "@/lib/auth/admin-api";
import { cleanCountry, deviceFromUserAgent, isBotUserAgent, isCountablePath, isTrackingOptOut, parseVisitBody, referrerHost, visitBodyLimit } from "@/lib/contracts/visits";
import { consumeVisitAttempt, purgeOldVisits, recordVisit } from "@/lib/db/visits";
import { dailyVisitorHash, istanbulDay } from "@/lib/visits/hash";

export const dynamic = "force-dynamic";
const PURGE_CHANCE = 0.01;
const skipped = () => new Response(null, { status: 204, headers: authResponseHeaders });

/** Çerezsiz sayfa sayacı. Ham IP ve UA yalnız günlük tek yönlü özet için bellekte kullanılır; saklanmaz, loglanmaz.
 * Sayılmayanlar (DNT/GPC, bot, panel/API/hesap yolları) sessizce 204 döner. */
export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
    if (isTrackingOptOut(request.headers)) return skipped();
    const userAgent = request.headers.get("user-agent");
    if (isBotUserAgent(userAgent) || !userAgent) return skipped();
    const input = parseVisitBody(await readJsonBody(request, visitBodyLimit));
    if (!input) return apiFailure(400, "validation_error", "Geçersiz istek.");
    if (!isCountablePath(input.path)) return skipped();
    const { secret, siteOrigin } = getAuthConfig();
    const day = istanbulDay();
    const visitor = await dailyVisitorHash(secret, day, request.headers.get("cf-connecting-ip") ?? "", userAgent);
    if (!await consumeVisitAttempt(visitor)) {
      return Response.json({ error: { code: "rate_limited", message: "Çok fazla istek." } }, { status: 429, headers: { ...authResponseHeaders, "Retry-After": "60" } });
    }
    await recordVisit({ day, path: input.path, referrerHost: referrerHost(input.referrer, new URL(siteOrigin).hostname),
      utmSource: input.utmSource, utmMedium: input.utmMedium, utmCampaign: input.utmCampaign,
      device: deviceFromUserAgent(userAgent), country: cleanCountry(request.headers.get("cf-ipcountry")), visitor });
    if (Math.random() < PURGE_CHANCE) await purgeOldVisits().catch(() => undefined);
    return skipped();
  } catch (error) {
    if (error instanceof AuthCoreError) return apiFailure(error.status, "visit_rejected", "İstek kabul edilmedi.");
    return apiFailure(503, "visit_unavailable", "Kaydedilemedi.");
  }
}

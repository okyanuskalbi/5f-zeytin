import "server-only";
import { query, type Row } from "@/lib/db";
import { classifySource, deviceKinds, sourceLabels, visitPeriods, visitRateLimit, visitRetentionDays, type DeviceKind, type SourceKind, type VisitPeriod, type VisitSummary } from "@/lib/contracts/visits";
import { istanbulDay, shiftDay } from "@/lib/visits/hash";

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const text = (value: unknown) => (typeof value === "string" ? value : "");

export type VisitRecord = { day: string; path: string; referrerHost: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
  device: DeviceKind; country: string | null; visitor: string };
export async function recordVisit(visit: VisitRecord): Promise<void> {
  await query(`insert into page_views (day, path, referrer_host, utm_source, utm_medium, utm_campaign, device, country, visitor, is_bot)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0)`,
    [visit.day, visit.path, visit.referrerHost, visit.utmSource, visit.utmMedium, visit.utmCampaign, visit.device, visit.country, visit.visitor]);
}

/** Aynı günlük özetten dakikada en fazla visitRateLimit.max kayıt. Anahtar özettir (ham IP yok); aşılmışsa false. */
export async function consumeVisitAttempt(visitor: string, now = Date.now()): Promise<boolean> {
  const { rows } = await query<{ count: number }>(`insert into "rateLimit" (id, key, count, "lastRequest") values ($1, $2, 1, $3)
    on conflict (key) do update set
      count = case when $3 - "rateLimit"."lastRequest" > $4 then 1 else "rateLimit".count + 1 end,
      "lastRequest" = case when $3 - "rateLimit"."lastRequest" > $4 then $3 else "rateLimit"."lastRequest" end
    returning count`, [crypto.randomUUID(), `visit:${visitor}`, now, visitRateLimit.windowMs]);
  return (rows[0]?.count ?? 1) <= visitRateLimit.max;
}

/** 180 günden eski satırlar ve bir günden eski hız sınırı kayıtları silinir. Yazım sırasında %1 olasılıkla çağrılır. */
export async function purgeOldVisits(now = new Date()): Promise<void> {
  await query("delete from page_views where day < $1", [shiftDay(istanbulDay(now), -visitRetentionDays)]);
  await query(`delete from "rateLimit" where key like 'visit:%' and "lastRequest" < $1`, [now.getTime() - 24 * 60 * 60 * 1000]);
}

export async function getTodayVisitors(now = new Date()): Promise<number> {
  const { rows } = await query<Row>("select count(distinct visitor) as n from page_views where day = $1 and is_bot = 0", [istanbulDay(now)]);
  return num(rows[0]?.n);
}

/** Tekil ziyaretçi = günlük özetlerin gün bazlı tekil toplamı (özet gün değişince değiştiği için çok günlü kişi tekrar sayılabilir). */
export async function getVisitSummary(period: VisitPeriod, now = new Date()): Promise<VisitSummary> {
  if (!visitPeriods.includes(period)) throw new RangeError("period");
  const today = istanbulDay(now);
  const from = shiftDay(today, -(period - 1));
  const chartDays = Math.max(period, 7);
  const chartFrom = shiftDay(today, -(chartDays - 1));
  const base = "from page_views where is_bot = 0 and day >= $1 and day <= $2";
  const [daily, pages, sources, campaigns, countries, devices, totals] = await Promise.all([
    query<Row>(`select day, count(*) as views, count(distinct visitor) as visitors ${base} group by day`, [chartFrom, today]),
    query<Row>(`select path, count(*) as views ${base} group by path order by views desc, path limit 10`, [from, today]),
    query<Row>(`select referrer_host, utm_source, count(*) as views ${base} group by referrer_host, utm_source`, [from, today]),
    query<Row>(`select utm_source, utm_medium, utm_campaign, count(*) as views ${base} and (utm_source is not null or utm_medium is not null or utm_campaign is not null)
      group by utm_source, utm_medium, utm_campaign order by views desc limit 10`, [from, today]),
    query<Row>(`select country, count(*) as views ${base} and country is not null group by country order by views desc, country limit 10`, [from, today]),
    query<Row>(`select device, count(*) as views ${base} group by device`, [from, today]),
    query<Row>(`select count(*) as views, count(distinct day || ':' || visitor) as visitors ${base}`, [from, today]),
  ]);
  const byDay = new Map(daily.rows.map(row => [text(row.day), row]));
  const series = Array.from({ length: chartDays }, (_, index) => {
    const day = shiftDay(chartFrom, index);
    const row = byDay.get(day);
    return { day, views: num(row?.views), visitors: num(row?.visitors) };
  });
  const sourceTotals = new Map<SourceKind, number>();
  for (const row of sources.rows) {
    const kind = classifySource(text(row.referrer_host) || null, text(row.utm_source) || null);
    sourceTotals.set(kind, (sourceTotals.get(kind) ?? 0) + num(row.views));
  }
  const deviceTotals = new Map(devices.rows.map(row => [text(row.device), num(row.views)]));
  return {
    period,
    totals: { views: num(totals.rows[0]?.views), visitors: num(totals.rows[0]?.visitors) },
    daily: series,
    pages: pages.rows.map(row => ({ path: text(row.path), views: num(row.views) })),
    sources: (Object.keys(sourceLabels) as SourceKind[]).map(kind => ({ kind, views: sourceTotals.get(kind) ?? 0 })).filter(item => item.views > 0).sort((a, b) => b.views - a.views),
    campaigns: campaigns.rows.map(row => ({ source: text(row.utm_source), medium: text(row.utm_medium), campaign: text(row.utm_campaign), views: num(row.views) })),
    countries: countries.rows.map(row => ({ country: text(row.country), views: num(row.views) })),
    devices: deviceKinds.map(device => ({ device, views: deviceTotals.get(device) ?? 0 })).filter(item => item.views > 0),
  };
}

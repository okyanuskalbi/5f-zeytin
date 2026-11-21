// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";
import { query } from "@/lib/db";
import { POST as postVisit } from "@/app/api/visit/route";
import { GET as getVisitors } from "@/app/api/admin/visitors/route";
import { requireAdmin } from "@/lib/auth/admin";
import { AuthCoreError } from "@/lib/auth/server";
import { classifySource, cleanCountry, deviceFromUserAgent, isBotUserAgent, isCountablePath, normalizePath, referrerHost } from "@/lib/contracts/visits";
import { consumeVisitAttempt, getTodayVisitors, getVisitSummary, purgeOldVisits, recordVisit } from "@/lib/db/visits";
import { dailyVisitorHash, istanbulDay, shiftDay } from "@/lib/visits/hash";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn(), requireAdminMutation: vi.fn() }));
vi.mock("@/lib/auth/server", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/auth/server")>();
  return { ...original, assertRequestOrigin: (request: Request) => {
    if (request.headers.get("origin") !== "https://shop.example.test") throw new original.AuthCoreError(403, "csrf_rejected");
  } };
});
const origin = "https://shop.example.test";
const SECRET = "visits-local-tests-only-32-character-secret";
const desktopUa = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const phoneUa = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const visit = (body: unknown, headers: Record<string, string> = {}) => new Request(`${origin}/api/visit`, {
  method: "POST", headers: { origin, "content-type": "application/json", "user-agent": desktopUa, "cf-connecting-ip": "203.0.113.7", "cf-ipcountry": "tr", ...headers }, body: JSON.stringify(body),
});
const count = async () => Number((await query<{ n: number }>("select count(*) as n from page_views")).rows[0].n);

beforeEach(() => {
  bindTestD1(createTestD1());
  vi.stubEnv("BETTER_AUTH_URL", origin);
  vi.stubEnv("BETTER_AUTH_SECRET", SECRET);
  vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", email: "admin@example.test" });
});

describe("0004_visits migration", () => {
  it("is applied by the test D1 setup and enforces constraints", async () => {
    await expect(query("insert into page_views(day,path,device,visitor) values ('x','/','desktop','0123456789abcdef0123456789abcdef')")).rejects.toMatchObject({ code: "23514" });
    await expect(query("insert into page_views(day,path,device,visitor) values ('2026-11-21','/','robot','0123456789abcdef0123456789abcdef')")).rejects.toMatchObject({ code: "23514" });
  });
});

describe("contract helpers", () => {
  it("normalizes paths (drops query/hash, rejects unsafe) and excludes panel/api/account paths", () => {
    expect(normalizePath("/Urun/Zeytin/?a=1#x")).toBe("/urun/zeytin");
    expect(normalizePath("//evil.test")).toBeNull();
    expect(normalizePath("/a/../b")).toBeNull();
    expect(normalizePath("/<script>")).toBeNull();
    expect(normalizePath("/" + "a".repeat(250))).toBeNull();
    for (const path of ["/panel", "/panel/urunler", "/api/visit", "/giris", "/kayit", "/hesabim/siparis", "/odeme", "/sepet"]) expect(isCountablePath(path)).toBe(false);
    expect(isCountablePath("/")).toBe(true);
    expect(isCountablePath("/blog/zeytin")).toBe(true);
    expect(isCountablePath("/panelli")).toBe(true);
  });
  it("keeps only the referrer host and drops own-site referrers", () => {
    expect(referrerHost("https://www.google.com/search?q=zeytin", "shop.example.test")).toBe("google.com");
    expect(referrerHost("https://shop.example.test/blog", "shop.example.test")).toBeNull();
    expect(referrerHost("javascript:alert(1)", null)).toBeNull();
  });
  it("classifies sources, bots, devices and countries", () => {
    expect(classifySource(null, null)).toBe("direct");
    expect(classifySource("google.com", null)).toBe("google");
    expect(classifySource("l.instagram.com", null)).toBe("instagram");
    expect(classifySource(null, "instagram")).toBe("instagram");
    expect(classifySource("example.org", null)).toBe("other");
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent(desktopUa)).toBe(false);
    expect(deviceFromUserAgent(phoneUa)).toBe("mobile");
    expect(deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(deviceFromUserAgent(desktopUa)).toBe("desktop");
    expect(cleanCountry("tr")).toBe("TR");
    expect(cleanCountry("XX")).toBeNull();
    expect(cleanCountry("Turkey")).toBeNull();
  });
});

describe("daily visitor hash", () => {
  it("is stable within a day, changes with the day, ip, ua and secret, and contains no raw input", async () => {
    const a = await dailyVisitorHash(SECRET, "2026-11-21", "203.0.113.7", desktopUa);
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(await dailyVisitorHash(SECRET, "2026-11-21", "203.0.113.7", desktopUa)).toBe(a);
    expect(await dailyVisitorHash(SECRET, "2026-11-22", "203.0.113.7", desktopUa)).not.toBe(a);
    expect(await dailyVisitorHash(SECRET, "2026-11-21", "203.0.113.8", desktopUa)).not.toBe(a);
    expect(await dailyVisitorHash(SECRET, "2026-11-21", "203.0.113.7", phoneUa)).not.toBe(a);
    expect(await dailyVisitorHash(SECRET + "x", "2026-11-21", "203.0.113.7", desktopUa)).not.toBe(a);
    expect(a).not.toContain("203");
  });
  it("uses Istanbul days", () => {
    expect(istanbulDay(new Date("2026-11-20T21:30:00Z"))).toBe("2026-11-21");
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("POST /api/visit", () => {
  it("records a visit with only whitelisted, non-personal fields (no raw IP or UA stored)", async () => {
    const response = await postVisit(visit({ path: "/Blog/Zeytin?x=1", ref: "https://www.google.com/", us: "Google", um: "cpc", uc: "kasim", evil: "<script>", ip: "9.9.9.9" }));
    expect(response.status).toBe(204);
    const { rows } = await query<Record<string, unknown>>("select * from page_views");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ path: "/blog/zeytin", referrer_host: "google.com", utm_source: "google", utm_medium: "cpc", utm_campaign: "kasim", device: "desktop", country: "TR", is_bot: 0, day: istanbulDay() });
    const dump = JSON.stringify(rows) + JSON.stringify((await query("select * from \"rateLimit\"")).rows);
    expect(dump).not.toContain("203.0.113.7");
    expect(dump).not.toContain("9.9.9.9");
    expect(dump).not.toContain("Macintosh");
    expect(dump).not.toContain("script");
  });
  it("skips DNT/GPC, bots, missing UA and excluded paths without writing", async () => {
    expect((await postVisit(visit({ path: "/" }, { dnt: "1" }))).status).toBe(204);
    expect((await postVisit(visit({ path: "/" }, { "sec-gpc": "1" }))).status).toBe(204);
    expect((await postVisit(visit({ path: "/" }, { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" }))).status).toBe(204);
    expect((await postVisit(visit({ path: "/" }, { "user-agent": "" }))).status).toBe(204);
    for (const path of ["/panel", "/api/contact", "/giris", "/hesabim", "/odeme"]) expect((await postVisit(visit({ path }))).status).toBe(204);
    expect(await count()).toBe(0);
  });
  it("rejects foreign origin, bad body and oversized body", async () => {
    expect((await postVisit(visit({ path: "/" }, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await postVisit(visit({ path: "//evil" }))).status).toBe(400);
    expect((await postVisit(visit({ path: "/", pad: "x".repeat(3000) }))).status).toBe(413);
    expect(await count()).toBe(0);
  });
  it("rate limits one visitor per minute and counts distinct visitors separately", async () => {
    for (let i = 0; i < 60; i += 1) expect((await postVisit(visit({ path: "/" }))).status).toBe(204);
    expect((await postVisit(visit({ path: "/" }))).status).toBe(429);
    expect((await postVisit(visit({ path: "/" }, { "cf-connecting-ip": "198.51.100.1" }))).status).toBe(204);
    expect(await count()).toBe(61);
  });
  it("answers 503 without leaking details when the server secret is missing", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    const response = await postVisit(visit({ path: "/" }));
    expect(response.status).toBe(503);
    expect(await count()).toBe(0);
  });
});

describe("visit queries", () => {
  const today = istanbulDay();
  async function add(day: string, visitor: string, extra: Partial<{ path: string; ref: string | null; us: string | null; device: "mobile" | "desktop" | "tablet"; country: string | null }> = {}) {
    await recordVisit({ day, path: extra.path ?? "/", referrerHost: extra.ref ?? null, utmSource: extra.us ?? null, utmMedium: null, utmCampaign: null, device: extra.device ?? "desktop", country: extra.country ?? "TR", visitor });
  }
  it("summarizes views, daily unique visitors, pages, sources, countries and devices; excludes bots", async () => {
    const v1 = "a".repeat(32), v2 = "b".repeat(32);
    await add(today, v1, { path: "/", ref: "google.com" });
    await add(today, v1, { path: "/blog" });
    await add(today, v2, { path: "/", us: "instagram", device: "mobile", country: "DE" });
    await add(shiftDay(today, -3), v1, { path: "/" });
    await add(shiftDay(today, -20), v2, { path: "/" });
    await query("insert into page_views(day,path,device,visitor,is_bot) values ($1,'/','desktop',$2,1)", [today, "c".repeat(32)]);
    const week = await getVisitSummary(7);
    expect(week.totals).toEqual({ views: 4, visitors: 3 });
    expect(week.daily).toHaveLength(7);
    expect(week.daily.at(-1)).toMatchObject({ day: today, views: 3, visitors: 2 });
    expect(week.pages[0]).toEqual({ path: "/", views: 3 });
    expect(week.sources.map(item => item.kind).sort()).toEqual(["direct", "google", "instagram"]);
    expect(week.countries).toEqual([{ country: "TR", views: 3 }, { country: "DE", views: 1 }]);
    expect(week.devices).toEqual([{ device: "mobile", views: 1 }, { device: "desktop", views: 3 }]);
    expect((await getVisitSummary(1)).totals).toEqual({ views: 3, visitors: 2 });
    expect((await getVisitSummary(1)).daily).toHaveLength(7);
    expect((await getVisitSummary(30)).totals.views).toBe(5);
    expect(await getTodayVisitors()).toBe(2);
  });
  it("purges rows older than 180 days and stale rate-limit keys only", async () => {
    await add(shiftDay(today, -181), "d".repeat(32));
    await add(shiftDay(today, -179), "e".repeat(32));
    await consumeVisitAttempt("f".repeat(32), Date.now() - 2 * 24 * 60 * 60 * 1000);
    await consumeVisitAttempt("9".repeat(32));
    await purgeOldVisits();
    expect(await count()).toBe(1);
    expect((await query("select key from \"rateLimit\" where key like 'visit:%'")).rows).toHaveLength(1);
  });
});

describe("GET /api/admin/visitors", () => {
  it("requires admin and validates the period", async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new AuthCoreError(401, "unauthenticated"));
    expect((await getVisitors(new Request(`${origin}/api/admin/visitors`))).status).toBe(401);
    expect((await getVisitors(new Request(`${origin}/api/admin/visitors?period=9`))).status).toBe(400);
    const ok = await getVisitors(new Request(`${origin}/api/admin/visitors?period=today`));
    expect(ok.status).toBe(200);
    expect((await ok.json()).data).toMatchObject({ period: 1, totals: { views: 0, visitors: 0 } });
  });
});

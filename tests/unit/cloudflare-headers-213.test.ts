// @vitest-environment node
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { fixDoctypeOrder, normalizeSecurityHeaders, securityHeaders } from "@/lib/site/security-headers";

describe("Cloudflare security headers", () => {
  it("serves next.config.ts headers from the shared module in production and development", async () => {
    const [rule] = await nextConfig.headers!();
    expect(rule.headers).toEqual(securityHeaders(false));
    expect(securityHeaders(true).find(header => header.key === "Content-Security-Policy")!.value).toContain("'unsafe-eval'");
    expect(securityHeaders(false).find(header => header.key === "Content-Security-Policy")!.value).not.toContain("'unsafe-eval'");
  });
  it("keeps public/_headers (static assets on Workers) identical to the shared module", async () => {
    const file = await readFile("public/_headers", "utf8");
    for (const { key, value } of securityHeaders(false)) expect(file).toContain(`  ${key}: ${value}\n`);
    expect(file).toContain("/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable");
  });
  it("keeps the proxy's stricter Referrer-Policy instead of the merged list", () => {
    const merged = new Response("x", { headers: { "Referrer-Policy": "no-referrer, strict-origin-when-cross-origin" } });
    expect(normalizeSecurityHeaders(merged).headers.get("Referrer-Policy")).toBe("no-referrer");
  });
  it("adds only the missing security headers to redirect responses", () => {
    const redirect = normalizeSecurityHeaders(Response.redirect("https://afinazeytin.com/giris?next=%2Fhesabim", 307));
    expect(redirect.status).toBe(307);
    expect(redirect.headers.get("location")).toBe("https://afinazeytin.com/giris?next=%2Fhesabim");
    for (const { key, value } of securityHeaders(false)) expect(redirect.headers.get(key)).toBe(value);
  });
  it("returns an already complete response untouched", () => {
    const complete = new Response("x", { headers: Object.fromEntries(securityHeaders(false).map(header => [header.key, header.value])) });
    expect(normalizeSecurityHeaders(complete)).toBe(complete);
    const own = new Response("x", { headers: { ...Object.fromEntries(securityHeaders(false).map(header => [header.key, header.value])), "Referrer-Policy": "no-referrer" } });
    expect(normalizeSecurityHeaders(own).headers.get("Referrer-Policy")).toBe("no-referrer");
  });
});

describe("doctype order on Workers", () => {
  const html = (chunks: string[], type = "text/html; charset=utf-8") => new Response(new ReadableStream({ start(controller) { const encoder = new TextEncoder(); chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk))); controller.close(); } }), { headers: { "content-type": type } });
  const polyfill = '<script src="/_next/static/chunks/p.js" noModule=""></script>';
  it("moves the leading polyfill script into the head, even when split across chunks", async () => {
    const response = fixDoctypeOrder(html([polyfill + "<!DOCT", 'YPE html><html lang="tr"><he', "ad><meta charSet=\"utf-8\"/></head><body>ok</body></html>"]));
    expect(await response.text()).toBe(`<!DOCTYPE html><html lang="tr"><head>${polyfill}<meta charSet="utf-8"/></head><body>ok</body></html>`);
  });
  it("leaves correct documents, other content types and empty bodies untouched", async () => {
    const good = '<!DOCTYPE html><html><head><title>x</title></head><body>ok</body></html>';
    expect(await fixDoctypeOrder(html([good])).text()).toBe(good);
    expect(await fixDoctypeOrder(html([good.slice(0, 20), good.slice(20)])).text()).toBe(good);
    const json = html(['{"a":1}'], "application/json");
    expect(fixDoctypeOrder(json)).toBe(json);
    const empty = new Response(null, { headers: { "content-type": "text/html" } });
    expect(fixDoctypeOrder(empty)).toBe(empty);
    expect(await fixDoctypeOrder(html(["<p>fragment</p>"])).text()).toBe("<p>fragment</p>");
  });
});

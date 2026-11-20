/** Güvenlik başlıkları tek yerde: next.config.ts ve Cloudflare Worker sarmalayıcısı (worker.ts) aynı değerleri kullanır. */
// Static/RSC pages emit inline hydration scripts and JSON-LD; inlineCss and
// Motion also need inline styles. Nonces would require dynamic rendering
// on every page. Keep these narrow allowances in the enforced policy.
// PayTR uses /js/iframeResizer.min.js and https://www.paytr.com/odeme/guvenli/*
// frames; retain its exact origin for frame/form flows under enforced CSP.
export function contentSecurityPolicy(development: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.paytr.com/js/iframeResizer.min.js${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' blob:",
    "frame-src 'self' https://www.paytr.com", "form-action 'self' https://www.paytr.com",
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function securityHeaders(development: boolean): { key: string; value: string }[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy(development) },
  ];
}

export function normalizeSecurityHeaders(response: Response): Response {
  const referrer = response.headers.get("Referrer-Policy");
  const missing = securityHeaders(false).filter(header => !response.headers.has(header.key));
  const merged = referrer !== null && referrer.includes(",");
  if (!merged && missing.length === 0) return response;
  const headers = new Headers(response.headers);
  if (merged) headers.set("Referrer-Policy", referrer.split(",")[0].trim());
  for (const header of missing) headers.set(header.key, header.value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}


const preambleLimit = 64 * 1024;

/** Next 16.4.2 + OpenNext (workerd): React, `<!DOCTYPE html>` öncesine `<script noModule>` yazıyor; tarayıcı sayfayı
 * "quirks" kipinde çizip satır yüksekliklerini değiştiriyor. Doctype'tan önceki bu ek parçayı `<head>` içine taşır.
 * Yalnız HTML yanıtın başında çalışır, gövdenin geri kalanı değiştirilmeden akar. Next 16.4.5+ ile gereksiz olabilir. */
export function fixDoctypeOrder(response: Response): Response {
  if (!response.body || !(response.headers.get("content-type") ?? "").includes("text/html")) return response;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let settled = false;
  const settle = (controller: TransformStreamDefaultController<Uint8Array>) => {
    settled = true;
    const doctype = buffer.search(/<!doctype html>/i);
    if (doctype > 0 && /^\s*<script[^>]*><\/script>\s*$/i.test(buffer.slice(0, doctype))) {
      const head = /<head[^>]*>/i.exec(buffer);
      if (head && head.index > doctype) {
        const end = head.index + head[0].length;
        buffer = buffer.slice(doctype, end) + buffer.slice(0, doctype) + buffer.slice(end);
      }
    }
    controller.enqueue(encoder.encode(buffer));
    buffer = "";
  };
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      if (settled) { controller.enqueue(chunk); return; }
      buffer += decoder.decode(chunk, { stream: true });
      const starts = buffer.trimStart().slice(0, 9).toLowerCase();
      if (starts.length >= 9 && starts === "<!doctype") settle(controller);
      else if (/<head[^>]*>/i.test(buffer) || buffer.length > preambleLimit) settle(controller);
    },
    flush(controller) { if (!settled) { buffer += decoder.decode(); settle(controller); } },
  });
  return new Response(response.body.pipeThrough(transform), { status: response.status, statusText: response.statusText, headers: response.headers });
}

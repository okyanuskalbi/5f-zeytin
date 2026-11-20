// Cloudflare Worker giriş noktası: OpenNext çıktısını sarar ve Vercel'deki başlık davranışını korur.
// 1) Ara katmanın (proxy.ts) verdiği Referrer-Policy ile next.config.ts'in değeri birleşip
//    "no-referrer, strict-origin-when-cross-origin" olmasın: ilk (ara katman) değer kalır, Vercel'deki gibi.
// 2) React, doctype'tan önce <script noModule> yazıyor (Next 16.4.2 + workerd): quirks kipine düşmesin diye <head> içine taşınır.
// 3) Ara katmanın yönlendirme yanıtları (ör. /hesabim -> /giris) next.config.ts başlıklarını almıyor; eksikler eklenir.
// @ts-expect-error: .open-next çıktısı derleme sırasında oluşur
import openNext from "./.open-next/worker.js";
import { fixDoctypeOrder, normalizeSecurityHeaders } from "./lib/site/security-headers";

// @ts-expect-error: .open-next çıktısı derleme sırasında oluşur
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type WorkerEnv = Record<string, unknown>;
type WorkerContext = { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void };

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: WorkerContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === "www.afinazeytin.com") {
      url.hostname = "afinazeytin.com";
      return Response.redirect(url.toString(), 308);
    }
    return fixDoctypeOrder(normalizeSecurityHeaders(await openNext.fetch(request, env, ctx)));
  },
};

export default worker;

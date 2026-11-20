import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// Sayfa önbelleği KV'de (afina-zeytin-cache), etiket ve yol geçersiz kılma D1'de tutulur (R2 kullanılmaz).
// Arka plan yenileme sırası bellek içidir (Durable Object gerektirmez). `revalidate = 300` ve admin panelinin `revalidatePath("/")` çağrısı bu sayede Vercel'deki gibi çalışır.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
  enableCacheInterception: false,
});

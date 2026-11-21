// OpenNext'in esbuild aşaması `cloudflare:sockets` adresini çözemez. Derlemede (next.config.ts içindeki
// turbopack.resolveAlias) worker-mailer'ın bu içe aktarması bu dosyaya yönlendirilir; gerçek modül
// çalışma zamanında smtp.server.ts tarafından yüklenip globalThis'e konur.
type SocketsModule = { connect: (...args: unknown[]) => unknown };
const holder = globalThis as typeof globalThis & { __cfSockets?: SocketsModule };

export function connect(...args: unknown[]): unknown {
  if (!holder.__cfSockets) throw new Error("cloudflare:sockets is not loaded");
  return holder.__cfSockets.connect(...args);
}

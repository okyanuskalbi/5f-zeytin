import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3104");
if (!["127.0.0.1", "localhost"].includes(base.hostname)) throw new Error("Use the local acceptance server.");
const html = await (await fetch(base)).text();
const scripts = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]
  .filter(([tag]) => !/noModule/i.test(tag)).map(([, src]) => src))];
const initialScripts = await Promise.all(scripts.map(async (src) => {
  const bytes = Buffer.from(await (await fetch(new URL(src, base))).arrayBuffer());
  return { src, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
}));
const graph = (await readFile("test-results/098/bundle-graph.jsonl", "utf8")).trim().split("\n").map(JSON.parse);
const deferred = graph.filter((entry) => entry.type === "group" && entry.kind === "async" && entry.trigger_module_ident.includes("[app-client]"))
  .map((entry) => ({ module: entry.trigger_module_ident, outputs: entry.outputs }));
const result = {
  initialScripts,
  total: { count: initialScripts.length, bytes: initialScripts.reduce((sum, entry) => sum + entry.bytes, 0), gzipBytes: initialScripts.reduce((sum, entry) => sum + entry.gzipBytes, 0) },
  deferred,
  notes: ["Sizes are uncompressed and Node gzip estimates for scripts in SSR HTML; noModule and inline RSC payloads are excluded.", "The full Turbopack module graph is in bundle-graph.jsonl.", "No Lenis or third-party tracking script is installed; native scroll is retained."],
};
await writeFile("test-results/098/bundle-summary.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result.total));

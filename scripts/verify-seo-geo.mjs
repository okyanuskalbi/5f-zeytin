import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";
import { JSDOM } from "jsdom";

// Checks the built production server over HTTP, without launching a browser.
const root = new URL("../", import.meta.url);
const prerender = JSON.parse(await readFile(new URL(".next/prerender-manifest.json", root), "utf8"));
assert.equal(prerender.routes["/"].initialRevalidateSeconds, 300);
assert.equal(prerender.routes["/llms.txt"].compute, "static");
const paths = JSON.parse(await readFile(new URL(".next/server/app-paths-manifest.json", root), "utf8"));
for (const path of ["/favicon.ico/route", "/apple-icon.png/route"]) assert(paths[path], `${path}: missing from build`);

const reservation = createServer();
await new Promise(resolve => reservation.listen(0, "127.0.0.1", resolve));
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
  cwd: root, stdio: "ignore", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});
let spawnError;
server.on("error", error => { spawnError = error; });
const closed = new Promise(resolve => server.once("exit", resolve));
const origin = `http://127.0.0.1:${port}`;
let dom;
try {
  let ready = false;
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    assert(server.exitCode === null && server.signalCode === null, "Production server exited before readiness");
    try { ready = (await fetch(`${origin}/llms.txt`, { signal: AbortSignal.timeout(1000) })).ok; } catch { /* startup */ }
    if (ready) break;
    await setTimeout(200);
  }
  assert(ready, "Production server readiness timed out");
  const results = [];
  for (const path of ["/", "/llms.txt", "/favicon.ico", "/apple-icon.png", "/brand/favicon.svg"]) {
    const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-powered-by"), null, `${path}: framework signature`);
    const bytes = Buffer.from(await response.arrayBuffer());
    results.push({ path, status: response.status, type: response.headers.get("content-type"), bytes: bytes.length });
    if (path === "/") {
      assert.match(response.headers.get("cache-control"), /s-maxage=300(?:,|$)/);
      dom = new JSDOM(bytes.toString());
    } else if (path === "/llms.txt") {
      assert.match(response.headers.get("content-type"), /^text\/(markdown|plain)(;|$)/);
      const body = bytes.toString();
      assert.doesNotMatch(body, /₺|\bTRY\b|\bTL\b|\/(?:kvkk|iade|mesafeli-satis)/);
      const cards = [...dom.window.document.querySelectorAll("article[data-product-id]")];
      assert.equal(cards.length, 6);
      for (const card of cards) {
        const name = card.querySelector("h3").textContent;
        const weight = card.querySelector('[aria-label="Boy"]').textContent;
        assert(body.includes(`${name} — ${weight}`), `Missing discovery variant: ${name} / ${weight}`);
      }
    } else {
      const file = path === "/brand/favicon.svg" ? `public${path}` : `app${path}`;
      assert.deepEqual(bytes, await readFile(new URL(file, root)), `${path}: served icon differs from source`);
    }
  }
  const doc = dom.window.document;
  assert.equal(doc.title, "Afina Zeytin | Düziçi'nden Zeytin ve Zeytinyağı");
  // Next serializes an origin-only OG URL without a trailing slash.
  assert.equal(new URL(doc.querySelector('meta[property="og:url"]')?.content).href, "https://afinazeytin.com/");
  for (const [property, value] of Object.entries({ type: "website", locale: "tr_TR", site_name: "Afina Zeytin" })) {
    assert.equal(doc.querySelector(`meta[property="og:${property}"]`)?.content, value, `og:${property}`);
  }
  assert(doc.querySelector('link[rel="apple-touch-icon"][sizes="180x180"]'));
  assert(doc.querySelector('link[rel="icon"][href="/brand/favicon.svg"]'));
  console.log(JSON.stringify({ homeRevalidateSeconds: 300, frameworkSignature: false, results }, null, 2));
  console.log("PASS: production HTTP, metadata, six discovery variants, ICO/Apple/SVG icons; no browser launched.");
} finally {
  dom?.window.close();
  if (server.pid && server.exitCode === null && server.signalCode === null) {
    server.kill("SIGTERM");
    await closed;
  }
}

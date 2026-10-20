// Task 093. Local redaction only; never uploads or approves the user's photo.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import dgram from "node:dgram";

// Instrument and deny network entry points for this process. This is an
// application-level audit, not an OS packet capture. No child processes run.
const attempts = [];
const deny = (api) => () => { attempts.push(api); throw new Error(`Network forbidden: ${api}`); };
http.request = deny("http.request"); http.get = deny("http.get");
https.request = deny("https.request"); https.get = deny("https.get");
net.Socket.prototype.connect = deny("net.Socket.connect");
tls.connect = deny("tls.connect"); dgram.Socket.prototype.send = deny("dgram.send");
globalThis.fetch = deny("fetch");
syncBuiltinESMExports();
const { default: sharp } = await import("sharp");

const hash = value => createHash("sha256").update(value).digest("hex");
const source = "docs/referans/tesis/afina-zeytin-tesis-osmaniye.png";
const expected = "2ab815d27aa8ef64f367feb49f0bb4923870644e534200c7f1716239106126a3";
const bytes = await readFile(source);
if (hash(bytes) !== expected) throw new Error("Source changed; re-inspect the plate before processing.");
const plate = { left: 328, top: 656, width: 104, height: 52 };
const patch = await sharp(bytes).extract(plate).blur(24).png().toBuffer();
const redacted = await sharp(bytes).composite([{ input: patch, left: plate.left, top: plate.top }]).png().toBuffer();
const manifestPath = "public/images/generated/manifest.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const outputs = [];
await mkdir("public/images/tesis", { recursive: true });
await mkdir("test-results/093", { recursive: true });
for (const width of [2400, 1200]) {
  const height = width * 10 / 16;
  const file = `/images/tesis/tesis-osmaniye-${width}.webp`;
  const output = await sharp(redacted).resize(width, height, { fit: "cover", position: "centre" }).webp({ quality: 86 }).toBuffer();
  await writeFile(`public${file}`, output);
  outputs.push({ id: `tesis-osmaniye-${width}`, file, sha256: hash(output), width, height, aspectRatio: "16:10",
    model: "sharp/local-blur", promptId: "TASK-093", representative: false,
    references: [{ file: source, sha256: expected }], status: "candidate", approval: null, runtime: false });
}
manifest.assets = [...manifest.assets.filter(asset => !outputs.some(output => output.id === asset.id)), ...outputs];
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const receipt = { source, sourceSha256: expected, sourceUnchanged: hash(await readFile(source)) === expected,
  note: "kullanıcının kendi fotoğrafı, plaka bulanık", status: "candidate", runtime: false,
  operation: { tool: "sharp", plate, blurSigma: 24, resize: "16:10 centre crop" },
  network: { guard: "Node HTTP/HTTPS/TCP/TLS/UDP/fetch denied and instrumented", attempts, uploads: 0 }, outputs };
await writeFile("test-results/093/media-preparation.json", `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);

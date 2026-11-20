import { spawnSync } from "node:child_process";

export const databaseName = "afina-zeytin";

/** Hedef açıkça seçilir: --local (yerel D1 kopyası) ya da --remote (Cloudflare). Varsayılan yoktur. */
export function parseTarget(args) {
  const flags = args.filter(arg => arg === "--local" || arg === "--remote");
  if (flags.length !== 1) throw new Error("Specify exactly one of --local or --remote");
  return { remote: flags[0] === "--remote", rest: args.filter(arg => arg !== flags[0]) };
}

export function executeArguments(target, input) {
  const base = ["wrangler", "d1", "execute", databaseName, target.remote ? "--remote" : "--local", "--json"];
  if (input.file) return [...base, "--file", input.file];
  return [...base, "--command", input.command];
}

/** SQLite metin değeri: tek tırnaklar ikiye katlanır, denetim karakterleri reddedilir. */
export function sqlText(value) {
  if (typeof value !== "string" || /[\u0000-\u001f]/.test(value)) throw new Error("Invalid SQL text value");
  return `'${value.replaceAll("'", "''")}'`;
}

/** Wrangler çalıştırıcısı; Cloudflare anahtarı çağıranın ortam değişkenidir ve hiçbir yere yazdırılmaz. */
export function execute(target, input, run = spawnSync) {
  const result = run("npx", executeArguments(target, input), { encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error("D1 command failed");
  const parsed = JSON.parse(result.stdout);
  return Array.isArray(parsed) ? parsed : [parsed];
}

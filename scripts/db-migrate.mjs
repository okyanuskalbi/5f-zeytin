import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { databaseName, parseTarget } from "./d1.mjs";

const migrationsDirectory = new URL("../db/d1/", import.meta.url);

/** db/d1 dosyaları sıralıdır; uygulananlar wrangler'ın d1_migrations tablosunda izlenir (tekrar çalıştırmak güvenlidir). */
export function listMigrations(directory = migrationsDirectory) {
  const names = readdirSync(directory).filter(name => /^\d{4}_[\w-]+\.sql$/.test(name)).sort();
  names.forEach((name, index) => {
    if (Number(name.slice(0, 4)) !== index + 1) throw new Error(`Migration numbering has a gap: ${name}`);
  });
  return names;
}

export function migrateArguments(args) {
  const target = parseTarget(args);
  if (target.rest.length) throw new Error("Use db:migrate -- --local|--remote");
  return ["wrangler", "d1", "migrations", "apply", databaseName, target.remote ? "--remote" : "--local"];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    listMigrations();
    const result = spawnSync("npx", migrateArguments(process.argv.slice(2)), { stdio: "inherit", env: process.env });
    process.exitCode = result.status ?? 1;
  } catch {
    // Sürücü hataları anahtar ya da adres içerebilir; yalnız genel mesaj yazılır.
    console.error("Database migration failed. Use --local or --remote and check migration files.");
    process.exitCode = 1;
  }
}

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");

/** Same sweep as `rg -o 'var\(--sf-radius-[a-z-]+' app components`, without needing rg on PATH. */
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(css|tsx?|mjs)$/.test(entry.name) ? [file] : [];
  });
}

it("Task204 tokens: Altın Dal colours and the six-corner table are the only radius source", () => {
  for (const [name, value] of Object.entries({
    "--sf-green-deep": "#1A2B1E", "--sf-olive": "#5C6B3A", "--sf-sage": "#E7EBDD",
    "--sf-gold-deep": "#80602D", "--sf-radius-pill": "999px", "--sf-radius-card": "24px",
    "--sf-radius-field": "12px", "--sf-radius-hero": "32px",
  })) expect(css, name).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
  for (const dead of ["--sf-radius-action", "--sf-radius-button", "--sf-radius-harvest", "--sf-radius-cart-card", "--sf-radius-drawer", "--sf-radius-video"]) {
    expect(css, dead).not.toContain(dead);
  }
  const used = [...new Set(["app", "components"].flatMap(sourceFiles)
    .flatMap(file => readFileSync(file, "utf8").match(/var\(--sf-radius-[a-z-]+/g) ?? []))];
  expect(used.length).toBeGreaterThan(0);
  expect(used.filter(token => !/pill|card|field|round|hero|arch/.test(token))).toEqual([]);
});

it("Task204 corners: storefront styles carry no raw pixel radius", () => {
  const raw = sourceFiles("components/storefront").filter(file => file.endsWith(".css"))
    .flatMap(file => readFileSync(file, "utf8").split("\n")
      .filter(line => /border-radius:\s*[0-9]/.test(line)).map(line => `${file}: ${line.trim().slice(0, 80)}`));
  expect(raw).toEqual([]);
});

it("Task204 fonts: Cormorant and Montserrat replace the rejected pair, with Turkish glyphs", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  expect(layout).toMatch(/Cormorant/);
  expect(layout).toMatch(/Montserrat/);
  expect(layout).toMatch(/latin-ext/);
  expect(layout).toMatch(/lang="tr"/);
  expect(layout).not.toMatch(/Fraunces|Figtree|Inter-tr/);
  expect(css).toMatch(/--font-display:\s*var\(--font-cormorant\)/);
  expect(css).toMatch(/--font-body:\s*var\(--font-montserrat\)/);
  expect(css).not.toMatch(/Fraunces|Figtree|"SOFT"/);
});

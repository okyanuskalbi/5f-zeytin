// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthCookieOptions } from "@/lib/auth/config";

const root = fileURLToPath(new URL("../../", import.meta.url));
const files = ["app", "components", "lib"].flatMap(directory =>
  readdirSync(join(root, directory), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name))
    .map(entry => join(entry.parentPath, entry.name)));

afterEach(() => vi.unstubAllEnvs());

describe("server-only auth cookie boundary", () => {
  it.each(["development", "test", "production"])("keeps auth cookies HttpOnly in %s", environment => {
    vi.stubEnv("NODE_ENV", environment);
    expect(getAuthCookieOptions()).toEqual({
      httpOnly: true, path: "/", sameSite: "lax", secure: environment === "production",
    });
  });

  it("removes the browser auth wrapper", () => {
    expect(existsSync(join(root, "lib/auth/client.ts"))).toBe(false);
  });

  it("has no browser Supabase auth client or SSR imports in client modules", () => {
    expect(files.length).toBeGreaterThan(0);
    const violations = files.flatMap(file => {
      const text = readFileSync(file, "utf8");
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      const client = source.statements.some(statement => ts.isExpressionStatement(statement) &&
        ts.isStringLiteral(statement.expression) && statement.expression.text === "use client");
      const ssrImport = source.statements.some(statement => ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === "@supabase/ssr");
      return /\bcreateBrowserClient\b/.test(text) || (client && ssrImport) ? [relative(root, file)] : [];
    });
    expect(violations).toEqual([]);
  });
});

import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { build } from "vite";

export const adminProductsFixturePath = "/__admin-products-fixture/";
let fixture: Promise<{ assets: Map<string, string | Buffer>; html: string }> | undefined;

export async function compileAdminProductsFixture() {
  fixture ??= (async () => {
    const root = fileURLToPath(new URL("../../..", import.meta.url));
    const result = await build({ configFile: false, root, base: adminProductsFixturePath, publicDir: false, envDir: false, logLevel: "error",
      resolve: { alias: { "@": root } }, define: { "process.env": JSON.stringify({ NODE_ENV: "production" }) },
      build: { write: false, rollupOptions: { input: fileURLToPath(new URL("../fixtures/admin-products.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed admin products fixture.");
    const assets = new Map(bundle.output.map(entry => [entry.fileName, entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    const html = [...assets.keys()].find(name => name.endsWith("admin-products.html"));
    if (!html) throw new Error("Missing admin products fixture HTML.");
    return { assets, html };
  })();
  return fixture;
}

export async function serveAdminProductsFixture(page: Page) {
  const { assets, html } = await compileAdminProductsFixture();
  await page.route("**/__admin-products-fixture/**", async route => {
    const name = new URL(route.request().url()).pathname.replace(adminProductsFixturePath, "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
}

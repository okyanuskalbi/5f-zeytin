import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { build } from "vite";

export const adminShellFixturePath = "/__admin-shell-fixture/";
let fixture: Promise<{ assets: Map<string, string | Buffer>; html: string }> | undefined;

/** Compile real client components in memory; never fake a server auth cookie. */
export async function serveAdminShellFixture(page: Page) {
  fixture ??= (async () => {
    const root = fileURLToPath(new URL("../../..", import.meta.url));
    const result = await build({ configFile: false, root, base: adminShellFixturePath, publicDir: false, envDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      define: { "process.env": JSON.stringify({ NODE_ENV: "production" }) },
      build: { write: false, rollupOptions: { input: fileURLToPath(new URL("../fixtures/admin-shell.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed admin shell fixture bundle.");
    const assets = new Map(bundle.output.map(entry => [entry.fileName, entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    const html = [...assets.keys()].find(name => name.endsWith("admin-shell.html"));
    if (!html) throw new Error("Missing admin shell fixture HTML.");
    return { assets, html };
  })();
  const { assets, html } = await fixture;
  await page.route("**/__admin-shell-fixture/**", async route => {
    const name = new URL(route.request().url()).pathname.replace(adminShellFixturePath, "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
}

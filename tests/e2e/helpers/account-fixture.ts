import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { build } from "vite";

export const accountFixturePath = "/__account-fixture/";
let fixture: Promise<{ assets: Map<string, string | Buffer>; html: string }> | undefined;

/** Compile real client components in memory; never fake a server auth cookie. */
export async function serveAccountFixture(page: Page) {
  fixture ??= (async () => {
    const root = fileURLToPath(new URL("../../..", import.meta.url));
    const result = await build({ configFile: false, root, base: accountFixturePath, publicDir: false, envDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      define: { "process.env": JSON.stringify({ NODE_ENV: "production", NEXT_PUBLIC_DEMO: "1" }) },
      build: { write: false, rollupOptions: { input: fileURLToPath(new URL("../fixtures/account.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed account fixture bundle.");
    const assets = new Map(bundle.output.map(entry => [entry.fileName, entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    const html = [...assets.keys()].find(name => name.endsWith("account.html"));
    if (!html) throw new Error("Missing account fixture HTML.");
    return { assets, html };
  })();
  const { assets, html } = await fixture;
  await page.route("**/__account-fixture/**", async route => {
    const name = new URL(route.request().url()).pathname.replace(accountFixturePath, "") || html;
    const body = assets.get(name);
    await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
  });
}

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// A fresh local production build is required. Never reuse a user's server/browser.
const root = fileURLToPath(new URL("../", import.meta.url));
const logArgument = process.argv.find(argument => argument.startsWith("--log="));
const logPath = resolve(root, logArgument?.slice(6) ?? "output/task185-2-browser.log");
assert(logPath.startsWith(resolve(root, "output") + "/"));
mkdirSync(dirname(logPath), { recursive: true });
mkdirSync(resolve(root, "output/tmp"), { recursive: true });
const runtimeTmp = mkdtempSync(resolve(root, "output/tmp/task185-2-"));
process.env.TMPDIR = runtimeTmp;
writeFileSync(logPath, `Measurement source\n${readFileSync(fileURLToPath(import.meta.url), "utf8")}\nMeasurements\n`);
const report = value => {
  const line = JSON.stringify(value);
  appendFileSync(logPath, line + "\n");
  console.log(line);
};
const listener = createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const port = listener.address().port;
await new Promise((done, fail) => listener.close(error => error ? fail(error) : done()));
const server = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: root, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", chunk => { serverOutput += chunk; });
server.stderr.on("data", chunk => { serverOutput += chunk; });
const stopped = once(server, "exit");
let browser;
const failures = [];
try {
  const url = `http://127.0.0.1:${port}/bayilik`;
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw Error("Local server exited before acceptance");
    try { ready = (await fetch(url)).ok; } catch { /* The new server is starting. */ }
    if (ready) break;
    await new Promise(done => setTimeout(done, 250));
  }
  assert(ready, "Local server must become ready");
  browser = await chromium.launch({ headless: true });
  report({ browser: "packaged headless Chromium", workers: 1, deviceScaleFactor: 1, buildId: readFileSync(resolve(root, ".next/BUILD_ID"), "utf8").trim() });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    try {
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      await page.goto(url, { waitUntil: "networkidle" });
      const section = page.locator('section[aria-labelledby="bayilik-neden-title"]');
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('section[aria-labelledby="bayilik-neden-title"] img')].map(image => image.decode()));
        await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
      });
      const measurement = await page.evaluate(async () => {
        const pictures = [...document.querySelectorAll('section[aria-labelledby="bayilik-neden-title"] figure img')];
        const images = await Promise.all(pictures.map(async image => {
          const rect = image.getBoundingClientRect();
          const style = getComputedStyle(image);
          const inset = side => parseFloat(style[`border${side}Width`]) + parseFloat(style[`padding${side}`]);
          const contentWidth = rect.width - inset("Left") - inset("Right");
          const contentHeight = rect.height - inset("Top") - inset("Bottom");
          const bitmap = new Image();
          bitmap.src = image.currentSrc;
          await bitmap.decode();
          // Raw bitmap dimensions preserve aspect ratio without the integer
          // rounding of density-corrected img.naturalWidth/naturalHeight.
          const scale = Math.min(contentWidth / bitmap.naturalWidth, contentHeight / bitmap.naturalHeight);
          const visibleWidth = bitmap.naturalWidth * scale;
          const visibleHeight = bitmap.naturalHeight * scale;
          // 'object-position: bottom' computes to '50% 100%'. Retain the old
          // centered placement in RED measurements instead of assuming alignment.
          const positionY = style.objectPosition.split(" ")[1] ?? "50%";
          if (!/^\d+(?:\.\d+)?%$/.test(positionY)) throw Error("Expected percentage object-position");
          const top = rect.top + inset("Top") + (contentHeight - visibleHeight) * parseFloat(positionY) / 100;
          return {
            label: image.closest("figure").querySelector("strong").textContent,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom },
            containVisibleRect: { width: visibleWidth, height: visibleHeight, top, bottom: top + visibleHeight },
            naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
            bitmapWidth: bitmap.naturalWidth, bitmapHeight: bitmap.naturalHeight,
            currentSrc: new URL(image.currentSrc).pathname, sizes: image.sizes,
            objectFit: style.objectFit, objectPosition: style.objectPosition,
          };
        }));
        return { images, overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth };
      });
      const ratio = measurement.images[0].containVisibleRect.height / measurement.images[1].containVisibleRect.height;
      const bottoms = measurement.images.map(image => image.containVisibleRect.bottom);
      const bottomSpread = Math.max(...bottoms) - Math.min(...bottoms);
      const checks = {
        heightRatio: ratio >= .9,
        sourceWidth: measurement.images.every(image => image.naturalWidth + .5 >= image.containVisibleRect.width && image.bitmapWidth + .5 >= image.containVisibleRect.width),
        alignedBottoms: bottomSpread <= 1,
        noOverflow: measurement.overflow === 0,
        noPageErrors: pageErrors.length === 0,
      };
      await section.screenshot({ path: logPath.replace(/\.log$/, `-${viewport.width}.png`) });
      report({ viewport, ...measurement, heightRatio: ratio, bottomSpread, pageErrors, checks });
      for (const [check, pass] of Object.entries(checks)) if (!pass) failures.push(`${viewport.width}: ${check}`);
    } finally { await context.close(); }
  }
  report({ result: failures.length ? "FAIL" : "PASS", failures });
  assert.equal(failures.length, 0, failures.join(", "));
} finally {
  try { if (browser) await browser.close(); }
  finally {
    if (server.exitCode === null) server.kill("SIGTERM");
    await stopped;
    rmSync(runtimeTmp, { recursive: true, force: true });
    appendFileSync(logPath, `\nLocal server output\n${serverOutput}\nCleanup: browser.close(), contexts closed, server SIGTERM and awaited exit; generated browser profile removed.\n`);
  }
}

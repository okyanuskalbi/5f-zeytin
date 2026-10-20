import { readFile, writeFile } from "node:fs/promises";

const files = process.argv.slice(2);
if (files.length !== 3) throw new Error("Pass exactly three Lighthouse mobile JSON reports.");
const runs = await Promise.all(files.map(async (file) => {
  const report = JSON.parse(await readFile(file, "utf8"));
  if (report.runtimeError) throw new Error(`${file}: ${report.runtimeError.message}`);
  if (report.configSettings.formFactor !== "mobile" || report.configSettings.throttlingMethod !== "simulate") {
    throw new Error(`${file}: mobile simulated throttling is required.`);
  }
  const breakdown = report.audits["lcp-breakdown-insight"].details.items;
  const metrics = report.audits.metrics.details.items[0];
  return {
    file, lighthouseVersion: report.lighthouseVersion, settings: report.configSettings,
    performance: report.categories.performance.score * 100,
    accessibility: report.categories.accessibility.score * 100,
    lcp: report.audits["largest-contentful-paint"].numericValue,
    cls: report.audits["cumulative-layout-shift"].numericValue,
    lcpElement: breakdown.find((item) => item.type === "node"),
    // Insight timings are observed trace timings, not the simulated LCP.
    observedBreakdown: breakdown.find((item) => item.type === "table")?.items,
    simulatedBreakdown: {
      ttfb: metrics.timeToFirstByte, loadDelay: metrics.lcpLoadDelay ?? 0,
      loadDuration: metrics.lcpLoadDuration ?? 0,
    },
    scriptBytes: report.audits["network-requests"].details.items.filter((entry) => entry.resourceType === "Script").reduce((sum, entry) => sum + entry.transferSize, 0),
  };
}));
for (const run of runs) {
  for (const key of ["throttling", "screenEmulation", "blockedUrlPatterns"]) {
    if (JSON.stringify(run.settings[key]) !== JSON.stringify(runs[0].settings[key])) throw new Error("Lighthouse settings must match across all three runs.");
  }
}
const median = (key) => runs.map((run) => run[key]).sort((a, b) => a - b)[1];
const medians = Object.fromEntries(["performance", "accessibility", "lcp", "cls"].map((key) => [key, median(key)]));
const pass = medians.performance >= 85 && medians.accessibility >= 95 && medians.lcp < 2500 && medians.cls < 0.1;
const result = { pass, medians, runs };
await writeFile("test-results/098/lighthouse-summary.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ pass, medians }, null, 2));
if (!pass) process.exitCode = 1;

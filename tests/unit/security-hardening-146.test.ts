// @vitest-environment node
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Vercel production demo build guard", () => {
  it("rejects demo mode as soon as the production config loads", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO", "1");
    await expect(import("@/next.config")).rejects.toThrow(
      "Vercel production ortamında demo modu açılamaz. NEXT_PUBLIC_DEMO=1 ayarını kaldırın.",
    );
  });

  it.each([
    ["production", "0"], ["preview", "1"], ["preview", "0"],
    ["production", undefined], [undefined, "1"], ["development", "1"],
  ])("loads with VERCEL_ENV=%s and NEXT_PUBLIC_DEMO=%s", async (environment, demo) => {
    // A local next build/start uses production NODE_ENV too; E2E must keep demo mode.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", environment);
    vi.stubEnv("NEXT_PUBLIC_DEMO", demo);
    await expect(import("@/next.config")).resolves.toHaveProperty("default");
  });
});

describe("API production deployment boundary", () => {
  it("keeps Vercel credentials and publication out of GitHub verification", async () => {
    const workflow = await readFile(new URL("../../.github/workflows/vercel-yayin.yml", import.meta.url), "utf8");
    expect(workflow).not.toMatch(/VERCEL_TOKEN|secrets\.|npx\s+.*vercel|deploy --|rm -rf \.git/);
    expect(workflow).toContain("permissions:\n  contents: read");
    for (const command of ["lint", "typecheck", "build"]) expect(workflow).toContain(`npm run ${command}`);
    expect(workflow).toContain("npm test -- --maxWorkers=2 --testTimeout=30000");
  });

  it("uses the package manager for ffmpeg, the lockfile and pinned actions", async () => {
    const workflow = await readFile(new URL("../../.github/workflows/vercel-yayin.yml", import.meta.url), "utf8");
    expect(workflow).not.toMatch(/johnvansickle|\bcurl\b|\btar\b|sudo cp|npm install/);
    expect(workflow).toContain("command -v ffmpeg || (sudo apt-get update && sudo apt-get install -y ffmpeg)");
    expect(workflow).toMatch(/- run: npm ci\b/);
    expect(workflow).toMatch(/uses: actions\/checkout@[a-f0-9]{40} # v4/);
    expect(workflow).toMatch(/uses: actions\/setup-node@[a-f0-9]{40} # v4/);
    expect(workflow).toContain("branches: [main]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain('ASSET_SKIP_REENCODE: "1"');
  });

  it.each(["", "task146-test-only"])("always runs verification without publishing, regardless of an ambient token (%#)", async token => {
    const workflow = await readFile(new URL("../../.github/workflows/vercel-yayin.yml", import.meta.url), "utf8");
    const commands = [...workflow.matchAll(/^\s+(?:- )?run: (npm .+)$/gm)].map(match => match[1]);
    expect(commands).toEqual([
      "npm ci --no-audit --no-fund", "npm run lint", "npm run typecheck",
      "npm test -- --maxWorkers=2 --testTimeout=30000", "npm run build",
    ]);
    // Execute the actual verification shell with network-free command stubs.
    // An ambient legacy secret must neither skip validation nor invoke a publisher.
    const script = 'npm() { printf "%s\\n" "$*"; }\nnpx() { echo unexpected-publisher; exit 99; }\n' + commands.join("\n");
    const output = execFileSync("bash", ["-e", "-o", "pipefail", "-c", script], {
      env: { ...process.env, VERCEL_TOKEN: token }, encoding: "utf8",
    });
    expect(output.trim().split("\n")).toEqual(commands.map(command => command.slice(4)));
    expect(output).not.toContain("unexpected-publisher");
  });
});

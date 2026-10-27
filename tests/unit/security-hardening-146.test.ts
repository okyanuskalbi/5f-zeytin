// @vitest-environment node
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
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

describe("production deployment workflow", () => {
  it("restricts the token to the three Vercel steps", async () => {
    const workflow = await readFile(new URL("../../.github/workflows/vercel-yayin.yml", import.meta.url), "utf8");
    const [configuration, stepSource] = workflow.split("    steps:\n");
    const steps = stepSource.split(/(?=^      - )/m);
    expect(configuration).not.toMatch(/VERCEL_TOKEN/);
    const tokenSteps = steps.filter(step => /^\s+VERCEL_TOKEN:/m.test(step));
    expect(tokenSteps).toHaveLength(3);
    for (const command of ["pull", "build", "deploy"]) {
      const step = tokenSteps.find(step => step.includes(`vercel@65.0.0 ${command}`));
      expect(step).toBeDefined();
      expect(step).toMatch(/^        env:\n(?:          .+\n)*          VERCEL_TOKEN: \$\{\{ secrets\.VERCEL_TOKEN \}\}/m);
    }
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
    expect(workflow).toContain("deploy --prebuilt --prod");
    expect(workflow).toContain("--environment=production");
  });

  it.each(["", "task146-test-only"])("preserves optional deployment with token presence (%#)", async token => {
    const workflow = await readFile(new URL("../../.github/workflows/vercel-yayin.yml", import.meta.url), "utf8");
    const steps = workflow.split("    steps:\n")[1].split(/(?=^      - )/m);
    const pull = steps.find(step => step.includes("vercel@65.0.0 pull"));
    const script = pull?.match(/^        run: \|\n((?:^          .*\n)+)/m)?.[1].replace(/^          /gm, "");
    expect(script).toBeDefined();
    // Stub the CLI: this checks the actual workflow shell without network or credentials.
    const directory = await mkdtemp(join(process.cwd(), ".task146-"));
    try {
      const outputPath = join(directory, "github-output");
      const output = execFileSync("bash", ["-e", "-o", "pipefail", "-c", `npx() { echo vercel-called; }\n${script}`], {
        env: { ...process.env, VERCEL_TOKEN: token, GITHUB_OUTPUT: outputPath }, encoding: "utf8",
      });
      expect(await readFile(outputPath, "utf8")).toBe(`enabled=${Boolean(token)}\n`);
      expect(output.includes("vercel-called")).toBe(Boolean(token));
    } finally { await rm(directory, { recursive: true, force: true }); }
    expect(pull).toContain("id: vercel");
    for (const command of ["build", "deploy"]) {
      expect(steps.find(step => step.includes(`vercel@65.0.0 ${command}`)))
        .toContain("if: steps.vercel.outputs.enabled == 'true'");
    }
    expect(steps.find(step => step.includes("name: Token yok uyarısı")))
      .toContain("if: steps.vercel.outputs.enabled == 'false'");
  });
});

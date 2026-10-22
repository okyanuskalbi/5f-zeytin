// @vitest-environment node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import sharp from "sharp";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { scripts } from "../../package.json";

interface Options {
  root: string;
  id?: string;
  mode?: "all" | "candidate" | "approved";
}

interface Decision {
  recordId: string;
  assetId: string;
  sha256: string;
  decision: "approved" | "rejected";
  decidedAt: string;
  evidenceRef: string;
}

interface Asset {
  id: string;
  file: string;
  sha256: string;
  width: number;
  height: number;
  aspectRatio: string;
  model: string;
  promptId: string;
  representative: boolean;
  references: { file: string; sha256: string }[];
  status: "candidate" | "approved" | "rejected";
  approval: { recordId: string; decidedAt: string } | null;
  runtime?: boolean;
}

let checkAssets: (options: Options) => Promise<{ checked: number; mode: string }>;
let parseArgs: (args: string[]) => { id?: string; mode: string };
let root: string;
let asset: Asset;
let decisions: Decision[];
let image: Buffer;
const projectRoot = resolve(import.meta.dirname, "../..");
const checkerPath = join(projectRoot, "scripts/check-assets.mjs");
const digest = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

async function put(file: string, content: string | Buffer) {
  const target = join(root, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function save(assets: unknown[] = [asset]) {
  await put("public/images/generated/manifest.json", JSON.stringify({ version: 1, assets }));
  await put("docs/gorsel-onay.md", `# Görsel kararları\n\n\`\`\`json asset-decisions\n${JSON.stringify({ version: 1, decisions })}\n\`\`\`\n`);
}

function approve() {
  const decidedAt = "2026-10-19T10:00:00.000Z";
  asset = { ...asset, status: "approved", approval: { recordId: "decision-p01-v1", decidedAt } };
  decisions = [{ recordId: "decision-p01-v1", assetId: asset.id, sha256: asset.sha256,
    decision: "approved", decidedAt, evidenceRef: "user-message-asset-p01-v1" }];
}

beforeAll(async () => {
  ({ checkAssets, parseArgs } = await import(checkerPath));
  image = await sharp({ create: { width: 160, height: 90, channels: 3, background: "#243A29" } }).png().toBuffer();
});

beforeEach(async () => {
  await mkdir(join(projectRoot, ".cache"), { recursive: true });
  root = await mkdtemp(join(projectRoot, ".cache/asset-registry-"));
  const reference = "# P01\nSynthetic test prompt, no generation request.\n";
  asset = { id: "p01", file: "/images/generated/p01/candidate.png", sha256: digest(image),
    width: 160, height: 90, aspectRatio: "16:9", model: "openai/gpt-image-2.5-flare",
    promptId: "P01", representative: true,
    references: [{ file: "docs/visual-prompts.md", sha256: digest(reference) }], status: "candidate", approval: null };
  decisions = [];
  await put(`public${asset.file}`, image);
  await put("docs/visual-prompts.md", reference);
  await put("app/page.tsx", 'export default function Page() { return <main>Afina</main>; }');
  await save();
});

afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

describe("Task 129 horizontal logo derivatives", () => {
  it("accepts only the pinned source and its exact approved letter-color derivatives", async () => {
    const sourceFile = "docs/referans/logolar/afina-zeytin-yatay.svg";
    const source = await readFile(join(projectRoot, sourceFile));
    await put(sourceFile, source);
    for (const tone of ["", "-dark"]) for (const scale of [2, 3]) {
      const file = `public/brand/afina-zeytin-yatay${tone}@${scale}x.webp`;
      await put(file, await readFile(join(projectRoot, file)));
    }
    const output = "public/brand/afina-zeytin-yatay-dark@2x.webp";
    await put("components/BrandLogo.tsx", '<picture><source srcSet="/brand/afina-zeytin-yatay-dark@2x.webp 2x, /brand/afina-zeytin-yatay-dark@3x.webp 3x" /><img src="/brand/afina-zeytin-yatay-dark@2x.webp" /></picture>');
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    await put(sourceFile, Buffer.concat([source, Buffer.from("\n")]));
    await expect(checkAssets({ root })).rejects.toThrow(/logo|source|kaynak|artwork/i);
    await put(sourceFile, source);
    await put(output, image);
    await expect(checkAssets({ root })).rejects.toThrow(/logo|source|kaynak|artwork/i);
  });
});

describe("asset registry CLI", () => {
  it("supports exact ID and mutually exclusive candidate/approved modes", () => {
    expect(parseArgs([])).toEqual({ mode: "all" });
    expect(parseArgs(["--id", "p01", "--candidate"])).toEqual({ id: "p01", mode: "candidate" });
    expect(parseArgs(["--approved", "--id", "p01"])).toEqual({ id: "p01", mode: "approved" });
    for (const args of [["--unknown"], ["--id"], ["--id", "--candidate"], ["--candidate", "--approved"], ["--candidate", "--candidate"], ["--id", "p01", "--id", "p02"]]) {
      expect(() => parseArgs(args)).toThrow();
    }
  });

  it("validates an empty initial registry without network or generation", async () => {
    await rm(join(root, "public/images/generated/p01"), { recursive: true });
    await save([]);
    await expect(checkAssets({ root, mode: "candidate" })).resolves.toEqual({ checked: 0, mode: "candidate" });
    const result = spawnSync(process.execPath, [checkerPath, "--candidate"], { cwd: root, encoding: "utf8", timeout: 15000 });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("0");
    const failure = spawnSync(process.execPath, [checkerPath, "--id", "missing"], { cwd: root, encoding: "utf8", timeout: 15000 });
    expect(failure.status).toBe(1);
    expect(failure.stderr).toContain("missing");
  });

  it("runs the guard before both dev and production builds", async () => {
    const current = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8")).scripts;
    expect(current["check:assets"]).toBe("node scripts/check-assets.mjs && node scripts/check-v3-assets.mjs");
    expect(current.prebuild).toBe("npm run check:assets");
    expect(current.predev).toBe("npm run check:assets");
    expect(scripts.build).toBe("next build");
  });
});

describe("asset metadata and source integrity", () => {
  it("registers local facility candidates but rejects their runtime use before user approval", async () => {
    asset = { ...asset, id: "tesis-2400", file: "/images/tesis/tesis-2400.png", representative: false, runtime: false };
    await put(`public${asset.file}`, image);
    await rm(join(root, "public/images/generated/p01"), { recursive: true });
    await save();
    await expect(checkAssets({ root, id: asset.id, mode: "candidate" })).resolves.toEqual({ checked: 1, mode: "candidate" });
    await put("components/Facility.tsx", '<img src="/images/tesis/tesis-2400.png" alt="Tesis" />');
    await expect(checkAssets({ root })).rejects.toThrow(/onaysız/i);
  });

  it("rejects unregistered facility derivatives", async () => {
    await put("public/images/tesis/unregistered.webp", image);
    await save();
    await expect(checkAssets({ root })).rejects.toThrow(/kayıtsız/i);
  });

  it("validates candidate bytes, dimensions, ratio, provenance and representative label", async () => {
    await expect(checkAssets({ root, id: "p01", mode: "candidate" })).resolves.toEqual({ checked: 1, mode: "candidate" });
  });

  it("rejects a missing file", async () => {
    await rm(join(root, `public${asset.file}`));
    await expect(checkAssets({ root })).rejects.toThrow(/dosya/i);
  });

  it("rejects replacement bytes even when the filename is unchanged", async () => {
    await put(`public${asset.file}`, Buffer.concat([image, Buffer.from("changed")]));
    await expect(checkAssets({ root })).rejects.toThrow(/hash/i);
  });

  it.each([
    ["sha256", "invalid"], ["width", 161], ["height", 91], ["aspectRatio", "9:16"],
    ["model", ""], ["promptId", ""], ["representative", "true"], ["status", "invalid"],
    ["references", []], ["file", "/images/generated/../private.png"],
  ])("rejects invalid %s metadata", async (key, value) => {
    await save([{ ...asset, [key]: value }]);
    await expect(checkAssets({ root })).rejects.toThrow();
  });

  it("rejects a disguised non-image file", async () => {
    await put(`public${asset.file}`, "not an image");
    await save([{ ...asset, sha256: digest("not an image") }]);
    await expect(checkAssets({ root })).rejects.toThrow(/görsel/i);
  });

  it("rejects changed or missing references", async () => {
    await put("docs/visual-prompts.md", "changed prompt");
    await expect(checkAssets({ root })).rejects.toThrow(/hash/i);
    await rm(join(root, "docs/visual-prompts.md"));
    await expect(checkAssets({ root })).rejects.toThrow(/dosya/i);
  });

  it("rejects unregistered files and duplicate IDs or output paths", async () => {
    await put("public/images/generated/extra.png", image);
    await expect(checkAssets({ root })).rejects.toThrow(/kayıtsız/i);
    await rm(join(root, "public/images/generated/extra.png"));
    await save([asset, asset]);
    await expect(checkAssets({ root })).rejects.toThrow(/tekrar/i);
    await save([asset, { ...asset, id: "p02" }]);
    await expect(checkAssets({ root })).rejects.toThrow(/tekrar/i);
  });

  it("rejects symlinked assets and source directories", async () => {
    await rm(join(root, `public${asset.file}`));
    await symlink(join(root, "docs/visual-prompts.md"), join(root, `public${asset.file}`));
    await expect(checkAssets({ root })).rejects.toThrow(/sembolik/i);
    await rm(join(root, `public${asset.file}`));
    await put(`public${asset.file}`, image);
    await symlink(join(root, "docs"), join(root, "components"));
    await expect(checkAssets({ root })).rejects.toThrow(/sembolik/i);
  });

  it("rejects unknown public fields and personally identifying values", async () => {
    await save([{ ...asset, approvedBy: "private@example.test" }]);
    await expect(checkAssets({ root })).rejects.toThrow(/alan/i);
    await save([{ ...asset, model: "private@example.test" }]);
    await expect(checkAssets({ root })).rejects.toThrow();
  });

  it("rejects malformed manifests and invalid ID/mode selections", async () => {
    await put("public/images/generated/manifest.json", "{");
    await expect(checkAssets({ root })).rejects.toThrow(/JSON/i);
    await put("public/images/generated/manifest.json", JSON.stringify({ version: 2, assets: [] }));
    await expect(checkAssets({ root })).rejects.toThrow(/version/i);
    await save();
    await expect(checkAssets({ root, id: "absent" })).rejects.toThrow(/absent/i);
    await expect(checkAssets({ root, id: "p01", mode: "approved" })).rejects.toThrow(/approved/i);
  });
});

describe("user decision records", () => {
  it("allows an approved image only with a matching separate decision record", async () => {
    approve();
    await save();
    await put("components/Hero.tsx", `export const hero = "${asset.file}";`);
    await expect(checkAssets({ root, id: "p01", mode: "approved" })).resolves.toEqual({ checked: 1, mode: "approved" });
    await expect(checkAssets({ root, mode: "candidate" })).resolves.toEqual({ checked: 0, mode: "candidate" });
  });

  it("rejects a forged status flag or an absent independent approval record", async () => {
    await save([{ ...asset, status: "approved" }]);
    await expect(checkAssets({ root })).rejects.toThrow(/onay/i);
    approve();
    decisions = [];
    await save();
    await expect(checkAssets({ root })).rejects.toThrow(/onay/i);
  });

  it.each([
    { sha256: "0".repeat(64) }, { assetId: "p02" }, { decision: "rejected" },
    { decidedAt: "2026-10-18T10:00:00.000Z" }, { evidenceRef: "" },
  ])("rejects mismatched approval evidence: %j", async (patch) => {
    approve();
    decisions = [{ ...decisions[0], ...patch } as Decision];
    await save();
    await expect(checkAssets({ root })).rejects.toThrow(/onay|karar/i);
  });

  it("rejects missing, invalid, future and normalized-invalid decision dates", async () => {
    approve();
    for (const decidedAt of ["", "yesterday", "2999-01-01T00:00:00.000Z", "2026-02-30T10:00:00.000Z"]) {
      await save([{ ...asset, approval: { ...asset.approval, decidedAt } }]);
      await expect(checkAssets({ root })).rejects.toThrow(/tarih/i);
    }
  });

  it("rejects duplicate decisions and stale decisions attached to a candidate", async () => {
    approve();
    decisions = [decisions[0], decisions[0]];
    await save();
    await expect(checkAssets({ root })).rejects.toThrow(/tekrar/i);
    decisions = [decisions[0]];
    await save([{ ...asset, status: "candidate" }]);
    await expect(checkAssets({ root })).rejects.toThrow(/onay/i);
  });

  it("rejects a missing or ambiguous machine-readable decision block", async () => {
    await put("docs/gorsel-onay.md", "# No decision block");
    await expect(checkAssets({ root })).rejects.toThrow(/karar/i);
    await save();
    const doc = await readFile(join(root, "docs/gorsel-onay.md"), "utf8");
    await put("docs/gorsel-onay.md", `${doc}\n${doc}`);
    await expect(checkAssets({ root })).rejects.toThrow(/karar/i);
  });
});

describe("Task 024-a source-bound brand approvals", () => {
  function brandApproval() {
    asset = { ...asset, runtime: true, status: "approved", approval: { recordId: "brand-p01-v1", decidedAt: "2026-10-20" } };
    return { recordId: "brand-p01-v1", assetId: asset.id, sha256: asset.sha256,
      references: asset.references, approvedBy: "user", approvedAt: "2026-10-20",
      evidence: "user-message-2026-10-20-task-024-a-brand-set" };
  }

  async function saveBrand(approvals: unknown[]) {
    await save();
    const doc = await readFile(join(root, "docs/gorsel-onay.md"), "utf8");
    await put("docs/gorsel-onay.md", `${doc}\n\`\`\`json asset-approvals\n${JSON.stringify({ version: 1, approvals })}\n\`\`\`\n`);
  }

  it("allows source-bound user approval with day precision and explicit runtime permission", async () => {
    await saveBrand([brandApproval()]);
    await put("components/Logo.tsx", `export const logo = "${asset.file}";`);
    await expect(checkAssets({ root, mode: "approved" })).resolves.toEqual({ checked: 1, mode: "approved" });
  });

  it.each([
    { approvedBy: "agent" }, { approvedAt: "2999-01-01" }, { approvedAt: "2026-02-30" },
    { approvedAt: "yesterday" }, { evidence: "" }, { references: [] },
    { references: [{ file: "docs/visual-prompts.md", sha256: "0".repeat(64) }] },
    { sha256: "0".repeat(64) }, { assetId: "p02" }, { approvedAt: "2026-10-19" },
  ])("rejects invalid or changed brand approval provenance: %j", async (patch) => {
    await saveBrand([{ ...brandApproval(), ...patch }]);
    await expect(checkAssets({ root })).rejects.toThrow();
  });

  it("rejects ambiguous brand records and duplicate IDs across both ledgers", async () => {
    const approval = brandApproval();
    await saveBrand([approval, approval]);
    await expect(checkAssets({ root })).rejects.toThrow(/tekrar/i);
    decisions = [{ recordId: approval.recordId, assetId: asset.id, sha256: asset.sha256,
      decision: "approved", decidedAt: "2026-10-19T10:00:00.000Z", evidenceRef: approval.evidence }];
    await saveBrand([approval]);
    await expect(checkAssets({ root })).rejects.toThrow(/tekrar/i);
    decisions = [];
    await saveBrand([approval]);
    const doc = await readFile(join(root, "docs/gorsel-onay.md"), "utf8");
    await put("docs/gorsel-onay.md", `${doc}\n${doc.slice(doc.indexOf("```json asset-approvals"))}`);
    await expect(checkAssets({ root })).rejects.toThrow(/onay/i);
  });

  it.each([true, "true"])("rejects unapproved or non-boolean runtime permission: %j", async (runtime) => {
    await save([{ ...asset, runtime }]);
    await expect(checkAssets({ root })).rejects.toThrow(/runtime|onay/i);
  });

  it("allows an approved reference to stay out of runtime and rejects its use", async () => {
    approve();
    asset.runtime = false;
    await save();
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    await put("components/Logo.tsx", `export const logo = "${asset.file}";`);
    await expect(checkAssets({ root })).rejects.toThrow(/runtime/i);
  });

  it("rejects runtime=true on an approved design reference", async () => {
    approve();
    await save([{ ...asset, promptId: "P08", runtime: true }]);
    await expect(checkAssets({ root })).rejects.toThrow(/tasarım referansı/i);
  });
});

describe("Task 086 approved hero frame integrity", () => {
  async function saveSequence(): Promise<void> {
    const directory = "public/frames/hero-zeytin";
    const manifest = JSON.stringify({ count: 121, fps: 24, widths: [1920, 960], aspect: 16 / 9, poster: "poster.webp" });
    const files: { file: string; sha256: string }[] = [];
    for (const width of [1920, 960]) {
      const bytes = await sharp({ create: { width, height: width * 9 / 16, channels: 3, background: "#243A29" } }).webp().toBuffer();
      for (let index = 1; index <= 121; index++) {
        const file = `${width}/frame-${String(index).padStart(4, "0")}.webp`;
        await put(`${directory}/${file}`, bytes);
        files.push({ file, sha256: digest(bytes) });
      }
      if (width === 1920) {
        await put(`${directory}/poster.webp`, bytes);
        files.push({ file: "poster.webp", sha256: digest(bytes) });
      }
    }
    const task = "docs/tasks/086-hero-zeytinlik.md";
    const taskCopy = "Synthetic user approval fixture";
    await put(task, taskCopy);
    const decidedAt = "2026-10-19T10:00:00.000Z";
    const recordId = "sequence-approval";
    const receipt = { version: 1, id: "hero-zeytin-sequence", sourceSha256: digest("approved source video"),
      manifestSha256: digest(manifest), files, status: "approved", runtime: true,
      approval: { recordId, decidedAt }, references: [{ file: task, sha256: digest(taskCopy) }] };
    const json = JSON.stringify(receipt);
    decisions.push({ recordId, assetId: receipt.id, sha256: digest(json), decision: "approved", decidedAt,
      evidenceRef: "user-message-sequence-approval" });
    await save();
    await put(`${directory}/manifest.json`, manifest);
    await put(`${directory}/approval.json`, json);
    await put("components/Hero.tsx", 'export const frames = "/frames/hero-zeytin/manifest.json";');
  }

  it("validates every approved frame and rejects changed bytes, missing frames and unregistered extras", async () => {
    await saveSequence();
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    const file = "public/frames/hero-zeytin/1920/frame-0001.webp";
    const original = await readFile(join(root, file));
    await put(file, image);
    await expect(checkAssets({ root })).rejects.toThrow(/hash/i);
    await put(file, original);
    await put("public/frames/hero-zeytin/extra.webp", image);
    await expect(checkAssets({ root })).rejects.toThrow(/kayıtsız/i);
    await rm(join(root, "public/frames/hero-zeytin/extra.webp"));
    await rm(join(root, file));
    await expect(checkAssets({ root })).rejects.toThrow(/eksik dosya/i);
  });

  it("binds the entire receipt to user approval so file hashes cannot be rewritten", async () => {
    await saveSequence();
    const file = "public/frames/hero-zeytin/approval.json";
    const receipt = JSON.parse(await readFile(join(root, file), "utf8"));
    receipt.files[0].sha256 = "0".repeat(64);
    await put(file, JSON.stringify(receipt));
    await expect(checkAssets({ root })).rejects.toThrow(/onay kararı/i);
  });
});

describe("unapproved runtime usage protection", () => {
  it("allows only deterministic poster variants of the approved hero, including after output hashes are rewritten", async () => {
    await rm(join(root, `public${asset.file}`));
    asset.file = "/images/hero/zeytinlik-2400.webp";
    await put(`public${asset.file}`, image);
    approve();
    await save();
    const files = [];
    for (const [name, width, height, avif, webp] of [["mobile", 900, 1350, 15, 10], ["desktop", 2400, 1350, 25, 75]] as const) {
      for (const format of ["avif", "webp"] as const) {
        const bytes = await sharp(image).resize(width, height, { fit: "cover", position: "right" })[format]({ quality: format === "avif" ? avif : webp }).toBuffer();
        const file = `/images/hero/optimized/${name}.${format}`;
        await put(`public${file}`, bytes);
        files.push({ file, sha256: digest(bytes), width, height });
      }
    }
    const receipt = { source: asset.file, sourceSha256: asset.sha256, files };
    const receiptFile = "public/images/hero/optimized/manifest.json";
    await put(receiptFile, JSON.stringify(receipt));
    await put("components/Hero.tsx", `export const poster = "${files[0].file} 900w";`);
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    const replacement = await sharp({ create: { width: 900, height: 1350, channels: 3, background: "#ff0000" } }).avif().toBuffer();
    await put(`public${files[0].file}`, replacement);
    files[0].sha256 = digest(replacement);
    await put(receiptFile, JSON.stringify(receipt));
    await expect(checkAssets({ root })).rejects.toThrow(/approved source transform/i);
  });

  it("requires independent approval for hero images, including every responsive srcSet entry", async () => {
    await rm(join(root, `public${asset.file}`));
    asset.file = "/images/hero/approved.webp";
    await put(`public${asset.file}`, image);
    approve();
    await save();
    await put("components/Hero.tsx", `export const poster = "${asset.file} 2400w, /images/hero/unapproved.webp 1200w";`);
    await expect(checkAssets({ root })).rejects.toThrow(/onaysız/i);
    await put("components/Hero.tsx", `export const poster = "${asset.file} 1200w, ${asset.file} 2400w";`);
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    await put("public/images/hero/extra.webp", image);
    await expect(checkAssets({ root })).rejects.toThrow(/kayıtsız/i);
  });

  it("rejects a hero sequence without a hash-bound approval receipt", async () => {
    await put("components/Hero.tsx", 'export const frames = "/frames/hero-zeytin/manifest.json";');
    await expect(checkAssets({ root })).rejects.toThrow(/onaysız/i);
    await put("public/frames/hero-zeytin/manifest.json", "{}");
    await expect(checkAssets({ root })).rejects.toThrow(/eksik dosya/i);
  });

  it.each([
    ['app/page.tsx', 'import image from "@/public/images/generated/p01/candidate.png";'],
    ['components/Hero.tsx', '<img src="/images/generated/p01/candidate.png" />'],
    ['lib/assets.ts', 'export const image = "/images/generated/p01/candidate.png?width=800";'],
    ['app/globals.css', 'main { background: url(/images/generated/p01/candidate.png); }'],
    ['app/page.tsx', 'const image = `/images/generated/${id}.png`;'],
    ['app/page.tsx', 'const image = "\\u002fimages/generated/p01/candidate.png";'],
    ['app/page.tsx', 'const image = "/images/" + "generated/p01/candidate.png";'],
    ['app/page.tsx', 'import registry from "@/public/images/generated/manifest.json";'],
    ['lib/assets.ts', 'export const image = "/images/generated/missing.png";'],
    ['lib/hero.json', '{"image":"/images/generated/p01/candidate.png"}'],
    ['components/Hero.tsx', 'import image from "../public/images/generated/p01/candidate.png";'],
  ])("rejects candidate, unknown and dynamic references in %s: %s", async (file, source) => {
    await put(file, source);
    await expect(checkAssets({ root, mode: "candidate" })).rejects.toThrow(/onaysız|dinamik|manifest/i);
  });

  it("still rejects a different candidate when selecting a valid approved ID", async () => {
    const candidate = { ...asset, id: "p02", file: "/images/generated/p02.png" };
    await put(`public${candidate.file}`, image);
    approve();
    await save([asset, candidate]);
    await put("lib/assets.ts", `export const image = "${candidate.file}";`);
    await expect(checkAssets({ root, id: "p01", mode: "approved" })).rejects.toThrow(/onaysız/i);
  });

  it("never treats P08–P12 design references as publishable assets", async () => {
    asset = { ...asset, promptId: "P08" };
    approve();
    await save();
    await put("lib/assets.ts", `export const image = "${asset.file}";`);
    await expect(checkAssets({ root })).rejects.toThrow(/tasarım referansı/i);
  });

  it("permits unused rejected candidates and supports future brand assets", async () => {
    await save([{ ...asset, status: "rejected" }]);
    await expect(checkAssets({ root })).resolves.toEqual({ checked: 1, mode: "all" });
    await rm(join(root, `public${asset.file}`));
    asset = { ...asset, file: "/brand/afina-zeytin.png", model: "svgo", promptId: "TASK-080", representative: false };
    await put(`public${asset.file}`, image);
    await save();
    await expect(checkAssets({ root, mode: "candidate" })).resolves.toEqual({ checked: 1, mode: "candidate" });
    await put("app/page.tsx", `const logo = "${asset.file}";`);
    await expect(checkAssets({ root })).rejects.toThrow(/onaysız/i);
  });
});

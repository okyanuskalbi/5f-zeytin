import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const MANIFEST = "public/images/generated/manifest.json";
const DECISIONS = "docs/gorsel-onay.md";
const ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{64}$/;
const IMAGE = /\.(png|jpe?g|webp|avif|svg)$/i;
const IMAGE_ROOT = "(?:images/(?:generated|hero|tesis)|brand)";
const SEQUENCE = "public/frames/hero-zeytin";
const ASSET_FIELDS = ["id", "file", "sha256", "width", "height", "aspectRatio", "model", "promptId", "representative", "references", "status", "approval"];

function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}

function exactFields(value, fields, label) {
  requireThat(value && typeof value === "object" && !Array.isArray(value), `${label}: nesne gerekli.`);
  requireThat(Object.keys(value).length === fields.length && fields.every((key) => Object.hasOwn(value, key)), `${label}: eksik veya izin verilmeyen alan.`);
}

function validDate(value) {
  const date = new Date(value);
  requireThat(typeof value === "string" && Number.isFinite(date.getTime()) && date.toISOString() === value && date.getTime() <= Date.now(), "Onay karar tarihi geçersiz veya gelecekte.");
}

function validDay(value) {
  const date = new Date(value);
  requireThat(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10), "Onay karar tarihi geçersiz veya gelecekte.");
}

async function localFile(root, file) {
  requireThat(typeof file === "string" && file.length > 0 && !file.includes("\\") && !file.includes("\0") && !file.split("/").some((part) => !part || part.startsWith(".")), "Dosya yolu geçersiz.");
  const target = resolve(root, file);
  requireThat(target.startsWith(`${root}${sep}`), "Dosya repo dışında.");
  let current = root;
  for (const part of file.split("/")) {
    current = join(current, part);
    let stat;
    try { stat = await lstat(current); } catch { throw new Error(`Eksik dosya: ${file}`); }
    requireThat(!stat.isSymbolicLink(), `Sembolik bağlantı yasak: ${file}`);
  }
  requireThat((await lstat(target)).isFile(), `Normal dosya gerekli: ${file}`);
  return target;
}

async function readJSON(root, file) {
  const text = await readFile(await localFile(root, file), "utf8");
  try { return JSON.parse(text); } catch { throw new Error(`Geçersiz JSON: ${file}`); }
}

async function verifyHash(root, file, expected) {
  requireThat(typeof expected === "string" && HASH.test(expected), `Geçersiz hash: ${file}`);
  const bytes = await readFile(await localFile(root, file));
  requireThat(createHash("sha256").update(bytes).digest("hex") === expected, `Hash uyuşmuyor: ${file}`);
  return bytes;
}

async function readDecisions(root) {
  const text = await readFile(await localFile(root, DECISIONS), "utf8");
  const blocks = [...text.matchAll(/^```json asset-decisions\r?\n([\s\S]*?)^```\s*$/gm)];
  requireThat(blocks.length === 1, "Tek bir asset-decisions karar bloğu gerekli.");
  let ledger;
  try { ledger = JSON.parse(blocks[0][1]); } catch { throw new Error("Karar bloğu geçerli JSON olmalı."); }
  exactFields(ledger, ["version", "decisions"], "Karar kaydı");
  requireThat(ledger.version === 1 && Array.isArray(ledger.decisions), "Karar kaydı version/decisions geçersiz.");
  const ids = new Set();
  for (const decision of ledger.decisions) {
    exactFields(decision, ["recordId", "assetId", "sha256", "decision", "decidedAt", "evidenceRef"], "Onay kararı");
    requireThat(ID.test(decision.recordId) && ID.test(decision.assetId) && HASH.test(decision.sha256), "Onay karar kimliği/hash geçersiz.");
    requireThat(!ids.has(decision.recordId), "Tekrarlanan karar kimliği.");
    ids.add(decision.recordId);
    requireThat(["approved", "rejected"].includes(decision.decision) && /^user-message-[a-z0-9.-]+$/.test(decision.evidenceRef), "Onay kararı ve anonim kullanıcı mesajı referansı gerekli.");
    validDate(decision.decidedAt);
  }
  // Task 024-a records the user's brand-set approval at its actual day precision.
  // Keep legacy decisions valid; both ledgers share one record-ID namespace.
  const approvalBlocks = [...text.matchAll(/^```json asset-approvals\r?\n([\s\S]*?)^```\s*$/gm)];
  requireThat(approvalBlocks.length <= 1, "Tek bir asset-approvals onay bloğu olabilir.");
  if (approvalBlocks.length === 0) return ledger.decisions;
  let approvals;
  try { approvals = JSON.parse(approvalBlocks[0][1]); } catch { throw new Error("Onay bloğu geçerli JSON olmalı."); }
  exactFields(approvals, ["version", "approvals"], "Kullanıcı onay kaydı");
  requireThat(approvals.version === 1 && Array.isArray(approvals.approvals), "Onay kaydı version/approvals geçersiz.");
  for (const approval of approvals.approvals) {
    exactFields(approval, ["recordId", "assetId", "sha256", "references", "approvedBy", "approvedAt", "evidence"], "Kullanıcı onayı");
    requireThat(ID.test(approval.recordId) && ID.test(approval.assetId) && HASH.test(approval.sha256), "Onay kimliği/hash geçersiz.");
    requireThat(!ids.has(approval.recordId), "Tekrarlanan karar kimliği.");
    ids.add(approval.recordId);
    requireThat(approval.approvedBy === "user" && /^user-message-[a-z0-9.-]+$/.test(approval.evidence), "Kullanıcı onayı ve anonim mesaj referansı gerekli.");
    validDay(approval.approvedAt);
    requireThat(Array.isArray(approval.references) && approval.references.length > 0, "Onay kaynak referansı gerekli.");
    for (const reference of approval.references) exactFields(reference, ["file", "sha256"], "Onay kaynağı");
    ledger.decisions.push({ recordId: approval.recordId, assetId: approval.assetId, sha256: approval.sha256,
      decision: "approved", decidedAt: approval.approvedAt, evidenceRef: approval.evidence, references: approval.references });
  }
  return ledger.decisions;
}

function verifyApproval(asset, decisions) {
  if (asset.status !== "approved") {
    requireThat(asset.approval === null, `${asset.id}: aday/reddedilen dosyada onay alanı boş olmalı.`);
    return;
  }
  requireThat(asset.approval !== null, `${asset.id}: onay kaydı gerekli.`);
  exactFields(asset.approval, ["recordId", "decidedAt"], "Onay");
  if (/^\d{4}-\d{2}-\d{2}$/.test(asset.approval.decidedAt)) validDay(asset.approval.decidedAt);
  else validDate(asset.approval.decidedAt);
  const decision = decisions.find((entry) => entry.recordId === asset.approval.recordId);
  requireThat(decision && decision.assetId === asset.id && decision.sha256 === asset.sha256 && decision.decision === "approved" && decision.decidedAt === asset.approval.decidedAt, `${asset.id}: bağımsız onay kararı eksik veya uyuşmuyor.`);
  if (decision.references) {
    requireThat(Array.isArray(asset.references) && decision.references.length === asset.references.length && new Set(decision.references.map((entry) => entry.file)).size === decision.references.length && decision.references.every((entry) => asset.references.some((reference) => reference.file === entry.file && reference.sha256 === entry.sha256)), `${asset.id}: onay kaynak hash'leri uyuşmuyor.`);
  }
}

async function verifyAsset(root, asset, decisions) {
  exactFields(asset, Object.hasOwn(asset, "runtime") ? [...ASSET_FIELDS, "runtime"] : ASSET_FIELDS, "Görsel");
  requireThat(typeof asset.id === "string" && ID.test(asset.id), "Geçersiz görsel kimliği.");
  requireThat(typeof asset.file === "string" && new RegExp(`^/${IMAGE_ROOT}/[a-zA-Z0-9/_.-]+$`).test(asset.file) && IMAGE.test(asset.file), `${asset.id}: görsel dosya yolu geçersiz.`);
  requireThat(typeof asset.model === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(asset.model), `${asset.id}: model gerekli.`);
  requireThat(typeof asset.promptId === "string" && /^(P(0[1-9]|1[0-2])|TASK-\d{3})$/.test(asset.promptId), `${asset.id}: prompt ID gerekli.`);
  requireThat(typeof asset.representative === "boolean", `${asset.id}: temsili etiketi gerekli.`);
  requireThat(!/^\/images\/(generated|hero)\//.test(asset.file) || asset.representative === true, `${asset.id}: üretilen görsel temsili olmalı.`);
  requireThat(["candidate", "approved", "rejected"].includes(asset.status), `${asset.id}: geçersiz aday/onay durumu.`);
  requireThat(!Object.hasOwn(asset, "runtime") || typeof asset.runtime === "boolean", `${asset.id}: runtime boolean olmalı.`);
  requireThat(asset.runtime !== true || asset.status === "approved", `${asset.id}: runtime için kullanıcı onayı gerekli.`);
  requireThat(asset.runtime !== true || !/^P(08|09|10|11|12)$/.test(asset.promptId), `${asset.id}: tasarım referansı runtime'da kullanılamaz.`);
  verifyApproval(asset, decisions);
  const bytes = await verifyHash(root, `public${asset.file}`, asset.sha256);
  let metadata;
  try { metadata = await sharp(bytes, { animated: true }).metadata(); } catch { throw new Error(`${asset.id}: okunamayan görsel.`); }
  requireThat(!metadata.pages || metadata.pages === 1, `${asset.id}: yalnız durağan görsel kabul edilir; video kapsam dışı.`);
  requireThat(Number.isInteger(asset.width) && Number.isInteger(asset.height) && asset.width > 0 && asset.height > 0 && asset.width === metadata.width && asset.height === metadata.height, `${asset.id}: görsel ölçüleri uyuşmuyor.`);
  const ratio = typeof asset.aspectRatio === "string" && asset.aspectRatio.match(/^([1-9]\d*):([1-9]\d*)$/);
  requireThat(ratio && Number(ratio[1]) * asset.height === Number(ratio[2]) * asset.width, `${asset.id}: görsel oranı uyuşmuyor.`);
  requireThat(Array.isArray(asset.references) && asset.references.length > 0, `${asset.id}: kaynak referansı gerekli.`);
  for (const reference of asset.references) {
    exactFields(reference, ["file", "sha256"], "Kaynak");
    requireThat(typeof reference.file === "string" && reference.file.startsWith("docs/") && !/[@?#:\r\n]/.test(reference.file), `${asset.id}: kaynak repo içindeki docs dosyası olmalı.`);
    await verifyHash(root, reference.file, reference.sha256);
  }
}

async function walk(root, directory, visit) {
  let entries;
  try {
    requireThat(!(await lstat(join(root, directory))).isSymbolicLink(), `Sembolik bağlantı yasak: ${directory}`);
    entries = await readdir(join(root, directory), { withFileTypes: true });
  }
  catch (error) { if (error.code === "ENOENT") return; throw error; }
  for (const entry of entries) {
    const file = join(directory, entry.name);
    requireThat(!entry.isSymbolicLink(), `Sembolik bağlantı yasak: ${file}`);
    if (entry.isDirectory()) await walk(root, file, visit);
    else if (entry.isFile()) await visit(file);
  }
}

async function verifyHeroSequence(root, decisions) {
  try { await lstat(join(root, SEQUENCE)); }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
  const receiptPath = `${SEQUENCE}/approval.json`;
  const receipt = await readJSON(root, receiptPath);
  exactFields(receipt, ["version", "id", "sourceSha256", "manifestSha256", "files", "status", "runtime", "approval", "references"], "Kare dizisi onayı");
  requireThat(receipt.version === 1 && receipt.id === "hero-zeytin-sequence" && HASH.test(receipt.sourceSha256)
    && receipt.status === "approved" && receipt.runtime === true, "Kare dizisi için açık kullanıcı onayı gerekli.");
  verifyApproval({ ...receipt, sha256: createHash("sha256").update(await readFile(await localFile(root, receiptPath))).digest("hex") }, decisions);
  requireThat(Array.isArray(receipt.references) && receipt.references.length > 0, "Kare dizisi kaynak referansı gerekli.");
  for (const reference of receipt.references) {
    exactFields(reference, ["file", "sha256"], "Kare dizisi kaynağı");
    requireThat(reference.file === "docs/tasks/086-hero-zeytinlik.md", "Kare dizisi onay kaynağı geçersiz.");
    await verifyHash(root, reference.file, reference.sha256);
  }
  const manifest = JSON.parse(await verifyHash(root, `${SEQUENCE}/manifest.json`, receipt.manifestSha256));
  exactFields(manifest, ["count", "fps", "widths", "aspect", "poster"], "Hero kare manifesti");
  requireThat(manifest.count === 121 && manifest.fps === 24 && JSON.stringify(manifest.widths) === "[1920,960]"
    && manifest.aspect === 16 / 9 && manifest.poster === "poster.webp", "Hero kare sayısı/fps/ölçüleri geçersiz.");
  const expected = new Map([["poster.webp", 1920]]);
  for (const width of manifest.widths) {
    for (let index = 1; index <= manifest.count; index += 1) expected.set(`${width}/frame-${String(index).padStart(4, "0")}.webp`, width);
  }
  requireThat(Array.isArray(receipt.files) && receipt.files.length === expected.size, "Eksik kare onay kaydı.");
  const registered = new Set([`${SEQUENCE}/manifest.json`, receiptPath]);
  let total = 0;
  for (const entry of receipt.files) {
    exactFields(entry, ["file", "sha256"], "Kare");
    const width = expected.get(entry.file);
    requireThat(width, "Kayıtsız veya tekrarlanan kare.");
    expected.delete(entry.file);
    const file = `${SEQUENCE}/${entry.file}`;
    const bytes = await verifyHash(root, file, entry.sha256);
    const metadata = await sharp(bytes).metadata();
    requireThat(metadata.format === "webp" && metadata.width === width && metadata.height === width * 9 / 16 && (!metadata.pages || metadata.pages === 1), "Kare ölçüsü/biçimi geçersiz.");
    total += bytes.length;
    registered.add(file);
  }
  await walk(root, SEQUENCE, async (file) => {
    requireThat(registered.has(file), `Kayıtsız kare dosyası: ${file}`);
    if (file.endsWith(".json")) total += (await readFile(await localFile(root, file))).length;
  });
  requireThat(total <= 12 * 1024 * 1024, "Hero kare dizisi 12 MB sınırını aşıyor.");
  return true;
}

function verifyRuntimePath(sourceFile, value, assets, sequenceApproved) {
  // Decode percent escapes and normalize static import aliases/relative paths.
  let decoded;
  try { decoded = decodeURIComponent(value); }
  catch {
    requireThat(!new RegExp(`${IMAGE_ROOT}/|frames/hero-zeytin`).test(value), `Geçersiz görsel URL: ${sourceFile}`);
    return;
  }
  for (const match of decoded.matchAll(/frames\/hero-zeytin[^\s"',)<>}]*/g)) {
    requireThat(sequenceApproved && match[0] === "frames/hero-zeytin/manifest.json", `${sourceFile}: onaysız veya dinamik kare dizisi.`);
  }
  for (const match of decoded.matchAll(new RegExp(`${IMAGE_ROOT}/[^\\s"',)<>}]*`, "g"))) {
    let path = `/${match[0].split(/[?#]/)[0]}`;
    // URL normalization also catches dot segments inside literal file paths.
    path = new URL(path, "https://assets.invalid").pathname;
    requireThat(!path.endsWith("/manifest.json"), `${sourceFile}: manifest runtime'a import edilemez.`);
    const asset = assets.find((entry) => entry.file === path);
    requireThat(asset?.status === "approved", `${sourceFile}: onaysız, kayıtsız veya dinamik görsel kullanımı.`);
    requireThat(asset.runtime !== false, `${sourceFile}: görselin runtime kullanımı kapalı.`);
    requireThat(!/^P(08|09|10|11|12)$/.test(asset.promptId), `${sourceFile}: tasarım referansı runtime'da kullanılamaz.`);
  }
}

function staticText(node) {
  if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text;
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticText(node.left);
    const right = staticText(node.right);
    if (left !== undefined && right !== undefined) return left + right;
  }
  return undefined;
}

async function verifyRuntime(root, assets, sequenceApproved) {
  const visit = async (file) => {
    if (!/\.(?:[cm]?[jt]sx?|json|css|scss|mdx)$/.test(file) || file === "package-lock.json") return;
    const text = await readFile(await localFile(root, file), "utf8");
    if (/\.(css|scss|mdx)$/.test(file)) {
      for (const match of text.matchAll(new RegExp(`(?:${IMAGE_ROOT}/|frames/hero-zeytin)[^\\s"'\x60);<>}]*`, "g"))) verifyRuntimePath(file, match[0], assets, sequenceApproved);
      return;
    }
    const extension = extname(file);
    const kind = extension === ".json" ? ts.ScriptKind.JSON : extension.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
    const inspect = (node) => {
      const value = staticText(node);
      if (value !== undefined) verifyRuntimePath(file, value, assets, sequenceApproved);
      ts.forEachChild(node, inspect);
    };
    inspect(source);
  };
  for (const directory of ["app", "components", "lib", "src", "pages", "styles"]) await walk(root, directory, visit);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isFile()) await visit(entry.name);
  }
}

/** Validate local files only. Never generates assets, calls APIs or changes approvals. */
export async function checkAssets({ root, id, mode = "all" }) {
  root = await realpath(root);
  requireThat(["all", "candidate", "approved"].includes(mode), "Geçersiz mod.");
  const manifest = await readJSON(root, MANIFEST);
  exactFields(manifest, ["version", "assets"], "Manifest");
  requireThat(manifest.version === 1 && Array.isArray(manifest.assets), "Manifest version/assets geçersiz.");
  const decisions = await readDecisions(root);
  const ids = new Set();
  const files = new Set();
  for (const asset of manifest.assets) {
    await verifyAsset(root, asset, decisions);
    requireThat(!ids.has(asset.id) && !files.has(asset.file), "Tekrarlanan görsel kimliği/dosya yolu.");
    ids.add(asset.id);
    files.add(asset.file);
  }
  await walk(root, "public/images/generated", async (file) => {
    requireThat(file === MANIFEST || files.has(`/${relative("public", file).split(sep).join("/")}`), `Kayıtsız dosya: ${file}`);
  });
  await walk(root, "public/images/hero", async (file) => {
    requireThat(files.has(`/${relative("public", file).split(sep).join("/")}`), `Kayıtsız dosya: ${file}`);
  });
  await walk(root, "public/images/tesis", async (file) => {
    requireThat(files.has(`/${relative("public", file).split(sep).join("/")}`), `Kayıtsız dosya: ${file}`);
  });
  const sequenceApproved = await verifyHeroSequence(root, decisions);
  // Selection never bypasses whole-registry integrity or runtime usage checks.
  await verifyRuntime(root, manifest.assets, sequenceApproved);
  const selected = manifest.assets.filter((asset) => (!id || asset.id === id) && (mode === "all" || asset.status === mode));
  requireThat(!id || selected.length > 0, `Görsel bulunamadı: ${id} (${mode}).`);
  return { checked: selected.length, mode };
}

/** @param {string[]} args */
export function parseArgs(args) {
  let mode = "all";
  let id;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--id") {
      requireThat(id === undefined && ID.test(args[index + 1] ?? ""), "--id için tek bir görsel kimliği gerekli.");
      id = args[++index];
    } else {
      requireThat(["--candidate", "--approved"].includes(arg) && mode === "all", "Yalnız --id, --candidate veya --approved; modlar birlikte kullanılamaz.");
      mode = arg.slice(2);
    }
  }
  return { ...(id ? { id } : {}), mode };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await checkAssets({ root: process.cwd(), ...parseArgs(process.argv.slice(2)) });
    process.stdout.write(`PASS: ${result.checked} görsel (${result.mode}); kaynak/hash/onay ve runtime kullanımı doğrulandı.\n`);
  } catch (error) {
    process.stderr.write(`FAIL: ${error.message}\n`);
    process.exitCode = 1;
  }
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { validateHtmlJsonLd } from '../lib/site/schema-validation.ts';

// Read saved local HTML only. Never submit project data to an external validator.
const files = process.argv.slice(2);
if (!files.length) throw new Error('Usage: node scripts/validate-json-ld.mjs <local.html> [...]');
let failed = false;
for (const file of files) {
  const resolved = path.resolve(file);
  if (!resolved.startsWith(process.cwd() + path.sep) || !resolved.endsWith('.html')) throw new Error('Only project-local HTML is allowed');
  const result = validateHtmlJsonLd(await fs.readFile(resolved, 'utf8'));
  console.log(JSON.stringify({ file, ...result }));
  if (result.count === 0 || result.errors.length) failed = true;
}
process.exitCode = failed ? 1 : 0;

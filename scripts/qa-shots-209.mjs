/* global document, scrollTo */
// Task209 screenshots of the landing page, taken the same way before and after the change so they can be compared.
// node scripts/qa-shots-209.mjs <origin> <output-directory under output/>
// Read-only: one GET of "/" per width. Reduced motion is requested so the hero stays on its poster (no video frame differences).
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://afinazeytin.com');
const out = path.resolve(process.argv[3] ?? 'output/task209/once');
assert(out.startsWith(path.resolve('output') + path.sep), 'Evidence belongs in project output/');
await fs.mkdir(out, { recursive: true });

const widths = [[390, 844], [768, 1024], [1024, 768], [1440, 900]];
const PHONE = 390;
/** Each phone block: the mark added by task 209, then the selector that finds the same block before the change. */
const blocks = [
  ['hero', '#baslangic'],
  ['products', '#urunler'],
  ['story', '#hikayemiz [class*="storyGrid"]'],
  ['facility', '#hikayemiz [data-home-facility] > [class$="facilityPhotos"]'],
  ['harvest', '#hikayemiz [data-home-facility] > [class$="harvest"]'],
  ['business', '#toptan-bayilik'],
  ['blog', '#blog'],
  ['faq', '#sik-sorulanlar'],
  ['contact', '#iletisim [class*="contactCard"]'],
  ['footer', 'footer'],
];

/** Scrolls through the page once so lazy images load, then returns to the top. */
async function settle(page, height) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height / 2) { await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y); await page.waitForTimeout(80); }
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
}

const report = { origin: origin.href, takenAt: new Date().toISOString(), pages: [] };
const browser = await chromium.launch();
try {
  for (const [width, height] of widths) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width <= 1024, reducedMotion: 'reduce', ignoreHTTPSErrors: ['localhost', '127.0.0.1'].includes(origin.hostname) });
    const page = await context.newPage();
    await page.goto(new URL('/', origin).href, { waitUntil: 'networkidle' });
    await settle(page, height);
    const file = path.join(out, `ana-sayfa-${width}.png`);
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    const entry = { width, height, pageHeight: await page.evaluate(() => document.documentElement.scrollHeight), file, blocks: [] };
    if (width === PHONE) for (const [name, legacy] of blocks) {
      const marked = page.locator(`[data-phone-screen="${name}"]`);
      const target = (await marked.count()) > 0 ? marked.first() : page.locator(legacy).first();
      if ((await target.count()) === 0) { entry.blocks.push({ name, missing: true }); continue; }
      const box = await target.boundingBox();
      const shot = path.join(out, `blok-${String(entry.blocks.length + 1).padStart(2, '0')}-${name}-${width}.png`);
      await target.screenshot({ path: shot, animations: 'disabled' });
      entry.blocks.push({ name, height: Math.round(box?.height ?? 0), file: shot });
    }
    report.pages.push(entry);
    await context.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(out, 'olcum.json'), `${JSON.stringify(report, null, 2)}\n`);
for (const entry of report.pages) {
  process.stdout.write(`${entry.width}: sayfa ${entry.pageHeight}px\n`);
  for (const block of entry.blocks) process.stdout.write(`  ${block.name}: ${block.missing ? 'bulunamadı' : `${block.height}px`}\n`);
}

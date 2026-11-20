/* global document, window */
// Görev 213: canlı Vercel sürümü ile Cloudflare deneme adresinin birebir piksel karşılaştırması.
// Yalnız GET. Hareket kapalı (reduce); varsa hero videosu aynı saniyeye (5,5 sn) çekilip durdurulur (210 yöntemi).
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';

const live = 'https://afinazeytin.com';
const trial = process.env.TRIAL_ORIGIN ?? 'https://afina-zeytin.revzamoda.workers.dev';
const root = 'output/task213/visual';
await fs.mkdir(root, { recursive: true });
const viewports = [['masaustu', 1440, 900], ['tablet', 768, 1024], ['telefon', 390, 844]];
const pages = [['ana', '/'], ['urun', '/urun/naturel-sizma-zeytinyagi'], ['sepet', '/sepet'], ['giris', '/giris'], ['blog', '/blog/salamura-zeytin-nasil-hazirlanir'], ['404', '/yok-sayfa-213']];

async function shot(browser, origin, [name, width, height], [pageName, path], tag) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: name === 'telefon', hasTouch: name === 'telefon' });
  const page = await context.newPage();
  await context.route('**/*', route => route.request().method() === 'GET' || route.request().method() === 'HEAD' ? route.continue() : route.abort());
  await page.goto(origin + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
  await page.evaluate(async () => {
    for (const video of document.querySelectorAll('video')) {
      video.pause();
      await new Promise(resolve => { video.addEventListener('seeked', resolve, { once: true }); video.currentTime = 5.5; setTimeout(resolve, 3000); });
    }
    window.scrollTo(0, 0);
  });
  // Sayfayı sonuna kadar kaydırıp tembel yüklenen görselleri getir, sonra başa dön.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height) { await page.evaluate(top => window.scrollTo(0, top), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const file = `${root}/${tag}-${pageName}-${name}.png`;
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  await context.close();
  return file;
}

async function compare(a, b) {
  const first = await sharp(a).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const second = await sharp(b).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sameSize = first.info.width === second.info.width && first.info.height === second.info.height;
  let different = 0;
  if (sameSize) for (let i = 0; i < first.data.length; i += 3) if (first.data[i] !== second.data[i] || first.data[i + 1] !== second.data[i + 1] || first.data[i + 2] !== second.data[i + 2]) different++;
  return { live: [first.info.width, first.info.height], trial: [second.info.width, second.info.height], different: sameSize ? different : null };
}

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of viewports) for (const entry of pages) {
    const a = await shot(browser, live, viewport, entry, 'canli');
    const b = await shot(browser, trial, viewport, entry, 'deneme');
    results.push({ sayfa: entry[1], gorunum: viewport[0], ...await compare(a, b) });
  }
} finally { await browser.close(); }
await fs.writeFile(`${root}/pixels.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));

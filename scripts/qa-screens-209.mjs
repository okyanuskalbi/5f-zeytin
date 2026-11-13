/* global document, window, innerWidth, innerHeight, getComputedStyle, scrollTo, PerformanceObserver */
// Task209 browser evidence: every block of the landing page fits one phone screen (docs/tasks/209-telefonda-tek-ekran-bolumler.md).
// node scripts/qa-screens-209.mjs <local-url> <output-directory under output/>
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://localhost:3024');
assert(['localhost', '127.0.0.1'].includes(origin.hostname), 'Local verification only');
const out = path.resolve(process.argv[3] ?? 'output/task209/sonra');
assert(out.startsWith(path.resolve('output') + path.sep), 'Evidence belongs in project output/');
await fs.mkdir(out, { recursive: true });

const BLOCKS = ['hero', 'products', 'story', 'facility', 'harvest', 'business', 'blog', 'faq', 'contact', 'footer'];
/** [width, height, share of one screen a block may take]: the narrowest phone is best effort. */
const phones = [[360, 800, 1], [375, 812, 1], [390, 844, 1], [430, 932, 1], [320, 640, 1.1]];
const limits = { cls: 0.05, lcp: 2500 };
const TOUCH = 44;
const report = { origin: origin.href, phones: [], failures: [] };
const fail = (where, what) => report.failures.push(`${where}: ${what}`);

/** Scrolls through the page once so every lazy image loads and every section has arrived. */
async function settle(page, height) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height / 2) { await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y); await page.waitForTimeout(60); }
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
}

/** Runs in the page: block heights, the room under the sticky menu, overflow, pictures and touch targets. */
function inspect(touch) {
  const visible = element => {
    const box = element.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility !== 'visible' || node.hidden) return false;
    }
    return true;
  };
  const text = element => (element.getAttribute('aria-label') ?? element.innerText ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const header = document.querySelector('header[data-site-navbar]').getBoundingClientRect().bottom;
  const blocks = [...document.querySelectorAll('[data-phone-screen]')].map(block => {
    // A block may hold its own sideways shelf, never a vertical scroll area.
    const scrollers = [...block.querySelectorAll('*')].filter(node => node.scrollHeight > node.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(node).overflowY) && getComputedStyle(node).overflowX === 'visible');
    return { name: block.getAttribute('data-phone-screen'), height: Math.round(block.getBoundingClientRect().height), innerScroll: scrollers.length };
  });
  const small = [...document.querySelectorAll('header a, header button, main a, main button, main summary, footer a, footer button')].filter(visible).map(element => ({ element, box: element.getBoundingClientRect() }))
    .filter(({ box }) => box.width < touch - 0.5 || box.height < touch - 0.5).map(({ element, box }) => `${text(element) || element.tagName} ${Math.round(box.width)}x${Math.round(box.height)}`);
  const shelf = document.querySelector('[data-product-grid]');
  // Codex F3 (task 207-1): on a shelf card the words of the buy pill must not run under its cart coin (a sold-out pill has no coin).
  const buyPills = [...shelf.querySelectorAll('[data-pill]')].map(pill => {
    const range = document.createRange();
    range.selectNodeContents(pill.querySelector('[data-pill-label]'));
    const words = range.getBoundingClientRect(), coin = pill.querySelector('[data-coin]')?.getBoundingClientRect(), box = pill.getBoundingClientRect();
    return { label: text(pill), width: Math.round(box.width), gap: coin ? Math.round((coin.left - words.right) * 10) / 10 : null, inside: words.left >= box.left - 0.5 && words.right <= box.right + 0.5 };
  });
  return {
    screen: Math.round(innerHeight - header), header: Math.round(header), blocks, small,
    pageHeight: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src),
    shelf: { scrolls: shelf.scrollWidth > shelf.clientWidth + 1, snap: getComputedStyle(shelf).scrollSnapType, cards: shelf.children.length, buyPills },
    sheetOpen: !!document.querySelector('[role="dialog"]'),
  };
}

const browser = await chromium.launch();
try {
  for (const [width, height, share] of phones) {
    const name = `${width}x${height}`;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce', ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(() => {
      window.__cls = null; window.__lcp = null;
      const supported = PerformanceObserver.supportedEntryTypes ?? [];
      if (supported.includes('layout-shift')) { window.__cls = 0; new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); }
      if (supported.includes('largest-contentful-paint')) new PerformanceObserver(list => { window.__lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(new URL('/', origin).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const lcp = await page.evaluate(() => window.__lcp === null ? null : Math.round(window.__lcp));
    await settle(page, height);
    const cls = await page.evaluate(() => window.__cls === null ? null : Math.round(window.__cls * 1000) / 1000);
    const facts = { ...await page.evaluate(inspect, TOUCH), lcp, cls };
    if (cls === null || cls > limits.cls) fail(name, `CLS ${cls}`);
    if (lcp === null || lcp > limits.lcp) fail(name, `LCP ${lcp} ms`);
    for (const pill of facts.shelf.buyPills) if ((pill.gap !== null && pill.gap < 4) || !pill.inside) fail(name, `buy pill words meet the coin: ${JSON.stringify(pill)}`);
    const limit = Math.round(facts.screen * share);
    assert.deepEqual(facts.blocks.map(block => block.name), BLOCKS, `${name}: blocks`);
    for (const block of facts.blocks) {
      block.fits = block.height <= limit;
      if (!block.fits) fail(name, `${block.name} ${block.height}px > ${limit}px`);
      if (block.innerScroll) fail(name, `${block.name} scrolls inside`);
    }
    if (facts.overflow > 0) fail(name, `sideways overflow ${facts.overflow}px`);
    if (facts.brokenImages.length) fail(name, `broken images ${facts.brokenImages.join(', ')}`);
    if (facts.small.length) fail(name, `small targets ${facts.small.join(' | ')}`);
    if (!facts.shelf.scrolls || !facts.shelf.snap.startsWith('x')) fail(name, `shelf ${JSON.stringify(facts.shelf)}`);
    if (facts.sheetOpen) fail(name, 'a sheet is open on arrival');
    await page.screenshot({ path: path.join(out, `ana-sayfa-${width}.png`), fullPage: true, animations: 'disabled' });
    for (const [index, block] of BLOCKS.entries()) await page.locator(`[data-phone-screen="${block}"]`).screenshot({ path: path.join(out, `blok-${String(index + 1).padStart(2, '0')}-${block}-${width}.png`), animations: 'disabled' });

    // The two sheets: opened from their cards, closed again with the phone's back step.
    const sheets = [];
    for (const [action, title] of [['Teklif iste', 'Toptan teklif formu'], ['Başvuru yap', 'Bayilik başvurusu']]) {
      await page.getByRole('button', { name: action, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: title, exact: true });
      await dialog.waitFor();
      await page.waitForTimeout(600);
      const box = await dialog.boundingBox();
      const close = await dialog.getByRole('button', { name: 'Pencereyi kapat', exact: true }).boundingBox();
      const forms = await page.locator('#toptan, #basvuru').count();
      sheets.push({ title, fullScreen: box.width === width && Math.round(box.height) === height, close: `${Math.round(close.width)}x${Math.round(close.height)}`, url: page.url().replace(origin.origin, ''), formAnchors: forms });
      if (width === 390) await page.screenshot({ path: path.join(out, `pencere-${title === 'Toptan teklif formu' ? 'toptan' : 'bayilik'}-${width}.png`), animations: 'disabled' });
      await page.goBack();
      await dialog.waitFor({ state: 'detached' });
    }
    for (const sheet of sheets) if (!sheet.fullScreen || sheet.close !== '44x44') fail(name, `sheet ${JSON.stringify(sheet)}`);
    if (errors.length) fail(name, `console ${errors.join(' | ')}`);
    report.phones.push({ name, ...facts, limit, sheets, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(out, 'olcum.json'), `${JSON.stringify(report, null, 2)}\n`);
for (const phone of report.phones) {
  process.stdout.write(`${phone.name}: ekran ${phone.screen}px (sınır ${phone.limit}), sayfa ${phone.pageHeight}px, LCP ${phone.lcp} ms, CLS ${phone.cls}, sepete ekle yazı-simge arası en az ${Math.min(...phone.shelf.buyPills.filter(pill => pill.gap !== null).map(pill => pill.gap))}px\n`);
  for (const block of phone.blocks) process.stdout.write(`  ${block.fits ? 'sığıyor' : 'TAŞIYOR'}  ${block.name} ${block.height}px\n`);
}
process.stdout.write(report.failures.length ? `\n${report.failures.length} sorun:\n${report.failures.join('\n')}\n` : '\nSorun yok.\n');
process.exitCode = report.failures.length ? 1 : 0;

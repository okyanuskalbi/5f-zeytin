/* global document, window, innerWidth, innerHeight, getComputedStyle, PerformanceObserver, performance, scrollTo, NodeFilter, CSSKeyframesRule, CSSStyleRule */
// Task204 browser evidence for the "Altın Dal" design language (docs/DESIGN.md).
// node scripts/qa-design-v3.mjs <local-https-url> <output-directory> [home|shop|pages] [pages: route,names for a partial look]
//   home (default): Task204 home page evidence · shop: Task205 buying path (scripts/qa-design-v3-shop.mjs)
//   pages: Task206 remaining pages, account and admin (scripts/qa-design-v3-pages.mjs; needs a --local-auth server)
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { routes } from './qa-storefront-pages.mjs';
import { auditShop } from './qa-design-v3-shop.mjs';
import { auditPages } from './qa-design-v3-pages.mjs';

const origin = new URL(process.argv[2] ?? 'https://localhost:3024');
assert(['localhost', '127.0.0.1'].includes(origin.hostname), 'Local verification only');
const out = path.resolve(process.argv[3] ?? 'output/task204');
assert(out.startsWith(path.resolve('output') + path.sep), 'Evidence belongs in project output/');
const scope = process.argv[4] ?? 'home';
assert(['home', 'shop', 'pages'].includes(scope), 'Scope is home, shop or pages');
const shots = path.join(out, 'ekran');
await fs.mkdir(shots, { recursive: true });

const profiles = [[320, 568, 'chromium'], [390, 844, 'webkit'], [768, 1024, 'chromium'], [1024, 768, 'chromium'], [1440, 900, 'chromium'], [1920, 1080, 'chromium']];
const screenshotWidths = new Set([320, 390, 768, 1440]);
const limits = { cls: 0.05, phoneLcp: 2500, desktopLcp: 1500, phoneJs: 244_000, desktopJs: 412_000, touch: 44, headingContrast: 3, textContrast: 4.5 };
const engines = { chromium, webkit };
const browsers = {};
const report = { origin: origin.href, profiles: [], failures: [] };
const fail = (where, what) => report.failures.push(`${where}: ${what}`);

async function open(engine, options = {}) {
  browsers[engine] ??= await engines[engine].launch();
  const context = await browsers[engine].newContext({ ignoreHTTPSErrors: true, ...options });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return { context, page, errors };
}

async function settle(page, height) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height / 2) { await page.evaluate(top => scrollTo(0, top), y); await page.waitForTimeout(50); }
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(350);
}

/** Runs in the page: geometry and type facts for every pill, card label, target and text node. */
function inspectDesign(touch) {
  const visible = element => {
    const box = element.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || style.clipPath === 'inset(50%)') return false;
    }
    return true;
  };
  // Painted text lines only: hidden width-measure spans share the label's grid cell.
  const lines = element => {
    const tops = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || getComputedStyle(node.parentElement).visibility !== 'visible') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) if (box.width > 0.5 && !tops.some(top => Math.abs(top - box.top) < box.height / 2)) tops.push(box.top);
    }
    return tops.length;
  };
  const text = element => (element.innerText ?? element.textContent).trim().replace(/\s+/g, ' ');
  const pills = [...document.querySelectorAll('[data-pill]')].filter(visible).map(pill => {
    pill.scrollIntoView({ block: 'center', inline: 'center' });
    const box = pill.getBoundingClientRect();
    const style = getComputedStyle(pill);
    return {
      label: text(pill), variant: pill.dataset.variant, height: Math.round(box.height * 10) / 10, width: Math.round(box.width),
      radius: parseFloat(style.borderTopLeftRadius), lines: lines(pill.querySelector('[data-pill-label]') ?? pill),
      inside: box.left >= -0.5 && box.right <= innerWidth + 0.5, fontFamily: style.fontFamily,
    };
  });
  const cardActions = [...document.querySelectorAll('[data-card-action]')].filter(visible).map(label => {
    const box = label.getBoundingClientRect(), card = label.closest('a').getBoundingClientRect();
    return { label: text(label), lines: lines(label), inside: box.left >= card.left && box.right <= card.right + 0.5 };
  });
  const smallTargets = [...document.querySelectorAll('header a, header button, main a, main button, footer a, footer button')].filter(visible).map(target => {
    const box = target.getBoundingClientRect();
    return { label: target.getAttribute('aria-label') ?? text(target), width: Math.round(box.width), height: Math.round(box.height) };
  }).filter(target => target.height < touch || target.width < touch);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const smallText = new Set();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!node.textContent.trim() || parent.closest('svg, script, style, noscript') || !visible(parent)) continue;
    const size = parseFloat(getComputedStyle(parent).fontSize);
    if (size < 12) smallText.add(`${size}px ${text(parent).slice(0, 40)}`);
  }
  scrollTo(0, 0);
  return {
    pills, cardActions, smallTargets, smallText: [...smallText],
    overflow: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src),
    h1Font: getComputedStyle(document.querySelector('h1')).fontFamily, bodyFont: getComputedStyle(document.body).fontFamily,
    eyebrows: [...document.querySelectorAll('[data-eyebrow]')].map(eyebrow => eyebrow.innerText.trim()),
    sections: [...document.querySelectorAll('[data-home-section]')].map(section => ({ name: section.dataset.homeSection, visible: visible(section), height: Math.round(section.getBoundingClientRect().height) })),
    stamps: document.querySelectorAll('[data-stamp]').length, branches: document.querySelectorAll('[data-olive-branch]').length,
    darkBands: document.querySelectorAll('[data-home-section][data-tone="dark"]').length,
  };
}

function judge(name, facts) {
  for (const pill of facts.pills) {
    if (pill.height < limits.touch) fail(name, `pill "${pill.label}" height ${pill.height}`);
    if (pill.radius < pill.height / 2) fail(name, `pill "${pill.label}" radius ${pill.radius}`);
    if (pill.lines !== 1) fail(name, `pill "${pill.label}" wraps to ${pill.lines} lines`);
    if (!pill.inside) fail(name, `pill "${pill.label}" leaves the viewport`);
    if (!/Montserrat/i.test(pill.fontFamily)) fail(name, `pill "${pill.label}" font ${pill.fontFamily}`);
  }
  for (const action of facts.cardActions) if (action.lines !== 1 || !action.inside) fail(name, `card label "${action.label}" wraps or overflows`);
  for (const target of facts.smallTargets) fail(name, `touch target "${target.label}" ${target.width}x${target.height}`);
  for (const small of facts.smallText) fail(name, `text below 12px: ${small}`);
  if (facts.overflow > 0) fail(name, `horizontal overflow ${facts.overflow}px`);
  if (facts.brokenImages.length) fail(name, `broken images ${facts.brokenImages.join(', ')}`);
  if (!/Cormorant/i.test(facts.h1Font)) fail(name, `h1 font ${facts.h1Font}`);
  if (!/Montserrat/i.test(facts.bodyFont)) fail(name, `body font ${facts.bodyFont}`);
  for (const eyebrow of facts.eyebrows) if (!eyebrow.includes('İ') || /I/.test(eyebrow)) fail(name, `eyebrow "${eyebrow}" lost the dotted İ`);
  if (facts.sections.length !== 9 || facts.sections.some(section => !section.visible)) fail(name, 'a home section is missing or hidden');
  if (facts.stamps !== 1) fail(name, `${facts.stamps} stamps`);
  if (facts.branches > 2) fail(name, `${facts.branches} olive branches`);
  if (facts.darkBands > 2) fail(name, `${facts.darkBands} dark bands`);
}

async function auditProfile([width, height, engine]) {
  const name = `${width}x${height}-${engine}`;
  const phone = width < 800;
  const { context, page, errors } = await open(engine, { viewport: { width, height }, deviceScaleFactor: phone ? 2 : 1, hasTouch: width <= 1024, isMobile: phone });
  try {
    await page.addInitScript(() => {
      window.__cls = null;
      if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        window.__cls = 0;
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      }
    });
    await page.goto(origin.href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Asked before any screenshot: WebKit forgets loaded faces in fonts.check() after a capture.
    const turkishFaces = await page.evaluate(async sample => {
      const loaded = [...await document.fonts.load('700 48px Cormorant', sample), ...await document.fonts.load('600 15px Montserrat', sample)];
      return {
        count: loaded.length, loaded: loaded.every(face => face.status === 'loaded'), families: [...new Set(loaded.map(face => face.family.replaceAll('"', '')))],
        check: document.fonts.check('700 48px Cormorant', sample) && document.fonts.check('600 15px Montserrat', sample),
      };
    }, 'İıŞşĞğÇçÖöÜü');
    if (turkishFaces.count < 2 || !turkishFaces.loaded || !turkishFaces.check || !turkishFaces.families.every(family => /Cormorant|Montserrat/.test(family))) fail(name, `Turkish faces ${JSON.stringify(turkishFaces)}`);
    if (screenshotWidths.has(width)) await page.screenshot({ path: path.join(shots, `ana-sayfa-${width}-ilk.png`) });
    await settle(page, height);
    const facts = await page.evaluate(inspectDesign, limits.touch);
    await page.waitForTimeout(200);
    const cls = await page.evaluate(() => window.__cls);
    const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    const contrast = axe.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' ')));
    judge(name, facts);
    if (cls !== null && cls >= limits.cls) fail(name, `CLS ${cls}`);
    if (contrast.length) fail(name, `axe contrast ${contrast.join(' | ')}`);
    if (errors.length) fail(name, `console ${errors.join(' | ')}`);
    if (screenshotWidths.has(width)) {
      // Measuring scrolled each pill into view; show shelves from their first card again.
      await page.evaluate(() => { for (const element of document.querySelectorAll('main *')) if (element.scrollLeft) element.scrollLeft = 0; scrollTo(0, 0); });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(shots, `ana-sayfa-${width}-tam.png`), fullPage: true });
      const card = page.locator('[data-home-section="products"] article[data-product-id]').first();
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: path.join(shots, `urun-karti-${width}.png`) });
    }
    report.profiles.push({ name, cls, axeContrast: contrast.length, consoleErrors: errors.length, pills: facts.pills.length, minPillHeight: Math.min(...facts.pills.map(pill => pill.height)), overflow: facts.overflow, eyebrows: facts.eyebrows, h1Font: facts.h1Font, bodyFont: facts.bodyFont, turkishFaces });
    await fs.writeFile(path.join(out, `olcum-${name}.json`), JSON.stringify(facts, null, 1));
  } finally { await context.close(); }
}

const linear = channel => { const value = channel / 255; return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const IVORY = luminance([245, 241, 231]), GREEN = luminance([36, 58, 41]), GOLD = luminance([212, 180, 131]);

/** Brightest-twentieth luminance behind a text box, from a screenshot taken with the words hidden. */
async function backdrop(image, box, scale) {
  const left = Math.max(0, Math.floor(box.x * scale)), top = Math.max(0, Math.floor(box.y * scale));
  const region = { left, top, width: Math.max(1, Math.floor(box.width * scale)), height: Math.max(1, Math.floor(box.height * scale)) };
  const { data, info } = await sharp(image).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const values = [];
  for (let index = 0; index < data.length; index += info.channels) values.push(luminance([data[index], data[index + 1], data[index + 2]]));
  values.sort((a, b) => a - b);
  return { mean: values.reduce((sum, value) => sum + value, 0) / values.length, bright: values[Math.floor(values.length * 0.95)] };
}

async function heroContrast(width, height) {
  const scale = 1;
  const { context, page } = await open('chromium', { viewport: { width, height }, deviceScaleFactor: scale, isMobile: width < 800, hasTouch: width < 800 });
  try {
    await page.goto(origin.href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('#baslangic video', { timeout: 15_000 });
    const duration = await page.evaluate(async () => {
      const video = document.querySelector('#baslangic video');
      if (video.readyState < 1) await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, { once: true }));
      video.pause();
      return video.duration;
    });
    const boxes = await page.evaluate(() => Object.fromEntries([['title', '#hero-title'], ['lead', '#baslangic p'], ['button', '#baslangic [data-pill]']].map(([key, selector]) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return [key, { x: box.x, y: box.y, width: box.width, height: box.height }];
    })));
    // Hide only the words and the pill; the video and its darkening layer stay.
    await page.addStyleTag({ content: '#baslangic [data-overlay-ok] > * { visibility: hidden !important; } [data-media-control] { visibility: hidden !important; }' });
    const frames = [];
    const samples = 14;
    for (let index = 0; index < samples; index++) {
      const time = duration * (index + 0.5) / samples;
      await page.evaluate(async at => {
        const video = document.querySelector('#baslangic video');
        await new Promise(resolve => { video.addEventListener('seeked', resolve, { once: true }); video.currentTime = at; });
        await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      }, time);
      const image = await page.screenshot({ clip: { x: 0, y: 0, width, height: Math.min(height, 900) } });
      const [title, lead, button] = await Promise.all([backdrop(image, boxes.title, scale), backdrop(image, boxes.lead, scale), backdrop(image, boxes.button, scale)]);
      frames.push({ time: Math.round(time * 10) / 10, brightness: title.mean, title: ratio(IVORY, title.bright), lead: ratio(IVORY, lead.bright), pillOnVideo: ratio(GOLD, button.mean) });
    }
    const brightest = [...frames].sort((a, b) => b.brightness - a.brightness).slice(0, 3);
    for (const frame of brightest) {
      if (frame.title < limits.headingContrast) fail(`hero-${width}`, `title ${frame.title.toFixed(2)}:1 at ${frame.time}s`);
      if (frame.lead < limits.textContrast) fail(`hero-${width}`, `lead ${frame.lead.toFixed(2)}:1 at ${frame.time}s`);
    }
    return { width, duration, frames: frames.length, brightest, worstTitle: Math.min(...frames.map(frame => frame.title)), worstLead: Math.min(...frames.map(frame => frame.lead)), buttonLabel: ratio(GOLD, GREEN) };
  } finally { await context.close(); }
}

/** Same method as scripts/qa-storefront-performance-199.mjs; `scale` adds a real phone pixel density. */
/** Words on photo cards: sampled behind each text box with the words hidden, like the hero. */
async function overlayCards(width, height) {
  const { context, page } = await open('chromium', { viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 800, hasTouch: width < 800 });
  try {
    await page.goto(origin.href, { waitUntil: 'networkidle' });
    await settle(page, height);
    const cards = page.locator('a[data-home-category], [data-home-section="banners"] a');
    const rows = [];
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      const texts = await card.evaluate(element => {
        const frame = element.getBoundingClientRect();
        return [...element.querySelectorAll('h2, [data-card-action]')].map(node => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const box = range.getBoundingClientRect();
          return { text: node.textContent.trim(), large: node.tagName === 'H2', x: box.x - frame.x, y: box.y - frame.y, width: box.width, height: box.height };
        });
      });
      await card.evaluate(element => { for (const node of element.querySelectorAll('h2, [data-card-action]')) node.style.visibility = 'hidden'; });
      const image = await card.screenshot();
      await card.evaluate(element => { for (const node of element.querySelectorAll('h2, [data-card-action]')) node.style.visibility = ''; });
      for (const text of texts) {
        const behind = await backdrop(image, text, 1);
        const contrast = ratio(IVORY, behind.bright);
        if (contrast < (text.large ? limits.headingContrast : limits.textContrast)) fail(`overlay-${width}`, `"${text.text}" ${contrast.toFixed(2)}:1`);
        rows.push({ text: text.text, large: text.large, contrast });
      }
    }
    return { width, rows };
  } finally { await context.close(); }
}

async function performanceRun(mobile, scale = 1) {
  const { context, page } = await open('chromium', { viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: scale });
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (mobile) {
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await page.addInitScript(() => {
      window.metrics = { lcp: 0, cls: 0, lcpElement: '' };
      new PerformanceObserver(list => { const entry = list.getEntries().at(-1); window.metrics.lcp = entry.startTime; window.metrics.lcpElement = `${entry.element?.tagName ?? ''} ${(entry.url ?? '').split('/').pop()}`.trim(); }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.metrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(origin.href, { waitUntil: 'load' });
    await page.waitForTimeout(mobile ? 5000 : 1500);
    const data = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const bytes = pattern => resources.filter(entry => pattern.test(new URL(entry.name).pathname)).reduce((sum, entry) => sum + entry.encodedBodySize, 0);
      return { ...window.metrics, js: bytes(/\.js$/), css: bytes(/\.css$/), fonts: bytes(/\.woff2$/), fontFiles: resources.filter(entry => /\.woff2$/.test(new URL(entry.name).pathname)).length };
    });
    const where = mobile ? `performance-phone-${scale}x` : 'performance-desktop';
    if (data.lcp > (mobile ? limits.phoneLcp : limits.desktopLcp)) fail(where, `LCP ${Math.round(data.lcp)} ms`);
    if (data.js > (mobile ? limits.phoneJs : limits.desktopJs)) fail(where, `first JS ${data.js} bytes`);
    if (data.cls >= limits.cls) fail(where, `CLS ${data.cls}`);
    return { mobile, scale, ...data };
  } finally { await context.close(); }
}

async function reducedMotion() {
  const { context, page, errors } = await open('chromium', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(origin.href, { waitUntil: 'networkidle' });
    await settle(page, 844);
    const add = page.locator('[data-home-section="products"] article[data-product-id]').first().getByRole('button', { name: 'Sepete ekle', exact: true });
    await add.scrollIntoViewIfNeeded();
    await add.click();
    const added = page.locator('[data-home-section="products"] article[data-product-id]').first().getByRole('button', { name: 'Eklendi', exact: true });
    await added.waitFor({ timeout: 3000 });
    const facts = await page.evaluate(() => ({
      running: document.getAnimations().filter(animation => animation.playState === 'running').length,
      video: document.querySelector('#baslangic video') !== null,
      status: document.querySelector('[data-home-section="products"] [role="status"]').textContent,
      hiddenSections: [...document.querySelectorAll('[data-home-section]')].filter(section => Number(getComputedStyle(section).opacity) < 1 || section.getBoundingClientRect().height < 1).length,
      badge: document.querySelector('[data-cart-count]')?.textContent ?? null,
    }));
    if (facts.running) fail('reduced-motion', `${facts.running} running animations`);
    if (facts.video) fail('reduced-motion', 'video mounted');
    if (!facts.status.includes('sepete eklendi') || facts.badge !== '1') fail('reduced-motion', 'addition feedback is not visible as text');
    if (facts.hiddenSections) fail('reduced-motion', 'hidden section');
    if (errors.length) fail('reduced-motion', `console ${errors.join(' | ')}`);
    return facts;
  } finally { await context.close(); }
}

async function withoutScript() {
  const { context, page } = await open('chromium', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  try {
    await page.goto(origin.href, { waitUntil: 'load' });
    const facts = await page.evaluate(() => {
      const shown = element => { const box = element.getBoundingClientRect(); const style = getComputedStyle(element); return box.width > 0 && box.height > 0 && style.visibility === 'visible' && Number(style.opacity) === 1; };
      const soldOut = [...document.querySelectorAll('[data-pill]')].find(pill => pill.textContent.trim() === 'Mevcut değil');
      return {
        sections: [...document.querySelectorAll('[data-home-section]')].filter(shown).length,
        heading: shown(document.querySelector('h1')),
        pills: [...document.querySelectorAll('main [data-pill]')].filter(pill => !shown(pill)).length,
        links: [...document.querySelectorAll('main a[href]')].filter(shown).length,
        soldOut: soldOut ? { shown: shown(soldOut), color: getComputedStyle(soldOut).color, background: getComputedStyle(soldOut).backgroundColor, coin: soldOut.querySelector('[data-coin]') !== null } : null,
      };
    });
    const rgb = value => value.match(/\d+/g).slice(0, 3).map(Number);
    facts.soldOutContrast = facts.soldOut ? ratio(luminance(rgb(facts.soldOut.color)), luminance(rgb(facts.soldOut.background))) : 0;
    if (facts.sections !== 9 || !facts.heading || facts.pills) fail('no-script', 'content or actions hidden without JavaScript');
    if (!facts.soldOut?.shown || facts.soldOut.coin || facts.soldOutContrast < limits.textContrast) fail('no-script', '"Mevcut değil" is not readable');
    await page.screenshot({ path: path.join(shots, 'js-kapali-390.png'), fullPage: true });
    return facts;
  } finally { await context.close(); }
}

/** Real pill classes, cloned from the page; hover and focus are forced through CDP. */
async function pillStates() {
  const { context, page } = await open('chromium', { viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(origin.href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      const source = document.querySelector('main a[data-pill][data-variant="primary"]');
      let waitClass = '';
      for (const sheet of document.styleSheets) {
        const rules = [...sheet.cssRules];
        const frames = rules.find(rule => rule instanceof CSSKeyframesRule && rule.name.includes('pill-wait'));
        const owner = frames && rules.find(rule => rule instanceof CSSStyleRule && rule.style.animationName === frames.name);
        if (owner) waitClass = owner.selectorText.replace(/^\./, '');
      }
      const board = document.createElement('div');
      board.id = 'pill-states';
      board.style.cssText = 'position:fixed;inset:0;z-index:9999;overflow:auto;padding:32px;background:#F5F1E7;font:500 13px var(--font-body);color:#243A29';
      const states = ['duran', 'hover', 'odak', 'busy', 'disabled'];
      for (const [variant, label] of [['primary', 'Sepete ekle'], ['gold', 'Teklif İste'], ['outline', 'Hakkımızda'], ['quiet', 'Teklife ekle']]) {
        const row = document.createElement('div');
        row.style.cssText = `display:grid;grid-template-columns:96px repeat(5,minmax(0,1fr));align-items:center;gap:24px;padding:24px;margin-bottom:16px;border-radius:24px;background:${variant === 'gold' ? '#243A29' : '#FFFDF8'};color:${variant === 'gold' ? '#F5F1E7' : '#243A29'}`;
        row.append(Object.assign(document.createElement('strong'), { textContent: variant }));
        for (const state of states) {
          const cell = document.createElement('div');
          cell.style.cssText = 'display:grid;justify-items:start;gap:12px';
          // A quiet pill is always a link: it has no busy or disabled state.
          if (variant === 'quiet' && (state === 'busy' || state === 'disabled')) { cell.textContent = `${state}: kullanılmaz`; row.append(cell); continue; }
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = source.className;
          pill.dataset.pill = ''; pill.dataset.variant = variant; pill.dataset.size = 'lg'; pill.dataset.state = state;
          pill.innerHTML = source.innerHTML;
          pill.querySelector('[data-pill-label]').textContent = state === 'disabled' && variant !== 'quiet' ? 'Mevcut değil' : label;
          const coin = pill.querySelector('[data-coin]');
          if (variant === 'quiet' || state === 'disabled') coin.remove();
          if (state === 'busy') { pill.disabled = true; pill.setAttribute('aria-busy', 'true'); coin.innerHTML = `<span class="${waitClass}"></span>`; }
          if (state === 'disabled') pill.disabled = true;
          cell.append(pill, Object.assign(document.createElement('span'), { textContent: state }));
          row.append(cell);
        }
        board.append(row);
      }
      document.body.append(board);
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    for (const [state, forced] of [['hover', ['hover']], ['odak', ['focus', 'focus-visible']]]) {
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: `#pill-states [data-state="${state}"]` });
      for (const nodeId of nodeIds) await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: forced });
    }
    await page.waitForTimeout(400);
    await page.locator('#pill-states').screenshot({ path: path.join(shots, 'dugme-durumlari.png') });
  } finally { await context.close(); }
}

async function otherRoutes() {
  const results = [];
  const { context, page, errors } = await open('chromium', { viewport: { width: 1440, height: 900 } });
  try {
    for (const [name, route] of routes) {
      errors.length = 0;
      const response = await page.goto(new URL(route, origin).href, { waitUntil: 'networkidle' });
      const status = response.status();
      const denied = name === '404' || status === 401 || status === 403;
      const serious = errors.filter(message => !(denied && /status of (401|403|404)/.test(message)));
      const expected = name === '404' ? status === 404 : [200, 401].includes(status);
      if (!expected) fail(`route ${route}`, `status ${status}`);
      if (serious.length) fail(`route ${route}`, `console ${serious.join(' | ')}`);
      results.push({ name, route, status, final: new URL(page.url()).pathname, consoleErrors: serious.length, overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), heightOk: await page.evaluate(() => document.body.scrollHeight >= innerHeight) });
    }
    return results;
  } finally { await context.close(); }
}

if (scope === 'shop') {
  let shop;
  try { shop = await auditShop({ origin, out, shots, open, settle, inspectDesign, limits, fail }); }
  finally { for (const browser of Object.values(browsers)) await browser.close(); }
  const cls = shop.pages.map(page => page.cls).filter(value => value !== null);
  console.log(JSON.stringify({
    failures: report.failures, pages: shop.pages.length, maxCls: Math.max(0, ...cls), clsUnmeasured: shop.pages.filter(page => page.cls === null).length,
    axeContrast: shop.pages.reduce((sum, page) => sum + page.axeContrast, 0), consoleErrors: shop.pages.reduce((sum, page) => sum + page.consoleErrors, 0),
    overflow: Math.max(0, ...shop.pages.map(page => page.overflow)), minPillHeight: Math.min(...shop.pages.map(page => page.minPillHeight).filter(Boolean)),
    flows: shop.flows.map(flow => ({ where: flow.where, steps: flow.steps.map(step => `${step.ok ? 'ok' : 'FAIL'} ${step.name}`) })), keyboard: shop.keyboard,
  }, null, 1));
  process.exit(report.failures.length ? 1 : 0);
}

if (scope === 'pages') {
  let pages;
  try { pages = await auditPages({ origin, out, shots, open, settle, inspectDesign, limits, fail, browsers, engines, only: (process.argv[5] ?? '').split(',').filter(Boolean) }); }
  finally { for (const browser of Object.values(browsers)) await browser.close(); }
  const cls = pages.pages.map(page => page.cls).filter(value => value !== null);
  console.log(JSON.stringify({
    failures: report.failures, pages: pages.pages.length, maxCls: Math.max(0, ...cls), clsUnmeasured: pages.pages.filter(page => page.cls === null).length,
    axeContrast: pages.pages.reduce((sum, page) => sum + page.axeContrast, 0), consoleErrors: pages.pages.reduce((sum, page) => sum + page.consoleErrors, 0),
    overflow: Math.max(0, ...pages.pages.map(page => page.overflow)), minPillHeight: Math.min(...pages.pages.map(page => page.minPillHeight).filter(Boolean)),
    auth: pages.auth, checks: pages.checks, flows: pages.flows.map(flow => ({ where: flow.where, steps: flow.steps.map(step => `${step.ok ? 'ok' : 'FAIL'} ${step.name}`) })),
  }, null, 1));
  process.exit(report.failures.length ? 1 : 0);
}

try {
  for (const profile of profiles) await auditProfile(profile);
  report.hero = [await heroContrast(1440, 900), await heroContrast(390, 844)];
  report.overlays = [await overlayCards(1440, 900), await overlayCards(768, 1024), await overlayCards(390, 844), await overlayCards(320, 568)];
  report.performance = [await performanceRun(true), await performanceRun(true, 3), await performanceRun(false)];
  report.reducedMotion = await reducedMotion();
  report.noScript = await withoutScript();
  await pillStates();
  report.routes = await otherRoutes();
} finally {
  for (const browser of Object.values(browsers)) await browser.close();
}

const fixed = value => value.toFixed(2);
await fs.writeFile(path.join(out, 'KONTRAST.md'), [
  '# Hero karşıtlık ölçümü (Task204)', '',
  'Yöntem: yerel üretim derlemesi, Chromium. Video 14 eşit aralıkta durdurulur; başlık, açıklama ve düğme gizlenip yalnız video + koyulaştırma katmanının ekran görüntüsü alınır. Her yazı kutusunun arkasındaki piksellerin **en parlak %5 eşiği** fildişi yazıyla (#F5F1E7) karşılaştırılır. En açık 3 kare başlık kutusunun ortalama parlaklığına göre seçilir.', '',
  ...report.hero.flatMap(hero => [
    `## ${hero.width} px (video ${hero.duration.toFixed(1)} sn, ${hero.frames} kare)`, '',
    '| Kare (sn) | Başlık (≥ 3:1) | Açıklama (≥ 4,5:1) | Altın hap / video zemini |', '|---|---|---|---|',
    ...hero.brightest.map(frame => `| ${frame.time} | ${fixed(frame.title)}:1 | ${fixed(frame.lead)}:1 | ${fixed(frame.pillOnVideo)}:1 |`), '',
    `Bütün karelerde en düşük: başlık ${fixed(hero.worstTitle)}:1, açıklama ${fixed(hero.worstLead)}:1. Düğme yazısı kendi altın dolgusunun üstündedir: yeşil/altın ${fixed(hero.buttonLabel)}:1 (videodan bağımsız).`, '',
  ]),
  '# Fotoğraf kartlarındaki yazı (4 kutu + üçlü banner)', '',
  'Aynı yöntem: yazı gizlenir, kartın ekran görüntüsünde yazı kutusunun arkasındaki en parlak %5 eşiği fildişi yazıyla karşılaştırılır. Başlık (Cormorant 24–28 px) büyük metindir (≥ 3:1); eylem metni ≥ 4,5:1.', '',
  ...report.overlays.flatMap(view => [`## ${view.width} px`, '', '| Yazı | Tür | Karşıtlık |', '|---|---|---|', ...view.rows.map(row => `| ${row.text} | ${row.large ? 'başlık' : 'eylem metni'} | ${fixed(row.contrast)}:1 |`), '']),
].join('\n'));
await fs.writeFile(path.join(out, 'olcum.json'), JSON.stringify(report, null, 1));
const summary = { failures: report.failures, profiles: report.profiles.map(profile => ({ name: profile.name, cls: profile.cls, axeContrast: profile.axeContrast, consoleErrors: profile.consoleErrors, pills: profile.pills, minPillHeight: profile.minPillHeight, overflow: profile.overflow })), performance: report.performance, hero: report.hero.map(hero => ({ width: hero.width, worstTitle: hero.worstTitle, worstLead: hero.worstLead })), overlayWorst: report.overlays.map(view => ({ width: view.width, heading: Math.min(...view.rows.filter(row => row.large).map(row => row.contrast)), action: Math.min(...view.rows.filter(row => !row.large).map(row => row.contrast)) })), reducedMotion: report.reducedMotion, noScript: report.noScript, routes: { total: report.routes.length, statuses: Object.groupBy(report.routes, entry => entry.status) } };
for (const [status, list] of Object.entries(summary.routes.statuses)) summary.routes.statuses[status] = list.length;
console.log(JSON.stringify(summary, null, 1));
process.exitCode = report.failures.length ? 1 : 0;

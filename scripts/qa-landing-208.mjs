/* global document, window, innerWidth, innerHeight, getComputedStyle, PerformanceObserver, performance, scrollTo, location */
// Task208 browser evidence for the one-page landing (docs/tasks/208-tek-sayfa-landing.md).
// node scripts/qa-landing-208.mjs <local-https-url> <output-directory>
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://localhost:3034');
assert(['localhost', '127.0.0.1'].includes(origin.hostname), 'Local verification only');
const out = path.resolve(process.argv[3] ?? 'output/task208');
assert(out.startsWith(path.resolve('output') + path.sep), 'Evidence belongs in project output/');
const shots = path.join(out, 'ekran');
await fs.mkdir(shots, { recursive: true });

const SECTIONS = ['baslangic', 'urunler', 'hikayemiz', 'toptan-bayilik', 'blog', 'iletisim'];
const MENU = [['Ürünler', 'urunler'], ['Hikâyemiz', 'hikayemiz'], ['Toptan & Bayilik', 'toptan-bayilik'], ['Blog', 'blog'], ['İletişim', 'iletisim']];
const REDIRECTS = [
  ['/urunler', '/#urunler'], ['/urunler/zeytin', '/?kategori=zeytin#urunler'], ['/hakkimizda', '/#hikayemiz'],
  ['/toptan-satis', '/?sekme=toptan#toptan-bayilik'], ['/bayilik', '/?sekme=bayilik#toptan-bayilik'], ['/blog', '/#blog'],
];
const widths = [[320, 568], [360, 740], [390, 844], [430, 932], [768, 1024], [1440, 900]];
const shotWidths = new Set([320, 390, 1440]);
const limits = { touch: 44, gap: 8, cls: 0.05, phoneLcp: 2500, phoneJs: 250_000, landMin: 0, landMax: 24 };
const sectionPadding = width => width <= 767 ? [36, 40] : width <= 1099 ? [48, 48] : [56, 64];
const engines = { chromium, webkit };
const browsers = {};
const report = { origin: origin.href, pages: [], failures: [] };
const fail = (where, what) => report.failures.push(`${where}: ${what}`);
const phone = width => width < 800;
const viewport = (width, height, extra = {}) => ({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: phone(width), hasTouch: width <= 1024, ...extra });

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
const url = route => new URL(route, origin).href;

/** Scrolls through the page once so every lazy image loads and every section has arrived. */
async function settle(page, height) {
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height / 2) { await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y); await page.waitForTimeout(60); }
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
}

/** Waits until the window stops scrolling (smooth in-page navigation). */
async function restingScroll(page) {
  let last = -1;
  for (let tries = 0; tries < 60; tries++) {
    const now = await page.evaluate(() => Math.round(window.scrollY));
    if (now === last) return now;
    last = now;
    await page.waitForTimeout(120);
  }
  return last;
}

const landing = (page, id) => page.evaluate(sectionId => {
  const box = document.getElementById(sectionId).getBoundingClientRect();
  const header = document.querySelector('header[data-site-navbar]').getBoundingClientRect().bottom;
  return { top: Math.round(box.top), header: Math.round(header), gap: Math.round(box.top - header), hash: location.hash, current: [...document.querySelectorAll('header nav a[aria-current]')].map(link => link.textContent.trim()) };
}, id);

/** Runs in the page: layout, spacing and touch facts of the landing page. */
function inspectLanding(touch) {
  const visible = element => {
    const box = element.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || node.hidden || style.clipPath === 'inset(50%)') return false;
    }
    return true;
  };
  const text = element => (element.getAttribute('aria-label') ?? element.innerText ?? element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50);
  const sections = [...document.querySelectorAll('[data-landing-section]')].map(section => {
    const style = getComputedStyle(section);
    return { id: section.id, height: Math.round(section.getBoundingClientRect().height), paddingTop: parseFloat(style.paddingTop), paddingBottom: parseFloat(style.paddingBottom), background: style.backgroundColor, reveal: section.getAttribute('data-reveal'), opacity: section.querySelector(':scope > div') ? Number(getComputedStyle(section.querySelector(':scope > div')).opacity) : 1 };
  });
  // Touch targets: a checkbox answers through its label.
  const targets = [...document.querySelectorAll('header a, header button, main a, main button, main summary, main input:not([type="hidden"]), main select, main textarea, footer a, footer button')]
    .filter(visible).filter(element => !element.matches(':disabled')).map(element => {
      let box = element.getBoundingClientRect();
      if (element.matches('input[type="checkbox"], input[type="radio"]')) { const label = element.closest('label'); if (label) box = label.getBoundingClientRect(); }
      return { element, label: text(element) || element.getAttribute('name') || element.tagName, left: box.left, right: box.right, top: box.top + window.scrollY, bottom: box.bottom + window.scrollY, width: box.width, height: box.height };
    });
  const small = targets.filter(target => target.width < touch - 0.5 || target.height < touch - 0.5).map(target => `${target.label} ${Math.round(target.width)}x${Math.round(target.height)}`);
  // Neighbours: two targets that share a row or a column and sit closer than 8 px (nested targets are one target).
  const close = [];
  for (let first = 0; first < targets.length; first++) for (let second = first + 1; second < targets.length; second++) {
    const a = targets[first], b = targets[second];
    if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
    const dx = Math.max(a.left - b.right, b.left - a.right), dy = Math.max(a.top - b.bottom, b.top - a.bottom);
    const sameRow = dy < 0 && dx >= -0.5, sameColumn = dx < 0 && dy >= -0.5;
    const gap = sameRow ? dx : sameColumn ? dy : Infinity;
    if (gap < 7.5) close.push(`${a.label} | ${b.label}: ${Math.round(gap * 10) / 10}px`);
  }
  const fields = [...document.querySelectorAll('main input:not([type="hidden"]):not([type="checkbox"]), main select, main textarea')].filter(visible).map(field => ({
    name: field.getAttribute('name') ?? field.id, size: parseFloat(getComputedStyle(field).fontSize), inputmode: field.getAttribute('inputmode'), type: field.getAttribute('type'), autocomplete: field.getAttribute('autocomplete'),
  }));
  const pills = [...document.querySelectorAll('[data-pill]')].filter(visible).map(pill => {
    const box = pill.getBoundingClientRect(), label = pill.querySelector('[data-pill-label]');
    return { label: text(pill), variant: pill.dataset.variant, height: Math.round(box.height), oneLine: !label || label.getBoundingClientRect().height < parseFloat(getComputedStyle(pill).fontSize) * 2, inside: box.left >= -0.5 && box.right <= innerWidth + 0.5, underline: getComputedStyle(label ?? pill).textDecorationLine };
  });
  const hero = document.querySelector('#baslangic'), heroPill = hero.querySelector('[data-pill]').getBoundingClientRect(), title = hero.querySelector('h1').getBoundingClientRect();
  const slogan = (document.body.innerText.match(/Kökü toprakta/g) ?? []).length;
  return {
    ids: sections.map(section => section.id), sections, pageHeight: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth,
    small, close, fields, pills, slogan,
    firstScreen: { title: title.top >= 0 && title.bottom <= innerHeight, action: heroPill.top >= 0 && heroPill.bottom <= innerHeight },
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src),
    stamps: document.querySelectorAll('[data-stamp]').length, stampInStory: !!document.querySelector('#hikayemiz [data-stamp]'), branches: document.querySelectorAll('[data-olive-branch]').length,
    darkSections: [...document.querySelectorAll('main [data-tone="dark"], main [data-surface="dark"]')].length,
    productCards: document.querySelectorAll('#urunler article[data-product-id]').length,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  };
}

async function auditHome([width, height], engine = 'chromium') {
  const name = `${width}x${height}-${engine}`;
  const { context, page, errors } = await open(engine, viewport(width, height));
  try {
    await page.addInitScript(() => {
      window.__cls = null;
      if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        window.__cls = 0;
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      }
    });
    await page.goto(url('/'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const pending = await page.evaluate(() => [...document.querySelectorAll('[data-reveal="pending"]')].map(section => section.id));
    if (shotWidths.has(width)) await page.screenshot({ path: path.join(shots, `ana-sayfa-${width}-ilk.png`) });
    await settle(page, height);
    const facts = await page.evaluate(inspectLanding, limits.touch);
    const cls = await page.evaluate(() => window.__cls);
    const axe = await new AxeBuilder({ page }).analyze();
    const violations = axe.violations.map(violation => `${violation.id} (${violation.nodes.length}): ${violation.nodes[0].target.join(' ')}`);
    const [low, high] = sectionPadding(width);
    if (facts.ids.join() !== SECTIONS.join()) fail(name, `sections ${facts.ids.join()}`);
    for (const section of facts.sections.slice(1)) {
      if (section.paddingTop < low || section.paddingTop > high || section.paddingBottom < low || section.paddingBottom > high) fail(name, `#${section.id} padding ${section.paddingTop}/${section.paddingBottom}, wanted ${low}-${high}`);
      if (section.opacity < 1) fail(name, `#${section.id} still hidden after it came into view`);
    }
    if (facts.overflow > 0) fail(name, `horizontal overflow ${facts.overflow}px`);
    if (facts.brokenImages.length) fail(name, `broken images ${facts.brokenImages.join(', ')}`);
    if (phone(width) || width === 768) for (const item of facts.small) fail(name, `touch target ${item}`);
    for (const item of facts.close) fail(name, `neighbours closer than ${limits.gap}px: ${item}`);
    for (const field of facts.fields) if (field.size < 16) fail(name, `field ${field.name} font ${field.size}px`);
    for (const pill of facts.pills) {
      if (pill.height < limits.touch) fail(name, `pill "${pill.label}" height ${pill.height}`);
      if (!pill.oneLine || !pill.inside) fail(name, `pill "${pill.label}" wraps or leaves the viewport`);
      if (pill.underline !== 'none') fail(name, `pill "${pill.label}" is underlined`);
      if (width <= 640 && pill.variant === 'quiet' && pill.height < 48) fail(name, `quiet pill "${pill.label}" is ${pill.height}px on a phone`);
    }
    if (!facts.firstScreen.title || !facts.firstScreen.action) fail(name, `first screen ${JSON.stringify(facts.firstScreen)}`);
    if (facts.stamps !== 1 || !facts.stampInStory) fail(name, `${facts.stamps} stamps`);
    if (facts.branches > 2) fail(name, `${facts.branches} olive branches`);
    if (facts.darkSections) fail(name, `${facts.darkSections} dark bands in the page`);
    if (facts.slogan > 2) fail(name, `slogan ${facts.slogan} times`);
    if (facts.productCards !== 6) fail(name, `${facts.productCards} product cards`);
    if (facts.scrollBehavior !== 'smooth') fail(name, `scroll-behavior ${facts.scrollBehavior}`);
    if (cls !== null && cls >= limits.cls) fail(name, `CLS ${cls}`);
    if (violations.length) fail(name, `axe ${violations.join(' | ')}`);
    if (errors.length) fail(name, `console ${errors.join(' | ')}`);
    if (shotWidths.has(width) && engine === 'chromium') {
      await page.screenshot({ path: path.join(shots, `ana-sayfa-${width}-tam.png`), fullPage: true });
      // Cut from the full-page capture: the sticky menu stays at the top of the page instead of crossing the footer.
      const footer = await page.evaluate(() => { document.activeElement?.blur(); const box = document.querySelector('footer').getBoundingClientRect(); return { x: 0, y: Math.round(box.top + window.scrollY), width: innerWidth, height: Math.round(box.height) }; });
      await page.screenshot({ path: path.join(shots, `alt-bilgi-${width}.png`), fullPage: true, clip: footer });
    }
    report.pages.push({ name, pageHeight: facts.pageHeight, sections: facts.sections.map(section => `${section.id} ${section.height} (${section.paddingTop}/${section.paddingBottom})`), overflow: facts.overflow, cls, axe: violations.length, consoleErrors: errors.length, pills: facts.pills.length, minPill: Math.min(...facts.pills.map(pill => pill.height)), smallTargets: facts.small.length, closeNeighbours: facts.close.length, pendingAtLoad: pending, fields: facts.fields });
  } finally { await context.close(); }
}

/** Desktop menu: every link lands its section 8 px below the sticky header and marks itself. */
async function desktopMenu() {
  const { context, page } = await open('chromium', viewport(1440, 900));
  const rows = [];
  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' });
    for (const [label, id] of MENU) {
      await page.getByRole('navigation', { name: 'Ana navigasyon' }).getByRole('link', { name: label, exact: true }).click();
      await restingScroll(page);
      await page.waitForTimeout(250);
      const landed = await landing(page, id);
      rows.push({ label, ...landed });
      // The last section may not reach the header when the page ends first.
      const atEnd = await page.evaluate(() => Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 1);
      if (landed.hash !== `#${id}` || landed.gap < limits.landMin || (landed.gap > limits.landMax && !atEnd)) fail(`menu ${label}`, JSON.stringify(landed));
      if (!atEnd && landed.current.join() !== label) fail(`menu ${label}`, `marked ${landed.current.join()}`);
    }
    const marker = await page.evaluate(() => { const link = document.querySelector('header nav a[aria-current]'); return link ? getComputedStyle(link, '::after').transitionDuration : null; });
    if (marker && marker !== '0s') fail('menu', `active marker animates (${marker})`);
    report.desktopMenu = rows;
  } finally { await context.close(); }
}

/** Phone drawer: a tap closes it, lands the section under the header, and Back returns. */
async function phoneMenu(width, height, engine) {
  const where = `drawer ${width}-${engine}`;
  const { context, page, errors } = await open(engine, viewport(width, height));
  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Menüyü aç', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForTimeout(400);
    const links = await dialog.locator('nav[aria-label="Mobil navigasyon"] a').evaluateAll(nodes => nodes.map(node => [node.textContent.trim(), node.getAttribute('href'), Math.round(node.getBoundingClientRect().height)]));
    if (engine === 'chromium') await page.screenshot({ path: path.join(shots, `menu-cekmecesi-${width}.png`) });
    if (links.map(link => link[1]).join() !== MENU.map(([, id]) => `/#${id}`).join()) fail(where, `links ${JSON.stringify(links)}`);
    if (await dialog.locator('[data-pill]').count()) fail(where, 'drawer still has a pill');
    const rows = [];
    for (const [label, id] of [['İletişim', 'iletisim'], ['Hikâyemiz', 'hikayemiz']]) {
      if (!(await dialog.isVisible())) { await page.getByRole('button', { name: 'Menüyü aç', exact: true }).click(); await dialog.waitFor(); await page.waitForTimeout(300); }
      await dialog.getByRole('link', { name: label, exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      await restingScroll(page);
      await page.waitForTimeout(300);
      const landed = await landing(page, id);
      const atEnd = await page.evaluate(() => Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 1);
      const locked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden' || document.body.hasAttribute('data-scroll-locked'));
      rows.push({ label, ...landed, atEnd, locked });
      if (landed.hash !== `#${id}` || landed.gap < limits.landMin || (landed.gap > limits.landMax && !atEnd) || locked) fail(`${where} ${label}`, JSON.stringify({ ...landed, locked }));
    }
    await page.goBack();
    await page.waitForTimeout(600);
    const back = await page.evaluate(() => ({ path: location.pathname, hash: location.hash }));
    if (back.path !== '/' || back.hash !== '#iletisim') fail(where, `back went to ${JSON.stringify(back)}`);
    // From another page the same link opens the home page at its section.
    await page.goto(url('/sepet'), { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Menüyü aç', exact: true }).click();
    await dialog.waitFor();
    await dialog.getByRole('link', { name: 'Blog', exact: true }).click();
    await page.waitForURL(url('/#blog'));
    await restingScroll(page);
    await page.waitForTimeout(500);
    const fromCart = await landing(page, 'blog');
    if (fromCart.gap < limits.landMin || fromCart.gap > limits.landMax) fail(`${where} from /sepet`, JSON.stringify(fromCart));
    const serious = errors.filter(message => !/status of 40[0-9]|Failed to load resource/.test(message));
    if (serious.length) fail(where, `console ${serious.join(' | ')}`);
    report.phoneMenu = [...(report.phoneMenu ?? []), { engine, width, links, rows, back, fromCart }];
  } finally { await context.close(); }
}

/** Category and business pills: in place, shareable, no reload. */
async function pillsInPlace(width, height, engine) {
  const where = `pills ${width}-${engine}`;
  const { context, page, errors } = await open(engine, viewport(width, height));
  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' });
    await page.evaluate(() => { window.__sameDocument = true; });
    const products = page.locator('#urunler');
    await products.getByRole('radio', { name: 'Zeytinyağı', exact: true }).click();
    await page.waitForTimeout(350);
    const oil = await page.evaluate(() => ({ cards: [...document.querySelectorAll('#urunler article[data-product-id]')].map(card => card.dataset.productId), search: location.search, same: window.__sameDocument === true, scrolled: Math.round(window.scrollY) }));
    await products.scrollIntoViewIfNeeded();
    if (engine === 'chromium') await page.screenshot({ path: path.join(shots, `urunler-sekme-zeytinyagi-${width}.png`) });
    if (oil.cards.length !== 2 || oil.search !== '?kategori=zeytinyagi' || !oil.same) fail(where, `oil ${JSON.stringify(oil)}`);
    await products.getByRole('radio', { name: 'Tümü', exact: true }).click();
    await page.waitForTimeout(300);
    const all = await page.evaluate(() => ({ cards: document.querySelectorAll('#urunler article[data-product-id]').length, search: location.search }));
    if (all.cards !== 6 || all.search !== '') fail(where, `all ${JSON.stringify(all)}`);
    await page.locator('#urunler [role="radiogroup"]').scrollIntoViewIfNeeded();
    if (engine === 'chromium') await page.screenshot({ path: path.join(shots, `urunler-sekme-tumu-${width}.png`) });

    const business = page.locator('#toptan-bayilik');
    await business.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    if (engine === 'chromium') await business.screenshot({ path: path.join(shots, `toptan-bayilik-toptan-${width}.png`) });
    await business.getByRole('radio', { name: 'Bayilik', exact: true }).click();
    await page.getByRole('form', { name: 'Bayilik başvurusu' }).waitFor({ timeout: 15_000 });
    await page.waitForTimeout(600);
    const dealer = await page.evaluate(() => ({ search: location.search, same: window.__sameDocument === true, quoteHidden: document.querySelector('form[aria-label="Kurumsal teklif talebi"]').closest('[hidden]') !== null, overflow: document.documentElement.scrollWidth - innerWidth }));
    if (engine === 'chromium') await business.screenshot({ path: path.join(shots, `toptan-bayilik-bayilik-${width}.png`) });
    if (dealer.search !== '?sekme=bayilik' || !dealer.same || !dealer.quoteHidden || dealer.overflow > 0) fail(where, `dealership ${JSON.stringify(dealer)}`);
    const axe = await new AxeBuilder({ page }).include('#toptan-bayilik').analyze();
    if (axe.violations.length) fail(where, `axe dealership ${axe.violations.map(violation => violation.id).join(', ')}`);

    // Shareable: the address alone opens the right pill.
    await page.goto(url('/?kategori=kirma-zeytin#urunler'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const deepCategory = await page.evaluate(() => ({ checked: document.querySelector('#urunler [role="radio"][aria-checked="true"]').textContent, cards: document.querySelectorAll('#urunler article[data-product-id]').length }));
    const deepCategoryLanding = await landing(page, 'urunler');
    if (deepCategory.checked !== 'Kırma' || deepCategory.cards !== 2 || deepCategoryLanding.gap < 0 || deepCategoryLanding.gap > limits.landMax) fail(where, `deep category ${JSON.stringify({ ...deepCategory, ...deepCategoryLanding })}`);
    await page.goto(url('/?sekme=bayilik#toptan-bayilik'), { waitUntil: 'networkidle' });
    await page.getByRole('form', { name: 'Bayilik başvurusu' }).waitFor({ timeout: 15_000 });
    await restingScroll(page);
    await page.waitForTimeout(500);
    const deepBusiness = await landing(page, 'toptan-bayilik');
    const checked = await page.locator('#toptan-bayilik [role="radio"][aria-checked="true"]').textContent();
    if (checked !== 'Bayilik' || deepBusiness.gap < 0 || deepBusiness.gap > limits.landMax) fail(where, `deep dealership ${checked} ${JSON.stringify(deepBusiness)}`);
    // A product sent for a quote arrives selected in the wholesale form.
    await page.goto(url('/?sekme=toptan&teklif=sample-olive-oil-5l#toptan-bayilik'), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('[name="productId"]')?.textContent.includes('1 ürün'), null, { timeout: 15_000 });
    const quote = await page.evaluate(() => ({ search: location.search, hash: location.hash, checked: document.querySelector('#toptan-bayilik [role="radio"][aria-checked="true"]').textContent }));
    if (quote.checked !== 'Toptan Satış' || quote.search.includes('teklif')) fail(where, `quote ${JSON.stringify(quote)}`);
    const serious = errors.filter(message => !/status of 40[0-9]|Failed to load resource/.test(message));
    if (serious.length) fail(where, `console ${serious.join(' | ')}`);
    report.pills = [...(report.pills ?? []), { engine, width, oil, all, dealer, deepCategory, deepCategoryGap: deepCategoryLanding.gap, deepBusinessGap: deepBusiness.gap, quote }];
  } finally { await context.close(); }
}

/** 390×500 stands in for an open keyboard: the last field and the submit pill fit under the header together. */
async function shortScreen() {
  report.shortScreen = [];
  for (const form of [
    { name: 'teklif', path: '/?sekme=toptan#toptan-bayilik', field: 'form[aria-label="Kurumsal teklif talebi"] input[name="kvkk"]', submit: 'Talep özetini hazırla' },
    { name: 'bayilik', path: '/?sekme=bayilik#toptan-bayilik', field: 'form[aria-label="Bayilik başvurusu"] input[name="kvkk"]', submit: 'Başvuru E-postasını Hazırla' },
  ]) {
    const { context, page } = await open('chromium', viewport(390, 500));
    try {
      await page.goto(url(form.path), { waitUntil: 'networkidle' });
      await page.locator(form.field).waitFor({ timeout: 15_000 });
      await page.locator(form.field).focus();
      const submit = page.getByRole('button', { name: form.submit, exact: true });
      await submit.scrollIntoViewIfNeeded();
      await restingScroll(page);
      const view = await page.evaluate(([fieldSelector, label]) => {
        const button = [...document.querySelectorAll('button[type="submit"]')].find(node => node.textContent.trim() === label);
        const box = button.getBoundingClientRect(), field = document.querySelector(fieldSelector).closest('label').getBoundingClientRect();
        const header = document.querySelector('header[data-site-navbar]').getBoundingClientRect().bottom;
        const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return { buttonVisible: box.top >= header && box.bottom <= innerHeight, fieldVisible: field.top >= header - 1 && field.bottom <= innerHeight, uncovered: button.contains(top) };
      }, [form.field, form.submit]);
      await page.screenshot({ path: path.join(shots, `${form.name}-kisa-ekran-390x500.png`) });
      report.shortScreen.push({ form: form.name, ...view });
      if (!view.buttonVisible || !view.fieldVisible || !view.uncovered) fail(`short screen ${form.name}`, JSON.stringify(view));
    } finally { await context.close(); }
  }
}

async function redirects() {
  browsers.chromium ??= await chromium.launch();
  const context = await browsers.chromium.newContext({ ignoreHTTPSErrors: true });
  report.redirects = [];
  try {
    for (const [from, to] of REDIRECTS) {
      const response = await context.request.get(url(from), { maxRedirects: 0 });
      const location = response.headers().location;
      report.redirects.push({ from, status: response.status(), location });
      if (response.status() !== 308 || location !== to) fail(`redirect ${from}`, `${response.status()} ${location}`);
    }
    // In a browser the fragment survives and the section is on screen.
    const page = await context.newPage();
    await page.goto(url('/hakkimizda'), { waitUntil: 'networkidle' });
    await restingScroll(page);
    await page.waitForTimeout(500);
    const landed = await landing(page, 'hikayemiz');
    report.redirects.push({ from: '/hakkimizda (browser)', final: page.url().replace(origin.origin, ''), ...landed });
    if (!page.url().endsWith('/#hikayemiz') || landed.gap < 0 || landed.gap > limits.landMax) fail('redirect /hakkimizda in browser', JSON.stringify(landed));
    for (const route of ['/urun/dogal-kirma-yesil-zeytin', '/blog/salamura-zeytin-nasil-hazirlanir', '/kvkk', '/iade', '/mesafeli-satis', '/siparis-takip', '/sepet', '/giris', '/kayit', '/sitemap.xml', '/robots.txt']) {
      const response = await context.request.get(url(route), { maxRedirects: 0 });
      report.redirects.push({ from: route, status: response.status() });
      if (response.status() !== 200) fail(`route ${route}`, `status ${response.status()}`);
    }
    const sitemap = await (await context.request.get(url('/sitemap.xml'))).text();
    const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
    report.sitemap = listed;
    if (listed.some(pathname => /^\/(urunler|hakkimizda|toptan-satis|bayilik|blog)\/?$/.test(pathname))) fail('sitemap', listed.join(', '));
  } finally { await context.close(); }
}

/** Reduced motion and no script: everything is simply there. */
async function calmModes() {
  {
    const { context, page } = await open('chromium', viewport(390, 844, { reducedMotion: 'reduce' }));
    try {
      await page.goto(url('/'), { waitUntil: 'networkidle' });
      const facts = await page.evaluate(() => ({ pending: document.querySelectorAll('[data-reveal="pending"]').length, behavior: getComputedStyle(document.documentElement).scrollBehavior, video: document.querySelector('#baslangic video') !== null, hidden: [...document.querySelectorAll('[data-landing-section] > div')].filter(node => Number(getComputedStyle(node).opacity) < 1).length }));
      report.reducedMotion = facts;
      if (facts.pending || facts.behavior !== 'auto' || facts.video || facts.hidden) fail('reduced motion', JSON.stringify(facts));
    } finally { await context.close(); }
  }
  {
    const { context, page } = await open('chromium', viewport(390, 844, { javaScriptEnabled: false }));
    try {
      await page.goto(url('/'), { waitUntil: 'load' });
      const facts = await page.evaluate(() => ({ sections: [...document.querySelectorAll('[data-landing-section]')].filter(section => section.getBoundingClientRect().height > 0 && [...section.children].every(child => Number(getComputedStyle(child).opacity) === 1)).length, cards: document.querySelectorAll('#urunler article[data-product-id]').length, form: !!document.querySelector('#toptan form'), faq: document.querySelectorAll('#iletisim details').length }));
      await page.screenshot({ path: path.join(shots, 'js-kapali-390.png'), fullPage: true });
      report.noScript = facts;
      if (facts.sections !== 6 || facts.cards !== 6 || !facts.form || facts.faq < 5) fail('no script', JSON.stringify(facts));
    } finally { await context.close(); }
  }
}

/** Arrival: a section below the first screen waits, then arrives once and stays. */
async function reveal() {
  const { context, page } = await open('chromium', viewport(390, 844));
  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-landing-section]')].map(section => [section.id, section.getAttribute('data-reveal')])));
    const waitingField = await page.evaluate(() => Math.round(document.querySelector('#toptan .customer-phone-field').getBoundingClientRect().height));
    await page.evaluate(() => document.getElementById('blog').scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(700);
    const shown = await page.evaluate(() => { const section = document.getElementById('blog'); const inner = section.firstElementChild; const style = getComputedStyle(inner); return { state: section.getAttribute('data-reveal'), opacity: Number(style.opacity), transform: style.transform, duration: style.animationDuration, timing: style.animationTimingFunction, name: style.animationName }; });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    const again = await page.evaluate(() => document.getElementById('blog').getAttribute('data-reveal'));
    report.reveal = { before, shown, again, waitingField };
    // A waiting section keeps its layout: the deferred phone field holds its place before it loads.
    if (waitingField < 100) fail('reveal', `phone field placeholder is ${waitingField}px tall while its section waits`);
    if (before.baslangic !== null || before.urunler !== null) fail('reveal', 'the first screen takes part in the arrival');
    if (before.blog !== 'pending' || shown.state !== 'shown' || shown.opacity !== 1 || !/280ms|0\.28s/.test(shown.duration) || again !== 'shown') fail('reveal', JSON.stringify(report.reveal));
  } finally { await context.close(); }
}

/** Other pages a phone visitor meets: first screen and full page at 390 and 320. */
async function otherPages() {
  report.others = [];
  for (const [width, height] of [[390, 844], [320, 568]]) {
    for (const [name, route] of [['yasal-kvkk', '/kvkk'], ['sepet', '/sepet'], ['urun-ayrinti', '/urun/dogal-kirma-yesil-zeytin?boy=1%20kg'], ['blog-yazi', '/blog/salamura-zeytin-nasil-hazirlanir'], ['404', '/task208-bulunamayan']]) {
      const { context, page, errors } = await open('chromium', viewport(width, height));
      try {
        const response = await page.goto(url(route), { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(shots, `${name}-${width}-ilk.png`) });
        await settle(page, height);
        const facts = await page.evaluate(inspectOther, limits.touch);
        const axe = await new AxeBuilder({ page }).analyze();
        await page.screenshot({ path: path.join(shots, `${name}-${width}-tam.png`), fullPage: true });
        const serious = errors.filter(message => !/status of 40[0-9]|Failed to load resource/.test(message));
        const where = `${name} ${width}`;
        if (facts.overflow > 0) fail(where, `overflow ${facts.overflow}`);
        if (facts.oldLinks.length) fail(where, `links to retired pages ${facts.oldLinks.join(', ')}`);
        if (facts.menu.join() !== MENU.map(([, id]) => `/#${id}`).join()) fail(where, `menu ${facts.menu.join()}`);
        for (const pill of facts.underlined) fail(where, `underlined pill ${pill}`);
        for (const item of facts.small) fail(where, `touch target ${item}`);
        if (axe.violations.length) fail(where, `axe ${axe.violations.map(violation => `${violation.id} (${violation.nodes.length})`).join(', ')}`);
        if (serious.length) fail(where, `console ${serious.join(' | ')}`);
        report.others.push({ name, width, status: response.status(), overflow: facts.overflow, axe: axe.violations.length, consoleErrors: serious.length, quietPills: facts.quiet, smallTargets: facts.small.length });
      } finally { await context.close(); }
    }
  }
}
function inspectOther(touch) {
  const visible = element => { const box = element.getBoundingClientRect(); if (box.width < 1 || box.height < 1) return false; for (let node = element; node; node = node.parentElement) { const style = getComputedStyle(node); if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || style.clipPath === 'inset(50%)') return false; } return true; };
  const pills = [...document.querySelectorAll('[data-pill]')].filter(visible);
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    oldLinks: [...document.querySelectorAll('a[href]')].map(link => link.getAttribute('href')).filter(href => /^\/(urunler|hakkimizda|toptan-satis|bayilik|blog)(\/?$|\?|\/[a-z-]+$)/.test(href) && !href.startsWith('/blog/')),
    menu: [...document.querySelectorAll('header nav[aria-label="Ana navigasyon"] a')].map(link => link.getAttribute('href')),
    underlined: pills.filter(pill => getComputedStyle(pill.querySelector('[data-pill-label]') ?? pill).textDecorationLine !== 'none').map(pill => pill.textContent.trim()),
    quiet: pills.filter(pill => pill.dataset.variant === 'quiet').map(pill => `${pill.textContent.trim()} ${Math.round(pill.getBoundingClientRect().height)}px`),
    small: [...document.querySelectorAll('header a, header button, main a, main button, footer a')].filter(visible).filter(element => !element.matches(':disabled')).map(element => { const box = element.getBoundingClientRect(); return { label: (element.getAttribute('aria-label') ?? element.textContent).trim().slice(0, 40), width: box.width, height: box.height }; }).filter(target => target.width < touch - 0.5 || target.height < touch - 0.5).map(target => `${target.label} ${Math.round(target.width)}x${Math.round(target.height)}`),
  };
}

/** Throttled phone load (1.6 Mbps, CPU ×4), the method of scripts/qa-design-v3.mjs. */
async function performanceRun(scale) {
  const { context, page } = await open('chromium', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: scale });
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.metrics = { lcp: 0, cls: 0, lcpElement: '' };
      new PerformanceObserver(list => { const entry = list.getEntries().at(-1); window.metrics.lcp = entry.startTime; window.metrics.lcpElement = `${entry.element?.tagName ?? ''} ${(entry.url ?? '').split('/').pop()}`.trim(); }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.metrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(url('/'), { waitUntil: 'load' });
    await page.waitForTimeout(5000);
    const data = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const bytes = pattern => resources.filter(entry => pattern.test(new URL(entry.name).pathname)).reduce((sum, entry) => sum + entry.encodedBodySize, 0);
      return { ...window.metrics, js: bytes(/\.js$/), jsFiles: resources.filter(entry => /\.js$/.test(new URL(entry.name).pathname)).length, css: bytes(/\.css$/), fonts: bytes(/\.woff2$/), html: performance.getEntriesByType('navigation')[0].encodedBodySize };
    });
    const where = `performance phone ${scale}x`;
    if (data.lcp > limits.phoneLcp) fail(where, `LCP ${Math.round(data.lcp)} ms`);
    if (data.js > limits.phoneJs) fail(where, `first JS ${data.js} bytes`);
    if (data.cls >= limits.cls) fail(where, `CLS ${data.cls}`);
    return { scale, ...data };
  } finally { await context.close(); }
}

try {
  for (const size of widths) await auditHome(size);
  await auditHome([390, 844], 'webkit');
  await desktopMenu();
  await phoneMenu(390, 844, 'chromium');
  await phoneMenu(320, 568, 'chromium');
  await phoneMenu(390, 844, 'webkit');
  await pillsInPlace(390, 844, 'chromium');
  await pillsInPlace(320, 568, 'chromium');
  await pillsInPlace(390, 844, 'webkit');
  await pillsInPlace(1440, 900, 'chromium');
  await shortScreen();
  await redirects();
  await calmModes();
  await reveal();
  await otherPages();
  report.performance = [await performanceRun(1), await performanceRun(3)];
} finally {
  for (const browser of Object.values(browsers)) await browser.close();
}

await fs.writeFile(path.join(out, 'olcum-landing.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({
  failures: report.failures,
  pages: report.pages.map(page => ({ name: page.name, height: page.pageHeight, overflow: page.overflow, cls: page.cls, axe: page.axe, console: page.consoleErrors, minPill: page.minPill, smallTargets: page.smallTargets, closeNeighbours: page.closeNeighbours })),
  desktopMenu: report.desktopMenu?.map(row => `${row.label}: ${row.gap}px`), phoneMenu: report.phoneMenu?.map(run => `${run.engine} ${run.width}: ${run.rows.map(row => `${row.label} ${row.gap}px`).join(', ')}; /sepet → blog ${run.fromCart.gap}px`),
  redirects: report.redirects?.filter(row => row.location).map(row => `${row.from} → ${row.status} ${row.location}`), shortScreen: report.shortScreen, reducedMotion: report.reducedMotion, noScript: report.noScript,
  reveal: report.reveal?.shown, others: report.others?.length, performance: report.performance?.map(run => ({ scale: run.scale, lcp: Math.round(run.lcp), js: run.js, cls: run.cls, element: run.lcpElement })),
}, null, 1));
process.exitCode = report.failures.length ? 1 : 0;

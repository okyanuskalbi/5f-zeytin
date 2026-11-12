/* global document, window, innerWidth, innerHeight, getComputedStyle, scrollTo */
// Task206 browser evidence for the remaining pages and the admin panel;
// run through scripts/qa-design-v3.mjs <url> <out> pages (the server needs local sign-in: run-clean --local-auth).
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import { randomBytes, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const GREEN = 'rgb(36, 58, 41)';
const SAGE = 'rgb(231, 235, 221)';
const PAPER = 'rgb(255, 253, 248)';
const LONG_WORD = 'cok-uzun-bir-eposta-adresi-ornegi-kirilmali@ornek-alan-adi-oldukca-uzun.example.test';
/** Task208: a section that has just come into view fades in for 280 ms; contrast is read after it has arrived. */
const arrived = async page => {
  // The page may still be gliding to a focused field; a section entering on the way starts its fade late.
  for (let last = -1, rounds = 0; rounds < 40; rounds++) { const now = await page.evaluate(() => Math.round(window.scrollY)); if (now === last) break; last = now; await page.waitForTimeout(120); }
  for (let pass = 0; pass < 2; pass++) {
    await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
    await page.waitForTimeout(120);
  }
};
const LONG_ADDRESS = 'ŞehitAliGökçeMahallesiŞehitÖmerHalisDemirSokağıNumaraOtuzBeşEllekBeldesiDüziçiOsmaniyeTürkiye, Kat 3 Daire 12, 80600';
const LONG_NAME = 'Geleneksel Usulde Hazırlanmış Doğal Kırma Yeşil Zeytin Ellek Hasadı Büyük Boy Teneke Ambalaj';
const profiles = [[320, 568, 'chromium'], [390, 844, 'webkit'], [768, 1024, 'chromium'], [1440, 900, 'chromium']];
const posts = ['salamura-zeytin-nasil-hazirlanir', 'kirma-zeytin-nedir-nasil-saklanir', 'naturel-sizma-zeytinyagi-nasil-saklanmali', 'sofralik-zeytin-secerken-nelere-dikkat-edilmeli'];
// Task208: Hakkımızda, Toptan, Bayilik and the blog list are sections of the home page (scripts/qa-landing-208.mjs).
const publicRoutes = [
  ...posts.map((slug, index) => ({ name: `blog-yazi-${index + 1}`, path: `/blog/${slug}`, kind: 'article' })),
  { name: 'giris', path: '/giris', kind: 'auth' },
  { name: 'kayit', path: '/kayit', kind: 'auth' },
  { name: 'siparis-takip', path: '/siparis-takip', kind: 'state' },
  { name: 'iade', path: '/iade', kind: 'legal' },
  { name: 'kvkk', path: '/kvkk', kind: 'legal' },
  { name: 'mesafeli-satis', path: '/mesafeli-satis', kind: 'legal' },
  { name: '404', path: '/task206-bulunamayan-sayfa', kind: 'missing' },
];

/** Runs in the page: facts that belong to one kind of page. */
function inspectPage(kind) {
  const style = element => element ? getComputedStyle(element) : null;
  const facts = { kind, h1: document.querySelectorAll('h1').length, coins: (document.querySelector('[data-admin-shell]') ?? document).querySelectorAll('[data-coin]').length };
  // Placeholder text against its own field: computed colours, WCAG ratio (axe does not look at placeholders).
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const pen = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = value => { pen.clearRect(0, 0, 1, 1); pen.fillStyle = '#000'; pen.fillStyle = value; pen.fillRect(0, 0, 1, 1); const [r, g, b, a] = pen.getImageData(0, 0, 1, 1).data; return { r, g, b, a: a / 255 }; };
  const luminance = ({ r, g, b }) => { const channel = value => { const v = value / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
  const surface = node => { for (let current = node; current; current = current.parentElement) { const colour = rgba(getComputedStyle(current).backgroundColor); if (colour.a > 0.99) return colour; } return { r: 255, g: 255, b: 255, a: 1 }; };
  facts.placeholders = [...document.querySelectorAll('main input[placeholder], main textarea[placeholder]')].filter(input => input.placeholder && input.type !== 'hidden').map(input => {
    const ink = rgba(getComputedStyle(input, '::placeholder').color), paper = surface(input);
    const mixed = { r: ink.r * ink.a + paper.r * (1 - ink.a), g: ink.g * ink.a + paper.g * (1 - ink.a), b: ink.b * ink.a + paper.b * (1 - ink.a) };
    const [light, dark] = [luminance(mixed), luminance(paper)].sort((first, second) => second - first);
    return { text: input.placeholder, ratio: Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100 };
  });
  const band = document.querySelector('[data-page-band]');
  if (band) facts.band = { background: style(band).backgroundColor, radius: parseFloat(style(band).borderTopLeftRadius), photo: band.querySelector('img') ? band.querySelector('img').naturalWidth > 0 : null };
  if (kind === 'form') {
    const form = document.querySelector('form');
    const submit = form.querySelector('button[type="submit"]');
    const input = form.querySelector('input:not([type="checkbox"]):not([type="hidden"])');
    const panel = form.closest('[data-quote-composer], [data-dealership-form]');
    facts.form = {
      submit: { variant: submit.dataset.variant, width: submit.getBoundingClientRect().width, panel: panel.getBoundingClientRect().width - parseFloat(style(panel).paddingLeft) - parseFloat(style(panel).paddingRight) },
      field: { height: input.getBoundingClientRect().height, radius: parseFloat(style(input).borderTopLeftRadius), background: style(input).backgroundColor },
    };
  }
  if (kind === 'article') {
    const prose = document.querySelector('[data-blog-content]');
    const paragraph = prose.querySelector('section p');
    const probe = document.createElement('span');
    probe.textContent = '0'; probe.style.cssText = 'position:absolute;visibility:hidden';
    paragraph.append(probe);
    const zero = probe.getBoundingClientRect().width;
    probe.remove();
    const title = style(document.querySelector('h1'));
    facts.article = {
      title: { font: title.fontFamily, size: parseFloat(title.fontSize) },
      body: { size: parseFloat(style(paragraph).fontSize), lineHeight: parseFloat(style(paragraph).lineHeight) / parseFloat(style(paragraph).fontSize), measure: paragraph.getBoundingClientRect().width / zero },
      contents: document.querySelectorAll('nav[aria-label="İçindekiler"] a').length, sections: prose.querySelectorAll('section:not([data-article-faq]) > h2[id]').length,
      faqRadius: parseFloat(style(document.querySelector('[data-article-faq] details')).borderTopLeftRadius),
      schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)['@type']),
    };
  }
  if (kind === 'auth') {
    const frame = document.querySelector('[data-membership-frame]');
    const tabs = document.querySelector('nav[aria-label="Üyelik işlemleri"]');
    const current = tabs.querySelector('[aria-current="page"]');
    const submit = frame.querySelector('button[type="submit"]');
    const password = frame.querySelector('input[type="password"]');
    const toggle = password.parentElement.querySelector('button');
    const fieldBox = password.getBoundingClientRect(), toggleBox = toggle.getBoundingClientRect();
    facts.auth = {
      frame: { background: style(frame).backgroundColor, radius: parseFloat(style(frame).borderTopLeftRadius), columns: frame.getBoundingClientRect().width },
      tabs: { pill: tabs.hasAttribute('data-pill-switch'), currentBackground: style(current).backgroundColor, height: current.getBoundingClientRect().height },
      submit: { variant: submit.dataset.variant, full: Math.abs(submit.getBoundingClientRect().width - fieldBox.width) < 2 },
      toggleInside: toggleBox.left >= fieldBox.left && toggleBox.right <= fieldBox.right && toggleBox.top >= fieldBox.top - 1 && toggleBox.bottom <= fieldBox.bottom + 1,
      field: { height: fieldBox.height, radius: parseFloat(style(password).borderTopLeftRadius) },
    };
  }
  if (kind === 'account') {
    const nav = document.querySelector('nav[aria-label="Müşteri hesabı"]');
    const current = nav.querySelector('[aria-current="page"]');
    const card = document.querySelector('main section, main [class*="card"]');
    facts.account = {
      links: [...nav.querySelectorAll('a')].map(link => ({ radius: parseFloat(style(link).borderTopLeftRadius), height: link.getBoundingClientRect().height })),
      currentBackground: current ? style(current).backgroundColor : null,
      tags: [...document.querySelectorAll('main [data-tag]')].map(tag => tag.textContent.trim()),
      cardRadius: card ? parseFloat(style(card).borderTopLeftRadius) : null,
    };
  }
  if (kind === 'legal') {
    const paragraph = document.querySelector('main article section p');
    const probe = document.createElement('span');
    probe.textContent = '0'; probe.style.cssText = 'position:absolute;visibility:hidden';
    paragraph.append(probe);
    const zero = probe.getBoundingClientRect().width;
    probe.remove();
    facts.legal = { measure: paragraph.parentElement.getBoundingClientRect().width / zero, contents: document.querySelectorAll('nav[aria-label="İçindekiler"] a').length };
  }
  if (kind === 'missing') {
    facts.missing = { actions: [...document.querySelectorAll('main a[data-pill]')].map(link => ({ text: link.textContent.trim(), variant: link.dataset.variant, href: link.getAttribute('href') })) };
  }
  if (kind === 'admin') {
    const rows = [...document.querySelectorAll('tbody tr')];
    const display = rows[0] ? style(rows[0]).display : null;
    facts.admin = {
      rows: rows.length, stacked: display === 'block',
      rowHeights: rows.map(row => Math.round(row.getBoundingClientRect().height)),
      headHeight: Math.round(document.querySelector('thead tr')?.getBoundingClientRect().height ?? 0),
      cellHeights: [...document.querySelectorAll('tbody td')].map(cell => Math.round(cell.getBoundingClientRect().height)),
      displayFonts: [...document.querySelectorAll('[data-admin-shell] :is(h2, h3, th, td, button, a, label, p)')].filter(node => /Cormorant/i.test(style(node).fontFamily)).map(node => node.textContent.trim().slice(0, 30)),
      titleFont: style(document.querySelector('h1')).fontFamily,
      tableScroll: (() => { const region = document.querySelector('[role="region"][aria-label="Ürün tablosu"]'); return region ? region.scrollWidth - region.clientWidth : null; })(),
      sortButtons: [...document.querySelectorAll('thead button')].filter(button => { const box = button.getBoundingClientRect(); return box.width >= 44 && box.height >= 44 && style(button).visibility === 'visible' && box.right <= innerWidth && box.left >= 0; }).length,
    };
  }
  return facts;
}

function localPool() {
  const raw = process.env.TEST_DATABASE_URL;
  if (!raw) throw new Error('Local TEST_DATABASE_URL required');
  const url = new URL(raw);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.pathname !== '/afina_kontrol189') throw new Error('Only afina_kontrol189 on localhost is allowed');
  return new pg.Pool({ connectionString: raw, max: 1 });
}

/** Registers a throwaway user through the real form, grants it the admin role in the local test database, signs in. */
async function prepareAdmin(browser, origin) {
  const pool = localPool();
  const email = `task206-${randomUUID().replaceAll('-', '').slice(0, 14)}@example.test`;
  const password = `LocalA9!${randomBytes(16).toString('hex')}`;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
  const cleanup = async () => {
    await context.close().catch(() => {});
    try { await pool.query('DELETE FROM public."user" WHERE email=$1', [email]); } finally { await pool.end(); }
  };
  try {
    if ((await pool.query('select current_database() AS name')).rows[0].name !== 'afina_kontrol189') throw new Error('unexpected database');
    const page = await context.newPage();
    const anonymous = { page: (await page.goto(new URL('/admin', origin).href)).status(), api: (await page.request.get(new URL('/api/admin/products', origin).href)).status() };
    await page.goto(new URL('/kayit', origin).href, { waitUntil: 'networkidle' });
    await page.getByLabel('Ad soyad', { exact: true }).fill('Yerel Panel Denetimi');
    await page.getByLabel('E-posta', { exact: true }).fill(email);
    await page.getByLabel('Şifre', { exact: true }).fill(password);
    await page.locator('input[name="privacy"]').check();
    await page.locator('input[name="consent"]').check();
    await page.getByRole('button', { name: 'Üyelik oluştur', exact: true }).click();
    await page.getByText('Hesabınız hazır. Şifrenizle giriş yapabilirsiniz.', { exact: true }).waitFor();
    const { grantAdmin } = await import(path.resolve('scripts/admin-grant.mjs'));
    await grantAdmin(pool, email);
    await page.goto(new URL('/giris', origin).href, { waitUntil: 'networkidle' });
    await page.getByLabel('E-posta', { exact: true }).fill(email);
    await page.getByLabel('Şifre', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'E-posta ile giriş yap', exact: true }).click();
    await page.waitForURL(new URL('/hesabim', origin).href);
    const storageState = await context.storageState();
    return { storageState, anonymous, cleanup };
  } catch (error) { await cleanup(); throw error; }
}

/** `only`: route names for a quick partial look (no flows); the evidence run passes none. */
export async function auditPages({ origin, out, shots, open, settle, inspectDesign, limits, fail, browsers, engines, only = [] }) {
  const report = { pages: [], flows: [], checks: {}, auth: [] };
  browsers.chromium ??= await engines.chromium.launch();
  process.env.STOREFRONT_QA_ORIGIN = origin.origin;
  const helper = await import(path.resolve('tests/helpers/storefront-local-auth.mjs'));
  // The helper registers, signs in and then uses the address book, the profile form and the password form through the page.
  const account = await helper.prepareSession(browsers.chromium);
  report.auth.push(...account.checks);
  let admin;

  function judge(where, route, width, base, facts, extras) {
    for (const pill of base.pills) {
      if (pill.height < limits.touch) fail(where, `pill "${pill.label}" height ${pill.height}`);
      if (pill.radius < pill.height / 2) fail(where, `pill "${pill.label}" radius ${pill.radius}`);
      if (pill.lines !== 1) fail(where, `pill "${pill.label}" wraps to ${pill.lines} lines`);
      if (!pill.inside) fail(where, `pill "${pill.label}" leaves the viewport`);
      if (!/Montserrat/i.test(pill.fontFamily)) fail(where, `pill "${pill.label}" font ${pill.fontFamily}`);
    }
    for (const target of base.smallTargets) fail(where, `touch target "${target.label}" ${target.width}x${target.height}`);
    for (const small of base.smallText) fail(where, `text below 12px: ${small}`);
    if (base.overflow > 0) fail(where, `horizontal overflow ${base.overflow}px`);
    if (base.brokenImages.length) fail(where, `broken images ${base.brokenImages.join(', ')}`);
    if (!/Cormorant/i.test(base.h1Font)) fail(where, `h1 font ${base.h1Font}`);
    if (!/Montserrat/i.test(base.bodyFont)) fail(where, `body font ${base.bodyFont}`);
    if (base.stamps !== (route.kind === 'about' ? 1 : 0)) fail(where, `${base.stamps} stamps`);
    if (base.branches > 2) fail(where, `${base.branches} olive branches`);
    if (facts.h1 !== 1) fail(where, `${facts.h1} h1 elements`);
    for (const placeholder of facts.placeholders) if (placeholder.ratio < limits.textContrast) fail(where, `placeholder "${placeholder.text}" contrast ${placeholder.ratio}`);
    if (extras.cls !== null && extras.cls >= limits.cls) fail(where, `CLS ${extras.cls}`);
    if (extras.contrast.length) fail(where, `contrast ${extras.contrast.join(' | ')}`);
    if (extras.errors.length) fail(where, `console ${extras.errors.join(' | ')}`);
    if (facts.band && (facts.band.background !== SAGE || facts.band.radius < 20 || facts.band.photo === false)) fail(where, `page band ${JSON.stringify(facts.band)}`);
    if (['legal', 'state'].includes(route.kind) && !facts.band) fail(where, 'no page band');
    if (route.kind === 'form') {
      const { submit, field } = facts.form;
      if (submit.variant !== 'primary') fail(where, `submit variant ${submit.variant}`);
      if (width < 768 && Math.abs(submit.width - submit.panel) > 2) fail(where, `submit ${submit.width} of ${submit.panel}`);
      if (field.height < 52 || field.radius !== 12 || field.background !== PAPER) fail(where, `field ${JSON.stringify(field)}`);
    }
    if (route.kind === 'article') {
      const { title, body, contents, sections, faqRadius, schemas } = facts.article;
      if (!/Cormorant/i.test(title.font) || title.size < 44 || title.size > 56) fail(where, `title ${JSON.stringify(title)}`);
      if (body.size !== 17 || Math.abs(body.lineHeight - 1.7) > 0.02 || body.measure > 68.5) fail(where, `body ${JSON.stringify(body)}`);
      if (!contents || contents !== sections) fail(where, `contents ${contents} for ${sections} sections`);
      if (faqRadius !== 12) fail(where, `FAQ radius ${faqRadius}`);
      if (schemas.join() !== 'BlogPosting,BreadcrumbList,FAQPage') fail(where, `schemas ${schemas.join()}`);
    }
    if (route.kind === 'auth') {
      const { frame, tabs, submit, toggleInside, field } = facts.auth;
      if (frame.background !== PAPER || frame.radius < 20) fail(where, `auth panel ${JSON.stringify(frame)}`);
      if (!tabs.pill || tabs.currentBackground !== GREEN || tabs.height < limits.touch) fail(where, `auth tabs ${JSON.stringify(tabs)}`);
      if (submit.variant !== 'primary' || !submit.full) fail(where, `auth submit ${JSON.stringify(submit)}`);
      if (!toggleInside) fail(where, 'password toggle is outside its field');
      if (field.height < 52 || field.radius !== 12) fail(where, `auth field ${JSON.stringify(field)}`);
    }
    if (route.kind === 'account') {
      if (facts.account.currentBackground !== GREEN) fail(where, `account menu current ${facts.account.currentBackground}`);
      if (facts.account.links.some(link => link.radius < link.height / 2 || link.height < limits.touch)) fail(where, `account menu links ${JSON.stringify(facts.account.links)}`);
      if (route.tag && !facts.account.tags.length) fail(where, 'order status is not a Tag');
    }
    if (route.kind === 'legal' && (facts.legal.measure > 68.5 || facts.legal.contents < 3)) fail(where, `legal ${JSON.stringify(facts.legal)}`);
    if (route.kind === 'missing') {
      const [home, products] = facts.missing.actions;
      if (home?.text !== 'Ana sayfa' || home.variant !== 'primary' || home.href !== '/' || products?.text !== 'Ürünler' || products.variant !== 'outline' || products.href !== '/#urunler' || base.branches < 1) fail(where, `404 ${JSON.stringify(facts.missing)}`);
    }
    if (route.kind === 'admin') {
      if (facts.coins) fail(where, `${facts.coins} coins in the panel`);
      if (facts.admin.displayFonts.length) fail(where, `Cormorant outside the title: ${facts.admin.displayFonts.join(', ')}`);
      if (!/Cormorant/i.test(facts.admin.titleFont)) fail(where, `title font ${facts.admin.titleFont}`);
      if (route.table) {
        if (facts.admin.rows !== 6) fail(where, `${facts.admin.rows} product rows`);
        // A table row is a 52 px cell plus its 1 px rule (header and body alike); a stacked card is taller by design.
        if (facts.admin.rowHeights.some(height => height < 52 || (!facts.admin.stacked && height > 53))) fail(where, `row heights ${facts.admin.rowHeights.join()}`);
        if (!facts.admin.stacked && (facts.admin.headHeight < 52 || facts.admin.headHeight > 53)) fail(where, `header row ${facts.admin.headHeight}px`);
        if (facts.admin.tableScroll > 0) fail(where, `product table scrolls sideways by ${facts.admin.tableScroll}px`);
        if (width < 768 && !facts.admin.stacked) fail(where, 'phone table is not stacked');
        if (facts.admin.sortButtons !== 4) fail(where, `${facts.admin.sortButtons} of 4 sort buttons reachable`);
      }
    }
  }

  async function visit(page, errors, route, width, height, engine) {
    const where = `${route.name} ${width}x${height}-${engine}`;
    errors.length = 0;
    const response = await page.goto(new URL(route.path, origin).href, { waitUntil: 'networkidle' });
    if (response.status() !== (route.kind === 'missing' ? 404 : 200)) fail(where, `status ${response.status()}`);
    await page.evaluate(() => document.fonts.ready);
    if (route.ready) await page.locator(route.ready).first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(shots, `${route.name}-${width}-ilk.png`) });
    await settle(page, height);
    const facts = await page.evaluate(inspectPage, route.kind);
    const base = await page.evaluate(inspectDesign, limits.touch);
    await page.waitForTimeout(150);
    const cls = await page.evaluate(() => window.__cls);
    await arrived(page);
        const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    const contrast = axe.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' ')));
    const serious = errors.filter(message => !(route.kind === 'missing' && /404/.test(message)));
    judge(where, route, width, base, facts, { cls, contrast, errors: serious });
    // Pill checks scroll wide regions sideways; the picture is taken from the start of every scroller.
    await page.evaluate(() => { for (const element of document.querySelectorAll('main *')) if (element.scrollLeft) element.scrollLeft = 0; scrollTo(0, 0); });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, `${route.name}-${width}-tam.png`), fullPage: true });
    report.pages.push({ where, cls, axeContrast: contrast.length, consoleErrors: serious.length, pills: base.pills.length, minPillHeight: base.pills.length ? Math.min(...base.pills.map(pill => pill.height)) : null, overflow: base.overflow, facts });
    return where;
  }

  const observeShift = page => page.addInitScript(() => {
    window.__cls = null;
    if (window.PerformanceObserver?.supportedEntryTypes?.includes('layout-shift')) {
      window.__cls = 0;
      new window.PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  const viewport = (width, height) => ({ viewport: { width, height }, deviceScaleFactor: width < 800 ? 2 : 1, hasTouch: width <= 1024, isMobile: width < 800 });

  try {
    admin = await prepareAdmin(browsers.chromium, origin);
    report.checks.anonymousAdmin = admin.anonymous;
    if (admin.anonymous.page !== 401 || admin.anonymous.api !== 401) fail('admin', `anonymous access ${JSON.stringify(admin.anonymous)}`);
    const accountRoutes = account.routes.map(([name, route]) => ({ name, path: route, kind: 'account', tag: /siparis/.test(name), ready: name === 'hesabim-adresler' ? 'main button[data-pill]' : name === 'hesabim-siparisler' || name === 'hesabim-siparis-detayi' ? 'main [data-tag]' : undefined }));
    const adminRoutes = [{ name: 'admin', path: '/admin', kind: 'admin' }, { name: 'admin-urunler', path: '/admin/urunler', kind: 'admin', table: true, ready: 'tbody tr' }];

    for (const [width, height, engine] of profiles) {
      for (const [routes, state] of [[publicRoutes, undefined], [accountRoutes, account.storageState], [adminRoutes, admin.storageState]]) {
        const { context, page, errors } = await open(engine, { ...viewport(width, height), storageState: state });
        try {
          await observeShift(page);
          for (const route of routes) if (!only.length || only.includes(route.name)) await visit(page, errors, route, width, height, engine);
        } finally { await context.close(); }
      }
    }

    if (only.length) return report;

    // Quote form: preselected product, phone field on WebKit after it scrolls into view, error state at 320.
    for (const [width, height, engine] of [[390, 844, 'webkit'], [320, 568, 'chromium'], [1440, 900, 'chromium']]) {
      const where = `teklif ${width}x${height}-${engine}`;
      const { context, page, errors } = await open(engine, viewport(width, height));
      const steps = [];
      const step = async (name, check) => { try { await check(); steps.push({ name, ok: true }); } catch (error) { const message = String(error.message).split('\n')[0]; steps.push({ name, ok: false, error: message }); fail(where, `${name}: ${message}`); } };
      try {
        await page.goto(new URL('/?sekme=toptan&teklif=sample-olive-oil-5l#toptan-bayilik', origin).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const form = page.getByRole('form', { name: 'Kurumsal teklif talebi' });
        await step('ön seçim: 5 L ürün seçili', async () => {
          const trigger = form.locator('[id$="-products"]');
          await trigger.waitFor();
          const text = await trigger.textContent();
          if (!/1 ürün|5 L|Zeytinyağı/i.test(text)) throw new Error(`picker shows "${text.trim()}"`);
        });
        await step('telefon alanı görünür olunca düzenlenir', async () => {
          const phone = form.locator('[data-deferred-phone]');
          await phone.scrollIntoViewIfNeeded();
          await form.locator('[data-deferred-phone="ready"]').waitFor({ timeout: 10000 });
          const input = form.locator('input[type="tel"]');
          await input.fill('5321234567');
          const digits = (await input.inputValue()).replace(/\D/g, '');
          if (digits !== '5321234567') throw new Error(`phone value "${digits}"`);
        });
        await step('boş gönderim: hata + alan + hap düğme taşmaz', async () => {
          await form.getByRole('button', { name: 'Talep özetini hazırla', exact: true }).click();
          await form.getByText('Lütfen işaretli alanları kontrol edin.', { exact: true }).waitFor({ timeout: 5000 });
          const state = await page.evaluate(() => {
            const panel = document.querySelector('[data-quote-composer]').getBoundingClientRect();
            const leaving = [...document.querySelectorAll('[data-quote-composer] :is(input, select, button, [class*="error"], label)')].filter(node => { const box = node.getBoundingClientRect(); return box.width > 0 && (box.left < panel.left - 0.5 || box.right > panel.right + 0.5); }).map(node => node.textContent.trim().slice(0, 30) || node.tagName);
            const submit = document.querySelector('[data-quote-composer] button[type="submit"]');
            return { overflow: document.documentElement.scrollWidth - innerWidth, leaving, errors: document.querySelectorAll('[data-quote-composer] [id$="-error"]').length, submitLines: Math.round(submit.querySelector('[data-pill-label]').getBoundingClientRect().height / parseFloat(getComputedStyle(submit).lineHeight || '20')) };
          });
          await arrived(page);
        const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
          const contrast = axe.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' ')));
          if (state.overflow > 0 || state.leaving.length || state.errors < 3 || contrast.length) throw new Error(JSON.stringify({ ...state, contrast }));
        });
        // From the top: WebKit draws the sticky header wherever the page happens to be scrolled in a full-page capture.
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(shots, `teklif-hata-${width}.png`), fullPage: true });
        if (errors.length) fail(where, `console ${errors.join(' | ')}`);
        report.flows.push({ where, steps });
      } finally { await context.close(); }
    }

    // Short phone (390×500, as with a keyboard open): with the last field focused, the submit pill can be brought
    // fully into view under the sticky header, together with that field, and nothing lies on top of it.
    report.checks.shortScreen = [];
    for (const form of [
      { name: 'giris', path: '/giris', field: '#auth-password', submit: 'E-posta ile giriş yap' },
      { name: 'teklif', path: '/?sekme=toptan#toptan-bayilik', field: 'form[aria-label="Kurumsal teklif talebi"] input[name="kvkk"]', submit: 'Talep özetini hazırla' },
      { name: 'bayilik', path: '/?sekme=bayilik#toptan-bayilik', field: 'form[aria-label="Bayilik başvurusu"] input[name="kvkk"]', submit: 'Başvuru E-postasını Hazırla' },
    ]) {
      const { context, page } = await open('chromium', viewport(390, 500));
      try {
        await page.goto(new URL(form.path, origin).href, { waitUntil: 'networkidle' });
        await page.locator(form.field).focus();
        const submit = page.getByRole('button', { name: form.submit, exact: true });
        await submit.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        const view = await page.evaluate(([fieldSelector, label]) => {
          const button = [...document.querySelectorAll('button[type="submit"]')].find(node => node.textContent.trim() === label);
          const box = button.getBoundingClientRect(), field = document.querySelector(fieldSelector).getBoundingClientRect();
          const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
          const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          return { buttonVisible: box.top >= header && box.bottom <= innerHeight, fieldVisible: field.top >= header - 1 && field.bottom <= innerHeight, uncovered: button.contains(top), gap: Math.round(box.top - field.bottom) };
        }, [form.field, form.submit]);
        await page.screenshot({ path: path.join(shots, `${form.name}-kisa-ekran-390x500.png`) });
        report.checks.shortScreen.push({ form: form.name, ...view });
        if (!view.buttonVisible || !view.fieldVisible || !view.uncovered) fail(`short screen ${form.name}`, JSON.stringify(view));
      } finally { await context.close(); }
    }

    // Error state at 320 px: field, message and pill stay inside the panel (the quote form is covered by its flow above).
    report.checks.errorState320 = [];
    for (const form of [
      { name: 'bayilik', path: '/?sekme=bayilik#toptan-bayilik', panel: '[data-dealership-form]', submit: 'Başvuru E-postasını Hazırla', message: 'Lütfen işaretli alanları kontrol edin.' },
      { name: 'giris', path: '/giris', panel: '[data-membership-frame]', submit: 'E-posta ile giriş yap', message: 'Lütfen alanları kontrol edin.' },
      { name: 'kayit', path: '/kayit', panel: '[data-membership-frame]', submit: 'Üyelik oluştur', message: 'Lütfen alanları kontrol edin.' },
    ]) {
      const { context, page, errors } = await open('chromium', viewport(320, 568));
      try {
        await page.goto(new URL(form.path, origin).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.locator(form.panel).getByRole('button', { name: form.submit, exact: true }).click();
        await page.locator(form.panel).getByText(form.message, { exact: false }).first().waitFor({ timeout: 10000 });
        const state = await page.evaluate(selector => {
          const root = document.querySelector(selector);
          const panel = root.getBoundingClientRect();
          // Screen-reader-only live regions are 1 px boxes; they are not part of the visible layout.
          const shown = node => { const box = node.getBoundingClientRect(); return box.width > 2 && box.height > 2; };
          const leaving = [...root.querySelectorAll('input, select, textarea, button, label, small, p, [role="alert"]')].filter(shown).filter(node => { const box = node.getBoundingClientRect(); return box.left < panel.left - 0.5 || box.right > panel.right + 0.5; }).map(node => node.textContent.trim().slice(0, 30) || node.tagName);
          const submit = [...root.querySelectorAll('button[type="submit"]')][0];
          const label = submit.querySelector('[data-pill-label]').getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth - innerWidth, leaving, invalid: root.querySelectorAll('[aria-invalid="true"]').length, pillOneLine: label.height < parseFloat(getComputedStyle(submit).fontSize) * 2 };
        }, form.panel);
        await arrived(page);
        const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
        const contrast = axe.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' ')));
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(shots, `${form.name}-hata-320.png`), fullPage: true });
        const serious = errors.filter(message => !/Failed to load resource|40[0-9]/.test(message));
        report.checks.errorState320.push({ form: form.name, ...state, axeContrast: contrast.length, consoleErrors: serious.length });
        if (state.overflow > 0 || state.leaving.length || state.invalid < 1 || !state.pillOneLine || contrast.length || serious.length) fail(`error state ${form.name} 320`, JSON.stringify({ ...state, contrast, serious }));
      } finally { await context.close(); }
    }

    // In-page links land their target below the sticky header: an article's contents pill and a legal page's.
    report.checks.anchors = [];
    for (const [name, route, link, target] of [
      ['blog-yazi', `/blog/${posts[0]}`, 'nav[aria-label="İçindekiler"] a >> nth=1', '#bolum-2'],
      ['kvkk', '/kvkk', 'nav[aria-label="İçindekiler"] a >> nth=2', '#seller-title'],
    ]) {
      for (const [width, height, engine] of [[1440, 900, 'chromium'], [390, 844, 'webkit']]) {
        const { context, page } = await open(engine, viewport(width, height));
        try {
          await page.goto(new URL(route, origin).href, { waitUntil: 'networkidle' });
          await page.locator(link).click();
          await page.waitForTimeout(700);
          const landed = await page.evaluate(selector => {
            const box = document.querySelector(selector).getBoundingClientRect();
            const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
            return { top: Math.round(box.top), header: Math.round(header), hash: window.location.hash };
          }, target);
          report.checks.anchors.push({ name, width, ...landed });
          if (landed.hash !== target || landed.top < landed.header || landed.top > height * 0.6) fail(`anchor ${name} ${width}`, JSON.stringify(landed));
        } finally { await context.close(); }
      }
    }

    // A visitor without a session is told to sign in (401 page), with one pill.
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const { context, page } = await open('chromium', viewport(width, height));
      try {
        const response = await page.goto(new URL('/admin', origin).href, { waitUntil: 'networkidle' });
        const state = await page.evaluate(() => {
          const pill = document.querySelector('main a[data-pill]');
          const panel = document.querySelector('main h1').parentElement;
          return { title: document.querySelector('h1').textContent, titleFont: getComputedStyle(document.querySelector('h1')).fontFamily, pill: pill?.textContent, href: pill?.getAttribute('href'), radius: parseFloat(getComputedStyle(panel).borderTopLeftRadius), overflow: document.documentElement.scrollWidth - innerWidth, shell: !!document.querySelector('[data-admin-shell]') };
        });
        await page.screenshot({ path: path.join(shots, `admin-girissiz-${width}.png`) });
        report.checks[`anonymousAdminPage${width}`] = { status: response.status(), ...state };
        if (response.status() !== 401 || state.shell || state.title !== 'Giriş gerekli' || !/Cormorant/i.test(state.titleFont) || state.pill !== 'Giriş yap' || state.href !== '/giris?next=%2Fadmin' || state.radius < 20 || state.overflow > 0) fail(`anonymous admin ${width}`, JSON.stringify(report.checks[`anonymousAdminPage${width}`]));
      } finally { await context.close(); }
    }

    // Membership dialog from the header: the same pill switch, here as two buttons that swap the form in place.
    {
      const { context, page, errors } = await open('chromium', viewport(1440, 900));
      try {
        await page.goto(new URL('/kvkk', origin).href, { waitUntil: 'networkidle' });
        await page.getByRole('banner').getByRole('link', { name: 'Hesabım', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('heading', { name: 'Soframıza hoş geldiniz.' }).waitFor({ timeout: 10000 });
        const before = await dialog.evaluate(node => {
          const tabs = node.querySelector('nav[aria-label="Üyelik işlemleri"]');
          const current = tabs.querySelector('[aria-current="page"]');
          const box = node.getBoundingClientRect();
          return { pill: tabs.hasAttribute('data-pill-switch'), current: current.textContent, background: getComputedStyle(current).backgroundColor, radius: parseFloat(getComputedStyle(node).borderTopLeftRadius), fits: box.top >= 0 && box.bottom <= innerHeight, submit: node.querySelector('button[type="submit"]').dataset.variant };
        });
        await page.screenshot({ path: path.join(shots, 'uyelik-penceresi-1440.png') });
        await dialog.getByRole('button', { name: 'Hesap oluştur', exact: true }).click();
        await dialog.getByRole('heading', { name: 'Soframıza katılın.' }).waitFor({ timeout: 5000 });
        const after = await dialog.evaluate(node => node.querySelector('nav[aria-label="Üyelik işlemleri"] [aria-current="page"]').textContent);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        // The dialog asks /api/account whether a session exists; for a guest the 401 answer is logged by the browser as a network error.
        const unexpected = errors.filter(message => !/status of 401/.test(message));
        report.checks.membershipDialog = { ...before, afterSwitch: after, guestSessionProbe401: errors.length - unexpected.length, consoleErrors: unexpected.length };
        if (!before.pill || before.current !== 'Giriş yap' || before.background !== GREEN || before.radius < 20 || !before.fits || before.submit !== 'primary' || after !== 'Hesap oluştur' || unexpected.length) fail('membership dialog', JSON.stringify({ ...report.checks.membershipDialog, unexpected }));
      } finally { await context.close(); }
    }

    // Phone menu lists every destination.
    {
      const { context, page } = await open('webkit', viewport(390, 844));
      try {
        await page.goto(new URL('/kvkk', origin).href, { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: 'Menüyü aç', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        // Five sections and the two account links; no second products button (Task208).
        const links = await dialog.locator('a:not([data-pill])').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
        const action = await dialog.locator('a[data-pill]').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(shots, 'menu-390.png') });
        report.checks.menu = { count: links.length, links, action };
        if (links.length !== 7 || action.length !== 0) fail('menu', `${links.length} links: ${links.join(', ')}`);
      } finally { await context.close(); }
    }

    // Long values: an account email and a product name that cannot fit on one line (text swapped in the page, nothing saved).
    {
      const { context, page } = await open('chromium', { ...viewport(320, 568), storageState: account.storageState });
      try {
        await page.goto(new URL('/hesabim', origin).href, { waitUntil: 'networkidle' });
        const result = await page.evaluate(value => {
          const cell = [...document.querySelectorAll('main dd')].find(node => node.textContent.includes('@'));
          cell.textContent = value;
          const card = cell.closest('section').getBoundingClientRect(), box = cell.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth - innerWidth, inside: box.right <= card.right + 0.5, lines: Math.round(box.height / parseFloat(getComputedStyle(cell).lineHeight)) };
        }, LONG_WORD);
        await page.screenshot({ path: path.join(shots, 'hesabim-uzun-eposta-320.png') });
        report.checks.longEmail = result;
        if (result.overflow > 0 || !result.inside || result.lines < 2) fail('long email', JSON.stringify(result));
      } finally { await context.close(); }
    }
    {
      const { context, page } = await open('chromium', { ...viewport(320, 568), storageState: account.storageState });
      try {
        await page.goto(new URL(`/hesabim/siparisler/${account.orderNo}`, origin).href, { waitUntil: 'networkidle' });
        await page.locator('main [data-tag]').first().waitFor();
        const result = await page.evaluate(value => {
          const line = [...document.querySelectorAll('main section p')].find(node => /Osmaniye/.test(node.textContent));
          if (!line) return { found: false };
          line.textContent = value;
          const card = line.closest('section').getBoundingClientRect(), box = line.getBoundingClientRect();
          return { found: true, overflow: document.documentElement.scrollWidth - innerWidth, inside: box.right <= card.right + 0.5 && box.left >= card.left - 0.5, lines: Math.round(box.height / parseFloat(getComputedStyle(line).lineHeight)) };
        }, LONG_ADDRESS);
        await page.locator('main section p').filter({ hasText: 'Mahallesi' }).first().scrollIntoViewIfNeeded().catch(() => {});
        await page.screenshot({ path: path.join(shots, 'hesabim-uzun-adres-320.png') });
        report.checks.longAddress = result;
        if (!result.found || result.overflow > 0 || !result.inside || result.lines < 2) fail('long address', JSON.stringify(result));
      } finally { await context.close(); }
    }
    // Address removal asks first, in a paper dialog with two pills; the question is dismissed, nothing is deleted.
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      const { context, page } = await open('chromium', { ...viewport(width, height), storageState: account.storageState });
      try {
        await page.goto(new URL('/hesabim/adresler', origin).href, { waitUntil: 'networkidle' });
        const remove = page.getByRole('button', { name: 'Sil', exact: true }).first();
        await remove.waitFor({ timeout: 10000 });
        await remove.click();
        const dialog = page.getByRole('alertdialog');
        await dialog.waitFor();
        await page.waitForTimeout(300);
        const result = await dialog.evaluate(node => {
          const box = node.getBoundingClientRect();
          const pills = [...node.querySelectorAll('button[data-pill]')];
          return { radius: parseFloat(getComputedStyle(node).borderTopLeftRadius), background: getComputedStyle(node).backgroundColor, fits: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight, pills: pills.map(pill => pill.textContent.trim()), pillHeights: pills.map(pill => Math.round(pill.getBoundingClientRect().height)), titleFont: getComputedStyle(node.querySelector('[data-slot="dialog-title"]')).fontFamily };
        });
        await page.screenshot({ path: path.join(shots, `adres-sil-onay-${width}.png`) });
        await dialog.getByRole('button', { name: 'Vazgeç', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
        const kept = await page.getByRole('button', { name: 'Sil', exact: true }).count();
        report.checks[`addressRemovalDialog${width}`] = { ...result, addressKept: kept > 0 };
        if (result.radius < 20 || result.background !== PAPER || !result.fits || result.pills.join() !== 'Vazgeç,Adresi sil' || result.pillHeights.some(value => value < 44) || !/Cormorant/i.test(result.titleFont) || !kept) fail(`address removal dialog ${width}`, JSON.stringify(report.checks[`addressRemovalDialog${width}`]));
      } finally { await context.close(); }
    }
    for (const [width, height] of [[390, 844], [320, 568], [768, 1024], [1024, 768]]) {
      const { context, page } = await open('chromium', { ...viewport(width, height), storageState: admin.storageState });
      try {
        await page.goto(new URL('/admin/urunler', origin).href, { waitUntil: 'networkidle' });
        await page.locator('tbody tr').first().waitFor();
        const result = await page.evaluate(value => {
          for (const name of document.querySelectorAll('tbody td:first-child strong')) name.textContent = value;
          const region = document.querySelector('[role="region"][aria-label="Ürün tablosu"]');
          const panel = region.getBoundingClientRect();
          const leaving = [...region.querySelectorAll('td, td *')].filter(node => { const box = node.getBoundingClientRect(); return box.width > 0 && box.right > panel.right + 0.5; }).length;
          return { rows: document.querySelectorAll('tbody tr').length, overflow: document.documentElement.scrollWidth - innerWidth, tableScroll: region.scrollWidth - region.clientWidth, leaving };
        }, LONG_NAME);
        await page.screenshot({ path: path.join(shots, `admin-urunler-uzun-ad-${width}.png`), fullPage: true });
        report.checks[`longProductName${width}`] = result;
        if (result.rows !== 6 || result.overflow > 0 || result.tableScroll > 0 || result.leaving) fail(`long product name ${width}`, JSON.stringify(result));
      } finally { await context.close(); }
    }

    // Product dialog on a phone and on a desktop.
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      const { context, page } = await open('chromium', { ...viewport(width, height), storageState: admin.storageState });
      try {
        await page.goto(new URL('/admin/urunler', origin).href, { waitUntil: 'networkidle' });
        await page.locator('tbody tr').first().locator('button[data-pill]').first().click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await page.waitForTimeout(300);
        const result = await dialog.evaluate(node => {
          const box = node.getBoundingClientRect();
          return { fits: box.left >= 0 && box.right <= innerWidth, coins: node.querySelectorAll('[data-coin]').length, pills: node.querySelectorAll('[data-pill]').length, titleFont: getComputedStyle(node.querySelector('[data-slot="dialog-title"]')).fontFamily, fieldHeight: node.querySelector('input').getBoundingClientRect().height };
        });
        await page.screenshot({ path: path.join(shots, `admin-urun-duzenle-${width}.png`) });
        report.checks[`productDialog${width}`] = result;
        if (!result.fits || result.coins || /Cormorant/i.test(result.titleFont) || result.fieldHeight < 52) fail(`product dialog ${width}`, JSON.stringify(result));
      } finally { await context.close(); }
    }
  } finally {
    await admin?.cleanup();
    await account.cleanup();
  }
  await fs.writeFile(path.join(out, 'olcum-pages.json'), JSON.stringify(report, null, 1));
  return report;
}

/* global document, window, innerHeight, getComputedStyle, localStorage, scrollTo */
// Task205 browser evidence for the buying path; run through scripts/qa-design-v3.mjs <url> <out> shop.
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const CART_KEY = 'afina-zeytin:cart';
const PAYMENT_SENTENCE = 'Online ödeme yakında açılıyor. Şimdilik ürünleriniz için teklif isteyebilirsiniz.';
const PAPER = 'rgb(255, 253, 248)';
const skus = ['sample-green-olive-1kg', 'sample-green-olive-10kg', 'sample-black-olive-1kg', 'sample-olive-oil-1l', 'sample-olive-oil-5l', 'sample-brined-green-olive-5kg'];
const crowded = skus.map(productId => ({ productId, quantity: 99 }));
const profiles = [[320, 568, 'chromium'], [390, 844, 'webkit'], [768, 1024, 'chromium'], [1440, 900, 'chromium']];
const routes = [
  { name: 'urunler', path: '/urunler', kind: 'catalog' },
  { name: 'kategori-zeytinyagi', path: '/urunler/zeytinyagi', kind: 'catalog' },
  { name: 'kategori-zeytin', path: '/urunler/zeytin', kind: 'catalog' },
  { name: 'kategori-kirma', path: '/urunler/kirma-zeytin', kind: 'catalog' },
  { name: 'kategori-siyah', path: '/urunler/siyah-zeytin', kind: 'catalog' },
  { name: 'kategori-yesil', path: '/urunler/yesil-zeytin', kind: 'catalog' },
  { name: 'urun-kirma-1kg', path: '/urun/dogal-kirma-yesil-zeytin?boy=1%20kg', kind: 'product' },
  { name: 'urun-kirma-3l', path: '/urun/dogal-kirma-yesil-zeytin?boy=3%20L', kind: 'product' },
  { name: 'urun-yag-5l', path: '/urun/naturel-sizma-zeytinyagi?boy=5%20L', kind: 'product' },
  { name: 'urun-siyah', path: '/urun/salamura-siyah-zeytin', kind: 'product', soldOut: true },
  { name: 'urun-yesil', path: '/urun/salamura-yesil-zeytin', kind: 'product' },
  { name: 'sepet-bos', path: '/sepet', kind: 'cart', cart: [] },
  { name: 'sepet-kalabalik', path: '/sepet', kind: 'cart', cart: crowded },
  { name: 'odeme', path: '/odeme', kind: 'checkout' },
];
const columnsFor = width => width >= 1200 ? 3 : width >= 360 ? 2 : 1;

/** Runs in the page: facts that belong to one kind of shop page. */
function inspectShop(kind) {
  const box = element => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }; };
  const font = element => { const style = getComputedStyle(element); return { family: style.fontFamily, size: parseFloat(style.fontSize), background: style.backgroundColor, radius: parseFloat(style.borderTopLeftRadius) }; };
  const facts = { kind };
  const cards = [...document.querySelectorAll('article[data-product-id]:not([data-product-page])')];
  facts.cards = cards.map(card => {
    const frame = box(card);
    const stage = card.querySelector('[data-tile-stage]');
    return {
      id: card.dataset.productId, width: Math.round(frame.width),
      escaping: [...card.querySelectorAll('[data-pill], h3, [aria-label="Fiyat"]')].filter(node => { const rect = box(node); return rect.left < frame.left - 0.5 || rect.right > frame.right + 0.5; }).map(node => node.textContent.trim()),
      stage: stage ? getComputedStyle(stage).backgroundColor : null,
      nameFont: getComputedStyle(card.querySelector('h3')).fontFamily,
    };
  });
  if (kind === 'catalog') {
    const grid = document.querySelector('[data-catalog-grid]');
    // Tracks, not cards: a category with two products still lays out three columns on a desktop.
    facts.columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const current = [...document.querySelectorAll('nav[aria-label="Ürün grupları"] a[aria-current="page"]')];
    const marker = document.querySelector('[data-category-indicator]');
    facts.currentPills = current.length;
    facts.indicatorOnCurrent = current.length === 1 && getComputedStyle(marker.parentElement).visibility === 'visible'
      ? Math.abs(box(marker).left - box(current[0]).left) < 1.5 && Math.abs(box(marker).top - box(current[0]).top) < 1.5 && Math.abs(box(marker).width - box(current[0]).width) < 1.5
      : null;
    facts.banner = { photo: document.querySelector('[data-catalog-banner] img')?.naturalWidth > 0, background: getComputedStyle(document.querySelector('[data-catalog-banner]')).backgroundColor };
    facts.sortRadius = font(document.querySelector('#catalog-sort')).radius;
  }
  if (kind === 'product') {
    const purchase = document.querySelector('[data-product-detail-purchase]');
    const action = purchase.querySelector('button[data-pill]');
    const group = document.querySelector('[role="radiogroup"]');
    const stepper = purchase.querySelector('[data-stepper]');
    facts.action = { label: (action.querySelector('[data-add-label]') ?? action).textContent.trim(), bottom: Math.round(box(action).bottom), viewport: innerHeight, disabled: action.disabled, coin: action.querySelector('[data-coin]') !== null };
    facts.tag = document.querySelector('[data-product-detail-info] [data-tag]')?.textContent ?? null;
    facts.title = { ...font(document.querySelector('h1')), lines: Math.round(box(document.querySelector('h1')).height / (parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight) || 1)) };
    facts.price = font(document.querySelector('[data-product-detail-info] [aria-label="Fiyat"]')).size;
    facts.sizes = group ? [...group.querySelectorAll('[role="radio"]')].map(radio => ({ label: radio.textContent, checked: radio.getAttribute('aria-checked'), tab: radio.tabIndex, height: Math.round(box(radio).height) })) : [];
    facts.stepper = stepper ? { height: Math.round(box(stepper).height), radius: font(stepper).radius, sameRow: Math.abs(box(stepper).top - box(action).top) < 12, buttons: [...stepper.querySelectorAll('button')].map(button => Math.round(Math.min(box(button).width, box(button).height))) } : null;
    facts.quote = purchase.querySelector('a[data-pill]')?.dataset.variant ?? null;
    facts.stage = { ...font(document.querySelector('[data-product-detail-image]')), photo: document.querySelector('[data-product-detail-image] img').naturalWidth > 0 };
    facts.thumbRadius = font(document.querySelector('[aria-label="Ürün görselleri"] button')).radius;
  }
  if (kind === 'cart') {
    const summary = document.querySelector('[data-cart-summary]');
    const total = summary.querySelector('[data-cart-total]');
    facts.summary = { background: getComputedStyle(summary).backgroundColor, radius: font(summary).radius, overflow: summary.scrollWidth - summary.clientWidth, dark: document.querySelector('main [data-surface="dark"]') !== null };
    facts.total = { ...font(total), text: total.textContent.trim(), inside: box(total).right <= box(summary).right + 0.5 && box(total).left >= box(summary).left - 0.5 };
    facts.lines = [...document.querySelectorAll('[aria-label="Sepetteki ürünler"] > li')].map(line => ({
      quantity: line.querySelector('output[aria-label="Adet"]').textContent, overflow: line.scrollWidth - line.clientWidth,
      controls: [...line.querySelectorAll('button')].map(button => Math.round(Math.min(box(button).width, box(button).height))),
      thumb: getComputedStyle(line.querySelector('picture')).backgroundColor,
    }));
    facts.empty = document.querySelector('main a[data-pill][href="/urunler"][data-variant="primary"]')?.textContent ?? null;
    const pay = [...summary.querySelectorAll('[data-pill]')].find(pill => pill.textContent.trim() === 'Ödemeye geç');
    facts.pay = pay ? { disabled: pay.disabled === true, coin: pay.querySelector('[data-coin]') !== null, help: document.getElementById(pay.getAttribute('aria-describedby'))?.textContent ?? null } : null;
    facts.quote = summary.querySelector('a[data-pill][href="/toptan-satis"]')?.dataset.variant ?? null;
    facts.back = document.querySelector('main a[data-pill][href="/urunler"][data-variant="quiet"]')?.textContent ?? null;
  }
  if (kind === 'checkout') {
    const panel = document.querySelector('[data-checkout-panel]');
    const marks = document.querySelector('[data-payment-pill]');
    facts.panel = { background: getComputedStyle(panel).backgroundColor, radius: font(panel).radius, text: panel.textContent };
    facts.marks = { radius: font(marks).radius, height: Math.round(box(marks).height), background: getComputedStyle(marks).backgroundColor, logos: [...marks.querySelectorAll('img')].filter(image => image.naturalWidth > 0).length };
    facts.back = document.querySelector('a[data-pill][href="/sepet"]')?.dataset.variant ?? null;
    facts.heading = document.querySelector('h1')?.closest('[data-section-heading]') !== null;
  }
  return facts;
}

export async function auditShop({ origin, out, shots, open, settle, inspectDesign, limits, fail }) {
  const report = { pages: [], flows: [], keyboard: null };

  function judge(where, route, width, base, shop, extras) {
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
    if (base.stamps) fail(where, `${base.stamps} stamps outside the two permitted places`);
    if (extras.cls !== null && extras.cls >= limits.cls) fail(where, `CLS ${extras.cls}`);
    if (extras.contrast.length) fail(where, `axe contrast ${extras.contrast.join(' | ')}`);
    if (extras.errors.length) fail(where, `console ${extras.errors.join(' | ')}`);
    for (const card of shop.cards) {
      if (card.escaping.length) fail(where, `card ${card.id}: ${card.escaping.join(', ')} leaves the card`);
      if (card.stage !== 'rgb(231, 235, 221)') fail(where, `card ${card.id} stage ${card.stage}`);
      if (!/Cormorant/i.test(card.nameFont)) fail(where, `card ${card.id} name font`);
    }
    if (route.kind === 'catalog') {
      if (shop.columns !== columnsFor(width)) fail(where, `${shop.columns} grid columns`);
      if (shop.currentPills !== 1 || shop.indicatorOnCurrent === false) fail(where, 'category indicator is not on the one current pill');
      if (!shop.banner.photo || shop.banner.background !== 'rgb(231, 235, 221)') fail(where, 'heading band without photograph or sage');
      if (shop.sortRadius !== 12) fail(where, `sort field radius ${shop.sortRadius}`);
    }
    if (route.kind === 'product') {
      if (width < 768 && shop.action.bottom > shop.action.viewport) fail(where, `"${shop.action.label}" ends at ${shop.action.bottom}, below the first screen (${shop.action.viewport})`);
      if (route.soldOut ? !(shop.action.label === 'Mevcut değil' && shop.action.disabled && !shop.action.coin && shop.stepper === null) : !(shop.action.label === 'Sepete ekle' && shop.stepper))
        fail(where, `purchase state ${JSON.stringify(shop.action)}`);
      if (!shop.tag) fail(where, 'category tag missing');
      if (!/Cormorant/i.test(shop.title.family) || shop.title.size < 34 || shop.title.size > 56 || shop.title.lines > 3) fail(where, `title ${JSON.stringify(shop.title)}`);
      if (shop.price !== 28) fail(where, `price ${shop.price}px`);
      if (shop.sizes.length && (shop.sizes.filter(size => size.checked === 'true').length !== 1 || shop.sizes.some(size => size.height < limits.touch || (size.checked === 'true') !== (size.tab === 0)))) fail(where, `size switch ${JSON.stringify(shop.sizes)}`);
      if (shop.stepper && (shop.stepper.radius < shop.stepper.height / 2 || shop.stepper.buttons.some(size => size < limits.touch))) fail(where, `stepper ${JSON.stringify(shop.stepper)}`);
      if (shop.stepper && width >= 360 && !shop.stepper.sameRow) fail(where, 'stepper and button are not side by side');
      if (shop.quote !== 'outline') fail(where, `quotation pill ${shop.quote}`);
      if (!shop.stage.photo || shop.stage.background !== 'rgb(231, 235, 221)' || shop.stage.radius < 20 || shop.thumbRadius !== 12) fail(where, `stage ${JSON.stringify(shop.stage)} thumb ${shop.thumbRadius}`);
    }
    if (route.kind === 'cart') {
      if (shop.summary.background !== PAPER || shop.summary.dark || shop.summary.radius < 20) fail(where, `summary ${JSON.stringify(shop.summary)}`);
      if (shop.summary.overflow > 0 || !shop.total.inside) fail(where, 'summary overflows');
      if (!/Cormorant/i.test(shop.total.family) || shop.total.size !== 28) fail(where, `total ${shop.total.family} ${shop.total.size}px`);
      if (route.cart.length === 0 && shop.empty !== 'Ürünleri İnceleyin') fail(where, 'empty cart without its primary pill');
      if (route.cart.length && shop.lines.length < 5) fail(where, `${shop.lines.length} lines`);
      for (const line of shop.lines) {
        if (line.overflow > 0) fail(where, 'cart line overflows');
        if (line.controls.some(size => size < limits.touch)) fail(where, `line controls ${line.controls.join('/')}`);
        if (line.thumb !== 'rgb(231, 235, 221)') fail(where, `line thumbnail ${line.thumb}`);
      }
      if (shop.pay && !(shop.pay.disabled && !shop.pay.coin && shop.pay.help === PAYMENT_SENTENCE)) fail(where, `closed checkout ${JSON.stringify(shop.pay)}`);
      if (shop.quote !== 'outline' || shop.back !== 'Alışverişe devam et') fail(where, 'quotation or way back missing');
    }
    if (route.kind === 'checkout') {
      if (shop.panel.background !== PAPER || shop.panel.radius < 20 || !shop.panel.text.includes('Ödeme hazırlıkları sürüyor.') || !shop.panel.text.includes(PAYMENT_SENTENCE)) fail(where, `panel ${JSON.stringify(shop.panel)}`);
      if (shop.marks.radius < shop.marks.height / 2 || shop.marks.background !== PAPER || shop.marks.logos !== 4) fail(where, `payment pill ${JSON.stringify(shop.marks)}`);
      if (shop.back !== 'outline' || !shop.heading) fail(where, 'heading or way back');
    }
  }

  for (const [width, height, engine] of profiles) {
    const phone = width < 800;
    const { context, page, errors } = await open(engine, { viewport: { width, height }, deviceScaleFactor: phone ? 2 : 1, hasTouch: width <= 1024, isMobile: phone });
    try {
      await page.addInitScript(() => {
        window.__cls = null;
        if (window.PerformanceObserver?.supportedEntryTypes?.includes('layout-shift')) {
          window.__cls = 0;
          new window.PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
        }
      });
      for (const route of routes) {
        const where = `${route.name} ${width}x${height}-${engine}`;
        errors.length = 0;
        if (route.cart) {
          await page.goto(new URL('/sepet', origin).href, { waitUntil: 'load' });
          await page.evaluate(([key, value]) => localStorage.setItem(key, value), [CART_KEY, JSON.stringify(route.cart)]);
        }
        await page.goto(new URL(route.path, origin).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        // First-screen facts are read before anything scrolls.
        const shop = await page.evaluate(inspectShop, route.kind);
        await page.screenshot({ path: path.join(shots, `${route.name}-${width}-ilk.png`) });
        await settle(page, height);
        const base = await page.evaluate(inspectDesign, limits.touch);
        await page.waitForTimeout(150);
        const cls = await page.evaluate(() => window.__cls);
        const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
        const contrast = axe.violations.flatMap(violation => violation.nodes.map(node => node.target.join(' ')));
        judge(where, route, width, base, shop, { cls, contrast, errors: [...errors] });
        await page.evaluate(() => { for (const element of document.querySelectorAll('main *')) if (element.scrollLeft) element.scrollLeft = 0; scrollTo(0, 0); });
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(shots, `${route.name}-${width}-tam.png`), fullPage: true });
        report.pages.push({ where, cls, axeContrast: contrast.length, consoleErrors: errors.length, pills: base.pills.length, minPillHeight: base.pills.length ? Math.min(...base.pills.map(pill => pill.height)) : null, overflow: base.overflow, shop });
      }
      await page.evaluate(key => localStorage.removeItem(key), CART_KEY);
    } finally { await context.close(); }
  }

  // Flow: size → quantity 2 → add → drawer → /sepet → /odeme, on a desktop and on a phone engine.
  for (const [width, height, engine] of [[1440, 900, 'chromium'], [390, 844, 'webkit']]) {
    const where = `flow ${width}x${height}-${engine}`;
    const phone = width < 800;
    const { context, page, errors } = await open(engine, { viewport: { width, height }, deviceScaleFactor: phone ? 2 : 1, hasTouch: phone, isMobile: phone });
    const steps = [];
    const step = async (name, check) => { try { await check(); steps.push({ name, ok: true }); } catch (error) { steps.push({ name, ok: false, error: String(error.message).split('\n')[0] }); fail(where, `${name}: ${String(error.message).split('\n')[0]}`); } };
    const expectText = async (locator, text) => { const actual = (await locator.textContent({ timeout: 5000 })).trim(); if (actual !== text) throw new Error(`expected "${text}", got "${actual}"`); };
    try {
      await page.goto(new URL('/urun/naturel-sizma-zeytinyagi', origin).href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const product = page.locator('[data-product-page]');
      const cartPill = page.getByRole('banner').getByRole('button', { name: /^Sepetim/ });
      const drawer = page.getByRole('dialog', { name: /^Sepetim \(/ });
      await step('boy değiştir: 5 L', async () => {
        await product.getByRole('radio', { name: '5 L', exact: true }).click();
        await product.locator('[role="radio"][aria-checked="true"]').filter({ hasText: '5 L' }).waitFor({ timeout: 5000 });
        if (!(await product.getByLabel('Fiyat').textContent()).includes('1.750')) throw new Error('price did not follow the size');
      });
      await step('adet 2', async () => { await product.getByRole('button', { name: 'Adedi artır', exact: true }).click(); await expectText(product.locator('output[aria-label="Adet"]'), '2'); });
      await step('sepete ekle', async () => {
        await product.locator('[data-product-detail-purchase]').getByRole('button', { name: 'Sepete ekle', exact: true }).click();
        await product.locator('[data-add-label][data-phase="added"]').waitFor({ timeout: 3000 });
        await expectText(page.locator('[data-cart-count]'), '2');
      });
      await page.screenshot({ path: path.join(shots, `akis-eklendi-${width}.png`) });
      await step('çekmece', async () => {
        await cartPill.click();
        await drawer.waitFor({ timeout: 5000 });
        await page.waitForTimeout(600);
        const line = drawer.getByRole('group', { name: 'Natürel Sızma Zeytinyağı', exact: true });
        await expectText(line.locator('[data-tag]'), '5 L');
        await expectText(line.locator('output[aria-label="Adet"]'), '2');
        await expectText(drawer.locator('[data-cart-total]'), '3.500,00 ₺');
        if (!(await drawer.getByRole('button', { name: 'Ödemeye geç' }).isDisabled())) throw new Error('checkout is not disabled');
        if (!(await drawer.getByText(PAYMENT_SENTENCE).isVisible())) throw new Error('payment sentence hidden');
        const footer = await drawer.evaluate(element => { const foot = element.querySelector('[data-cart-footer]'); const body = element.querySelector('[aria-label="Sepetteki ürünler"]').parentElement; return { background: getComputedStyle(foot).backgroundColor, footer: Math.round(foot.getBoundingClientRect().height), body: Math.round(body.getBoundingClientRect().height), dark: element.querySelector('[data-surface="dark"]') !== null }; });
        if (footer.background !== PAPER || footer.dark) throw new Error(`drawer footer ${JSON.stringify(footer)}`);
        if (footer.body < 160) throw new Error(`only ${footer.body}px left for the lines`);
        steps.push({ name: 'çekmece ölçüsü', ok: true, ...footer });
      });
      await page.screenshot({ path: path.join(shots, `cekmece-${width}.png`) });
      await step('Esc kapatır, odak sepet hapına döner', async () => {
        await page.keyboard.press('Escape');
        await drawer.waitFor({ state: 'detached', timeout: 5000 });
        if (!(await cartPill.evaluate(element => element === document.activeElement))) throw new Error('focus did not return to the cart pill');
      });
      await step('/sepet', async () => {
        await cartPill.click();
        await drawer.getByRole('link', { name: 'Sepeti görüntüle' }).click();
        await page.waitForURL(/\/sepet$/, { timeout: 8000 });
        const summary = page.getByRole('complementary', { name: 'Sepet özeti' });
        await expectText(summary.locator('[data-cart-total]'), '3.500,00 ₺');
        if (await page.getByRole('link', { name: 'Ödemeye geç' }).count()) throw new Error('an open checkout link exists');
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(shots, `sepet-${width}-ilk.png`) });
      await page.screenshot({ path: path.join(shots, `sepet-${width}-tam.png`), fullPage: true });
      await step('/odeme', async () => {
        await page.getByRole('complementary', { name: 'Sepet özeti' }).getByRole('link', { name: 'Ödeme bilgileri' }).click();
        await page.waitForURL(/\/odeme$/, { timeout: 8000 });
        await expectText(page.getByRole('heading', { level: 1 }), 'Ödeme');
        if (!(await page.getByText('Ödeme hazırlıkları sürüyor.').isVisible())) throw new Error('preparation message hidden');
        await page.getByRole('link', { name: 'Sepetime dön' }).click();
        await page.waitForURL(/\/sepet$/, { timeout: 8000 });
      });
      if (errors.length) fail(where, `console ${errors.join(' | ')}`);
      report.flows.push({ where, steps });
    } finally { await context.close(); }
  }

  // Keyboard: arrows move the size, Tab reaches the purchase, without a pointer.
  {
    const { context, page } = await open('chromium', { viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(new URL('/urun/dogal-kirma-yesil-zeytin', origin).href, { waitUntil: 'networkidle' });
      const radios = page.locator('[data-product-page] [role="radio"]');
      await radios.first().focus();
      const outline = await radios.first().evaluate(element => parseFloat(getComputedStyle(element).outlineWidth));
      await page.keyboard.press('ArrowRight');
      const afterRight = await radios.evaluateAll(all => all.map(radio => ({ label: radio.textContent, checked: radio.getAttribute('aria-checked'), focused: radio === document.activeElement })));
      await page.keyboard.press('ArrowLeft');
      const afterLeft = await radios.evaluateAll(all => all.map(radio => radio.getAttribute('aria-checked')));
      await page.keyboard.press('Tab');
      const next = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.trim());
      report.keyboard = { outline, afterRight, afterLeft, next, url: page.url() };
      if (!(afterRight[1]?.checked === 'true' && afterRight[1]?.focused && afterLeft[0] === 'true')) fail('keyboard', `size arrows ${JSON.stringify(afterRight)}`);
      if (outline < 2) fail('keyboard', `focus ring ${outline}px`);
    } finally { await context.close(); }
  }

  await fs.writeFile(path.join(out, 'olcum-shop.json'), JSON.stringify(report, null, 1));
  return report;
}

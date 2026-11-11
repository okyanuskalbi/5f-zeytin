/* global document, NodeFilter, getComputedStyle */
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// node scripts/qa-storefront-collisions.mjs <local-url> <output-directory>
const origin = new URL(process.argv[2] ?? 'https://localhost:3019');
assert(['localhost', '127.0.0.1'].includes(origin.hostname), 'Local verification only');
const output = path.resolve(process.argv[3] ?? 'output/task198-codex/duzeltme-198-2/green');
assert(output.startsWith(path.resolve('output') + path.sep), 'Evidence belongs in project output/');
await fs.mkdir(output, { recursive: true });
const cards = '[data-home-section="hero"], article[data-product-id], a[data-home-category], [data-home-section="banners"] a, [data-home-section="blog"] a[href^="/blog/"]';
const sizes = [[320,568],[360,800],[375,667],[390,844],[414,896],[430,932],[768,1024],[820,1180],[1024,768],[1024,1366],[1280,800],[1366,768],[1440,900],[1920,1080],[2560,1440]];

// Text-node line boxes avoid falsely treating a whole image-bearing link as text.
// Clip at scrolling/hidden ancestors, but not at the viewport: every card is
// inspected in full, including long cards and every item in a horizontal shelf.
function inspectCard(card) {
  const visibleRect = (rect, element) => {
    let box = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    for (let parent = element; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || parent.hidden) return null;
      const bounds = parent.getBoundingClientRect();
      if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX)) {
        box.left = Math.max(box.left, bounds.left); box.right = Math.min(box.right, bounds.right);
      }
      if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)) {
        box.top = Math.max(box.top, bounds.top); box.bottom = Math.min(box.bottom, bounds.bottom);
      }
      if (style.clip !== 'auto' || style.clipPath !== 'none') return null;
    }
    return box.right - box.left > 1 && box.bottom - box.top > 1 ? box : null;
  };
  const images = [...card.querySelectorAll('img,picture')].filter(e => !e.closest('[data-overlay-ok]')).flatMap(element => {
    const box = visibleRect(element.getBoundingClientRect(), element);
    return box ? [{ element, box }] : [];
  });
  const failures = [];
  let textRuns = 0;
  const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!node.textContent.trim() || parent.closest('[data-overlay-ok],button[data-media-control],svg,script,style,[aria-hidden="true"]')) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      const textBox = visibleRect(rect, parent);
      if (!textBox) continue;
      textRuns++;
      // picture display:contents has no box; its img still participates.
      for (const {element, box} of images) {
        const width = Math.min(textBox.right, box.right) - Math.max(textBox.left, box.left);
        const height = Math.min(textBox.bottom, box.bottom) - Math.max(textBox.top, box.top);
        if (width > 1 && height > 1) failures.push({ text: node.textContent.trim(), media: element.tagName, src: element.currentSrc ?? element.querySelector('img')?.currentSrc, width, height, textBox, imageBox: box });
      }
    }
  }
  return { textRuns, images: images.length, failures };
}

const rows = [];
let browser;
process.on('SIGTERM', async () => { await browser?.close(); process.exit(1); });
try {
  for (const engine of ['chromium', 'webkit']) {
    browser = await ({chromium, webkit}[engine]).launch({headless:true});
    // A broken detector or an ignored overlay must not silently pass the matrix.
    const fixture = await browser.newPage();
    await fixture.setContent('<div id="card" style="position:relative"><img alt="" style="width:100px;height:100px"><p style="position:absolute;left:0;top:0">Collision</p><p data-overlay-ok style="position:absolute;left:0;top:0">Allowed</p></div>');
    const probe = await fixture.locator('#card').evaluate(inspectCard);
    assert.equal(probe.failures.length, 1); assert.equal(probe.failures[0].text, 'Collision');
    await fixture.close();
    for (const [width,height] of sizes.filter(([w]) => ([390,430,820].includes(w) ? 'webkit' : 'chromium') === engine)) {
      for (const [name,route] of [['home','/'],['product','/urun/dogal-kirma-yesil-zeytin']]) {
        const context = await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},hasTouch:width<1024,isMobile:width<1024,deviceScaleFactor:1});
        try {
          await context.route('**/*', r => new URL(r.request().url()).origin === origin.origin ? r.continue() : r.abort());
          const page = await context.newPage(); const errors = [], resources = [];
          page.on('pageerror', e => errors.push(e.message));
          page.on('console', m => {if(m.type()==='error') errors.push(m.text());});
          page.on('response', r => {if(r.status()>=400) resources.push(r.url());});
          await page.goto(new URL(route, origin).href, {waitUntil:'networkidle'});
          await page.evaluate(() => document.fonts.ready);
          const count = await page.locator(cards).count();
          assert.equal(count, name === 'home' ? 20 : 5, 'Card selector coverage changed');
          const results = [];
          for (const card of await page.locator(cards).all()) {
            await card.scrollIntoViewIfNeeded();
            await card.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode().catch(() => {}))));
            await page.waitForTimeout(80);
            const result = await card.evaluate(inspectCard);
            const hero = await card.getAttribute('data-home-section') === 'hero';
            assert(result.images > 0 && (result.textRuns > 0 || hero), 'Card must have measured media and visible text');
            if (hero) assert.equal(await card.locator('[data-overlay-ok] h1').count(), 1, 'Hero heading must explicitly allow overlay');
            results.push(result);
          }
          const broken = await page.locator(cards).locator('img').evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth===0).map(img => img.src));
          const collisions = results.flatMap((r,index) => r.failures.map(f => ({card:index,...f})));
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          rows.push({name,width,height,engine,cards:count,textRuns:results.reduce((n,r)=>n+r.textRuns,0),collisions,overflow,errors,resources,broken});
          if (name==='home' && [320,390,430,768].includes(width)) {
            await page.locator('[data-home-section="featured"]').screenshot({path:path.join(output,`featured-${width}.png`)});
            await page.evaluate(() => {for(const e of document.querySelectorAll('div')) if(getComputedStyle(e).overflowX==='auto') e.scrollLeft=0; window.scrollTo(0,0);});
            await page.screenshot({path:path.join(output,`home-${width}-full.png`),fullPage:true});
          }
          await fs.writeFile(path.join(output,'report.json'),JSON.stringify(rows,null,2));
          console.log(`${name} ${width}x${height} ${engine}: cards=${count} collisions=${collisions.length} overflow=${overflow} errors=${errors.length} broken=${broken.length}`);
        } finally { await context.close(); }
      }
    }
    await browser.close(); browser=undefined;
  }
} finally { await browser?.close(); }
const failures=rows.filter(r => r.collisions.length || r.overflow || r.errors.length || r.resources.length || r.broken.length);
console.log(`${failures.length ? 'FAIL' : 'PASS'}: ${rows.length} profiles, ${failures.length} failing profiles`);
process.exitCode=failures.length ? 1 : 0;

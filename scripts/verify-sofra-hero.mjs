import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, webkit, devices } from '@playwright/test';
import sharp from 'sharp';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3112';
const directory = resolve('test-results/112');
await mkdir(directory, { recursive: true });
const report = [];
for (const [name, engine, options] of [
  ['desktop', chromium, { viewport: { width: 1440, height: 900 } }],
  ['comp', chromium, { viewport: { width: 1152, height: 654 } }],
  ['iphone14', webkit, { ...devices['iPhone 14'], viewport: {width:390,height:844} }],
  ['iphone-se', webkit, { ...devices['iPhone SE'], viewport: {width:320,height:568} }],
  ['pixel7', chromium, devices['Pixel 7']],
  ['pixel7-landscape', chromium, devices['Pixel 7 landscape']],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ ...options, deviceScaleFactor: 1, baseURL, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator('[data-hero-intro]');
    const add = hero.getByRole('button', { name: /Sepete ekle/ });
    await add.waitFor({ state: 'visible' });
    const measure = await hero.evaluate(node => {
      const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      const h = node.querySelector('h1');
      const img = node.querySelector('img');
      const words = [...h.querySelectorAll('[data-hero-word]')];
      return { hero: rect(node), heading: rect(h), words: words.map(rect), font: getComputedStyle(h).fontFamily,
        fontSize: getComputedStyle(h).fontSize, lineHeight: getComputedStyle(h).lineHeight,
        button: rect(node.querySelector('button')), nav: rect(document.querySelector('[data-site-navbar]')),
        photo: img.currentSrc, opacity: getComputedStyle(img).opacity,
        overflow: document.documentElement.scrollWidth > innerWidth, viewport: {width:innerWidth,height:innerHeight} };
    });
    assert(!measure.overflow, `${name}: horizontal overflow`);
    assert(measure.heading.y >= measure.nav.height, `${name}: heading behind header`);
    assert(measure.heading.y + measure.heading.height <= measure.viewport.height, `${name}: heading outside first screen`);
    assert(measure.button.y + measure.button.height <= measure.viewport.height, `${name}: CTA outside first screen`);
    assert(measure.heading.height <= parseFloat(measure.lineHeight) * 2 + 1, `${name}: heading exceeds two lines`);
    assert(measure.words.every(word => word.width <= measure.heading.width + 1), `${name}: clipped word`);
    assert(measure.nav.height <= (measure.viewport.width >= 1024 ? 72 : 60), `${name}: header too tall`);
    await page.screenshot({path:resolve(directory,`${name}.png`)});
    await add.click();
    await page.waitForFunction(() => document.querySelector('[data-hero-intro] [role="status"]').textContent.includes('sepete eklendi'));
    assert.equal(await page.getByRole('dialog').count(),0,`${name}: drawer opens automatically`);
    await page.getByRole('button', {name:'Sepetim, 1 adet',exact:true}).waitFor();
    await page.screenshot({path:resolve(directory,`${name}-added.png`)});
    await page.getByRole('link',{name:'Ürünleri gör',exact:true}).click();
    assert.equal(new URL(page.url()).hash,'#kiler');
    const top=await page.locator('#kiler-title').evaluate(node=>node.getBoundingClientRect().top);
    assert(top >= measure.nav.height && top < measure.viewport.height,`${name}: pantry not reached`);
    const scrollDirectory=resolve(directory,'scroll');
    await mkdir(scrollDirectory,{recursive:true});
    const fullHeight = await page.evaluate(()=>document.documentElement.scrollHeight);
    const step=Math.round(measure.viewport.height*0.4);
    const frames=[];
    for(let y=0; y<fullHeight; y+=step) {
      await page.evaluate(top=>scrollTo(0,top),y);
      await page.evaluate(()=>new Promise(requestAnimationFrame));
      const path=resolve(scrollDirectory,`${name}-${String(frames.length).padStart(2,'0')}.png`);
      await page.screenshot({path}); frames.push(path);
    }
    const thumbs=await Promise.all(frames.map(path=>sharp(path).resize({width:180}).png().toBuffer()));
    const thumbMeta=await sharp(thumbs[0]).metadata();
    await sharp({create:{width:180*frames.length,height:thumbMeta.height,channels:3,background:'#faf7f0'}}).composite(thumbs.map((input,i)=>({input,left:i*180,top:0}))).png().toFile(resolve(directory,`${name}-scroll-strip.png`));
    await page.evaluate(()=>scrollTo(0,0));
    let clicks=0;
    while(clicks++<200) {
      if(engine===webkit && options.isMobile) await page.evaluate(()=>scrollBy(0,120));
      else await page.mouse.wheel(0,120);
      await page.evaluate(()=>new Promise(requestAnimationFrame));
      if(await page.evaluate(()=>innerHeight+scrollY>=document.documentElement.scrollHeight-2)) break;
    }
    assert(clicks<200,`${name}: footer unreachable`);
    assert.deepEqual(errors,[]);
    report.push({name,...measure,frames:frames.length,wheelClicks:clicks,errors});
  } finally {await browser.close();}
}
await writeFile(resolve(directory,'viewport-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.map(({name,fontSize,heading,button,frames,wheelClicks})=>({name,fontSize,heading,button,frames,wheelClicks})),null,2));

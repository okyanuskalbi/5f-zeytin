/* global document, innerHeight */
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://localhost:3019');
assert(['localhost', '127.0.0.1'].includes(origin.hostname));
const output = path.resolve(process.argv[3] ?? 'output/task198-3/first-screen');
assert(output.startsWith(path.resolve('output') + path.sep));
await fs.mkdir(output, { recursive: true });
const rows = [];
let browser;
process.on('SIGTERM', async () => { await browser?.close(); process.exit(1); });
try {
  for (const [engine, width, height] of [['chromium',320,568],['webkit',390,844]]) {
    browser = await ({chromium,webkit}[engine]).launch({headless:true});
    const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,ignoreHTTPSErrors:true,deviceScaleFactor:1});
    await context.route('**/*', route => new URL(route.request().url()).origin === origin.origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(new URL('/urun/dogal-kirma-yesil-zeytin',origin).href,{waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts.ready);
    const purchase = page.locator('[data-product-detail-purchase]');
    await purchase.getByRole('button',{name:'Sepete ekle',exact:true}).waitFor();
    const measures = await page.evaluate(() => {
      const selectors = {size:'[data-state="checked"]',price:'[aria-label="Fiyat"]',buy:'[data-product-detail-purchase] button[data-variant]'};
      return Object.fromEntries(Object.entries(selectors).map(([name,selector]) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return [name,{top:rect.top,bottom:rect.bottom,visible:rect.top>=0 && rect.bottom<=innerHeight}];
      }));
    });
    await page.screenshot({path:path.join(output,`product-${width}-first.png`)});
    rows.push({engine,width,height,measures,pass:Object.values(measures).every(m=>m.visible)});
    await context.close(); await browser.close(); browser=undefined;
  }
} finally { await browser?.close(); }
await fs.writeFile(path.join(output,'report.json'),JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows,null,2));
assert(rows.every(row=>row.pass),'Selected size, price and purchase must fit the first screen');

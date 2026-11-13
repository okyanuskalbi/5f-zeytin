/* global document, getComputedStyle, scrollTo, innerWidth */
// Task210: deterministic local screenshots and text/coin geometry, before and after.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin = new URL(process.argv[2] ?? 'https://localhost:3024');
const out = path.resolve(process.argv[3] ?? 'output/task210/once');
assert(['localhost', '127.0.0.1'].includes(origin.hostname));
assert(out.startsWith(path.resolve('output') + path.sep));
await fs.mkdir(out, { recursive: true });
const sizes = [[320,568],[360,740],[375,812],[390,844],[430,932],[768,1024],[1024,768],[1440,900]];
const report = [];
const browser = await chromium.launch({headless:true});
try {
 for (const [width,height] of sizes) {
  const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<768,hasTouch:width<=1024,reducedMotion:'reduce',ignoreHTTPSErrors:true});
  await context.route('**/*', route => { const r=route.request(); return new URL(r.url()).origin!==origin.origin || !['GET','HEAD'].includes(r.method()) ? route.abort() : route.continue(); });
  const page = await context.newPage();
  const urls = ['/'];
  for (let index=0;index<urls.length;index++) {
   const url=urls[index], errors=[];
   const errorHandler=e=>errors.push(e.message); page.on('pageerror',errorHandler);
   await page.goto(new URL(url,origin).href,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   if(index===0) urls.push(...await page.locator('[data-product-grid] h3 a').evaluateAll(nodes=>[...new Set(nodes.map(n=>new URL(n.href).pathname))]));
   await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}))); 
   const total=await page.evaluate(()=>document.documentElement.scrollHeight);
   for(let y=0;y<total;y+=height) {await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(50);}
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);
   const key=index===0?'home':url.split('/').at(-1);
   await page.screenshot({path:path.join(out,`${key}-${width}.png`),fullPage:true,animations:'disabled'});
   const blocks=[];
   if(index===0) for(const block of await page.locator('[data-phone-screen]').all()) {
    const name=await block.getAttribute('data-phone-screen');
    await block.screenshot({path:path.join(out,`section-${name}-${width}.png`),animations:'disabled'});
    blocks.push({name,box:await block.boundingBox()});
   }
   const facts=await page.evaluate(()=>{
    const pills=[...document.querySelectorAll('[data-product-grid] [data-pill], [class*="relatedGrid"] [data-pill]')].map(p=>{
     const label=p.querySelector('[data-pill-label]'), l=label.getBoundingClientRect(),coin=p.querySelector('[data-coin]')?.getBoundingClientRect();
     const range=document.createRange();range.selectNodeContents(label);const t=range.getBoundingClientRect();
     return {text:label.textContent,labelWidth:l.width,textWidth:t.width,gap:coin?coin.left-t.right:null,overflow:Math.max(0,t.right-l.right,l.left-t.left),font:getComputedStyle(p).fontSize};
    });
    return {pills,overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)};
   });
   report.push({width,height,url,blocks,...facts,errors});page.off('pageerror',errorHandler);
  }
  await context.close();
 }
} finally { await browser.close(); }
await fs.writeFile(path.join(out,'shots210.json'),JSON.stringify(report,null,2));
console.log(`${report.length} pages; ${report.filter(r=>r.pills.some(p=>p.overflow>.5||p.gap<0&&p.gap!==null)).length} pages with colliding/overflowing labels`);

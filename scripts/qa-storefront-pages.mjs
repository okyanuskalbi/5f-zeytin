/* global document, window, innerWidth, getComputedStyle, NodeFilter, PerformanceObserver, performance */
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

export const profiles = [[320,568],[360,800],[375,667],[390,844],[414,896],[430,932],[768,1024],[820,1180],[1024,768],[1024,1366],[1280,800],[1366,768],[1440,900],[1920,1080],[2560,1440]];
export const routes = [
 // Task208: one landing page; categories and the two business pills are query states of `/`.
 ['anasayfa','/'], ...['zeytinyagi','zeytin','siyah-zeytin','yesil-zeytin','kirma-zeytin'].map(x=>[x,`/?kategori=${x}`]),
 ['urun-kirma','/urun/dogal-kirma-yesil-zeytin?boy=1%20kg'],['urun-teneke','/urun/dogal-kirma-yesil-zeytin?boy=3%20L'],['urun-yag','/urun/naturel-sizma-zeytinyagi?boy=5%20L'],['urun-siyah','/urun/salamura-siyah-zeytin'],['urun-yesil','/urun/salamura-yesil-zeytin'],
 ['toptan','/?sekme=toptan'],['teklif-onsecim','/?sekme=toptan&teklif=sample-green-olive-1kg'],['bayilik','/?sekme=bayilik'],
 ...['salamura-zeytin-nasil-hazirlanir','kirma-zeytin-nedir-nasil-saklanir','naturel-sizma-zeytinyagi-nasil-saklanmali','sofralik-zeytin-secerken-nelere-dikkat-edilmeli'].map((x,i)=>[`blog-${i+1}`,`/blog/${x}`]),
 ['sepet','/sepet'],['odeme','/odeme'],['giris','/giris'],['kayit','/kayit'],['hesabim','/hesabim'],['adresler','/hesabim/adresler'],['bilgilerim','/hesabim/bilgilerim'],['guvenlik','/hesabim/guvenlik'],['siparisler','/hesabim/siparisler'],['siparis-detay','/hesabim/siparisler/TASK199-QA'],
 ['siparis-takip','/siparis-takip'],['iade','/iade'],['kvkk','/kvkk'],['mesafeli-satis','/mesafeli-satis'],['404','/task199-bulunamayan-sayfa'],
];

/** Visible text line boxes, not element boxes: inline links and image links are not false collisions. */
export function inspectPage() {
 const visible = e => {
  const r=e.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
  for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility!=='visible'||Number(s.opacity)===0||p.hidden||p.getAttribute('aria-hidden')==='true'||s.clipPath==='inset(50%)')return false;}
  return true;
 };
 const scope=document.querySelector('[role=dialog]')??document.querySelector('main')??document.body;
 // Ignore geometry hidden behind a scroll container's clipping edge; retain
 // offscreen page content so full-page collisions are still checked.
 const paintedRect=(e,box)=>{
  const r={left:box.left,right:box.right,top:box.top,bottom:box.bottom};
  for(let p=e.parentElement;p&&p!==document.body&&p!==document.documentElement;p=p.parentElement){
   const style=getComputedStyle(p),bounds=p.getBoundingClientRect();
   if(/hidden|clip|auto|scroll/.test(style.overflowX)){r.left=Math.max(r.left,bounds.left+p.clientLeft);r.right=Math.min(r.right,bounds.left+p.clientLeft+p.clientWidth);}
   if(/hidden|clip|auto|scroll/.test(style.overflowY)){r.top=Math.max(r.top,bounds.top+p.clientTop);r.bottom=Math.min(r.bottom,bounds.top+p.clientTop+p.clientHeight);}
  }
  r.width=r.right-r.left;r.height=r.bottom-r.top;return r;
 };
 const text=[];const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
 for(let n=walker.nextNode();n;n=walker.nextNode()){
  const e=n.parentElement; if(!n.textContent.trim()||e.closest('script,style,svg,[aria-hidden="true"]')||!visible(e))continue;
  const range=document.createRange();range.selectNodeContents(n);
  for(const box of range.getClientRects()){const r=paintedRect(e,box);if(r.width>1&&r.height>1)text.push({e,text:n.textContent.trim(),r});}
 }
 const images=[...scope.querySelectorAll('img')].filter(visible);
 const collisions=[];
 for(const t of text){if(t.e.closest('[data-overlay-ok],[data-media-control]'))continue;for(const image of images){
  const r=paintedRect(image,image.getBoundingClientRect()), w=Math.min(r.right,t.r.right)-Math.max(r.left,t.r.left),h=Math.min(r.bottom,t.r.bottom)-Math.max(r.top,t.r.top);
  if(w>2&&h>2)collisions.push({text:t.text.slice(0,90),image:image.getAttribute('src'),width:w,height:h});
 }}
 const targets=[...document.querySelectorAll('a,button,input:not([type=hidden]),select,textarea,summary')].filter(visible).filter(e=>!e.matches('[disabled]'));
 const smallTargets=targets.flatMap(e=>{
  let r=e.getBoundingClientRect();
  if(e.matches('input[type=checkbox],input[type=radio]')){const label=e.closest('label')??(e.id?document.querySelector(`label[for="${e.id}"]`):null);if(label)r=label.getBoundingClientRect();}
  return r.width<43.5||r.height<43.5?[{text:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('name')||e.tagName).trim().slice(0,80),width:r.width,height:r.height}]:[];
 });
 const smallText=text.filter(t=>parseFloat(getComputedStyle(t.e).fontSize)<12).map(t=>({text:t.text.slice(0,60),size:getComputedStyle(t.e).fontSize}));
 const buttons=[...document.querySelectorAll('button,a[class*="action"],a[class*="primary"],a[class*="quote"]')].filter(visible).flatMap(e=>{
  const lines=text.filter(t=>e.contains(t.e)).reduce((out,t)=>out.some(y=>Math.abs(y-t.r.top)<3)?out:[...out,t.r.top],[]);
  return lines.length>1?[{text:e.textContent.trim().slice(0,80),lines:lines.length}]:[];
 });
 return {title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,
  broken:[...document.images].filter(visible).filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),collisions,smallTargets,smallText,wrappedButtons:buttons,
  longDashes:[...text.filter(t=>/[—–]/.test(t.text)).map(t=>t.text),...[document.title,...[...document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')].map(e=>e.content),...images.map(i=>i.alt)].filter(t=>/[—–]/.test(t))],
  radii:[...new Set(targets.map(e=>getComputedStyle(e).borderRadius))],cls:window.__cls??null};
}

async function main(){
 const origin=new URL(process.argv[2]??'https://localhost:3021'); assert(['localhost','127.0.0.1'].includes(origin.hostname));
 const out=path.resolve(process.argv[3]??'output/task199'); assert(out.startsWith(path.resolve('output')+path.sep));
 await fs.mkdir(`${out}/ekran`,{recursive:true});
 const requestedWidths=process.argv.find(a=>a.startsWith('--widths='))?.split('=')[1].split(',').map(Number);
 const subset=requestedWidths?profiles.filter(([w])=>requestedWidths.includes(w)):process.argv.includes('--quick')?profiles.filter(([w])=>[320,390,768,1440].includes(w)):profiles;
 const suffix=process.argv.find(a=>a.startsWith('--suffix='))?.split('=')[1]??(process.argv.includes('--quick')?'quick':'');
 assert(/^[a-z0-9-]*$/.test(suffix));
 let selected=process.argv.includes('--public')?routes.filter(([,r])=>!r.startsWith('/hesabim')):routes;
 if(process.argv.includes('--forms'))selected=selected.filter(([name])=>['toptan-satis','teklif-onsecim','bayilik'].includes(name));
 const rows=[];let browser;let account;let writeQueue=Promise.resolve();
 process.on('SIGTERM',async()=>{await browser?.close();await account?.cleanup?.();process.exit(1);});
 try {
  if(!process.argv.includes('--public')){
   const helper=await import(path.resolve('tests/helpers/storefront-local-auth.mjs'));
   browser=await chromium.launch({headless:true}); account=await helper.prepareSession(browser); selected=[...routes.filter(([,r])=>!r.startsWith("/hesabim")),...account.routes]; await fs.writeFile(`${out}/auth-checks.json`,JSON.stringify(account.checks,null,2)); await browser.close();browser=undefined;
  }
  for(const engine of ['chromium','webkit']){
   browser=await ({chromium,webkit}[engine]).launch({headless:true});
   for(const [width,height] of subset.filter(([w])=>([390,430,820].includes(w)?'webkit':'chromium')===engine)){
    for(let index=0;index<selected.length;index+=2){
     await Promise.all(selected.slice(index,index+2).map(async([name,route])=>{
     const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},hasTouch:width<=1024,isMobile:width<=1024,deviceScaleFactor:1,...(route.startsWith('/hesabim')?{storageState:account.storageState}:{})});
     try {
      await context.route('**/*',r=>new URL(r.request().url()).origin===origin.origin?r.continue():r.abort());
      const page=await context.newPage(); const errors=[],resources=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!(name==='404'&&m.text().includes('404')))errors.push(m.text());});
      page.on('response',r=>{if(r.status()>=400&&!(name==='404'&&r.status()===404&&new URL(r.url()).pathname===route))resources.push([r.status(),r.url()]);});
      await page.addInitScript(()=>{window.__cls=null;if(PerformanceObserver.supportedEntryTypes.includes('layout-shift')){window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});}});
      const response=await page.goto(new URL(route,origin).href,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(100);
      const initialCLS=await page.evaluate(()=>window.__cls);
      const initialJs=await page.evaluate(()=>performance.getEntriesByType("resource").filter(e=>new URL(e.name).pathname.endsWith(".js")).reduce((sum,e)=>sum+e.encodedBodySize,0));
      for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=height){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(25);}
      await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,2500))]);})));
      await page.evaluate(()=>window.scrollTo(0,0));
      const checks=await page.evaluate(inspectPage);checks.cls=initialCLS;
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      if([390,768,1440].includes(width))await page.screenshot({path:`${out}/ekran/${name}-${width}.png`,fullPage:true});
      const row={name,route,width,height,engine,hasTouch:width<=1024,isMobile:width<=1024,initialJs,status:response.status(),...checks,errors,resources,axe:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};
      rows.push(row);const snapshot=JSON.stringify(rows,null,2);writeQueue=writeQueue.then(()=>fs.writeFile(`${out}/matrix${suffix?'-'+suffix:''}.json`,snapshot));await writeQueue;
      const counts=[checks.overflow?1:0,checks.broken.length,checks.collisions.length,checks.smallTargets.length,checks.smallText.length,checks.wrappedButtons.length,checks.longDashes.length,errors.length,resources.length,axe.violations.length];
      console.log(name,width,engine,counts.some(Boolean)?JSON.stringify(counts):'PASS',checks.cls);
     } finally {await context.close();}
     }));
    }
   }
   await browser.close();browser=undefined;
  }
 }finally{await browser?.close();await account?.cleanup?.();}
 const failures=rows.filter(r=>r.overflow||r.broken.length||r.collisions.length||r.smallTargets.length||r.smallText.length||r.wrappedButtons.length||r.longDashes.length||r.errors.length||r.resources.length||r.axe.length||(r.cls!==null&&r.cls>=.05)||!r.h1);
 console.log(`${rows.length} profiles, ${failures.length} failures`);process.exitCode=failures.length?1:0;
}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename)await main();

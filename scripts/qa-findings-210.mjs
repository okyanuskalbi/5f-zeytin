/* global document, getComputedStyle, innerWidth, innerHeight */
// Task210 local-only checks. Text resize doubles a snapshot of computed font sizes;
// it is not browser zoom. Contrast samples decoded video, not the poster.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin='https://localhost:3024';
const out=path.resolve(process.argv[2]??'output/task210/sonra');
const mode=process.argv[3]??'all';
assert(out.startsWith(path.resolve('output')+path.sep));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={contrast:[],zoom:[],bars:[],axe:[],reflow:[]};
async function pageFor(width,height,reduce=true) {
 const c=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<768,hasTouch:width<768,reducedMotion:reduce?'reduce':'no-preference',ignoreHTTPSErrors:true});
 await c.route('**/*',r=>new URL(r.request().url()).origin!==origin||!['GET','HEAD'].includes(r.request().method())?r.abort():r.continue());
 const p=await c.newPage();await p.goto(origin,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);return p;
}
async function settle(p) {await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));}
async function raw(buffer) {return sharp(buffer).removeAlpha().raw().toBuffer();}
function luminance(rgb) {return rgb.map(n=>{const v=n/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
async function contrast(p,locator,key) {
 const loc=p.locator(locator);const box=await loc.boundingBox();
 const clip={x:Math.floor(box.x),y:Math.floor(box.y),width:Math.ceil(box.width)+1,height:Math.ceil(box.height)+1};
 const color=await loc.evaluate(e=>getComputedStyle(e).color.match(/[\d.]+/g).slice(0,3).map(Number));
 const style=await p.addStyleTag({content:`${locator}, ${locator} * {color:white!important;-webkit-text-fill-color:white!important;text-shadow:none!important;}`});
 const white=await raw(await p.screenshot({clip}));
 await style.evaluate((e,s)=>e.textContent=s,`${locator}, ${locator} * {color:black!important;-webkit-text-fill-color:black!important;text-shadow:none!important;}`);
 const black=await raw(await p.screenshot({clip}));
 await style.evaluate((e,s)=>e.textContent=s,`${locator}, ${locator} * {color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;}`);
 const bg=await raw(await p.screenshot({clip}));await style.evaluate(e=>e.remove());
 const ratios=[],fg=luminance(color);
 for(let i=0;i<bg.length;i+=3) if(Math.min(white[i]-black[i],white[i+1]-black[i+1],white[i+2]-black[i+2])>200) {
  const l=luminance([bg[i],bg[i+1],bg[i+2]]);ratios.push((Math.max(fg,l)+.05)/(Math.min(fg,l)+.05));
 }
 assert(ratios.length>100,'Glyph mask has enough strongly covered pixels');
 await p.screenshot({path:path.join(out,`${key}.png`),clip});
 return {pixels:ratios.length,min:Math.min(...ratios),under3:ratios.filter(n=>n<3).length,under4_5:ratios.filter(n=>n<4.5).length};
}
function geometry() {
 const nodes=[...document.querySelectorAll('[data-pill-switch] button,[data-product-grid] [data-pill], [data-business-chooser] [data-pill], [class*="chooserCard"] [data-pill], footer button,[role="dialog"] h2, [role="dialog"] [data-pill]')];
 const entries=nodes.filter(e=>e.getBoundingClientRect().width>0).map(e=>{
  const l=e.querySelector('[data-pill-label]')??e;
  const range=document.createRange();range.selectNodeContents(l);const text=range.getBoundingClientRect(),box=l.getBoundingClientRect(),outer=(e.matches('h2')?e.parentElement:e).getBoundingClientRect(),coin=e.querySelector('[data-coin]')?.getBoundingClientRect();
  return {text:l.textContent,box:{x:box.x,y:box.y,width:box.width,height:box.height},textBox:{x:text.x,y:text.y,width:text.width,height:text.height},overflow:Math.max(0,box.left-text.left,text.right-box.right,outer.top-text.top,text.bottom-outer.bottom),gap:coin?coin.left-text.right:null};
 });
 const overlaps=[];
 for(let i=0;i<entries.length;i++) for(let j=i+1;j<entries.length;j++) {const a=entries[i].textBox,b=entries[j].textBox;if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>.5&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>.5)overlaps.push([entries[i].text,entries[j].text]);}
 return {overflow:document.documentElement.scrollWidth-innerWidth,entries,overlaps};
}
async function doubleText(p) {await p.evaluate(()=>{
 const sizes=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);
 for(const [e,size] of sizes) if(e instanceof HTMLElement)e.style.setProperty('font-size',`${size*2}px`,'important');
});}
try {
 if(['all','contrast'].includes(mode)) for(const [width,height] of [[320,568],[360,740],[390,844],[1440,900]]) {
  const p=await pageFor(width,height,false);await p.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
  await p.locator('[data-media-control]').click();
  const duration=await p.locator('video').evaluate(v=>v.duration);
  const times=Array.from({length:14},(_,i)=>i===4?5.5:Math.min(duration-.2,.1+i*(duration-.3)/13));
  for(const time of times) {
   await p.locator('video').evaluate(async(v,t)=>{v.pause();await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});},time);
   await p.waitForTimeout(60);
   const fact=await contrast(p,'#baslangic h1',`hero-${width}-${time.toFixed(2)}`);
   report.contrast.push({width,height,time,duration,...fact});
  }
  await p.context().close();
 }
 if(['all','layout'].includes(mode)) {
  for(const [width,height] of [[390,664],[375,667],[360,640]]) {
   const p=await pageFor(width,height);await settle(p);
   const blocks=await p.locator('[data-phone-screen]').evaluateAll(nodes=>nodes.map(e=>({name:e.getAttribute('data-phone-screen'),height:e.getBoundingClientRect().height})));
   const limit=await p.evaluate(()=>innerHeight-document.querySelector('[data-site-navbar]').getBoundingClientRect().height);
   const captions=[];
   for(let i=0;i<3;i++) {
    const selector=`[data-home-facility] figure:nth-child(${i+1}) figcaption`;
    await p.locator(selector).scrollIntoViewIfNeeded();await p.waitForTimeout(100);
    captions.push({font:await p.locator(selector).evaluate(e=>getComputedStyle(e).fontSize),...await contrast(p,selector,`caption-${width}-${i}`)});
   }
   report.bars.push({width,height,limit,blocks,captions});await p.context().close();
  }
  for(const width of [320,390]) {
   const p=await pageFor(width,844);await settle(p);await doubleText(p);
   const home=await p.evaluate(geometry);await p.screenshot({path:path.join(out,`text200-${width}.png`),fullPage:true});
   await p.getByRole('button',{name:'Teklif iste',exact:true}).click();await p.getByRole('dialog',{name:'Toptan teklif formu',exact:true}).waitFor();await p.waitForTimeout(600);
   // Portaled/lazy form nodes need their initial computed sizes doubled once too.
   await p.evaluate(()=>{const list=[...document.querySelectorAll('[role="dialog"] *')].filter(e=>!e.style.fontSize).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,size]of list)e.style.setProperty('font-size',`${size*2}px`,'important');});
   const sheet=await p.evaluate(geometry);await p.screenshot({path:path.join(out,`text200-sheet-${width}.png`)});
   report.zoom.push({width,method:'Computed font sizes doubled from one snapshot; not native browser zoom',home,sheet});await p.context().close();
  }
  for(const width of [640,720]) {const p=await pageFor(width,900);report.reflow.push({width,overflow:await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth),method:'200% equivalent CSS viewport, not native browser zoom'});await p.context().close();}
 }
 if(['all','axe'].includes(mode)) for(const width of [390,1440]) {
  const p=await pageFor(width,900);await settle(p);
  if(width<768)await p.getByRole('button',{name:'Teklif iste',exact:true}).click();
  const trigger=p.locator('#toptan button[name="productId"]');await trigger.scrollIntoViewIfNeeded();await p.waitForTimeout(500);
  for(const selected of [false,true]) {
   if(selected){await trigger.click();const dialog=p.getByRole('dialog',{name:'Ürünleri seçin',exact:true});await dialog.getByRole('checkbox').first().check();await dialog.getByRole('textbox').first().fill('2');await dialog.getByRole('button',{name:'Tamam',exact:true}).click();}
   const result=await new AxeBuilder({page:p}).analyze();report.axe.push({width,selected,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),name:await trigger.getAttribute('aria-label')});
   const country=p.locator('#toptan .phone-country-trigger');await country.scrollIntoViewIfNeeded();await country.click();await p.getByRole('combobox',{name:'Ülke veya kod ara'}).waitFor();await p.waitForTimeout(400);
   const open=await new AxeBuilder({page:p}).analyze();report.axe.push({width,selected,countryOpen:true,violations:open.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});await country.click();
  }
  await p.context().close();
 }
} finally {await browser.close();await fs.writeFile(path.join(out,`findings-${mode}.json`),JSON.stringify(report,null,2));}
console.log(JSON.stringify({frames:report.contrast.length,minContrast:Math.min(...report.contrast.map(f=>f.min)),zoom:report.zoom.map(z=>({width:z.width,homeOverflow:z.home.overflow,collisions:z.home.overlaps,labels:z.home.entries.filter(e=>e.overflow>.5||e.gap<0&&e.gap!==null)})),bars:report.bars.map(b=>({width:b.width,limit:b.limit,over:b.blocks.filter(x=>x.height>b.limit)})),axe:report.axe.map(a=>({width:a.width,selected:a.selected,countryOpen:a.countryOpen,violations:a.violations.map(v=>v.id)}))},null,2));

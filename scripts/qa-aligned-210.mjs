/* global document */
// Compare unchanged phone blocks at their original page offsets, without sticky chrome
// crossing the crop. Reserve the original heights of the two deliberately shorter
// blocks so following content keeps the original fractional raster origin.
// The baseline rules below reproduce git 97ba510's changed
// declarations only; the untouched markup, media and fonts are shared.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='output/task210/aligned';await fs.mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true}),report=[];
try {
 for(const [width,height]of [[320,568],[360,740],[375,812],[390,844],[430,932]]) {
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce',ignoreHTTPSErrors:true});
  const p=await ctx.newPage();await p.goto('https://localhost:3024',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
  await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}))); 
  const classes=await p.locator('[data-phone-screen="hero"]').evaluate(e=>({shade:[...e.querySelectorAll('div')].find(x=>[...x.classList].some(n=>n.endsWith('heroShade')))?.className}));
  const oldShade='radial-gradient(ellipse 92% 108% at 0% 100%, rgba(26, 43, 30, .88) 0%, rgba(26, 43, 30, .8) 40%, rgba(26, 43, 30, .42) 62%, rgba(26, 43, 30, 0) 84%),linear-gradient(to top, rgba(26, 43, 30, .78) 0%, rgba(26, 43, 30, 0) 48%)';
  const before=`
   [data-pill] {height:var(--pill-height)!important;min-height:0!important;line-height:1!important;}
   [data-pill-label] {white-space:nowrap!important;overflow-wrap:normal!important;}
   [data-pill-switch] :is(button,a) {height:44px!important;min-height:0!important;line-height:1!important;white-space:nowrap!important;overflow-wrap:normal!important;}
   [data-phone-screen="facility"] figure {aspect-ratio:16/10!important;}
   @media(max-width:359px) { .${classes.shade} {background:${oldShade}!important;} [data-product-grid] article {--pill-gap:6px!important;} }
   @media(max-height:700px) { [data-phone-screen="story"] {gap:16px!important;} [class$="storyPhotos"] {padding-block-end:20px!important;} [class$="storyPhoto"] {height:clamp(112px,calc(100svh - 600px),280px)!important;} }
  `;
  await p.addStyleTag({content:'header[data-site-navbar], a[href="#ana-icerik"] {visibility:hidden!important;}'});
  const names=['hero','products','story','facility','harvest','business','blog','faq','contact','footer'];
  async function capture(state) {
   for(const name of names) {
    const target=p.locator(`[data-phone-screen="${name}"]`);
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({path:`${root}/${state}-${name}-${width}.png`,animations:'disabled'});
   }
  }
  const baseline=await p.addStyleTag({content:before});
  const heights=await p.locator('[data-phone-screen="facility"], [data-phone-screen="story"]').evaluateAll(nodes=>nodes.map(e=>({name:e.getAttribute('data-phone-screen'),height:e.getBoundingClientRect().height})));
  await capture('once');await baseline.evaluate(e=>e.remove());
  await p.addStyleTag({content:heights.map(e=>`[data-phone-screen="${e.name}"] {height:${e.height}px!important;align-content:start!important;}`).join('\n')});
  await capture('sonra');
  for(const name of names) {
   const a=await sharp(`${root}/once-${name}-${width}.png`).removeAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(`${root}/sonra-${name}-${width}.png`).removeAlpha().raw().toBuffer({resolveWithObject:true});
   let different=0;const same=a.info.width===b.info.width&&a.info.height===b.info.height;
   if(same)for(let i=0;i<a.data.length;i+=3)if(a.data[i]!==b.data[i]||a.data[i+1]!==b.data[i+1]||a.data[i+2]!==b.data[i+2])different++;
   report.push({width,name,before:[a.info.width,a.info.height],after:[b.info.width,b.info.height],different:same?different:null,expected:name==='facility'||name==='hero'&&width===320||name==='story'&&height<=700});
  }
  await ctx.close();
 }
}finally{await browser.close();}
await fs.writeFile('output/task210/aligned.json',JSON.stringify(report,null,2));console.log(report.filter(r=>!r.expected&&r.different!==0));

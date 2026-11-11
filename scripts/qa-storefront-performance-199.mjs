/* global window, PerformanceObserver, document, performance */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {routes} from './qa-storefront-pages.mjs';
const origin='https://localhost:3021';
const browser=await chromium.launch({headless:true});const report=[];let account;
try{
if(!process.argv.includes("--focused")&&!process.argv.includes("--sample")&&!process.argv.includes("--forms")){const {prepareSession}=await import("../tests/helpers/storefront-local-auth.mjs");account=await prepareSession(browser,{exercise:false});}
const allRoutes=account?[...routes.filter(([,r])=>!r.startsWith("/hesabim")),...account.routes]:routes;
process.on('SIGTERM',async()=>{await browser.close();await account?.cleanup();process.exit(1);});
const selected=process.argv.includes('--forms')?routes.filter(([name])=>['toptan-satis','teklif-onsecim','bayilik'].includes(name)):process.argv.includes('--affected')?allRoutes.filter(([name])=>name==='404'||name.startsWith('hesabim')):process.argv.includes('--focused')?routes.filter(([name])=>['urun-yag','toptan-satis','sepet','giris'].includes(name)):process.argv.includes('--sample')?routes.filter(([name])=>['anasayfa','urunler','urun-yag','toptan-satis','giris','kayit','sepet','hakkimizda','blog-1'].includes(name)):allRoutes;
for(const mobile of (process.argv.includes('--width430')?[true]:[false,true])){for(const [name,route] of selected){
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:mobile?(process.argv.includes('--width430')?{width:430,height:932}:{width:390,height:844}):{width:1440,height:900},isMobile:mobile,hasTouch:mobile,...(route.startsWith("/hesabim")?{storageState:account.storageState}:{})});
 try{
 const page=await context.newPage();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(mobile){await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
 await page.addInitScript(()=>{window.metrics={lcp:0,cls:0};new PerformanceObserver(l=>window.metrics.lcp=l.getEntries().at(-1).startTime).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.metrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 await page.goto(origin+route,{waitUntil:'load'});await page.waitForTimeout(mobile?5000:1500);
 const data=await page.evaluate(()=>({...window.metrics,js:performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.endsWith('.js')).reduce((s,e)=>s+e.encodedBodySize,0),video:document.querySelector('video')?.currentSrc,videoTime:document.querySelector('video')?.currentTime}));
 report.push({name,route,mobile,...data});await fs.writeFile(`output/task199/performance${process.argv.includes('--forms')?(process.argv.includes('--width430')?'-forms430':'-forms'):process.argv.includes('--affected')?'-affected':''}.json`,JSON.stringify(report,null,2));console.log(name,mobile?'mobile':'desktop',Math.round(data.lcp),data.js,data.cls);
 }finally{await context.close();}
}}}finally{await browser.close();await account?.cleanup();}
process.exitCode=report.some(r=>r.lcp>(r.mobile?2500:1500)||r.js>(r.mobile?244000:412000)||r.cls>=.05)?1:0;

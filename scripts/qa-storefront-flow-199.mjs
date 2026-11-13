/* global document, localStorage, performance, innerHeight, getComputedStyle */
import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { inspectPage } from './qa-storefront-pages.mjs';
const origin='https://localhost:3021', out='output/task199';
const results=[];let browser;
process.on('SIGTERM',async()=>{await browser?.close();process.exit(1);});
try{for(const [engine,width,height] of [['chromium',320,568],['webkit',390,844],['chromium',768,1024],['webkit',820,1180],['chromium',1440,900]]){
 browser=await ({chromium,webkit}[engine]).launch({headless:true});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},hasTouch:width<1024,isMobile:width<1024});
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.waitForLoadState('networkidle');
  await page.goto(`${origin}/urun/naturel-sizma-zeytinyagi?boy=1%20L`,{waitUntil:'networkidle'});
  await page.getByRole('radio',{name:'5 L',exact:true}).click();
  await page.waitForFunction(()=>document.title.includes('5 L'));
  assert((await page.locator('link[rel=canonical]').getAttribute('href')).includes('5%20L')||(await page.locator('link[rel=canonical]').getAttribute('href')).includes('5+L'));
  await page.getByRole('button',{name:'Sepete ekle',exact:true}).first().click();
  await page.getByRole('button',{name:/Sepetim/}).first().click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();
  assert(await dialog.getByText('Natürel Sızma Zeytinyağı',{exact:true}).count()>0);
  await page.waitForTimeout(250);
  await dialog.screenshot({path:`${out}/ekran/sepet-cekmece-${width}.png`});
  const drawerChecks=await page.evaluate(inspectPage);assert.deepEqual(drawerChecks.smallTargets,[]);assert.deepEqual(drawerChecks.collisions,[]);assert.equal(drawerChecks.overflow,false);
  await dialog.screenshot({path:`${out}/ekran/sepet-cekmece-${width}.png`});
  await dialog.getByRole('link',{name:'Sepeti görüntüle',exact:true}).click({trial:true});
  await dialog.screenshot({path:`${out}/ekran/sepet-cekmece-alt-${width}.png`});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.waitForLoadState('networkidle');
  await page.goto(`${origin}/sepet`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Natürel Sızma Zeytinyağı',exact:true}).waitFor();
  await page.getByRole('button',{name:/Adedi artır/}).first().click();
  const cart=await page.evaluate(()=>JSON.parse(localStorage.getItem('afina-zeytin:cart')));
  assert.equal(cart[0].productId,'sample-olive-oil-5l');assert.equal(cart[0].quantity,2);
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,2500))]);})));
  await page.screenshot({path:`${out}/ekran/sepet-dolu-${width}.png`,fullPage:true});
  await page.getByRole('link',{name:'Ödeme bilgileri',exact:true}).click();
  await page.getByRole('heading',{name:'Ödeme',exact:true}).waitFor();
  assert(await page.getByText(/Online ödeme yakında açılıyor/).count()>0);
  await page.getByRole('link',{name:'Teklif iste',exact:true}).click();
  await page.getByRole('heading',{name:'Toptan Satış',exact:true}).waitFor();
  await page.waitForLoadState('networkidle');
  await page.goto(`${origin}/urun/dogal-kirma-yesil-zeytin?boy=1%20kg`,{waitUntil:'networkidle'});
  await page.locator('[data-product-detail-purchase]').getByRole('link',{name:'Teklife ekle',exact:true}).click();
  const picker=page.getByRole('button',{name:/İlgilendiğiniz ürünler$/});await picker.waitFor();
  assert((await picker.textContent()).includes('1 ürün'));
  await picker.click();const selector=page.getByRole('dialog',{name:'Ürünleri seçin',exact:true});await selector.waitFor();
  await selector.getByRole('textbox',{name:'Adet · Doğal Kırma Yeşil Zeytin · 1 kg',exact:true}).fill('2');
  await page.keyboard.press('Escape');await selector.waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')?.endsWith('İlgilendiğiniz ürünler'),{},{timeout:2000});
  assert(await picker.evaluate(e=>e===document.activeElement));assert((await picker.textContent()).includes('2 adet'));
  await page.getByLabel('Adınız veya firma adı',{exact:true}).fill('Yerel teklif denetimi');
  await page.getByLabel('İşletme türü',{exact:true}).selectOption('retail');
  await page.getByRole('combobox',{name:'Şehir',exact:true}).fill('Osmaniye');
  await page.getByRole('option',{name:'Osmaniye',exact:true}).click();
  await page.getByRole('combobox',{name:'İlçe',exact:true}).fill('Düziçi');
  await page.getByRole('option',{name:'Düziçi',exact:true}).click();
  await page.locator('.phone-country-trigger').click();
  const countrySearch=page.getByRole('combobox',{name:'Ülke veya kod ara'});await countrySearch.waitFor();assert((await countrySearch.boundingBox()).height>=44);
  await page.keyboard.press('Escape');
  await page.getByLabel('Telefon',{exact:true}).fill('05321234567');
  await page.locator('input[name=kvkk]').check();
  await page.getByRole('button',{name:'Talep özetini hazırla',exact:true}).click();
  const email=page.getByRole('link',{name:'E-postayla gönder',exact:true});await email.waitFor();await email.click({trial:true});
  const uri=new URL(await email.getAttribute('href'));assert.equal(uri.protocol,'mailto:');assert(uri.searchParams.get('body').includes('Doğal Kırma Yeşil Zeytin'));
  await page.getByRole('region',{name:'Talep özeti'}).screenshot({path:`${out}/ekran/teklif-ozet-${width}.png`});
  await page.waitForLoadState('networkidle');
  await page.goto(`${origin}/giris`,{waitUntil:'networkidle'});
  await page.getByLabel('Şifre',{exact:true}).fill('OnlyLocalTest1!');
  await page.getByRole('button',{name:'Şifreyi göster',exact:true}).click();assert.equal(await page.getByLabel('Şifre',{exact:true}).getAttribute('type'),'text');
  await page.getByRole('button',{name:'Şifreyi gizle',exact:true}).click();assert.equal(await page.getByLabel('Şifre',{exact:true}).getAttribute('type'),'password');
  if(width<=430){
   await page.setViewportSize({width,height:320});await page.getByLabel('Şifre',{exact:true}).focus();
   const submit=page.getByRole('button',{name:'E-posta ile giriş yap',exact:true});
   for(let i=0;i<8&&!await submit.evaluate(e=>e===document.activeElement);i++)await page.keyboard.press(engine==='webkit'?'Alt+Tab':'Tab');
   const focused=await submit.evaluate(e=>({active:e===document.activeElement,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,height:innerHeight,outline:getComputedStyle(e).outlineWidth,shadow:getComputedStyle(e).boxShadow}));
   await page.screenshot({path:`${out}/ekran/giris-kisa-${width}.png`});
   assert(focused.active&&focused.top>=0&&focused.bottom<=focused.height&&(parseFloat(focused.outline)>0||focused.shadow!=='none'),JSON.stringify(focused));
   await page.setViewportSize({width,height});
  }
  const signIn=await page.evaluate(inspectPage);assert.equal(signIn.collisions.length,0);assert.equal(signIn.overflow,false);
  if(width<1100){const opener=page.getByRole('button',{name:'Menüyü aç',exact:true});await opener.click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Menüyü aç',{},{timeout:2000});assert(await opener.evaluate(e=>e===document.activeElement));}
  await page.waitForLoadState('networkidle');await page.goto(`${origin}/hakkimizda`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Şeridi duraklat',exact:true}).click();
  assert.equal(await page.locator('[data-about-strip]').getAttribute('data-paused'),'true');
  await page.getByRole('button',{name:'Şeridi oynat',exact:true}).click();
  assert.equal(await page.locator('[data-about-strip]').getAttribute('data-paused'),'false');
  await page.waitForLoadState('networkidle');await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${origin}/`,{waitUntil:'networkidle'});assert.equal(await page.locator('video').count(),0);
  await page.waitForLoadState('networkidle');
  await page.goto(`${origin}/hakkimizda`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-about-strip]').count(),1);
  const animations=await page.locator('[data-about-strip]').evaluateAll(es=>es.flatMap(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running')));assert.equal(animations.length,0);
  await page.waitForLoadState('networkidle');
  results.push({engine,width,height,cart:'PASS',drawerGeometry:'PASS',pickerFirstClickQuantityAndFocus:'PASS',paymentInfo:'PASS',quotePrefillAndMailto:'PASS',passwordVisibility:'PASS',menuFocus:'PASS',stripPause:'PASS',reducedMotion:'PASS',errors});assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close();browser=undefined;}
}
 browser=await chromium.launch({headless:true});
 const slow=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await slow.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await slow.newPage(), cdp=await slow.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const videoRequest=page.waitForRequest(r=>r.url().includes('/videos/customer-home/hero-720.mp4'));
  await page.goto(origin,{waitUntil:'domcontentloaded'});await videoRequest;
  const first=await page.locator('[data-hero-photo] img').evaluate(i=>({complete:i.complete,width:i.naturalWidth,src:i.currentSrc,time:performance.now()}));
  assert(first.complete&&first.width>0);await page.screenshot({path:`${out}/ekran/anasayfa-yavas-poster-390.png`});
  await fs.writeFile(`${out}/slow-poster.json`,JSON.stringify({profile:'390 / 4G 1.6Mbps 150ms / CPU4',posterAtVideoRequest:first,result:'PASS'},null,2));
 }finally{await slow.close();await browser.close();browser=undefined;}
}finally{await browser?.close();await fs.writeFile(`${out}/flows.json`,JSON.stringify(results,null,2));}
console.log(`${results.length} browser profiles: flow PASS`);

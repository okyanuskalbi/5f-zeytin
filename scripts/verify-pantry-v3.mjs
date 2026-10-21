import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { chromium, webkit, devices } from 'playwright';
import sharp from 'sharp';

const base=process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3114';
const output=resolve('test-results/113');
await mkdir(resolve(output,'break'),{recursive:true});
const result=await build({ configFile:false,root:process.cwd(),base:'/__pantry-fixture/',publicDir:false,logLevel:'error',resolve:{alias:{'@':process.cwd()}},build:{write:false,target:'esnext',rollupOptions:{input:resolve('tests/e2e/fixtures/pantry-v3.html')}} });
const bundle=Array.isArray(result)?result[0]:result;
const assets=new Map(bundle.output.map(entry=>[entry.fileName,entry.type==='chunk'?entry.code:entry.source]));
const html=[...assets.keys()].find(name=>name.endsWith('.html'));
const report=[];
for(const [name,engine,options] of [
  ['desktop',chromium,{viewport:{width:1440,height:1000}}],
  ['iphone',webkit,{...devices['iPhone 14']}],
  ['pixel',chromium,{...devices['Pixel 7']}],
]) {
 const browser=await engine.launch();
 try {
  const page=await browser.newPage(options); const errors=[]; console.log(`${name}: start`);
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base); await page.evaluate(()=>document.fonts.ready);
  const fontCSS=await page.evaluate(()=>{const root=getComputedStyle(document.documentElement);const rules=[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(rule=>rule.type===CSSRule.FONT_FACE_RULE).map(rule=>rule.cssText)}catch{return []}});return rules.join('\n')+`:root{--font-display:${root.getPropertyValue('--font-display')};--font-body:${root.getPropertyValue('--font-body')}}`;});
  await page.locator('[data-hero-photo] img').evaluate(img=>img.decode());
  await page.screenshot({path:resolve(output,`${name}-hero.jpg`)});
  if(options.viewport.width<768) {
   const bounds=await page.locator('[data-hero-intro] a').boundingBox();
   assert(bounds.y+bounds.height<options.viewport.height*0.47,`${name}: hero CTA covers can`);
  }
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  const viewport=page.viewportSize(); const frames=[];
  for(let y=0;y<height;y+=Math.round(viewport.height*0.4)) {
   await page.evaluate(top=>scrollTo(0,top),y);
   await page.locator('#kiler article picture img').evaluateAll(images=>Promise.all(images.filter(img=>{const box=img.getBoundingClientRect();return box.top<innerHeight&&box.bottom>0;}).map(img=>img.decode())));
   // Capture after the bounded shelf+tag sequence (350ms + 600ms + 210ms).
   await page.waitForTimeout(1250);
   frames.push(await page.screenshot());
  }
  const thumbs=await Promise.all(frames.map(input=>sharp(input).resize({width:150}).jpeg().toBuffer()));
  const meta=await sharp(thumbs[0]).metadata();
  await sharp({create:{width:150*frames.length,height:meta.height,channels:3,background:'#faf7f0'}}).composite(thumbs.map((input,i)=>({input,left:150*i,top:0}))).jpeg({quality:85}).toFile(resolve(output,`filmstrip-${name}.jpg`));
  await page.locator('#kiler').screenshot({path:resolve(output,`${name}-pantry.png`)});
  await page.getByRole('button',{name:'Doğal Kırma Yeşil Zeytin hızlı görünüm',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').locator('picture img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await page.screenshot({path:resolve(output,`${name}-quick-view.png`)});
  await page.keyboard.press('Escape');
  await page.route('**/__pantry-fixture/**',async route=>{
   const key=new URL(route.request().url()).pathname.replace('/__pantry-fixture/','')||html;
   const body=assets.get(key); await route.fulfill({status:body?200:404,body:body??'Unknown fixture asset',contentType:key.endsWith('.js')?'application/javascript':key.endsWith('.css')?'text/css':'text/html'});
  });
  for(const mode of ['four','six','long','single','sold','empty']) {
   console.log(`${name}: ${mode}`);
   await page.goto(`${base}/__pantry-fixture/?data=${mode}`);
   await page.locator('#kiler-title').waitFor();
   await page.addStyleTag({content:fontCSS});
   for(const img of await page.locator('#kiler img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(img=>img.decode());}
   await page.evaluate(()=>scrollTo(0,0));
   await page.evaluate(()=>document.fonts.ready);
   // Capture after the bounded shelf+tag sequence (350ms + 600ms + 210ms).
   await page.waitForTimeout(1250);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}/${mode}: overflow`);
   if(mode==='sold') assert.equal(await page.getByRole('button',{name:'Tükendi',exact:true}).count(),4);
   if(mode==='six') {
    assert.equal(await page.getByRole('article').count(),6);
    if(page.viewportSize().width>=1024) {
     const contact=await page.evaluate(()=>{const last=document.querySelector('#kiler article:last-of-type');const parcel=document.querySelector('[data-pantry-parcel]');return [last,parcel].map(node=>node.getBoundingClientRect().top+parseFloat(getComputedStyle(node,'::after').top));});
     assert(Math.abs(contact[0]-contact[1])<=1,`${name}: parcel and product shelf mismatch`);
    }
   }
   if(mode==='single') assert.equal(await page.getByRole('radio').count(),1);
   for(const control of await page.locator('#kiler button').all()) {
    const box=await control.boundingBox(); assert(box.width>=43.99&&box.height>=43.99,`${name}/${mode}: small target`);
   }
   await page.screenshot({path:resolve(output,'break',`${name}-${mode}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]); report.push({name,frames:frames.length,breakCases:6,errors});
 }finally{await browser.close();}
}
// Pixel-level check against the actual kraft texture, taking its darkest pixel.
const texture=await sharp('public/images/v3/kraft-doku-w512.webp').raw().toBuffer({resolveWithObject:true});
const linear=value=>{value/=255;return value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4;};
const luminance=rgb=>rgb.map(linear).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const ink=luminance([28,42,31]);let minimum=Infinity;
const kraft=[201,169,122];
const softLight=(base,blend)=>blend<=.5?base-(1-2*blend)*base*(1-base):base+(2*blend-1)*((base<=.25?((16*base-12)*base+4)*base:Math.sqrt(base))-base);
for(let i=0;i<texture.data.length;i+=texture.info.channels){const light=luminance([...texture.data.subarray(i,i+3)].map((value,index)=>softLight(kraft[index]/255,value/255)*255));minimum=Math.min(minimum,(Math.max(light,ink)+.05)/(Math.min(light,ink)+.05));}
assert(minimum>=4.5,`kraft contrast ${minimum}`);
await writeFile(resolve(output,'visual-report.json'),JSON.stringify({report,minimumKraftContrast:minimum},null,2)+'\n');
console.log(JSON.stringify({report,minimumKraftContrast:minimum},null,2));

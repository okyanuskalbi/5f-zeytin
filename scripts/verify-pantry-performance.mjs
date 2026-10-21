import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const cli=process.argv[2];
if(!cli) throw new Error('Usage: node scripts/verify-pantry-performance.mjs <lighthouse/cli/index.js> [url]');
const url=process.argv[3]??'http://localhost:3114';
const execute=promisify(execFile); const directory=resolve('test-results/113');
await mkdir(directory,{recursive:true});
const runs=[];
for(let index=1;index<=3;index++) {
 const file=resolve(directory,`lighthouse-${index}.json`);
 await execute(process.execPath,[cli,url,'--quiet','--chrome-flags=--headless=new --no-sandbox','--only-categories=performance,accessibility','--output=json',`--output-path=${file}`],{env:{...process.env,CHROME_PATH:chromium.executablePath()},maxBuffer:2_000_000});
 const report=JSON.parse(await readFile(file,'utf8'));
 assert(!report.runtimeError,report.runtimeError?.message);
 assert.equal(report.configSettings.formFactor,'mobile'); assert.equal(report.configSettings.throttlingMethod,'simulate');
 runs.push({file,version:report.lighthouseVersion,performance:report.categories.performance.score*100,accessibility:report.categories.accessibility.score*100,lcp:report.audits['largest-contentful-paint'].numericValue,cls:report.audits['cumulative-layout-shift'].numericValue,settings:report.configSettings});
 console.log(`Run ${index}: performance=${runs.at(-1).performance} CLS=${runs.at(-1).cls}`);
}
for(const run of runs) for(const key of ['throttling','screenEmulation','blockedUrlPatterns']) assert.deepEqual(run.settings[key],runs[0].settings[key]);
const medians=Object.fromEntries(['performance','accessibility','lcp','cls'].map(key=>[key,runs.map(run=>run[key]).sort((a,b)=>a-b)[1]]));
const pass=medians.performance>=85&&medians.cls<0.1;
await writeFile(resolve(directory,'lighthouse-summary.json'),JSON.stringify({pass,medians,runs},null,2)+'\n');
console.log(JSON.stringify({pass,medians},null,2));
if(!pass)process.exitCode=1;

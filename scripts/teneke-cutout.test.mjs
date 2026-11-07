import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile('public/images/v3/manifest.json', 'utf8'));
for (const [id, asset] of Object.entries(manifest.assets).filter(([id]) => /^(urun-0[16]-|0[16]-)/.test(id))) {
  test(`${id}: transparent corners, opaque label and soft shadow`, async () => {
    for (const output of asset.outputs) {
      const {data, info} = await sharp(`public${output.file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const alpha=(x,y)=>data[(y*info.width+x)*4+3];
      assert.equal(alpha(0,0),0);
      assert.equal(alpha(info.width-1,info.height-1),0);
      assert.equal(alpha(Math.floor(info.width/2),Math.floor(info.height/2)),255);
      assert(Array.from(data).some((value,index)=>index%4===3 && value>0 && value<200));
    }
  });
}

// Exact RGB pixel comparison; each section is captured separately to ignore its changed page offset.
import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='output/task210',results=[];
for(const file of await fs.readdir(`${root}/once`)) {
 if(!file.endsWith('.png')||file.startsWith('hero-')||file.startsWith('caption-')||file.startsWith('text200-'))continue;
 let after;try{after=await sharp(`${root}/sonra/${file}`).removeAlpha().raw().toBuffer({resolveWithObject:true});}catch{continue;}
 const before=await sharp(`${root}/once/${file}`).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const sameSize=before.info.width===after.info.width&&before.info.height===after.info.height;
 let different=0;
 if(sameSize)for(let i=0;i<before.data.length;i+=3)if(before.data[i]!==after.data[i]||before.data[i+1]!==after.data[i+1]||before.data[i+2]!==after.data[i+2])different++;
 results.push({file,before:[before.info.width,before.info.height],after:[after.info.width,after.info.height],different:sameSize?different:null});
}
await fs.writeFile(`${root}/pixels.json`,JSON.stringify(results,null,2));
console.log(results.filter(r=>r.different!==0));

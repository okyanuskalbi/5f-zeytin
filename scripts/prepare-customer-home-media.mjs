import { mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import sharp from 'sharp';
const run=promisify(execFile), hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const dir='AFINA-KAYNAK/musteri-2026-11-10';
await mkdir('output/tmp',{recursive:true});
await mkdir('public/images/customer-home',{recursive:true});await mkdir('public/videos/customer-home',{recursive:true});
const manifest={version:1,provider:'customer-supplied',authorization:'user-2026-11-10-homepage-brief',sourceDirectory:dir,paidGeneration:false,derivation:{codec:'h264',pixelFormat:'yuv420p',audio:false,fastStart:true,toneMapping:false,crop:false},hero:{source:`${dir}/hero-video-zeytinlik.mp4`,sourceSha256:'',sourceWidth:1920,sourceHeight:1080,sourceDurationSeconds:17.16,video:{outputs:[1920,1280,720].map(width=>({file:`/videos/customer-home/hero-${width}.mp4`,width,height:width*9/16}))},posters:{alt:'Ellek zeytinliklerinin gün ışığındaki görünümü',outputs:[]}},assets:{}};
for(const [id,alt] of [['fabrika','AFİNA ZEYTİN üretim tesisi'],['her-tanede-ayni-ozen-el','Dalından özenle seçilen zeytinler'],['bereketin-hasat-vakti','Hasat zamanı zeytinlerin toplanışı']]){
const source=`${dir}/${id}.jpg`,bytes=await readFile(source),meta=await sharp(bytes).metadata();
const asset={source,sourceSha256:hash(bytes),sourceWidth:meta.width,sourceHeight:meta.height,alt,outputs:[]};
for(const width of [480,800,1086])for(const format of ['avif','webp']){const file=`/images/customer-home/${id}-${width}.${format}`,image=await sharp(bytes).rotate().resize({width,withoutEnlargement:true})[format]({quality:format==='avif'?52:78}).toBuffer(),meta=await sharp(image).metadata();await writeFile(`public${file}`,image);asset.outputs.push({file,format,width:meta.width,height:meta.height,bytes:image.length,sha256:hash(image)});}
manifest.assets[id]=asset;
}
const movie=await readFile(manifest.hero.source);manifest.hero.sourceSha256=hash(movie);manifest.hero.sourceBytes=movie.length;
await run('ffmpeg',['-y','-v','error','-i',manifest.hero.source,'-frames:v','1','output/tmp/customer-poster192.png']);
for(const width of [720,1280,1920])for(const format of ['avif','webp']){const file=`/images/customer-home/hero-poster-${width}.${format}`,bytes=await sharp('output/tmp/customer-poster192.png').resize({width})[format]({quality:format==='avif'?56:80}).toBuffer(),meta=await sharp(bytes).metadata();await writeFile(`public${file}`,bytes);manifest.hero.posters.outputs.push({file,format,width:meta.width,height:meta.height,bytes:bytes.length,sha256:hash(bytes)});}
const save=()=>writeFile('lib/media/customer-home.json',JSON.stringify(manifest,null,2)+'\n');await save();
for(const output of manifest.hero.video.outputs){const crf=output.width===1920?'28':'27',rate=output.width===1920?'2200k':output.width===1280?'1600k':'1000k';await run('ffmpeg',['-y','-v','error','-i',manifest.hero.source,'-map','0:v:0','-an','-sn','-dn','-vf',`scale=${output.width}:-2,setsar=1`,'-c:v','libx264','-threads','2','-preset','medium','-crf',crf,'-maxrate',rate,'-bufsize','4400k','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',`public${output.file}`]);const bytes=await readFile(`public${output.file}`);const probe=JSON.parse((await run('ffprobe',['-v','error','-show_entries','stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames,duration:format=duration','-of','json',`public${output.file}`])).stdout);const stream=probe.streams[0];Object.assign(output,{height:stream.height,codec:stream.codec_name,fps:25,frames:Number(stream.nb_frames),durationSeconds:Number(stream.duration),audio:false,encoding:{crf:Number(crf),preset:'medium',maxRate:rate,bufferSize:'4400k',sampleAspectRatio:'1:1'},bytes:bytes.length,sha256:hash(bytes)});await save();console.log(output.file,output.bytes);}

await rm('output/tmp/customer-poster192.png',{force:true});

// QA tool (task 5cb93228): does the iOS Simulator's own mobile Safari move a film laid in as a picture (<img src="film.mp4">),
// for the H.264 film and for its lighter HEVC twin? mgs.js lays a refused film in that way (asImage: Low Power Mode, a
// window Safari judges unseen); a twin may replace the H.264 file there only if Safari moves it as an image too.
// Serves a probe page on 127.0.0.1 (the simulator shares the host's network) with each film of option-2.2/site/media as an
// <img>; the page draws each picture to a canvas twice, 900 ms apart, and reports the share of pixels that changed (same
// origin, so the canvas stays readable); two simulator screenshots 900 ms apart are kept beside the numbers (should a
// canvas only ever draw a film-picture's first frame, they still show whether it moves). Booted headless with simctl.
//   node sim-img-films.mjs <outdir> [film,film,...]   (default: every film that has an -hevc twin, with its twin)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), MEDIA = path.join(REPO, 'option-2.2', 'site', 'media');
const OUT = path.resolve(process.argv[2] || 'out-sim-img-films'); fs.mkdirSync(OUT, { recursive: true });
const FILMS = process.argv[3] ? process.argv[3].split(',')
  : fs.readdirSync(MEDIA).filter((f) => f.endsWith('-hevc.mp4')).flatMap((f) => [f.replace('-hevc', ''), f]);
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });
const dev = Object.values(JSON.parse(sh('list', 'devices', 'available', '-j')).devices).flat().find((d) => d.name === 'iPhone 17');
const wasBooted = dev.state === 'Booted'; if (!wasBooted) sh('boot', dev.udid); sh('bootstatus', dev.udid, '-b');
console.log('simulator', dev.name, dev.udid, wasBooted ? '(was booted)' : '(booted here)');
const PAGE = `<!doctype html><meta name="viewport" content="width=device-width"><body style="margin:0;background:#000">
${FILMS.map((f) => `<img src="/m/media/${f}" data-f="${f}" style="width:48vw;height:27vw;object-fit:cover;margin:1vw;display:inline-block">`).join('')}
<script>(async function(){
var sl=function(ms){return new Promise(function(r){setTimeout(r,ms)})},post=function(o){return fetch('/__r',{method:'POST',body:JSON.stringify(o)})};
await new Promise(function(r){if(document.readyState==='complete')r();else addEventListener('load',r)});await sl(3000);
function grab(im){var c=document.createElement('canvas');c.width=160;c.height=90;var x=c.getContext('2d');try{x.drawImage(im,0,0,160,90);return x.getImageData(0,0,160,90).data}catch(e){return null}}
var ims=[].slice.call(document.querySelectorAll('img')),a=ims.map(grab);await sl(900);var b=ims.map(grab);
var rows=ims.map(function(im,i){var n=0,ch=0;if(a[i]&&b[i]){for(var k=0;k<a[i].length;k+=4){n++;if(Math.abs(a[i][k]-b[i][k])+Math.abs(a[i][k+1]-b[i][k+1])+Math.abs(a[i][k+2]-b[i][k+2])>24)ch++}}
return{f:im.getAttribute('data-f'),complete:im.complete,w:im.naturalWidth,h:im.naturalHeight,changed:n?+(ch/n).toFixed(3):null,readable:!!a[i]}});
await post({ev:'shot',n:1});await sl(900);await post({ev:'shot',n:2});await sl(400);await post({ev:'rows',ua:navigator.userAgent,rows:rows})})()</script>`;
let rows = null, done; const fin = new Promise((ok) => (done = ok));
const extra = (u, req, res) => {
  if (u === '/probe') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(PAGE); return true; }
  if (u === '/__r' && req.method === 'POST') { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    const o = JSON.parse(b); res.writeHead(204); res.end();
    if (o.ev === 'shot') { try { sh('io', dev.udid, 'screenshot', '--type=png', path.join(OUT, `img-films-${o.n}.png`)); } catch (e) { console.log('shot', e.message.slice(0, 80)); } }
    if (o.ev === 'rows') { rows = o; done(); } }); return true; }
  return false;
};
const srv = await serve(REPO, extra);
sh('openurl', dev.udid, `http://127.0.0.1:${srv.address().port}/probe`);
const to = setTimeout(() => done(), 90000); await fin; clearTimeout(to);
if (!rows) console.log('no report: the probe page never ran');
else { console.log(rows.ua); for (const r of rows.rows) console.log(JSON.stringify(r), r.changed > 0.05 ? 'MOVING' : 'STILL'); }
fs.writeFileSync(path.join(OUT, 'sim-img-films.json'), JSON.stringify(rows, null, 1));
if (!wasBooted) { try { sh('shutdown', dev.udid); } catch (e) {} }
srv.close(); process.exit(0);

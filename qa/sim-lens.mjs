// QA tool (task a73569a9): the glass (lens.js) in the iOS Simulator's own mobile Safari, the engine J's iPhone runs. Same harness as
// sim-films.mjs, no WebDriver: this checkout's built pages are served on 127.0.0.1, the page gets ONE read-only reporter injected
// by the server (no page code changed), the simulator is booted headless with simctl and driven only by `simctl openurl`.
// For the pause and Why Aveda in the salon world and in Inner Work's twin the reporter arrives at the section as a visitor's jump
// does, asks the server for a simulator screenshot 0.45 s after (the glass sliding in) and 6.5 s after (at rest), and reads the
// panes: is WebGL live (len--gl), is the CSS frost showing instead (len--css), canvas size against pane size. Then the motion
// switch is turned to calm (one still frame) and a screenshot taken. It also reports script errors from the page's first byte and
// how many times the page loaded in the tab: more than one means Safari reloaded it (its "using significant memory" reload).
//   node sim-lens.mjs <m|g,...> <outdir>
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERS = (process.argv[2] || 'm').split(','), OUT = path.resolve(process.argv[3] || 'out-sim-lens'); fs.mkdirSync(OUT, { recursive: true });
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });
const dev = Object.values(JSON.parse(sh('list', 'devices', 'available', '-j')).devices).flat().find((d) => d.name === 'iPhone 17');
const wasBooted = dev.state === 'Booted'; if (!wasBooted) sh('boot', dev.udid); sh('bootstatus', dev.udid, '-b');
console.log('simulator', dev.name, dev.udid, wasBooted ? '(was booted)' : '(booted here)');
const HEADSCRIPT = `<script>window.__errs=[];addEventListener('error',function(e){__errs.push(String(e.message).slice(0,140))});addEventListener('unhandledrejection',function(e){__errs.push('rejected: '+String(e.reason).slice(0,100))});</script>`;
const REPORTER = `<script>try{localStorage.setItem('om-sound','off')}catch(e){}</script>
<script>(function(){
var post=function(o){return fetch('/__r',{method:'POST',body:JSON.stringify(o)}).catch(function(){})},sl=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var n=0;try{n=(+sessionStorage.getItem('lensLoads')||0)+1;sessionStorage.setItem('lensLoads',String(n))}catch(e){}
function panes(id){var s=document.getElementById(id);return [].map.call(s.querySelectorAll('.len'),function(e){var c=e.querySelector('canvas'),r=e.getBoundingClientRect();
return{css:[Math.round(r.width),Math.round(r.height)],canvas:[c.width,c.height],gl:e.classList.contains('len--gl'),clear:e.classList.contains('is-clear'),frost:e.classList.contains('len--css')}}).filter(function(p){return p.css[0]>0})}
function jump(id){var s=document.getElementById(id),y=Math.round(s.getBoundingClientRect().top+scrollY),r=document.documentElement;r.style.scrollBehavior='auto';r.style.scrollSnapType='none';scrollTo(0,y)}
async function sec(w,k){var id=(w==='coaching'?'c-':'')+k;jump(id);await sl(450);await post({ev:'shot',name:w+'-'+k+'-1arrive'});await sl(6000);await post({ev:'shot',name:w+'-'+k+'-2rest'});
 await post({ev:'sec',w:w,id:id,lenOn:document.documentElement.classList.contains('len-on'),panes:panes(id),errs:__errs.slice(0,4),loads:n})}
async function go(){await sl(2500);await post({ev:'start',ua:navigator.userAgent,w:innerWidth,h:innerHeight,v:location.pathname,loads:n});
 await sec('salon','pause');await sec('salon','aveda');
 document.documentElement.setAttribute('data-motion','calm');jump('aveda');scrollBy(0,3);await sl(1500);await post({ev:'shot',name:'salon-aveda-3calm'});
 await post({ev:'sec',w:'salon-calm',id:'aveda',lenOn:document.documentElement.classList.contains('len-on'),panes:panes('aveda'),errs:__errs.slice(0,4),loads:n});
 document.documentElement.removeAttribute('data-motion');
 document.querySelector('.worlds [data-to-world="coaching"]').click();await sl(3000);
 await sec('coaching','pause');await sec('coaching','aveda');
 await post({ev:'done'})}
addEventListener('load',go)})()</script>`;
const results = {}; let cur = null, done = null;
const extra = (u, req, res) => {
  if (u === '/__r' && req.method === 'POST') { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    const o = JSON.parse(b); res.writeHead(204);
    if (o.ev === 'start') { results[cur] = { ua: o.ua, vp: [o.w, o.h], secs: [] }; }
    else if (o.ev === 'shot') { try { sh('io', dev.udid, 'screenshot', '--type=jpeg', path.join(OUT, cur + '-' + o.name + '.jpg')); } catch (e) { console.log('shot', e.message.slice(0, 80)); } }
    else if (o.ev === 'sec') { if (results[cur]) results[cur].secs.push(o); }
    else if (o.ev === 'done') { done && done(); }
    res.end(); }); return true; }
  const m = u.match(/^\/([mgs])\/?(index\.html)?$/);
  if (m) { const f = path.join(REPO, 'option-2.2-mgs', m[1], 'index.html');
    const h = fs.readFileSync(f, 'utf8').replace(/<head[^>]*>/, (x) => x + HEADSCRIPT).replace('</body>', REPORTER + '</body>');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(h); return true; }
  return false;
};
const srv = await serve(REPO, extra), port = srv.address().port;
for (const v of VERS) {
  cur = v; const fin = new Promise((ok) => (done = ok)); sh('openurl', dev.udid, `http://127.0.0.1:${port}/${v}/`);
  const to = setTimeout(() => done && done(), 150000); await fin; clearTimeout(to);
  const r = results[cur]; if (!r) { console.log(v, 'no report: the page never started (Safari blocked the address?)'); continue; }
  console.log(v, r.vp.join('x'), r.ua.slice(0, 90));
  for (const s of r.secs) console.log(' ', s.w, s.id, 'lenOn', s.lenOn, JSON.stringify(s.panes), 'errors', JSON.stringify(s.errs), 'page loads in this tab', s.loads);
}
fs.writeFileSync(path.join(OUT, 'sim-lens.json'), JSON.stringify(results, null, 1));
if (!wasBooted) { try { sh('shutdown', dev.udid); } catch (e) {} }
srv.close(); process.exit(0);

// QA tool (task c4360b88): the films in the iOS Simulator's own mobile Safari, where safaridriver cannot open a session (Safari 27:
// "Could not find any session hosts"). No WebDriver: this checkout's built pages are served on 127.0.0.1 with byte ranges (the
// simulator shares the host's network), the page gets ONE read-only reporter injected by the server (no page code changed), and
// the simulator is booted headless with simctl (no Simulator window), driven only by `simctl openurl` and read by `simctl io screenshot`.
// The reporter arrives at each film section as a visitor's jump does, reads each <video> (clock, paused, error) at 1.6 s and 7 s,
// asks the server for a simulator screenshot at 6.5 s, and measures the step's text lines against the rail.
//   node sim-films.mjs <m|g|s,...> <outdir>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERS = (process.argv[2] || 'm').split(','), OUT = path.resolve(process.argv[3] || 'out-sim-films'); fs.mkdirSync(OUT, { recursive: true });
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });
const dev = Object.values(JSON.parse(sh('list', 'devices', 'available', '-j')).devices).flat().find((d) => d.name === 'iPhone 17');
const wasBooted = dev.state === 'Booted'; if (!wasBooted) sh('boot', dev.udid); sh('bootstatus', dev.udid, '-b');
console.log('simulator', dev.name, dev.udid, wasBooted ? '(was booted)' : '(booted here)');
const REPORTER = `<script>try{localStorage.setItem('om-sound','off')}catch(e){}</script>
<script>(function(){
var post=function(o){return fetch('/__r',{method:'POST',body:JSON.stringify(o)}).catch(function(){})},sl=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
function read(id){var s=document.getElementById(id);return [].map.call(s.querySelectorAll('video'),function(v){return{src:(v.currentSrc||v.getAttribute('data-src')||'').split('/').pop(),t:+v.currentTime.toFixed(2),paused:v.paused,rs:v.readyState,err:v.error?v.error.code:0,stop:v.getAttribute('data-stop'),dur:+(v.duration||0).toFixed(2),fr:(v.getVideoPlaybackQuality?v.getVideoPlaybackQuality().totalVideoFrames:-1)}})}
function words(id){var s=document.getElementById(id),rail=document.getElementById('rail'),vw=innerWidth,vh=innerHeight,cs=rail?getComputedStyle(rail):null,on=!!rail&&cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05;
var links=on?[].map.call(rail.querySelectorAll('a'),function(a){var q=a.getBoundingClientRect();return{t:a.textContent.replace(/\\s+/g,' ').trim(),l:q.left,t0:q.top,r:q.right,b:q.bottom}}).filter(function(q){return q.r-q.l>2&&q.b-q.t0>2}):[];
var hits=[],n=0,tw=document.createTreeWalker(s.querySelector('.s__leave')||s,NodeFilter.SHOW_TEXT);
for(var x=tw.nextNode();x;x=tw.nextNode()){if(!x.textContent.trim())continue;var e=x.parentElement,st=getComputedStyle(e);if(st.visibility==='hidden'||+st.opacity<.05||e.closest('.sr'))continue;var g=document.createRange();g.selectNodeContents(x);
[].forEach.call(g.getClientRects(),function(q){if(q.width<2||q.height<5||q.bottom<=0||q.top>=vh)return;n++;links.forEach(function(a){if(q.left<a.r+6&&q.right>a.l-6&&q.top<a.b+6&&q.bottom>a.t0-6)hits.push('"'+x.textContent.trim().slice(0,24)+'" x rail '+a.t)});if(q.right>vw+1||q.left<-1)hits.push('"'+x.textContent.trim().slice(0,24)+'" off-screen')})}
return{railOn:on,lines:n,hits:hits.slice(0,8)}}
async function go(){await sl(2500);await post({ev:'start',ua:navigator.userAgent,w:innerWidth,h:innerHeight,v:location.pathname});
for(var w of ['salon','coaching']){if(w==='coaching'){document.querySelector('.worlds [data-to-world="coaching"]').click();await sl(3000)}
var ids=[].filter.call(document.querySelectorAll('#main-'+w+' > section.s'),function(s){return s.querySelector('video')}).map(function(s){return s.id});
for(var id of ids){var s=document.getElementById(id),y=Math.round(s.getBoundingClientRect().top+scrollY),r=document.documentElement;r.style.scrollBehavior='auto';r.style.scrollSnapType='none';scrollTo(0,y);setTimeout(function(){r.style.scrollSnapType=''},60);
await sl(1600);var a=read(id);await sl(1200);var b=read(id);await sl(3700);await post({ev:'shot',name:location.pathname.replace(/\\W/g,'')+'-'+w+'-'+id});await sl(500);var c=read(id),wd=words(id);
await post({ev:'film',w:w,id:id,a:a,b:b,c:c,words:wd})}}
await post({ev:'done'})}
addEventListener('load',go)})()</script>`;
const results = {}; let cur = null, done = null;
const extra = (u, req, res) => {
  if (u === '/__r' && req.method === 'POST') { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    const o = JSON.parse(b); res.writeHead(204);
    if (o.ev === 'start') { results[cur] = { ua: o.ua, vp: [o.w, o.h], films: [] }; }
    else if (o.ev === 'shot') { try { sh('io', dev.udid, 'screenshot', '--type=jpeg', path.join(OUT, o.name + '.jpg')); } catch (e) { console.log('shot', e.message.slice(0, 80)); } }
    else if (o.ev === 'film') { if (results[cur]) results[cur].films.push(o); }   // a late report from the previous version's page is dropped, never a crash
    else if (o.ev === 'done') { done && done(); }
    res.end(); }); return true; }
  const m = u.match(/^\/([mgs])\/?(index\.html)?$/);
  if (m) { const f = path.join(REPO, 'option-2.2-mgs', m[1], 'index.html'); const h = fs.readFileSync(f, 'utf8').replace('</body>', REPORTER + '</body>');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(h); return true; }
  return false;
};
const srv = await serve(REPO, extra), port = srv.address().port;
for (const v of VERS) {
  cur = v; const fin = new Promise((ok) => (done = ok)); sh('openurl', dev.udid, `http://127.0.0.1:${port}/${v}/`);
  // task 7a3c013b: Inner Work now has as many film sections as the salon, so the wait scales with the page's film sections
  // (about 30 s each with its simulator screenshot, more on a busy machine), never a fixed 240 s that the twin outgrows
  const nFilm = (fs.readFileSync(path.join(REPO, 'option-2.2-mgs', v, 'index.html'), 'utf8').match(/<section [^>]*>(?:(?!<\/section>)[\s\S])*?<video /g) || []).length;
  const to = setTimeout(() => done && done(), Math.max(240000, 60000 + nFilm * 32000)); await fin; clearTimeout(to);
  const r = results[cur]; if (!r) { console.log(v, 'no report: the page never started (Safari blocked the address?)'); continue; }
  // a film is moving when, between the two readings 1.2 s apart, its clock advanced (or wrapped at its loop point) or its frame counter rose by 8 or more;
  // the old readings 7-12 s apart read a looping film's wrap as "not moving" (task b36dde1f)
  const moves = (a, b) => !b.paused && !b.err && ((b.t > a.t + 0.5) || (b.t < a.t && a.dur && a.t > a.dur - 2.5) || (a.fr >= 0 && b.fr - a.fr >= 8));
  const isMoving = (f) => f.b.every((x, i) => f.a[i] && moves(f.a[i], x));
  const bad = r.films.filter((f) => !isMoving(f) || f.words.hits.length);
  console.log(v, r.vp.join('x'), 'films', r.films.length, 'moving:', r.films.filter(isMoving).length, 'problems:', bad.map((f) => `${f.w}:${f.id} ` + JSON.stringify(f.b.map((x, i) => [f.a[i] && f.a[i].t, x.t, x.dur, f.a[i] && f.a[i].fr, x.fr, x.paused, x.rs, x.err])) + ' words ' + JSON.stringify(f.words.hits)).join('  | ') || 'none')
}
fs.writeFileSync(path.join(OUT, 'sim-films.json'), JSON.stringify(results, null, 1));
if (!wasBooted) { try { sh('shutdown', dev.udid); } catch (e) {} }
srv.close(); process.exit(0);

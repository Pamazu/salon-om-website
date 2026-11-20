// The option switcher in the iOS Simulator's own mobile Safari (task e5325977), as sim-films.mjs drives it: this checkout's
// built pages served on 127.0.0.1 (the simulator shares the host's network), ONE read-only reporter injected by the server
// (no page code changed), the simulator booted headless with simctl, driven only by `simctl openurl` and read by
// `simctl io screenshot`. Each address opens one option (?opt-<section>=<option>, as J's shared link does); on the first, the
// reporter also opens the panel with the phone's handle and swaps an option in place. The five steps' options (task 5cf1107e,
// one key for all five, ?opt-steps=): each opens on its option and is scrolled through its first step in 2.4 s, the frames
// counted (mobile Safari's own: J 19 Nov, "smooth ... on a phone"), today's the same way. Writes <out>/result.json and shots.
//   node sim-options.mjs [out]
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), OUT = path.resolve(process.argv[2] || 'out-sim-options'); fs.mkdirSync(OUT, { recursive: true });
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });
const dev = Object.values(JSON.parse(sh('list', 'devices', 'available', '-j')).devices).flat().find((d) => d.name === 'iPhone 17');
const wasBooted = dev.state === 'Booted'; if (!wasBooted) sh('boot', dev.udid); sh('bootstatus', dev.udid, '-b');
console.log('simulator', dev.name, dev.udid, wasBooted ? '(was booted)' : '(booted here)');
// [name, address, section to show, where inside it (0 top, .97 near its end), also try the handle and an in-place swap]
const RUNS = [['pause-live', '/m/?opt-pause=live', 'pause', 0, true], ['pause-door', '/m/?opt-pause=door', 'pause', 0], ['pause-room', '/m/?opt-pause=room', 'pause', 0],
  ['pause-breath', '/m/?opt-pause=breath', 'pause', .97], ['pause-cinema', '/m/?opt-pause=cinema', 'pause', 0],
  ['aveda-f', '/m/?opt-pause=live&opt-aveda=sheet-f', 'aveda', 0], ['aveda-g', '/m/?opt-aveda=sheet-g', 'aveda', 0], ['aveda-i', '/m/?opt-aveda=sheet-i', 'aveda', 0],
  ['aveda-d', '/m/?opt-aveda=sheet-d', 'aveda', 0], ['g-aveda-h', '/g/?opt-aveda=sheet-h', 'aveda', 0], ['g-pause-room', '/g/?opt-pause=room&opt-aveda=live', 'pause', 0],
  // [.., frames through the section, the option's key when it is not the section's id]
  ['steps-live', '/m/?opt-steps=live', 'arrive', 0, false, true, 'steps'], ['steps-breath', '/m/?opt-steps=breath', 'arrive', 0, false, true, 'steps'],
  ['steps-fade', '/m/?opt-steps=fade', 'arrive', 0, false, true, 'steps'], ['steps-sheet', '/m/?opt-steps=sheet', 'arrive', 0, false, true, 'steps'],
  ['g-steps-breath', '/g/?opt-steps=breath', 'renew', 0, false, true, 'steps']];
const REPORTER = `<script>try{localStorage.setItem('om-sound','off')}catch(e){}</script>
<script>(function(){
var post=function(o){return fetch('/__r',{method:'POST',body:JSON.stringify(o)}).catch(function(){})},sl=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var errs=[];addEventListener('error',function(e){errs.push(String(e.message))});
function jump(id,f){var s=document.getElementById(id),r=document.documentElement;r.style.scrollBehavior='auto';r.style.scrollSnapType='none';scrollTo(0,Math.round(s.getBoundingClientRect().top+scrollY+(s.offsetHeight-innerHeight)*f));setTimeout(function(){r.style.scrollSnapType='';r.style.scrollBehavior=''},60)}
function st(id){var s=document.getElementById(id),sh=s&&s.querySelector('[data-sheet]'),p=document.getElementById('opt-panel'),h=document.querySelector('.opt-handle');
return{opt:s&&s.getAttribute('data-opt'),e:s&&s.style.getPropertyValue('--e'),stick:!!(s&&s.querySelector(':scope > .ch__stick')),h:s&&+(s.offsetHeight/innerHeight).toFixed(2),letters:s?s.querySelectorAll('[data-write] .l').length:0,sheet:sh&&sh._sheet?{ready:!!sh._sheet.ready,frames:sh._sheet.frames,err:sh.getAttribute('data-sheet-error')}:null,
handle:h?getComputedStyle(h).display:'none',panel:!!p&&!p.hidden,sec:p&&p.querySelector('.opt__sec')?p.querySelector('.opt__sec').textContent:null,rows:p?p.querySelectorAll('.opt__row').length:0,wide:document.documentElement.scrollWidth,w:innerWidth,errs:errs.slice(0,5)}}
function frames(id){return new Promise(function(done){var s=document.getElementById(id),r=document.documentElement,y0=s.getBoundingClientRect().top+scrollY-40,dy=Math.max(innerHeight,s.offsetHeight-innerHeight)+80,g=[],at=[],last=0,lk=0,t0=performance.now();
r.style.scrollBehavior='auto';r.style.scrollSnapType='none';
(function fr(t){if(last){g.push(t-last);if(t-last>50)at.push([+lk.toFixed(2),Math.round(t-last)])}last=t;var k=Math.min(1,(t-t0)/2400);lk=k;scrollTo(0,y0+dy*k);if(k<1)requestAnimationFrame(fr);else{r.style.scrollSnapType='';r.style.scrollBehavior='';g.sort(function(a,b){return a-b});
done({n:g.length,worst:Math.round(g[g.length-1]),p95:Math.round(g[Math.floor(g.length*.95)]),over50:g.filter(function(x){return x>50}).length,at:at})}})(t0)})}
async function go(){var q=new URLSearchParams(location.search),name=q.get('run'),id=q.get('sec'),f=+q.get('at')||0,hand=q.get('hand')==='1',fm=q.get('frames')==='1';
await sl(2500);jump(id,f);await sl(4500);
if(fm){var F=await frames(id);await sl(400);var S0=st(id);S0.frames=F;jump(id,.5);await sl(1600);await post({ev:'shot',name:name+'-mid'});S0.mid=st(id).e;await post({ev:'state',name:name,s:S0});await post({ev:'done'});return}
if(hand){document.querySelector('.opt-handle').click();await sl(900);await post({ev:'shot',name:name+'-panel'});await post({ev:'state',name:name+'-panel',s:st(id)});
document.querySelector('#opt-panel [data-k="cinema"]').click();await sl(1200);document.querySelector('.opt-handle').click();await sl(4200);
await post({ev:'shot',name:name+'-swapped-cinema'});await post({ev:'state',name:name+'-swapped-cinema',s:st(id)});
window.OMOptions.choose('pause','live',false);await sl(300)}
await post({ev:'shot',name:name});await post({ev:'state',name:name,s:st(id)});await post({ev:'done'})}
addEventListener('load',go)})()</script>`;
const res = { device: dev.name, started: new Date().toISOString(), runs: {} }; let done = null;
const extra = (u, req, res2) => {
  if (u === '/__r' && req.method === 'POST') { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    const o = JSON.parse(b); res2.writeHead(204);
    if (o.ev === 'shot') { try { sh('io', dev.udid, 'screenshot', '--type=jpeg', path.join(OUT, 'sim-' + o.name + '.jpg')); } catch (e) { console.log('shot', e.message.slice(0, 80)); } }
    else if (o.ev === 'state') { res.runs[o.name] = o.s; console.log(o.name, JSON.stringify(o.s)); }
    else if (o.ev === 'done') { done && done(); }
    res2.end(); }); return true; }
  const m = u.match(/^\/([mgs])\/?(index\.html)?$/);
  if (m) { const h = fs.readFileSync(path.join(REPO, 'option-2.2-mgs', m[1], 'index.html'), 'utf8').replace('</body>', REPORTER + '</body>');
    res2.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res2.end(h); return true; }
  return false;
};
const srv = await serve(REPO, extra), port = srv.address().port;
for (const [name, addr, sec, at, hand, fm] of RUNS) {
  const fin = new Promise((ok) => (done = ok));
  sh('openurl', dev.udid, `http://127.0.0.1:${port}${addr}&run=${name}&sec=${sec}&at=${at}&hand=${hand ? 1 : 0}&frames=${fm ? 1 : 0}`);
  const to = setTimeout(() => done && done(), 60000); await fin; clearTimeout(to);
  if (!res.runs[name]) console.log(name, 'no report: the page never started');
}
const R = res.runs, checks = [];
const ok = (n, p, i) => { checks.push({ n, pass: !!p, i }); console.log(p ? 'PASS' : 'FAIL', n, i === undefined ? '' : JSON.stringify(i)); };
const p0 = R['pause-live-panel'] || {};
ok('the handle shows in mobile Safari', p0.handle && p0.handle !== 'none', p0.handle);
ok('the handle opens the panel on the pause', p0.panel && p0.sec === 'The pause' && p0.rows === 5, p0);
ok('an option swaps in place in mobile Safari', (R['pause-live-swapped-cinema'] || {}).opt === 'cinema' && (R['pause-live-swapped-cinema'] || {}).letters > 0, R['pause-live-swapped-cinema']);
for (const [name, , sec, , , fm, key] of RUNS) {
  const s = R[name] || {}, want = (RUNS.find((r) => r[0] === name)[1].match(new RegExp('opt-' + (key || sec) + '=([\\w-]+)')) || [])[1];
  if (fm) {      // a step: its option in place (the scroll frame for a scroll option), handing over half way, and the frames through it
    const live = R['steps-live'] || {}, scroll = want !== 'live';
    ok(`${name}: opens on its option, the scroll frame ${scroll ? 'in place, half way at mid-scroll' : 'absent'}, fits the phone, no script error`,
      s.opt === want && s.stick === scroll && (!scroll || (+s.mid > .2 && +s.mid < .8)) && s.wide <= s.w && !(s.errs || []).length, s);
    ok(`${name}: mobile Safari scrolls through it without a frame over 100 ms, no more long frames than today's`,
      s.frames && s.frames.worst <= 100 && (!live.frames || s.frames.over50 <= live.frames.over50 + 1), { it: s.frames, today: live.frames });
    continue;
  }
  ok(`${name}: opens on its option, fits the phone, no script error`, s.opt === want && s.wide <= s.w && !(s.errs || []).length && (sec !== 'aveda' || (s.sheet && s.sheet.ready && s.sheet.frames > 10 && !s.sheet.err)), s);
}
res.checks = checks; res.pass = checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 2));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', checks.filter((c) => !c.pass).length, 'failed of', checks.length);
srv.close(); if (!wasBooted) sh('shutdown', dev.udid);

// How much memory real mobile Safari holds through a whole read (task 5cb93228; CEO MA 18 Nov: J's Safari "reloaded because
// it was using significant memory"). WebKit in Playwright never came near Safari's limit, so this reads the iOS Simulator's own
// Safari: a fresh iPhone made for this run (never the shared one), booted headless, driven only by `simctl openurl`, deleted
// after. The served page gets ONE read-only reporter (sim-films.mjs's way; no page code changed) that reads down the whole page
// a screen at a time (1.5 s each, as memory.mjs does) and, at each screen, asks the server to read the footprint of this
// phone's Safari page processes (WebContent) and media process (GPU) before it moves on. Run it under heavy-slot.
//   node sim-memory.mjs <out.json> [m,g,s]          PAGES=dir serves another build's m/, g/, s/ index.html (e.g. live)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , OUT, VS = 'm'] = process.argv; const PAGES = process.env.PAGES || path.join(REPO, 'option-2.2-mgs');
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' }).trim();
const udid = sh('create', 'QA-memory-5cb93228', 'iPhone 17', 'com.apple.CoreSimulator.SimRuntime.iOS-27-0');
function mine() {      // this phone's processes: children of its own launchd_sim
  const ps = execFileSync('ps', ['-axo', 'pid=,ppid=,command='], { encoding: 'utf8' }).split('\n').map((l) => l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean);
  const root = ps.find((r) => r[3].includes('launchd_sim') && r[3].includes(udid)); if (!root) return { page: [], media: [] };
  const kids = ps.filter((r) => r[2] === root[1]);
  return { page: kids.filter((r) => /WebKit\.WebContent/.test(r[3])).map((r) => +r[1]), media: kids.filter((r) => /WebKit\.GPU/.test(r[3])).map((r) => +r[1]) };
}
function mb(pid) {
  try { const s = execFileSync('footprint', [String(pid)], { encoding: 'utf8' }); const m = /Footprint: ([\d.]+) (KB|MB|GB)/.exec(s); return m ? +m[1] * { KB: 1 / 1024, MB: 1, GB: 1024 }[m[2]] : 0; }
  catch (e) { return 0; }
}
const read = () => { const p = mine(); const page = p.page.map(mb); return { page: +Math.max(0, ...page).toFixed(1), pageAll: +page.reduce((a, x) => a + x, 0).toFixed(1), media: +p.media.map(mb).reduce((a, x) => a + x, 0).toFixed(1), nPage: p.page.length }; };
const REPORTER = `<script>try{localStorage.setItem('om-sound','off')}catch(e){}</script>
<script>(function(){
var post=function(o){return fetch('/__m',{method:'POST',body:JSON.stringify(o)}).catch(function(){})},sl=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
function to(y){var r=document.documentElement;r.style.scrollBehavior='auto';r.style.scrollSnapType='none';scrollTo(0,y);setTimeout(function(){r.style.scrollSnapType=''},60)}
async function go(){await sl(3000);var h=innerHeight,H=document.documentElement.scrollHeight;await post({ev:'start',w:innerWidth,h:h,H:H,v:location.pathname});
for(var y=0;y<H-h;y+=h){to(y);await sl(1500);await post({ev:'step',y:Math.round(y/h*10)/10})}
for(var y2=H-h;y2>0;y2-=3*h){to(y2);await sl(500)}to(0);await sl(2000);await post({ev:'step',y:0});await post({ev:'done'})}
addEventListener('load',go)})()</script>`;
const rows = []; let cur = null, done = null;
const extra = (u, req, res) => {
  if (u === '/__m' && req.method === 'POST') { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
    const o = JSON.parse(b);
    if (o.ev === 'start' && cur) cur.vp = [o.w, o.h, o.H];
    else if (o.ev === 'step' && cur) cur.trace.push({ y: o.y, ...read() });
    else if (o.ev === 'done') done && done();
    res.writeHead(204); res.end(); }); return true; }
  const m = u.match(/^\/([mgs])\/?(index\.html)?$/);
  if (m) { const h = fs.readFileSync(path.join(PAGES, m[1], 'index.html'), 'utf8').replace('</body>', REPORTER + '</body>');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(h); return true; }
  return false;
};
const srv = await serve(REPO, extra), port = srv.address().port;
try {
  sh('boot', udid); sh('bootstatus', udid, '-b');
  for (const v of VS.split(',')) {
    cur = { v, trace: [] }; const fin = new Promise((ok) => (done = ok));
    sh('openurl', udid, `http://127.0.0.1:${port}/${v}/?r=${Date.now()}`);
    const t = setTimeout(() => done && done(), 300000); await fin; clearTimeout(t);
    const pk = (k) => Math.max(0, ...cur.trace.map((r) => r[k]));
    const row = { v, vp: cur.vp, screens: cur.trace.length, peakPageMB: pk('page'), peakPageAllMB: pk('pageAll'), peakMediaMB: pk('media'),
      endPageMB: cur.trace.length ? cur.trace[cur.trace.length - 1].page : null, trace: cur.trace };
    rows.push(row); const { trace: _, ...brief } = row; console.log(JSON.stringify(brief));
  }
} finally {
  try { sh('shutdown', udid); } catch (e) {} try { sh('delete', udid); } catch (e) {}
  const gone = !execFileSync('xcrun', ['simctl', 'list', 'devices'], { encoding: 'utf8' }).includes(udid);
  console.log('phone', udid, gone ? 'deleted' : 'NOT deleted'); srv.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
}
process.exit(0);

// How fast the music and the films start (task 5cb93228, J 18 Nov: "the music takes too long to load ... Ensure films,
// music all is extremely fast so the experience is seamless"). Serves this checkout's built M/G/S through a throttled
// network and measures, in WebKit at 1440 and 390:
//   sound: from the visitor's first click to the music audible (master x track gain >= 0.1, a source playing), and a
//          step's sound change (from its section arriving to its own sound audible; the lowest combined level between)
//   films: from the page opening (hero) or the section arriving (a step) to the film moving (currentTime > 0, shown)
//   node speed.mjs <out.json> [net: fast|4g|slow] [m,g,s] [1440,390]
import fs from 'node:fs'; import http from 'node:http'; import http2 from 'node:http2'; import os from 'node:os'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import * as pw from 'playwright'; import { TYPES, jump } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , OUT, NET = '4g', VS = 'm,g,s', WS = '1440,390'] = process.argv;
const NETS = { fast: [0, 0], '4g': [80, 1_200_000], slow: [150, 200_000] };      // [latency ms, bytes per second]
const [LAT, BPS] = NETS[NET];
let line = 0;      // when the shared line is next free (ms)
// the pages to serve: this checkout's build, or (PAGES=dir) another build's m/, g/, s/ index.html (e.g. the live commit's)
const PAGES = process.env.PAGES || path.join(REPO, 'option-2.2-mgs');
// H2=1: HTTP/2 over TLS as the live Firebase sites serve (every file on one connection, so a film never queues for one
// of HTTP/1.1's six); the key and certificate are a local self-signed pair (H2_DIR, default ~/tmp/12ad020c/speed)
const H2 = process.env.H2 === '1', H2_DIR = process.env.H2_DIR || path.join(os.homedir(), 'tmp/12ad020c/speed');
// LOG=1: each case's row also lists every request (file, range, when it was asked and finished, bytes sent, ms from the
// case's start) and the moments of the case (page asked, click, near the step, at the step), to see what holds the line
const LOG = process.env.LOG === '1'; let reqs = [], tCase = 0;
const handler = (req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname); const m = u.match(/^\/([mgs])\/(.*)$/);
  const rec = LOG ? { f: m ? (m[2] || 'index.html') : u, range: req.headers.range || '', ask: Date.now() - tCase, sent: 0 } : null;
  if (rec) { reqs.push(rec); res.on('close', () => { rec.end = Date.now() - tCase; }); }
  if (!m) { res.writeHead(404); return res.end(); }
  const file = !m[2] || m[2] === 'index.html' ? path.join(PAGES, m[1], 'index.html') : path.join(REPO, 'option-2.2', 'site', m[2]);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end(); }
    const type = TYPES[path.extname(file)] || 'application/octet-stream', r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    // the headers live Firebase sends (19 Nov, curl -I on salon-om-2-2-m.web.app): the page revalidated on every visit, every
    // other file kept a week under its versioned address, so a sound or film asked for again comes from the browser's cache
    let a = 0, z = st.size - 1, code = 200, h = { 'Content-Type': type, 'Accept-Ranges': 'bytes', ETag: `"${st.size}-${+st.mtime}"`, 'Last-Modified': st.mtime.toUTCString(),
      'Cache-Control': type.startsWith('text/html') ? 'no-cache, max-age=0, must-revalidate' : 'public, max-age=604800' };
    if (r) { a = r[1] ? +r[1] : 0; z = r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1; code = 206; h['Content-Range'] = `bytes ${a}-${z}/${st.size}`; }
    h['Content-Length'] = z - a + 1;
    setTimeout(() => {
      res.writeHead(code, h); const s = fs.createReadStream(file, { start: a, end: z, highWaterMark: 16384 });
      if (!BPS) return s.pipe(res);
      // one line shared by every file at once, as a phone's 4G is: each chunk waits for the line to be free
      s.on('data', (c) => { if (rec) rec.sent += c.length; s.pause(); const now = Date.now(); line = Math.max(line, now) + c.length / BPS * 1000; setTimeout(() => { res.write(c); s.resume(); }, line - now); });
      // the end goes after the last chunk, which waits for the line too
      s.on('end', () => setTimeout(() => res.end(), Math.max(0, line - Date.now()) + 1)); res.on('close', () => s.destroy());
    }, LAT);
  });
};
const srv = H2 ? http2.createSecureServer({ key: fs.readFileSync(path.join(H2_DIR, 'key.pem')), cert: fs.readFileSync(path.join(H2_DIR, 'cert.pem')), allowHTTP1: true }, handler)
  : http.createServer(handler);
srv.listen(0, '127.0.0.1');
await new Promise((r) => srv.on('listening', r));
const BASE = `${H2 ? 'https' : 'http'}://127.0.0.1:${srv.address().port}`;
const PROBE = () => {
  const P = window.__perf = { gains: [], srcs: [], t: [] };
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  // as Safari does: a page's audio waits for the visitor's first tap, click or key (headless WebKit would run it at once)
  window.__gest = false; ['pointerdown', 'touchend', 'click', 'keydown'].forEach((e) => addEventListener(e, () => { window.__gest = true; }, true));
  const r0 = AC.prototype.resume; AC.prototype.resume = function () { return window.__gest ? r0.call(this) : Promise.resolve(); };
  const Wrapped = function (o) { const c = new AC(o); c.suspend(); return c; }; Wrapped.prototype = AC.prototype;
  window.AudioContext = Wrapped; if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  const g0 = AC.prototype.createGain; AC.prototype.createGain = function () { const g = g0.call(this); P.gains.push(g); return g; };
  const b0 = AC.prototype.createBufferSource; AC.prototype.createBufferSource = function () { const s = b0.call(this); const st = s.start; s.start = function () { s._on = true; P.t.push(['buf', performance.now()]); return st.apply(this, arguments); }; P.srcs.push(s); return s; };
  if (AC.prototype.createMediaElementSource) { const e0 = AC.prototype.createMediaElementSource; AC.prototype.createMediaElementSource = function (el) { const s = e0.call(this, el); s._el = el; P.srcs.push(s); return s; }; }
  // the level heard now: master gain x the loudest playing track's gain (a track = a gain node fed by a playing source)
  P.level = () => {
    if (!P.gains.length) return 0; const master = P.gains[0].gain.value; let best = 0;
    for (const s of P.srcs) { const on = s._el ? (!s._el.paused && s._el.currentTime > 0) : s._on; if (!on || !s._g) continue; best = Math.max(best, P.chain(s)); }
    return master * best;
  };
  // a source's level up to the master: every gain on its way multiplied (the engine has one per track, M/G/S two)
  P.chain = (s) => { let g = s._g, v = 1, n = 0; while (g && g !== P.gains[0] && n++ < 6) { v *= g.gain.value; g = g._next; } return v; };
  const c0 = AudioNode.prototype.connect; AudioNode.prototype.connect = function (dest) {
    if (dest && dest.gain) { if (P.srcs.includes(this)) this._g = dest; else if (this.gain) this._next = dest; }
    return c0.apply(this, arguments); };
};
const rows = [];
// one case in a fresh browser (no file cached from the case before); the browser is handed back at once so a case that
// hangs (the pool's WebKit sometimes stops answering mid-run, 19 Nov) can be closed and tried again
async function one(v, w, box) {
  line = 0;      // the shared line starts free for each case
  reqs = []; tCase = Date.now(); const marks = {};
  const b = box.b = await pw.webkit.launch();
  const ctx = await b.newContext({ ignoreHTTPSErrors: H2, viewport: { width: w, height: w < 700 ? 844 : 900 }, deviceScaleFactor: w < 700 ? 3 : 1, ...(w < 700 ? { isMobile: true, hasTouch: true } : {}) });
  await ctx.addInitScript(PROBE);
  const p = await ctx.newPage(); const t0 = Date.now();
  await p.goto(`${BASE}/${v}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  // hero film: from the page opening to moving
  let heroMs = null;
  for (let i = 0; i < 300 && heroMs === null; i++) { if (await p.evaluate(() => { const x = document.querySelector('#top video'); return !!x && x.currentTime > 0.05 && !x.paused; })) heroMs = Date.now() - t0; else await p.waitForTimeout(50); }
  await p.waitForTimeout(Math.max(0, 3000 - (Date.now() - t0)));      // a visitor reads the opening for about 3 s, then clicks
  const tc = Date.now(); marks.click = tc - tCase; await p.mouse.click(w / 2, 300);
  let soundMs = null;
  for (let i = 0; i < 300 && soundMs === null; i++) { if (await p.evaluate(() => window.__perf.level() >= 0.1)) soundMs = Date.now() - tc; else await p.waitForTimeout(20); }
  await p.waitForTimeout(1500);      // the opening's sound fully up, so the lowest level below belongs to the step change
  // a step's sound and film: jump to the first step, measure its film and its own sound
  const step = await p.evaluate(() => { const s = document.querySelector('main[data-world="salon"] .s.ch[data-sound]:not([data-sound="bed"])'); return s ? [s.id, s.dataset.sound] : null; });
  let stepFilmMs = null, stepSoundMs = null, minLevel = 1;
  if (step) {
    const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, step[0]);
    // the sources playing loudest now are the opening's; the step's own sound is a source that rises from quiet after the jump
    await p.evaluate(() => { const P = window.__perf; P.before = new Set(P.srcs.filter((q) => q._g && P.chain(q) > 0.05)); });
    // as a person arrives: near the step first (its film is attached two screens ahead), a moment there, then the step
    marks.near = Date.now() - tCase; await jump(p, Math.max(0, top - 1.5 * (w < 700 ? 844 : 900))); await p.waitForTimeout(2500);
    await jump(p, top); const ts = Date.now(); marks.step = ts - tCase;
    for (let i = 0; i < 600 && (stepFilmMs === null || stepSoundMs === null); i++) {
      const s = await p.evaluate((id) => { const x = document.querySelector(`#${id} video`); const P = window.__perf; const m = P.gains.length ? P.gains[0].gain.value : 0;
        const fresh = P.srcs.filter((q) => !P.before.has(q) && q._g && (q._el ? !q._el.paused : q._on)).reduce((a, q) => Math.max(a, P.chain(q)), 0);
        return { film: !!x && x.currentTime > 0.05 && !x.paused, level: P.level(), fresh: m * fresh }; }, step[0]);
      if (stepFilmMs === null && s.film) stepFilmMs = Date.now() - ts;
      if (stepSoundMs === null && s.fresh >= 0.1) stepSoundMs = Date.now() - ts;
      minLevel = Math.min(minLevel, s.level);
      await p.waitForTimeout(25);
      if (Date.now() - ts > 15000) break;
    }
  }
  await ctx.close(); await b.close();
  return { v, w, net: NET, heroFilmMs: heroMs, clickToSoundMs: soundMs, step: step && step.join(':'), stepFilmMs, stepSoundMs, minLevelDuringStepChange: +minLevel.toFixed(2), ...(LOG ? { marks, requests: reqs } : {}) };
}
// a case gets 150 s (a full case takes some 25-40 s); one that runs out is closed and tried once more, then written as hung
for (const v of VS.split(',')) for (const w of WS.split(',').map(Number)) {
  let row = null;
  for (let attempt = 1; attempt <= 2 && !row; attempt++) {
    const box = {}; let timer;
    row = await Promise.race([one(v, w, box).catch((e) => ({ v, w, net: NET, error: String(e.message || e).slice(0, 160) })),
      new Promise((ok) => { timer = setTimeout(() => ok(null), 150000); })]);
    clearTimeout(timer);
    if (!row || row.error) { if (box.b) box.b.close().catch(() => {}); if (attempt === 1) { console.log(`${v} ${w}: ${row ? row.error : 'hung 150 s'}; trying once more`); row = null; } }
  }
  rows.push(row || { v, w, net: NET, hung: true }); const { requests, ...brief } = rows[rows.length - 1]; console.log(JSON.stringify(brief));
}
srv.close();
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
process.exit(0);      // a closed browser that never answered keeps no handle open

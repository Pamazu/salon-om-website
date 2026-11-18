// How much memory a person's visit holds (task 5cb93228; CEO MA 18 Nov: J's Safari showed "This webpage was reloaded
// because it was using significant memory" on live M). Serves this checkout's built M/G/S (or PAGES=dir, another build)
// and reads through the whole page as a person does in WebKit: the opening for 3 s, a click (the sound starts), then down
// the page a screen at a time, 1.5 s per screen, and back up to the top. At every step it reads the footprint (what
// macOS counts against a process, the number Safari's limit uses) of this browser's page process (pictures, decoded
// sounds, scripts) and its media process (films).
//   node memory.mjs <out.json> [m,g,s] [1440,390] [films: play|refused]
//   refused = as J's Safari in Low Power Mode: every film's play() is refused until a tap that never comes (the page
//   then lays each film in as a moving image)
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import * as pw from 'playwright'; import { serve, jump } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , OUT, VS = 'm,g,s', WS = '1440,390', FILMS = 'play'] = process.argv;
const PAGES = process.env.PAGES;
// this browser's own processes: the WebKit page and media processes that were not running before it started
function procs() {
  const out = execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8' });
  const pick = (tag) => new Set(out.split('\n').filter((l) => l.includes('ms-playwright/webkit') && l.includes(tag)).map((l) => +l.trim().split(/\s+/)[0]));
  return { page: pick('WebContent'), media: pick('WebKit.GPU') };
}
function mb(pid) {
  try { const s = execFileSync('footprint', [String(pid)], { encoding: 'utf8' }); const m = /Footprint: ([\d.]+) (KB|MB|GB)/.exec(s); return m ? +(+m[1] * { KB: 1 / 1024, MB: 1, GB: 1024 }[m[2]]).toFixed(1) : null; }
  catch (e) { return null; }
}
const srv = await serve(REPO, PAGES && ((u, req, res) => {
  const m = u.match(/^\/([mgs])\/(index\.html)?$/); if (!m) return false;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(PAGES, m[1], 'index.html'))); return true;
}));
const BASE = `http://127.0.0.1:${srv.address().port}`;
const rows = [];
for (const v of VS.split(',')) for (const w of WS.split(',').map(Number)) {
  const before = procs();
  const b = await pw.webkit.launch();
  const h = w < 700 ? 844 : 900;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 700 ? 3 : 2, ...(w < 700 ? { isMobile: true, hasTouch: true } : {}) });
  if (FILMS === 'refused') await ctx.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () { const e = new DOMException('refused', 'NotAllowedError'); this.dispatchEvent(new Event('play')); return Promise.reject(e); };
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${v}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const after = procs();
  const page = [...after.page].filter((x) => !before.page.has(x)), media = [...after.media].filter((x) => !before.media.has(x));
  if (page.length !== 1 || media.length !== 1) console.error('processes not single:', page, media);
  const read = () => ({ page: page.reduce((a, x) => a + (mb(x) || 0), 0), media: media.reduce((a, x) => a + (mb(x) || 0), 0) });
  await p.waitForTimeout(3000); await p.mouse.click(w / 2, 300);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const trace = []; let peak = { page: 0, media: 0, both: 0, at: 0 };
  const sample = async (y) => { const r = read(); r.y = Math.round(y / h * 10) / 10; trace.push(r); const both = r.page + r.media;
    if (r.page > peak.page) peak.page = r.page; if (r.media > peak.media) peak.media = r.media; if (both > peak.both) { peak.both = +both.toFixed(1); peak.at = r.y; } };
  if (process.env.DWELL) {
    // staying on one section as a person reading it (J's screenshot: G's pause), the footprint read every 10 s
    const y = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, process.env.DWELL);
    await jump(p, y); const secs = +(process.env.SECS || 180);
    for (let t = 0; t <= secs; t += 10) { await p.waitForTimeout(t ? 10000 : 1500); await sample(y); trace[trace.length - 1].s = t; }
  } else {
    for (let y = 0; y < H - h; y += h) { await jump(p, y); await p.waitForTimeout(1500); await sample(y); }
    for (let y = H - h; y > 0; y -= 3 * h) { await jump(p, y); await p.waitForTimeout(500); }
    await jump(p, 0); await p.waitForTimeout(2000); await sample(0);
  }
  const films = await p.evaluate(() => ({ attached: [...document.querySelectorAll('video')].filter((x) => x.getAttribute('src')).length,
    asImage: document.querySelectorAll('img.film-img').length, videos: document.querySelectorAll('video').length }));
  const row = { v, w, films: FILMS, screens: Math.round(H / h), peakPageMB: +peak.page.toFixed(1), peakMediaMB: +peak.media.toFixed(1), peakBothMB: peak.both, peakAtScreen: peak.at,
    endPageMB: trace[trace.length - 1].page, endMediaMB: trace[trace.length - 1].media, filmsAtEnd: films, trace };
  if (process.env.DWELL) { row.dwell = process.env.DWELL; row.pageBySec = trace.map((r) => [r.s, r.page, r.media]); }
  rows.push(row); const { trace: _, ...brief } = row; console.log(JSON.stringify(brief));
  await ctx.close(); await b.close();
}
srv.close();
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));

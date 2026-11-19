// Does a sound file play as it streams (an <audio> started inside a tap, through the page's AudioContext), and how soon?
// The M/G/S sound engine leans on it when the visitor taps before a sound is decoded (task 5cb93228).
//   node sound-stream.mjs [bytes per second, 0 = unthrottled] [files, e.g. sound/bed.m4a,sound/bed.mp3]
// One fresh WebKit per file; the file served from option-2.2/site with ranges, at the given rate; prints, per file, the
// moments (ms from the tap) of the media events, the sound moving (0.1 s past where 'playing' found it) and the bytes sent by then.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import pw from 'playwright'; import { TYPES } from './lib.mjs';
const SITE = process.env.SITE || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'option-2.2', 'site');
const BPS = +(process.argv[2] || 0), FILES = (process.argv[3] || 'sound/bed.m4a,sound/bed.mp3').split(',');
let sent = 0;
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.writeHead(200, { 'Content-Type': TYPES['.html'] }); return res.end('<button id=b>tap</button>'); }
  const f = path.join(SITE, u); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const st = fs.statSync(f), m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  let a = 0, z = st.size - 1, code = 200; if (m) { a = m[1] ? +m[1] : 0; z = m[2] ? Math.min(+m[2], z) : z; code = 206; }
  const h = { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Content-Length': z - a + 1 };
  if (code === 206) h['Content-Range'] = `bytes ${a}-${z}/${st.size}`;
  res.writeHead(code, h); const s = fs.createReadStream(f, { start: a, end: z, highWaterMark: 16384 });
  if (!BPS) { s.on('data', (c) => { sent += c.length; }); return s.pipe(res); }
  s.on('data', (c) => { sent += c.length; s.pause(); res.write(c); setTimeout(() => s.resume(), c.length / BPS * 1000); });
  s.on('end', () => res.end()); res.on('close', () => s.destroy());
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const BASE = `http://127.0.0.1:${srv.address().port}`;
for (const file of FILES) {
  sent = 0; const b = await pw.webkit.launch(); const p = await (await b.newContext()).newPage();
  await p.goto(BASE + '/');
  await p.evaluate((src) => { document.getElementById('b').onclick = () => {
    const t0 = performance.now(), ctx = new (window.AudioContext || window.webkitAudioContext)(), el = new Audio(); const R = window.__r = { ev: [] };
    el.preload = 'auto'; el.loop = true; el.src = src; ctx.createMediaElementSource(el).connect(ctx.destination); ctx.resume();
    ['loadedmetadata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'stalled', 'error'].forEach((e) => el.addEventListener(e, () => R.ev.push([e, Math.round(performance.now() - t0)])));
    try { el.currentTime = 0.5; } catch (e) {} el.play().catch((e) => R.ev.push(['play-refused ' + e.name, Math.round(performance.now() - t0)]));
    let c0 = null; el.addEventListener('playing', () => { c0 = el.currentTime; });
    const iv = setInterval(() => { if (c0 !== null && el.currentTime > c0 + 0.1 && !el.paused && !R.moving) R.moving = Math.round(performance.now() - t0); }, 20);
    setTimeout(() => clearInterval(iv), 15000); }; }, file);
  const tSent = sent; await p.click('#b');
  let r = null; for (let i = 0; i < 150; i++) { await p.waitForTimeout(100); r = await p.evaluate(() => window.__r); if (r.moving) { r.bytes = sent - tSent; break; } }
  console.log(JSON.stringify({ file, bps: BPS, moving: r.moving || null, bytesThen: r.bytes || sent - tSent, events: r.ev }));
  await b.close();
}
srv.close();

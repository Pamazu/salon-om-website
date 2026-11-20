// Why one tall section misses its pull (task 95e37a41): r4 snap's step b (jump 200 px short of the section's end, scroll slowly
// 320 px on), then every 50 ms for 2.5 s the scroll position, the section's top, bottom and height, the next section's top, and
// any sheet stage's own height and min-height, so a move that is not the pull shows where it comes from. WebKit (%WEBKIT%).
// And who set the page's snap style since it loaded, each write with its callers (task 58855053: the browser's own snap ran
// under the pull whenever another script set the style back after mgs.js had turned it off).
// Usage: node qa/pull-probe.mjs <m|g|s> <salon|coaching> <section id> [390|1440]
import { webkit } from 'playwright';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v = 'm', world = 'coaching', id = 'c-aveda', w = '390', modes = 'free,frozen'] = process.argv.slice(2);   // free: the sheet drifts; frozen: its clock held (window.__lensT)
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const phone = +w < 600;
const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
// html.style handed out through a wrapper that notes each write of scrollSnapType: when, the value, what it replaced, its callers
await ctx.addInitScript(() => {
  let o = HTMLHtmlElement.prototype; while (o && !Object.getOwnPropertyDescriptor(o, 'style')) o = Object.getPrototypeOf(o);
  if (!o) return;
  const d = Object.getOwnPropertyDescriptor(o, 'style'); let wrap = null; window.__snapBy = [];
  const who = () => (new Error().stack || '').split('\n').slice(1, 5).map((l) => l.replace(location.origin, '').replace(/:\d+$/, '')).join(' < ');
  Object.defineProperty(o, 'style', { configurable: true, set(v) { d.set.call(this, v); }, get() {
    const real = d.get.call(this); if (this !== document.documentElement) return real;
    return wrap ||= new Proxy(real, {
      get: (t, k) => { const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; },
      set: (t, k, v) => { if (k === 'scrollSnapType') window.__snapBy.push({ t: Math.round(performance.now()), to: v, was: t.scrollSnapType, y: Math.round(scrollY), by: who() }); t[k] = v; return true; },
    });
  } });
});
for (const mode of modes.split(',')) {
const p = await open(ctx, `${base}/${v}/`);
if (mode === 'frozen') await p.evaluate(() => { window.__lensT = 5; });
if (world === 'coaching') await toWorld(p, 'coaching');
const g = await p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
console.log('section', id, JSON.stringify(g));
await jump(p, g.top); await wait(p, 900);
await jump(p, g.top + g.h - g.vh - 200); await wait(p, 900);
await p.evaluate((id) => {
  const s = document.getElementById(id), nx = s.nextElementSibling, st = s.querySelector('.sh'), t0 = performance.now(); window.__probe = [];
  const rec = (why) => { const r = s.getBoundingClientRect(); window.__probe.push({ t: Math.round(performance.now() - t0), why, y: Math.round(scrollY), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), next: nx && Math.round(nx.getBoundingClientRect().top), sh: st && Math.round(st.getBoundingClientRect().height), mh: st && st.style.minHeight, snap: document.documentElement.style.scrollSnapType }); };
  addEventListener('scroll', () => rec('scroll'), { passive: true });
  window.__frames = []; let f0 = performance.now(); (function fr(now) { window.__frames.push(now - f0); f0 = now; if (now - t0 < 3000) requestAnimationFrame(fr); })(f0);
  const iv = setInterval(() => rec('tick'), 50); setTimeout(() => clearInterval(iv), 4000);
}, id);
const n = Math.round(320 / 60);
for (let i = 0; i < n; i++) { await p.evaluate((d) => scrollBy({ top: d, behavior: 'instant' }), 320 / n); await wait(p, 40); }
await wait(p, 2500);
const rows = await p.evaluate(() => window.__probe);
const fr = (await p.evaluate(() => window.__frames)).slice(1).sort((a, b) => a - b), q = (x) => Math.round(fr[Math.min(fr.length - 1, Math.floor(fr.length * x))]);
const end = rows[rows.length - 1];
console.log(mode, 'frames', fr.length, 'in 3 s; interval median', q(.5), 'ms, p95', q(.95), 'ms, max', q(1), 'ms | settled at', JSON.stringify({ t: end.t, bottom: end.bottom, next: end.next }));
let last = '';
for (const r of rows) { const k = `${r.y}|${r.h}|${r.sh}|${r.mh}|${r.snap}`; if (k !== last) console.log(' ', mode, JSON.stringify(r)); last = k; }
const by = await p.evaluate(() => window.__snapBy || []);
console.log(mode, 'the snap style was set', by.length, 'times since the page loaded (t in ms since then; a caller with no page address is this script\'s own jump):');
for (const w of by) console.log(' ', mode, JSON.stringify(w));
await p.close();
}
await b.close(); srv.close();
